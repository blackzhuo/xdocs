// 'use strict';
const log = require('./x-log');
const path = require('path');
const ghpages = require('gh-pages');
let deployFunc = {
    init(options) {
        let args = options.deploy[0];
        let publicDir = path.resolve(process.cwd(), options.output_dir);
        let message = args.msg || 'update';
        let countNum = '';
        const count = function() {
            if (!countNum) {
                countNum = '.';
            } else {
                countNum += '.';
            }
            log.info(countNum);
        }
        let deployTimer = setInterval(count, 500);
        const pushdone = function() {
            clearInterval(deployTimer);
            log.success('[XDOCS] deploy end.');
            log.end('deploy');
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