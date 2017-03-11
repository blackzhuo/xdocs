'use strict';
const log = require('./x-log');
const create = require('./x-create').create;
let makePage = {
    init(options) {
        options.posts.forEach((pageObj) => {
            create.init(pageObj, options);
        });
        create.init({
            path: '/',
            chapterPath: 'index.html',
            pagePath: './index.html',
            relative_root_path: './',
            name: options.name,
            date: '',
            subscript: '',
            site: options.site,
            author: options.author,
            content: ''
        }, options);
        return options;
    }
};
module.exports = makePage;