'use strict';
const log = require('./x-log');
const create = require('./x-create').create;
let makePage = {
    init(options) {
        options.posts.sort((item1, item2) => {
            return new Date(item1.date).getTime() < new Date(item2.date).getTime();
        });
        options.posts.forEach((pageObj) => {
            create.config(pageObj, options);
        });
        options.posts.forEach((pageObj) => {
            create.init(pageObj, options);
        });
        create.init({
            path: '/',
            name: '',
            date: ''
        }, options);

        return options;
    }
};
module.exports = makePage;