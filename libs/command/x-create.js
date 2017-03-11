'use strict';
const path = require('path');
const fs = require('fs-extra');
const log = require('./x-log');
const yaml = require('js-yaml');
const Mustache = require('mustache');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it');

function getPageIndex(root, options) {
    for (let i = 0; i < options.posts.length; i++) {
        if (options.posts[i].path === root.path) {
            return i;
        }
    }
    return -1;
}

function setCurrentPath(root, options) {
    options.current_path = root.path;
    if (options.current_path === '/') {
        options.isIndex = true;
    }
    return options;
}

function getPageInfo(root, options) {
    const position = getPageIndex(root, options);
    if (position > -1) {
        options.page_title = options.posts[position].name;
        options.content = options.posts[position].content || '';
        options.relative_root_path = options.posts[position].relative_root_path;
        if (options.posts[position].prev) {
            options.prev = options.posts[position].prev;
        } else {
            options.prev = null;
        }
        if (options.posts[position].next) {
            options.next = options.posts[position].next;
        } else {
            options.next = null;
        }
    } else {
        options.page_title = root.name;
        options.content = root.content;
        options.relative_root_path = root.relative_root_path;
        options.prev = null;
        options.next = null;
    }

    return options;
}

function renderContent(root, options) {
    const md = markdownIt({
        html: true,
        linkify: true,
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + '</code></pre>';
                } catch (e) {
                    throw e;
                }
            }
            return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
    });
    options.content = md.render(options.content);
    return options;
}

function createPage(root, options) {
    const pageContent = Mustache.render(options.templates.index, options);
    let relativePath = root.path;
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
    log.info(path.resolve(process.cwd(), options.output_dir, relativePath));
    fs.outputFileSync(path.resolve(process.cwd(), options.output_dir, relativePath), pageContent);
    return options;
}
let create = {
    init(root, options) {
        options = setCurrentPath(root, options);
        options = getPageInfo(root, options);
        options = renderContent(root, options);
        options = createPage(root, options);
        return options;
    }
}
exports.create = create;