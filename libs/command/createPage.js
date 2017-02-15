'use strict';
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const log = require('./log');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it');

function getPos(root, options) {
    for (let i = 0; i < options.posts.length; i += 1) {
        if (options.posts[i][root]) {
            return i;
        }
    }
}

function createPostsList(root, options) {
    let chapterArr = options.posts;
    if (!options.posts) {
        chapterArr = [];
    }
    let str = '<ul class="list-group">';
    let current_level = 0;
    chapterArr.forEach(function(c, i) {
        const chapterPathOrigin = Object.keys(c)[0];
        let chapterPath = chapterPathOrigin;
        if (chapterPath.substr(-3) === '.md') {
            // 处理index.md
            if (chapterPath === 'index.md') {
                chapterPath = chapterPath.substr(0, chapterPath.length - 3) + '-me.html';
            } else {
                chapterPath = chapterPath.substr(0, chapterPath.length - 3) + '.html';
            }
        }
        // about不进入列表
        if (chapterPath !== 'about.html') {
            str += '<li class="list-group-item">';
            str += '<a href="' + options.relative_root_path + chapterPath + '">' + c[Object.keys(c)[0]] + '</a>';
            str += '</li>';
        }
    });
    str += '</ul>';
    options.chapterList = str;
    return options;
}

function createPageTitle(root, options) {
    const position = getPos(root, options);
    try {
        options.page_title = options.posts[position][root] || options.name;
    } catch (ex) {
        options.page_title = options.name;
    }
    return options;
}

function createContent(root, options) {
    if (root[root.length - 1] !== '/') {
        const filePath = path.resolve(process.cwd(), options.source_dir, root);
        options.content = fs.readFileSync(filePath, 'utf8');
        return options;
    }
    options.content = '';
    return options;
}

function getCurrentPath(root, options) {
    options.current_path = root;
    return options;
}

function getRelativeRootPath(root, options) {
    if (root === '/') {
        options.relative_root_path = './';
    } else {
        const pathArr = root.split('/');
        options.relative_root_path = _.repeat('../', pathArr.length - 1);
    }
    return options;
}

function createMarkdown(root, options) {
    const md = markdownIt({
        html: true,
        linkify: true,
        highlight: function(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (e) {}
            }
            return md.utils.escapeHtml(str);
        }
    });
    options.content = md.render(options.content);
    return options;
}

function renderPage(root, options) {
    const pageContent = options.templates.index(options);
    let relativePath = root;
    if (relativePath === '/') {
        relativePath = './';
    }
    if (relativePath[relativePath.length - 1] === '/') {
        relativePath += 'index.html';
    } else {
        let outputDoc = relativePath.substr(0, relativePath.length - 3);
        // 处理index.md
        if (outputDoc === 'index') {
            outputDoc = 'index-me';
        }
        relativePath = outputDoc + '.html';
    }
    fs.outputFileSync(path.resolve(process.cwd(), options.output_dir, relativePath), pageContent);
    return options;
}

function createPage(root, options) {
    options = getCurrentPath(root, options);
    options = getRelativeRootPath(root, options);
    options = createPostsList(root, options);
    options = createPageTitle(root, options);
    options = createContent(root, options);
    options = createMarkdown(root, options);
    options = renderPage(root, options);
    return options;
}
exports.createPage = createPage;