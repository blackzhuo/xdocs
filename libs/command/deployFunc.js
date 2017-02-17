// 'use strict';
const log = require('./log');
const path = require('path');
const ghpages = require('gh-pages');
let deployFunc = {
    init: function(options) {
        let args = options.deploy[0];
        let publicDir = path.resolve(process.cwd(), options.output_dir);
        let message = args.msg || 'update';

        function pushdone() {
            log.success('[XDOCS] deploy end.');
        }
        ghpages.publish(publicDir, {
            branch: args.branch || '',
            repo: args.repo || '',
            message: message,
            user: {
                name: args.name || '',
                email: args.email || ''
            }
        }, pushdone);
    }
};
module.exports = deployFunc;