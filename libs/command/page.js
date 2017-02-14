'use strict';
const createPage = require('./create').createPage;

function page(option) {
    createPage('/', option);
    option.posts.forEach(function(pageObj) {
        createPage(Object.keys(pageObj)[0], option);
    });
    return option;
}
module.exports = page;