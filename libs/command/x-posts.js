'use strict';
const log = require('./x-log');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const walkSync = require('walk-sync');
let makePosts = {
    init(option) {
        let docs = walkSync(path.resolve(process.cwd(), option.source_dir), {
            ignore: ['node_modules']
        });
        docs = docs.filter((doc) => {
            return !/^\./.test(doc) && !/(\/)$/.test(doc);
        });
        const docsArr = docs.map((file) => {
            let obj = {};
            let key = file;
            let value = file;
            if (/(\.md)$/.test(value)) {
                value = value.replace(/(\.md)$/, '');
            }
            if (/(\/)/.test(value)) {
                value = value.replace(/(\/)/, '-');
            }
            obj[key] = {
                path: key,
                name: value,
                date: ''
            };
            return obj;
        });
        option.posts = docsArr;
        return option;
    }
};
module.exports = makePosts;