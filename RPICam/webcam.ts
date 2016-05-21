'use strict'

var child = require('child_process');

module.exports = {
    run: function (filename) {
        //if running on Windows, make sure you'll have an exe called fswebcam or you'll get an error
        child.execSync('fswebcam -r 640x480 /home/pi/nodeiot/' + filename, function (err, stdout, stderr) {       
            if (err !== null) {
                console.log('error ' + err);
            } else
            {
                console.log('image saved');
            }
        });  
    }
};