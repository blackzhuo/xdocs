'use strict';
const log = require('./x-log');
const create = require('./x-create').create;
let makePage = {
    init(options) {
        options.posts.forEach((pageObj) => {
            create.init(pageObj[Object.keys(pageObj)[0]], options);
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