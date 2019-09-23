var express = require("express");
const exec = require('child_process').exec;
var router = express.Router();

router.get("/", function (req, res, next) {
    exec('ffmpeg -version', (error, stdout, stderr) => {
        if (error) {
            res.send(`exec error: ${error}`);
            return;
        } else {
            res.send(`stdout: ${stdout}`);
        }
    });
});

module.exports = router;
