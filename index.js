'use strict';
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const winston = require('winston');
const session = require('express-session');
const http = require('http');

const Controller = require('./controllers/index_controller');
const settings = require('./settings');

const port = settings['serverPort'];
const app = express();

function WebApp() {
    let self = this;
    self.configureExpress();
}

WebApp.prototype.configureExpress = function () {
    let self = this;

    app.use(express.static(path.join(__dirname, 'public')));

    // Logger setup
    self.configureLogger();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');
    app.set('port', port);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    self.configureCORSHeaders();

    app.use('/', Controller);

    self.startServer();
};

WebApp.prototype.configureCORSHeaders = function () {
    app.all('/*', function (req, res, next) {
        // CORS headers
        res.header("Access-Control-Allow-Origin", settings['website_link']); // restrict it to the required domain
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', "*");
        res.header('Access-Control-Allow-Credentials', "true");
        if (req.method === 'OPTIONS') {
            res.status(200).end();
        } else {
            next();
        }
    });
};


WebApp.prototype.configureLogger = function () {
    app.use(morgan('combined'));

    winston.add(winston.transports.File, {
        filename: path.join(__dirname, 'logs', 'web.log'),
        colorize: true,
        handleExceptions: true
    });

    winston.remove(winston.transports.Console);
};

WebApp.prototype.startServer = function () {
    let server = http.createServer(app);
    server.listen(port, function () {
        console.log("Server is up and running.");
        console.log(app.get('env'));
    });
};

new WebApp();