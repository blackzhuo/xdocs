'use strict';
const http = require('http');
const path = require('path');
const connect = require('connect');
const log = require('./command/log');
const getConfig = require('./command/getConfig');
const filesOpt = require('./command/filesOpt');
const makePosts = require('./command/makePosts');
const makePage = require('./command/makePage');
const deployFunc = require('./command/deployFunc');
let xdocs = {
    build: function(options) {
        log.success('[XDOCS] build start');
        options = getConfig.init(options);
        options = filesOpt.init(options);
        options = filesOpt.theme(options);
        options = filesOpt.clean(options);
        options = filesOpt.sources(options);
        options = makePosts.init(options);
        options = makePage.init(options);
        log.success('[XDOCS] build end');
        process.exit(0);
    },
    clean: function(options) {
        log.success('[XDOCS] clean start');
        options = getConfig.init(options);
        options = filesOpt.clean(options);
        log.success('[XDOCS] clean end');
        process.exit(0);
    },
    deploy: function(options) {
        log.success('[XDOCS] deploy start');
        options = getConfig.init(options);
        deployFunc.init(options);
        log.success('[XDOCS] deploy end');
    },
    server: function(options) {
        let port = 8998;
        options = getConfig.init(options);
        let app = connect().use(connect.logger('tiny')).use(connect.query()).use(connect.bodyParser()).use(connect['static'](path.resolve(process.cwd(), options.output_dir), {
            hidden: true,
            redirect: true,
            index: 'null'
        })).use(connect.directory(path.resolve(process.cwd(), options.output_dir)));
        let server = http.createServer(app);
        server.listen(port);
        server.on('listening', function(e) {
            return log.success('[XDOCS] server start port ' + port + '.');
        });
    },
    version: function(options) {
        log.success('[XDOCS] version info');
        const info = require(path.join(__dirname, '../package.json'));
        log.info(info.version);
        process.exit(0);
    }
}
module.exports = xdocs;