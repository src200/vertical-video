var express = require('express');
var formidable = require('formidable');
var cv = require('opencv4nodejs');
var KalmanFilter = require('kalmanjs');
 
const { grabFrames } = require('../utils');
var router = express.Router();

router.post('/upload', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req);
  form.uploadDir = "./uploads";

  form.on('fileBegin', function (name, file) {
    file.path = form.uploadDir + '/' + file.name;
  });

  form.on('file', function (name, file) {
    console.log('Uploaded ' + file.name);

    // start anlaysing video
    function initVideoProcessing() {
      // parameters for ShiTomasi corner detection
      let [maxCorners, qualityLevel, minDistance, blockSize] = [1000, 0.001, 3, 3];
      // take first frame and find corners in it
      // let srcFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

      let corners = new cv.Mat();
      let grayFrame = new cv.Mat();

      let sum, avgX;
      const FPS = 24;
      const kf = new KalmanFilter({ R: 0.01, Q: 4 });
      let delay = 1000 / FPS;
      // var out = new cv.VideoWriter('out/output.mp4', cv.VideoWriter.fourcc('MJPG'), FPS, new cv.Size(270, 480));

      grabFrames(file.path, delay, (frame) => {
        grayFrame = frame.cvtColor(cv.COLOR_RGBA2GRAY)
        // cv.cvtColor(frame, grayFrame, cv.COLOR_RGBA2GRAY);
        corners = cv.goodFeaturesToTrack(grayFrame, maxCorners, qualityLevel, minDistance, new cv.Mat(), blockSize);

        sum = 0;
        for (var i = 0; i < corners.length; i++) {
          // point = new cv.Point(corners.data32F[i * 2], corners.data32F[(i * 2) + 1]);
          // goodFeatures.push(point);
          sum = sum + (corners[i].x - 200);
        }

        avgX = sum / corners.length;

        // console.log(kf.filter(avgX));
        // const cropRegion = frame.getRegion(new cv.Rect(50, 50, 25, 25));
        // out.write(grayFrame);
      });
    }

    initVideoProcessing();
  });

  form.on('progress', function (bytesReceived, bytesExpected) {
    var percentComplete = (bytesReceived / bytesExpected) * 100;
    console.log(percentComplete.toFixed(2));
  });

  form.on('end', function () {
    res.send('File uploaded!');
  });

  form.on('aborted', function () {
    res.send('File Upload aborted');
  });

  form.on('error', function (err) {
    res.send('Error occured while uploading file. Please try again.');
  });
});

module.exports = router;
