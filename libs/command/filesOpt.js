const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const walkSync = require('walk-sync');
const log = require('./log');

function readTemplate(options, dest) {
    const pageTemplate = fs.readFileSync(path.resolve(dest, 'index.template'), 'utf8');
    options.templates = {};
    options.templates['index'] = pageTemplate;
    options.templates.index = _.template(options.templates.index);
    return options;
}
let filesOpt = {
    init: function(options) {
        let goalDirPath = path.resolve(process.cwd(), 'source')
        if (fs.existsSync(goalDirPath)) {} else {
            fs.mkdirSync(goalDirPath);
        }
        let isConfigExists;
        let about = path.resolve(process.cwd(), 'source/about.md');
        try {
            fs.accessSync(about);
            isConfigExists = true;
        } catch (e) {
            isConfigExists = false;
        }
        if (!isConfigExists) {
            fs.writeFileSync(about, `# about`, 'utf8');
        }
        return options;
    },
    clean: function(options) {
        fs.removeSync(path.resolve(process.cwd(), options.output_dir));
        return options;
    },
    sources: function(options) {
        fs.copySync(path.resolve(process.cwd(), 'themes', 'default'), path.resolve(process.cwd(), options.output_dir), {
            filter(file) {
                return !/\.template$/.test(file);
            }
        });
        let source_from = path.resolve(process.cwd(), options.source_dir, 'sources');
        let source_to = path.resolve(process.cwd(), options.output_dir, 'sources');
        if (fs.existsSync(source_from)) {
            fs.copySync(source_from, source_to);
        }
        return options;
    },
    theme: function(options) {
        let theme_src = path.resolve(__dirname, '../../themes', options.theme, `layout`);
        let theme_dest = path.resolve(process.cwd(), 'themes', options.theme);
        if (!fs.existsSync(path.resolve(process.cwd(), 'themes', options.theme))) {
            fs.copySync(theme_src, theme_dest);
        }
        options = readTemplate(options, theme_dest);
        return options;
    }
}
module.exports = filesOpt;