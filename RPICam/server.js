'use strict';
var http = require('http');
var webcam = require('./webcam');
var fs = require('fs');
var url = require('url');
var device = require('azure-iot-device');
var azure = require('azure');
//need to change AccountName and AccountKey
var connectionblob = 'DefaultEndpointsProtocol=https;AccountName=XXX;AccountKey=XXXXXX';
var blobSvc = azure.createBlobService(connectionblob);
var connectionstring = 'HostName=XXX.azure-devices.net;DeviceId=XXX;SharedAccessKey=XXX';
var deviceID = 'XXX'; // must match the deviceID in the connection string 
var messageFromIoTHub = '';
var iotHubClient = new device.Client(connectionstring, new device.Https());
var port = process.env.port || 1337;
http.createServer(function (req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    if (action == '/image.jpg') {
        webcam.run('image.jpg');
        var img = fs.readFileSync('./image.jpg');
        //console.log('image.jpg ok');
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(img, 'binary');
    }
    else if (action == '/status') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Status:\n' + messageFromIoTHub);
    }
    else if (action == '/postimage') {
        pushtoblob(null);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('image posted to blob');
    }
    else if (action == '/senddata') {
        var payload = '{\"deviceid\":\"' + deviceID + '\",\"wind\":42 }';
        var message = new device.Message(payload);
        iotHubClient.sendEvent(message, function (err, res) {
            if (!err) {
                if (res && (res.statusCode !== 204))
                    console.log('send status: ' + res.statusCode + ' ' + res.statusMessage);
            }
            else
                console.log('no data send, error ' + err.toString());
        });
        res.end('data sent');
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Linux RPI working perfectly, try /status /postimage /senddata and /image.jpg \n');
    }
}).listen(port);
function pushtoblob(msg) {
    blobSvc.createContainerIfNotExists('webcam', function (error, result, response) {
        if (!error) {
            if (result == true)
                console.log('blob created');
            else
                console.log('blob existing');
        }
    });
    //create the picture named image.jpg
    webcam.run('imageiot.jpg');
    // this will upload the picture named image.jpg which needs to be in the same directory as the js file
    blobSvc.createBlockBlobFromLocalFile('webcam', 'picture', 'imageiot.jpg', function (error, result, response) {
        if (!error) {
            // file uploaded
            console.log('file uploaded :-) ');
            if (msg != null) {
                //msg.data = 'uploaded';
                iotHubClient.complete(msg, function (err, res) {
                    if (err)
                        console.log('complete error: ' + err.toString());
                    if (res && (res.statusCode !== 204))
                        console.log('complete status: ' + res.statusCode + ' ' + res.statusMessage);
                });
            }
        }
        else {
            console.log('error uploading picture');
            if (msg != null) {
                //msg.data = 'error';
                iotHubClient.complete(msg, function (err, res) {
                    if (err)
                        console.log('complete error: ' + err.toString());
                    if (res && (res.statusCode !== 204))
                        console.log('complete status: ' + res.statusCode + ' ' + res.statusMessage);
                });
            }
        }
    });
}
function isMessage() {
    iotHubClient.receive(function (err, res, msg) {
        if (!err && res.statusCode !== 204) {
            console.log('Received data: ' + msg.getData());
            // process the request
            messageFromIoTHub = msg.getData();
            if (messageFromIoTHub === "picture")
                pushtoblob(msg);
            return true;
        }
        else if (err) {
            console.log('receive error: ' + err.toString());
        }
    });
    return false;
}
var isWaiting = false;
function waitForMessages() {
    isWaiting = true;
    isMessage();
    isWaiting = false;
}
// Start messages listener
setInterval(function () { if (!isWaiting)
    waitForMessages(); }, 1000);
//# sourceMappingURL=server.js.map