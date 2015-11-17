/*
 * GET home page.
 */
import express = require('express');
var iothub = require('azure-iothub');
var connectionString = 'HostName=XXX.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=XXX=';
var async = require('async');

export function index(req: express.Request, res: express.Response) {
    res.render('index', { title: 'Express', year: new Date().getFullYear() });
};

export function sendmsg(req: express.Request, res: express.Response) {    
    var count = 0;
    var deviceID = 'XXX';
    var registry = iothub.Registry.fromConnectionString(connectionString);
    var msg = 'No device found';
    registry.get(deviceID, function (err, device) {
        msg = 'Device ' + deviceID + ' found. Sending message';
        console.log(msg);
        var client = iothub.Client.fromConnectionString(connectionString);
        client.open(function (err) {
            if (!err) {
                client.send(deviceID, 'picture');
                async.whilst(
                    function () { return count < 10; },
                    function (callback) {
                        count++;
                        isMessage();
                        if (received == true) {
                            res.header('Cache-Control', 'no-cache');
                            res.render('image', { title: 'Image', year: new Date().getFullYear(), message: 'Successfully asked for the image.' });
                            return;
                        }
                        setTimeout(callback, 1000);
                    },
                    function (err) {
                        // 10 seconds have passed
                        if (received)
                            return;
                        msg = 'error, timeout in receiving confirmation from device.';
                        res.render('sendmsg', { title: 'Send message', year: new Date().getFullYear(), message: msg });
                    }
                );
                //now wait fir an anwser
                //var isWaiting = false;
                //received = false;
                //function waitForMessages() {
                //    isWaiting = true;
                //    isMessage();
                //    isWaiting = false;
                //}
                //// Start messages listener
                //setInterval(function () { if ((!isWaiting) && (!received)) waitForMessages(); }, 1000);               
            } else {
                msg = 'error finding client in Azure IotT hub.';
                res.render('sendmsg', { title: 'Send message', year: new Date().getFullYear(), message: msg });
            }
            
        });
        

    });
    

    //res.render('sendmsg', { title: 'Send message', year: new Date().getFullYear(), message: msg });
};

export function image(req: express.Request, res: express.Response) {
    res.render('image', { title: 'Image', year: new Date().getFullYear(), message: 'Last image from webcam.' });
};

var received = false;
function isMessage() {
    //if (received)
    //    return false;
    var client = iothub.Client.fromConnectionString(connectionString);
    client.getFeedbackReceiver(function (err, receiver) {
        if (!err)
        {
            received = true;
            console.log('message received ' + receiver.message.getData());
            return true;
        }
    });
    return false;
}