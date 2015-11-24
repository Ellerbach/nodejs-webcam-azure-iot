import express = require('express');
import routes = require('./routes/index');
import http = require('http');
import path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.disabled('view cache');

import stylus = require('stylus');
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/sendmsg', routes.sendmsg);
app.get('/image', routes.image);
app.get('/devices', routes.devices);
app.post('/devices', routes.devices);
app.get('/devicedetail/:deviceId', routes.devicedetail);
app.get('/adddevice/:deviceId?', routes.adddevice);
app.post('/adddevice', routes.adddevice);
app.get('/removedevice/:deviceId?', routes.removedevice);
app.post('/removedevice', routes.removedevice);
app.post('/messages', routes.messages); 
app.get('/messages', routes.messages);
app.get('/msgstatus', routes.msgstatus);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
