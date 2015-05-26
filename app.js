var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var apiRoutes = require('./routes/api');
var errorHandler = require('./routes/error');

function beforeRouteSetup(app) {
	// view engine setup
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');

	// uncomment after placing your favicon in /public
	// app.use(favicon(__dirname + '/public/favicon.ico'));
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));
}

function routeSetup(app) {
	app.use('/api', apiRoutes);
}

function afterRouteSetup(app) {
	errorHandler.registerRoutes(app);
}

/** Entry Point */
var app = express();
beforeRouteSetup(app);
routeSetup(app);
afterRouteSetup(app);
module.exports = app;