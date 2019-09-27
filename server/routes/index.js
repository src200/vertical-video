var express = require('express');
var formidable = require('formidable');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();

  form.parse(req);

  form.on('fileBegin', function (name, file){
      file.path = __dirname + '/uploads/' + file.name;
  });

  form.on('file', function (name, file){
      console.log('Uploaded ' + file.name);
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
