// 'use strict';
const co = require('co');
const log = require('./x-log');
const path = require('path');
const ghpages = require('gh-pages');
let deployFunc = {
    init(options) {
        let that = this;
        let args = options.deploy;
        let fn = co.wrap(function* (args) {
            for (let i = 0, len = args.length; i < len; i++) {
                yield that.deploy(args[i], options);
            }
            return true;
        });
        fn(args).then(function (val) {
            log.success('[XDOCS] deploy end.');
            log.end('deploy');
        });
    },
    deploy(arg, options) {
        return new Promise((resolve, reject) => {
            let publicDir = path.resolve(process.cwd(), options.output_dir);
            let message = arg.msg || 'update';
            let countNum = '';
            const count = function () {
                if (!countNum) {
                    countNum = '.';
                } else {
                    countNum += '.';
                }
                log.info(countNum);
            }
            let deployTimer = setInterval(count, 500);
            const pushdone = function () {
                clearInterval(deployTimer);
                resolve('end');
            }
            ghpages.publish(publicDir, {
                branch: arg.branch || '',
                repo: arg.repo || '',
                message: message,
                user: {
                    name: arg.name || '',
                    email: arg.email || ''
                }
            }, pushdone);
        });
    }
};
module.exports = deployFunc;