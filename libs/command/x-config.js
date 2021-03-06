const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const log = require('./x-log');
const _config = '_config.yml';
let getConfig = {
    init(options) {
        var config = '';
        try {
            config = yaml.safeLoad(fs.readFileSync(path.resolve(process.cwd(), _config), 'utf8'));
        } catch (e) {
            config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../../', _config), 'utf8'));
            fs.copySync(path.resolve(__dirname, '../../', _config), path.resolve(process.cwd(), _config));
        }
        Object.assign(options, config);
        return options;
    }
};
module.exports = getConfig;