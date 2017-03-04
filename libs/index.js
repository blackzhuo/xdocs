'use strict';
const http = require('http');
const path = require('path');
const connect = require('connect');
const log = require('./command/x-log');
const config = require('./command/x-config');
const handler = require('./command/x-handler');
const posts = require('./command/x-posts');
const page = require('./command/x-page');
const deploy = require('./command/x-deploy');
let xdocs = {
    build(options) {
        log.start('build');
        log.success('[XDOCS] build start');
        options = config.init(options);
        options = handler.init(options);
        options = handler.theme(options);
        options = handler.clean(options);
        options = handler.sources(options);
        options = posts.init(options);
        options = page.init(options);
        log.success('[XDOCS] build end');
        log.end('build');
        process.exit(0);
    },
    clean(options) {
        log.start('clean');
        log.success('[XDOCS] clean start');
        options = config.init(options);
        handler.clean(options);
        log.success('[XDOCS] clean end');
        log.end('clean');
        process.exit(0);
    },
    deploy(options) {
        log.start('deploy');
        log.success('[XDOCS] deploying...');
        options = config.init(options);
        deploy.init(options);
    },
    new(options) {
        log.start('create');
        log.success('[XDOCS] create start');
        options = config.init(options);
        handler.create(options);
        log.success('[XDOCS] create end');
        log.end('create');
        process.exit(0);
    },
    server(options) {
        let port = options.server || 8998;
        options = config.init(options);
        let app = connect().use(connect.logger('tiny')).use(connect.query()).use(connect.bodyParser()).use(connect['static'](path.resolve(process.cwd(), options.output_dir), {
            hidden: true,
            redirect: true,
            index: 'index.html'
        })).use(connect.directory(path.resolve(process.cwd(), options.output_dir)));
        let server = http.createServer(app);
        server.listen(port);
        server.on('listening', (e) => {
            log.success(`[XDOCS] server start port ${port}.`);
            return log.info(`please visit http://127.0.0.1:${port}`);
        });
    },
    version(options) {
        log.success('[XDOCS] version info');
        const info = require(path.join(__dirname, '../package.json'));
        log.info(info.version);
        process.exit(0);
    }
}
module.exports = xdocs;