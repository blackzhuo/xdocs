'use strict';
const path = require('path');
const http = require('http');
const connect = require('connect');
const getConfig = require('./command/config');
const FilesOpt = require('./command/init');
const posts = require('./command/posts');
const page = require('./command/page');
let xdocs = {
    build: function(options) {
        options = getConfig(options);
        options = FilesOpt.init(options);
        options = FilesOpt.theme(options);
        options = FilesOpt.clean(options);
        options = FilesOpt.copy(options);
        options = posts(options);
        options = page(options);
        return options;
    },
    server: function() {
        var port = 8998;
        var options = FilesOpt.config();
        var app = connect().use(connect.logger('tiny')).use(connect.query()).use(connect.bodyParser()).use(connect["static"](path.resolve(process.cwd(), options.output), {
            hidden: true,
            redirect: true,
            index: 'null'
        })).use(connect.directory(path.resolve(process.cwd(), options.output)));
        var server = http.createServer(app);
        server.listen(port);
        server.on("listening", function(e) {
            console.log("blog server 运行成功, 端口为 " + port + ".");
            return console.log("按 Ctrl + C 结束进程.");
        });
    },
    version: function() {
        const info = require(path.join(__dirname, '../package.json'));
        console.log(info.version);
        process.exit(0);
    }
}
module.exports = xdocs;