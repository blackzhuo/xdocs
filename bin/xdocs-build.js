#!/usr/bin/env node

const xdocs = require('../libs');
const argv = require('yargs').usage('Usage: xdocs [Options]').option('server', {
    alias: 's',
    describe: 'xdocs server',
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
argv.server && xdocs.server(argv);
argv.version && xdocs.version(argv);
xdocs.build(argv);