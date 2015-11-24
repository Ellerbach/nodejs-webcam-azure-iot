/*
 * GET home page.
 */
import express = require('express');
var iothub = require('azure-iothub');
var connectionString = 'HostName=XXX.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=XXX';
var async = require('async');
var cnxString = '';
var year = new Date().getFullYear();
var dataReveived;

export function index(req: express.Request, res: express.Response) {
    res.render('index', { title: 'Express', year });
};

export function sendmsg(req: express.Request, res: express.Response) {    
    var count = 0;
    var deviceID = 'LaurelleRPI';
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
                        isMessage(connectionString, function (err, data) {
                            if (received == true) {
                                //res.header('Cache-Control', 'no-cache');
                                res.render('image', { title: 'Image', year, message: 'Successfully asked for the image.' });
                                return;
                            }
                        });

                        setTimeout(callback, 1000);
                    },
                    function (err) {
                        // 10 seconds have passed
                        if (received)
                            return;
                        msg = 'error, timeout in receiving confirmation from device.';
                        res.render('sendmsg', { title: 'Send message', year, message: msg });
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
                res.render('sendmsg', { title: 'Send message', year, message: msg });
            }
            
        });
        

    });
    

    //res.render('sendmsg', { title: 'Send message', year, message: msg });
};

export function image(req: express.Request, res: express.Response) {
    res.render('image', { title: 'Image', year, message: 'Last image from webcam.' });
};

export function devices(req: express.Request, res: express.Response) {
    var cnxstr = req.body['constr'];

    if ((cnxstr != undefined) || (cnxString)) {
        if (cnxString) {
            if ((cnxstr == undefined)||(cnxstr ==''))
                cnxstr = cnxString;
        }     
        var registry = iothub.Registry.fromConnectionString(cnxstr);
        registry.list(function (err, deviceList) {
            if (!err) {
                cnxString = cnxstr;
                res.render('devices', { title: 'Devices', year, message: 'Getting list of devices', devicelist: deviceList });
            } else
                res.render('devices', { title: 'Devices', year, message: 'Error getting list of devices', devicelist: null });
        });
    } else
        res.render('devices', { title: 'Devices', year, message: 'Please give a valid connection key', devicelist: null });
    
};

export function devicedetail(req: express.Request, res: express.Response) {
    var devId = req.params.deviceId;
    var strcnx = getHostName(cnxString);
    if (strcnx == '')
        res.render('devicedetail', { title: 'Device detail', year, message: 'Error getting device details. Connection string was: ' + cnxString + ' and deviceId: ' + devId });
    strcnx += ';DeviceId=' + devId;
    var registry = iothub.Registry.fromConnectionString(cnxString);
    var msg = 'No device found';
    registry.get(devId, function (err, device) {
        if (!err) {
            strcnx += ';SharedAccessKey=' + device.authentication.SymmetricKey.primaryKey;
            res.render('devicedetail', { title: 'Device detail', year, message: 'Those are the device details. Connection string: ' + strcnx, device: device });

        } else
            res.render('devicedetail', { title: 'Device detail', year, message: 'Error connecting' });

    });

};

export function adddevice(req: express.Request, res: express.Response) {
    var devId = req.params.deviceId;
    if (devId == undefined) {
        devId = req.body['deviceId'];
        if (devId == undefined)
            res.render('adddevice', { title: 'Add device', year, message: 'Error, no device ID' });
    } 
    if (cnxString == '')
        res.render('adddevice', { title: 'Add device', year, message: 'Error, no connection string' });
    else {
        var registry = iothub.Registry.fromConnectionString(cnxString);
        //create a new device
        var device = new iothub.Device(null);
        device.deviceId = devId;
        registry.create(device, function (err, deviceInfo, response) {
            if (err)
                res.render('adddevice', { title: 'Add device', year, message: 'Error, creating device' + err.toString() })
            else
                if (deviceInfo)
                    res.render('adddevice', { title: 'Add device', year, message: 'Device created ' + JSON.stringify(deviceInfo) });
                else
                    res.render('adddevice', { title: 'Add device', year, message: 'Unknown error creating device ' + devId });
        });
    }
 
}

export function removedevice(req: express.Request, res: express.Response) {
    var devId = req.params.deviceId;
    if (devId == undefined) {
        devId = req.body['deviceId'];
        if (devId == undefined)
            res.render('devices', { title: 'Remove device', year, message: 'Error, no device ID' });
    }
    if (cnxString == '')
        res.render('devices', { title: 'Remove device', year, message: 'Error, no connection string' });
    else {
        var registry = iothub.Registry.fromConnectionString(cnxString);
        //create a new device
        registry.delete(devId, function (err, deviceInfo, response) {
            if (err)
                res.render('devices', { title: 'Remove device', year, message: 'Error, deleting device' + err.toString() })
            else
                res.render('devices', { title: 'Remove device', year, message: 'Device deleted ' + devId });
        });
    }
    
}

export function messages(req: express.Request, res: express.Response) {

    var deviceID = req.body['deviceId'];
    var message = req.body['message'];
    if (deviceID != undefined) {
        var registry = iothub.Registry.fromConnectionString(cnxString);
        var msg = 'No device found';
        registry.get(deviceID, function (err, device) {
            msg = 'Device ' + deviceID + ' found. Sending message';
            console.log(msg);
            var client = iothub.Client.fromConnectionString(cnxString);
            client.open(function (err) {
                if (!err) {
                    client.send(deviceID, message);
                    res.render('messages', { title: 'Messages', year, message: 'Sending message to device Id: ' + deviceID + ' message: ' + message });
                } else
                    res.render('messages', { title: 'Messages', year, message: 'Error rending message to device Id: ' + deviceID + ' message: ' + message + ' error: ' + err.toString() });
            });
        });
    } else
        res.render('messages', { title: 'Messages', year, message: 'Listening to messages from devices' });

    //setInterval(function () { if (!isWaiting) waitForMessages(); }, 1000);
    //waitForMessages();
}

var msgstat = '';
export function msgstatus(req: express.Request, res: express.Response) {
    isMessage(cnxString, function (err, feedbackdata) {            
            for (var prop in feedbackdata.body)
                msgstat += 'Feedback, deviceId: ' + feedbackdata.body[prop].deviceId + ', desc: ' + feedbackdata.body[prop].description + ', orginal Id: ' + feedbackdata.body[prop].originalMessageId + '<br>';
            res.end(msgstat);
    });
    res.end(msgstat);
}

function getHostName(str)
{
    var txtchain = str.split(';');
    for (var strx in txtchain) {
        var txtbuck = txtchain[strx].split('=')
        if (txtbuck[0].toLowerCase() == 'hostname')
            return txtchain[strx];
    }
    return '';
}

var received = false;
function isMessage(cnstr: string, callback?) {
    //if (received)
    //    return false;
    var client = iothub.Client.fromConnectionString(cnstr);
    client.getFeedbackReceiver(function (err, receiver) {
        if (!err)
        {          
            receiver.on('errorReceived', function (err) {
                console.log('error ' + err.toString());
            });
            receiver.on('message', function (feedbackRecords) {
                received = true;
                dataReveived = feedbackRecords;
                console.log('message received');
                callback(err, dataReveived);
            });           
            //allback(err, dataReveived);
            return true;
        }
    });
    return false;
}

var isWaiting = false;
received = false;
function waitForMessages() {
    isWaiting = true;
    isMessage(cnxString);
    isWaiting = false;
}