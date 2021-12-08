"use strict";
/*
 * Express App
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression"); // compresses requests
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");
const favicon = require("serve-favicon");
const session = require("express-session");
// import SfmcApiDemoRoutes from './SfmcApiDemoRoutes';
const SfmcAppDemoRoutes_1 = require("./SfmcAppDemoRoutes");
const Utils_1 = require("./Utils");
const PORT = process.env.PORT || 5000;
// Create & configure Express server
const app = express();
// Express configuration
app.set("port", PORT);
app.set("views", path.join(__dirname, "../views"));
app.set('view engine', 'ejs');
// Use helmet. More info: https://expressjs.com/en/advanced/best-practice-security.html
var helmet = require('helmet');
app.use(helmet());
// Allow X-Frame from Marketing Cloud. Sets "X-Frame-Options: ALLOW-FROM http://exacttarget.com".
app.use(helmet.frameguard({
    action: 'allow-from',
    domain: 'http://exacttarget.com'
}));
app.use(session({
    name: 'server-session-cookie-id',
    secret: 'sanagama-df18',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Setup static paths
app.use(express.static(path.join(__dirname, "../static")));
app.use(favicon(path.join(__dirname, '../static', 'images', 'favicons', 'favicon.ico')));
// Routes: pages
app.get('/', function (req, res) { Utils_1.default.initSampleDataAndRenderView(req, res, 'apidemo.ejs'); });
app.get('/apidemo', function (req, res) { Utils_1.default.initSampleDataAndRenderView(req, res, 'apidemo.ejs'); });
app.get('/appdemo', function (req, res) { Utils_1.default.initSampleDataAndRenderView(req, res, 'appdemo.ejs'); });
//const apiDemoRoutes = new SfmcApiDemoRoutes();
const appDemoRoutes = new SfmcAppDemoRoutes_1.default();
// Routes: used by this demo app that internally call Marketing Cloud REST APIs
//app.get('/apidemooauthtoken', function(req, res) {
// apiDemoRoutes.getOAuthAccessToken(req, res); });
// app.get('/loaddata', function(req, res) {
//   apiDemoRoutes.loadData(req, res); });
// Routes: called when this demo app runs as a Marketing Cloud app in an IFRAME in the Marketing Cloud web UI
app.get('/appdemoauthtoken', function (req, res) {
    appDemoRoutes.getOAuthAccessToken(req, res);
});
app.post("/domainconfigurationdecheck", function (req, res) {
    appDemoRoutes.domainConfigurationDECheck(req, res);
});
// Marketing Cloud POSTs the JWT to the '/login' endpoint when a user logs in
app.post('/login', function (req, res) {
    appDemoRoutes.login(req, res);
});
// Marketing Cloud POSTs to the '/logout' endpoint when a user logs out
app.post('/logout', function (req, res) {
    appDemoRoutes.logout(req, res);
});
module.exports = app;
//# sourceMappingURL=app.js.map