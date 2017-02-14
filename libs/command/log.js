'use strict';
var colors = require('colors');
const log = {
    success: function(info) {
        console.log(colors.green(info));
    },
    error: function(info) {
        console.log(colors.red(info));
    },
    info: function(info) {
        console.log(colors.gray(info));
    }
};
module.exports = log;