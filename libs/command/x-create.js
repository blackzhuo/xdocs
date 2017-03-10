'use strict';
const path = require('path');
const fs = require('fs-extra');
const log = require('./x-log');
const yaml = require('js-yaml');
const Mustache = require('mustache');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it');

function postPosition(root, options) {
    for (let i = 0; i < options.posts.length; i++) {
        if (options.posts[i].path === root) {
            return i;
        }
    }
}

function createPostsList(root, options) {
    let pa = options.posts;
    if (!options.posts) {
        pa = [];
    }
    let str = [];
    pa.forEach((item, index) => {
        let relative_root_path = '';
        if (item.path === '/') {
            relative_root_path = './';
        } else {
            const pp = item.path.split('/');
            relative_root_path = '../'.repeat(pp.length - 1);
        }
        const chapterPathOrigin = item.path;
        let chapterPath = chapterPathOrigin;
        if (chapterPath.substr(-3) === '.md') {
            // 处理index.md
            if (chapterPath === 'index.md') {
                chapterPath = `${chapterPath.substr(0, chapterPath.length - 3)}-me.html`;
            } else {
                chapterPath = `${chapterPath.substr(0, chapterPath.length - 3)}.html`;
            }
        }
        item.pagePath = relative_root_path + chapterPath;
        // about不进入列表
        if (chapterPath !== 'about.html') {
            let listTmpl = Mustache.render(fs.readFileSync(path.resolve(__dirname, './tmpl/title.string'), 'utf8'), {
                path: relative_root_path + chapterPath,
                name: item.name,
                subscript: item.subscript,
                site: item.site,
                author: item.author,
                date: item.date
            });
            str.push(listTmpl);
        }
    });
    options.chapterList = str.join('');
    return options;
}

function createTitle(root, options) {
    const position = postPosition(root, options);
    try {
        options.page_title = options.posts[position].name || options.name;
    } catch (ex) {
        options.page_title = options.name;
    }
    return options;
}

function createContent(root, options) {
    if (root[root.length - 1] !== '/') {
        const filePath = path.resolve(process.cwd(), options.source_dir, root);
        options.content = fs.readFileSync(filePath, 'utf8');
        let pageInfo = '';
        let subscript = '';
        if (options.content.includes('>>>>>>>>>>')) {
            pageInfo = options.content.split('>>>>>>>>>>')[0];
            options.content = options.content.split('>>>>>>>>>>')[1];
            subscript = options.content.split('<!--description-->')[0] || '';
        }
        if (pageInfo) {
            pageInfo = yaml.safeLoad(pageInfo);
            pageInfo.subscript = subscript;
            const position = postPosition(root, options);
            Object.assign(options.posts[position], pageInfo);
            if (options.posts[position].prev) {
                options.prev = options.posts[position].prev;
            }
            if (options.posts[position].next) {
                options.next = options.posts[position].next;
            }
        }
        return options;
    }
    options.content = '';
    return options;
}

function createPrevNext(root, options) {
    options.posts.forEach((pageObj, index) => {
        if (index === 0 && options.posts[1]) {
            pageObj.next = {
                name: options.posts[1].name,
                path: options.posts[1].pagePath
            }
        } else if (index === options.posts.length - 1) {
            pageObj.prev = {
                name: options.posts[index - 1].name,
                path: options.posts[index - 1].pagePath
            }
        } else {
            pageObj.prev = {
                name: options.posts[index - 1].name,
                path: options.posts[index - 1].pagePath
            }
            pageObj.next = {
                name: options.posts[index + 1].name,
                path: options.posts[index + 1].pagePath
            }
        }
    });
    return options;
}

function setCurrentPath(root, options) {
    options.current_path = root;
    if (options.current_path === '/') {
        options.isIndex = true;
    }
    return options;
}

function getRelativeRootPath(root, options) {
    if (root === '/') {
        options.relative_root_path = './';
    } else {
        const pp = root.split('/');
        options.relative_root_path = '../'.repeat(pp.length - 1);
    }
    return options;
}

function createMarkdown(root, options) {
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

function renderPage(root, options) {
    const pageContent = Mustache.render(options.templates.index, options);
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
    log.info(path.resolve(process.cwd(), options.output_dir, relativePath));
    fs.outputFileSync(path.resolve(process.cwd(), options.output_dir, relativePath), pageContent);
    return options;
}
let create = {
    init(root, options) {
        options = setCurrentPath(root.path, options);
        options = getRelativeRootPath(root.path, options);
        options = createContent(root.path, options);
        options = createTitle(root.path, options);
        options = createMarkdown(root.path, options);
        options = createPostsList(root.path, options);
        options = renderPage(root.path, options);
        return options;
    },
    config(root, options) {
        options = createPostsList(root.path, options);
        options = createContent(root.path, options);
        options = createPrevNext(root.path, options);
        return options;
    }
}
exports.create = create;