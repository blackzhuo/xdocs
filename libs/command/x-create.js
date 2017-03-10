'use strict';
const path = require('path');
const fs = require('fs-extra');
const log = require('./x-log');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it');

function postPosition(root, options) {
    for (let i = 0; i < options.posts.length; i += 1) {
        if (options.posts[i][root]) {
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
    pa.sort(function(item1, item2) {
        return new Date(item1[Object.keys(item1)[0]].date) < new Date(item2[Object.keys(item2)[0]].date)
    });
    pa.forEach((item, index) => {
        const chapterPathOrigin = Object.keys(item)[0];
        let chapterPath = chapterPathOrigin;
        if (chapterPath.substr(-3) === '.md') {
            // 处理index.md
            if (chapterPath === 'index.md') {
                chapterPath = `${chapterPath.substr(0, chapterPath.length - 3)}-me.html`;
            } else {
                chapterPath = `${chapterPath.substr(0, chapterPath.length - 3)}.html`;
            }
        }
        // about不进入列表
        if (chapterPath !== 'about.html') {
            let listTmpl = `<div class="post-preview">
                                <a href="${options.relative_root_path + chapterPath}">
                                    <h2 class="post-title">
                                        ${item[Object.keys(item)[0]].name}
                                    </h2>
                                    <h3 class="post-subtitle">
                                        ${item[Object.keys(item)[0]].name}
                                    </h3>
                                </a>
                                <p class="post-meta">Posted by <a href="${options.relative_root_path}index.html">${options.author}</a> ${item[Object.keys(item)[0]].date}</p>
                            </div>
                            <hr>`;
            str.push(listTmpl);
        }
    });
    options.chapterList = str.join('');
    return options;
}

function createTitle(root, options) {
    const position = postPosition(root, options);
    try {
        options.page_title = options.posts[position][root].name || options.name;
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
        if (options.content.includes('>>>>>>>>>>')) {
            pageInfo = options.content.split('>>>>>>>>>>')[0];
            options.content = options.content.split('>>>>>>>>>>')[1];
        }
        if (pageInfo) {
            pageInfo = (new Function("return " + pageInfo))();
            const position = postPosition(root, options);
            Object.assign(options.posts[position][root], pageInfo);
        }
        return options;
    }
    options.content = '';
    return options;
}

function setCurrentPath(root, options) {
    options.current_path = root;
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
    }
}
exports.create = create;