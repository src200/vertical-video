var express = require("express");
const exec = require('child_process').exec;
var router = express.Router();

router.get("/", function (req, res, next) {
    exec('ffmpeg --version', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
});

module.exports = router;
