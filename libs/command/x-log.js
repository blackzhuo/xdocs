'use strict';
const colors = require('colors');
const log = {
    success(info) {
        console.log(colors.green(info));
    },
    error(info) {
        console.log(colors.red(info));
    },
    info(info) {
        console.log(colors.gray(info));
    },
    start(key) {
        console.time(key);
    },
    end(key) {
        console.timeEnd(key);
    }
};
module.exports = log;