'use strict';
const log = require('./log');
const createPage = require('./create').createPage;

let makePage = {
	init: function(options){
		   createPage('/', options);
		    options.posts.forEach(function(pageObj) {
		        createPage(Object.keys(pageObj)[0], options);
		    });
		    return options;
	}
};
module.exports = makePage;