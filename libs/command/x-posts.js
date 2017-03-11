'use strict';
const log = require('./x-log');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const Mustache = require('mustache');
const walkSync = require('walk-sync');
const utils = require('./x-utils');

const SEP = '>>>>>>>>>>';
const SEPD = '<!--description-->';

let makePosts = {
    renderList(options) {
        // about不进入列表
        let page = [];
        options.posts.forEach((item, index) => {
            if (item.chapterPath !== 'about.html') {
                let listTmpl = Mustache.render(fs.readFileSync(path.resolve(__dirname, './tmpl/title.string'), 'utf8'), item);
                page.push(listTmpl);
            }
        });
        options.chapterList = page.join('');
        return options;
    },
    createPrevNext(options) {
        let postCollection = [];
        let otherCollection = [];
        options.posts.forEach((item, index) => {
            if (item.chapterPath !== 'about.html') {
                postCollection.push(item);
            } else {
                otherCollection.push(item);
            }
        });
        postCollection.forEach((item, index) => {
            if (index === 0 && postCollection[1]) {
                item.prev = null;
                item.next = {
                    name: postCollection[1].name,
                    path: postCollection[1].pagePath
                }
            } else if (index === postCollection.length - 1) {
                item.prev = {
                    name: postCollection[index - 1].name,
                    path: postCollection[index - 1].pagePath
                }
                item.next = null;
            } else {
                item.prev = {
                    name: postCollection[index - 1].name,
                    path: postCollection[index - 1].pagePath
                }
                item.next = {
                    name: postCollection[index + 1].name,
                    path: postCollection[index + 1].pagePath
                }
            }
        });
        postCollection = postCollection.concat(otherCollection);
        options.posts = postCollection;
        return options;
    },
    init(options) {
        let docs = walkSync(path.resolve(process.cwd(), options.source_dir), {
            ignore: ['node_modules']
        });
        docs = docs.filter((doc) => {
            return !/^\./.test(doc) && !/(\/)$/.test(doc);
        });
        let page = [];
        const docsArr = docs.map((file) => {
            // 处理文章名字
            let value = file;
            if (/(\.md)$/.test(value)) {
                value = value.replace(/(\.md)$/, '');
            }
            if (/(\/)/.test(value)) {
                value = value.replace(/(\/)/, '-');
            }
            // 获取文章头部信息
            const filePath = path.resolve(process.cwd(), options.source_dir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let pageInfo = '';
            let subscript = '';
            if (content.includes(SEP)) {
                pageInfo = content.split(SEP)[0];
                content = content.split(SEP)[1];
                subscript = content.split(SEPD)[0] || '';
            }
            if (pageInfo) {
                pageInfo = yaml.safeLoad(pageInfo);
                pageInfo.subscript = subscript;
            }

            // 获取文章路径
            let relative_root_path = '';
            let pagePath = file.split('/');
            relative_root_path = '../'.repeat(pagePath.length - 1);
            let chapterPath = file;
            if (chapterPath.substr(-3) === '.md') {
                // 处理index.md
                if (chapterPath === 'index.md') {
                    chapterPath = `${chapterPath.substr(0, chapterPath.length - 3)}-me.html`;
                } else {
                    chapterPath = `${chapterPath.substr(0, chapterPath.length - 3)}.html`;
                }
            }
            pagePath = relative_root_path + chapterPath;
            // 文章信息
            let date = pageInfo.date ? pageInfo.date.toISOString().substr(0, 19).replace('T', ' ') : '';
            let obj = {
                path: file,
                chapterPath: chapterPath,
                pagePath: pagePath,
                relative_root_path: relative_root_path,
                name: pageInfo.title || options.name,
                subscript: pageInfo.subscript,
                site: pageInfo.site,
                author: pageInfo.author,
                date: utils.formatDateNow(new Date(date)),
                content: content
            };
            return obj;
        });
        options.posts = docsArr;
        options.posts.forEach((item, index) => {

        });
        options.posts.sort((item1, item2) => {
            return (new Date(item1.date)) < (new Date(item2.date)) ? 1 : -1;
        });
        options = this.renderList(options);
        options = this.createPrevNext(options);
        return options;
    }
};
module.exports = makePosts;