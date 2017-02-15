'use strict';
const log = require('./log');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const walkSync = require('walk-sync');
const _posts = '_posts.yml';

function dealFile(prefix) {
    return function(file) {
        let obj = {};
        let key = file;
        let value = file;
        if (/(\.md)$/.test(value)) {
            value = value.replace(/(\.md)$/, '');
        }
        if (/(\/)/.test(value)) {
            value = value.replace(/(\/)/, '-');
        }
        obj[key] = value;
        return obj;
    };
}
let makePosts = {
    init: function(option) {
        let docs = walkSync(path.resolve(process.cwd(), option.source_dir), {
            ignore: ['node_modules']
        });
        docs = docs.filter(function(doc) {
            return !/^\./.test(doc) && !/(\/)$/.test(doc);
        });
        const docsArr = docs.map(dealFile(option.source_dir));
        try {
            fs.writeFileSync(path.resolve(process.cwd(), _posts), yaml.safeDump(docsArr), 'utf8');
        } catch (e) {}
        option.posts = docsArr;
        return option;
    }
};
module.exports = makePosts;