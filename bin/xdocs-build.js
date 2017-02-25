#!/usr/bin/env node

const xdocs = require('../libs');
const argv = require('yargs').usage('Usage: xdocs [Options] || xdocs [Options] [Options]').option('build', {
    alias: 'b',
    describe: 'xdocs --build 创建基本结构以及生成内容',
    type: 'boolean'
}).option('clean', {
    alias: 'c',
    describe: 'xdocs --clean 清空生成的内容',
    type: 'boolean'
}).option('deploy', {
    alias: 'd',
    describe: 'xdocs --deploy 部署到github，请配置 _config.yml中的内容',
    type: 'boolean'
}).option('new', {
    alias: 'n',
    describe: 'xdocs --new 创建新文件',
    type: 'string'
}).option('server', {
    alias: 's',
    describe: 'xdocs --server 起一个静态文件的服务',
    type: 'string'
}).option('version', {
    alias: 'v',
    describe: 'xdocs --version 查看版本号',
    type: 'boolean'
}).option('help', {
    alias: 'h',
    describe: 'xdocs --help 帮助信息',
    type: 'boolean'
}).help('help').example('xdocs -b').example('xdocs -c').example('xdocs -d').argv;
if (argv._.indexOf('server') > -1) {
    xdocs.server(argv);
} else {
    if (argv.build) {
        xdocs.build(argv);
    } else if (argv.clean) {
        xdocs.clean(argv);
    } else if (argv.deploy) {
        xdocs.deploy(argv);
    } else if (argv.new) {
        xdocs.new(argv);
    } else if (argv.version) {
        xdocs.version(argv);
    } else if (argv.server) {
        xdocs.server(argv);
    } else {
        console.log('输入的指令不存在，请使用 xdocs -h 查看所有指令!');
    }
}