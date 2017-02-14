const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const _ = require('lodash');
const _config = '_config.yml';

function getConfig(options) {
    var config = '';
    try {
        config = yaml.safeLoad(fs.readFileSync(path.resolve(process.cwd(), _config), 'utf8'));
    } catch (e) {
        config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../../', _config), 'utf8'));
        fs.copySync(path.resolve(__dirname, '../../', _config), path.resolve(process.cwd(), _config));
    }
    _.assign(options, config);
    return options;
}
module.exports = getConfig;