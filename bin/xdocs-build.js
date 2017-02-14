#!/usr/bin/env node

const xdocs = require('../libs');

const argv = require('yargs').usage('Usage: xdocs [Options]').option('server', {
    alias: 's',
    describe: 'xdocs server',
    type: 'boolean'
}).option('build', {
    alias: 'b',
    describe: 'xdocs build',
    type: 'boolean'
}).option('clean', {
    alias: 'c',
    describe: 'xdocs clean',
    type: 'boolean'
}).option('deploy', {
    alias: 'd',
    describe: 'xdocs deploy',
    type: 'boolean'
}).option('version', {
    alias: 'v',
    describe: 'xdocs version',
    type: 'boolean'
}).option('help', {
    alias: 'h',
    describe: 'xdocs help',
    type: 'boolean'
}).help('help').example('xdocs').example('xdocs -s').example('xdocs -v').argv;

argv.build && xdocs.build(argv);
argv.clean && xdocs.clean(argv);
argv.deploy && xdocs.deploy(argv);
argv.server && xdocs.server(argv);
argv.version && xdocs.version(argv);
1 &&  xdocs.build(argv);