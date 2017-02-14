'use strict';
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const log = require('./log');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it');
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default;

function makeContent(root, options) {
    if (root[root.length - 1] !== '/') {
        const filePath = path.resolve(process.cwd(), options.source_dir, root);
        options.content = fs.readFileSync(filePath, 'utf8');
        return options;
    }
    if (fs.existsSync(path.resolve(process.cwd(), options.source_dir, root, 'index.md'))) {
        options.content = fs.readFileSync(path.posix.resolve(process.cwd(), options.source_dir, root, 'index.md'), 'utf8');
    } else {
        const chapters = options.posts.filter(p => Object.keys(p)[0].indexOf(root) === 0).filter((p) => {
            const pathArr = path.posix.relative(root, Object.keys(p)[0]).split('/');
            if (pathArr.length > 1) return false;
            if (pathArr[0] === '') return false;
            return true;
        });
        let contentStr = '';
        chapters.forEach((p) => {
            const pagePath = Object.keys(p)[0];
            const relativePath = path.posix.relative(root, pagePath);
            let pageHtml = '';
            if (relativePath.substr(-3).toLowerCase() === '.md') {
                pageHtml = relativePath.substr(0, relativePath.length - 3) + '.html';
            } else {
                pageHtml = relativePath + '/';
            }
            const pageName = p[pagePath];
            contentStr += '- [' + pageName + ']';
            contentStr += '(' + pageHtml + ')\n';
        });
        options.content = contentStr;
    }
    return options;
}

function findRootPosition(root, options) {
    for (let i = 0; i < options.posts.length; i += 1) {
        if (options.posts[i][root]) {
            return i;
        }
    }
}

function createPageTitle(root, options) {
    if (root.substr(-3).toLowerCase() === '.md') {
        if (options.content) {
            const contentArr = options.content.split('\n');
            const hasTitle = /^#\s*(.*)\s*$/.exec(contentArr[0]);
            if (hasTitle) {
                options.page_title = hasTitle[1];
                contentArr.shift();
                options.content = contentArr.join('\n');
            } else {
                const position = findRootPosition(root, options);
                options.page_title = options.posts[position][root];
            }
        } else {
            const position = findRootPosition(root, options);
            options.page_title = options.posts[position][root];
        }
        return options;
    }
    if (root[root.length - 1] === '/' && root !== '/') {
        const contentArr = options.content.split('\n');
        const hasTitle = /^#\s*(.*)$/.exec(contentArr[0]);
        if (hasTitle) {
            options.page_title = hasTitle[1];
            contentArr.shift();
            options.content = contentArr.join('\n');
        } else {
            const position = findRootPosition(root, options);
            options.page_title = options.posts[position][root];
        }
        return options;
    }
    if (root === '/') {
        if (options.content !== '') {
            const contentArr = options.content.split('\n');
            const hasTitle = /^#\s*(.*)$/.exec(contentArr[0]);
            if (hasTitle) {
                options.page_title = hasTitle[1];
                contentArr.shift();
                options.content = contentArr.join('\n');
            } else {
                options.page_title = options.site;
            }
        } else {
            options.page_title = options.site;
        }
        return options;
    }
    options.page_title = options.site;
    return options;
}

function makeChapterList(root, options) {
    let chapterArr = options.posts;
    if (!options.posts) {
        chapterArr = [];
    }
    let str = '<ul>';
    let current_level = 0;
    chapterArr.forEach(function(c, i) {
        const chapterPathOrigin = Object.keys(c)[0];
        let chapterPath = chapterPathOrigin;
        if (chapterPath.substr(-3) === '.md') {
            chapterPath = chapterPath.substr(0, chapterPath.length - 3) + '.html';
        } else if (chapterPath.substr(-1) === '/') {
            chapterPath += 'index.html';
        }
        const chapterPathArr = chapterPath.split('/');
        const level = chapterPathArr.length - 1;
        if (level < current_level) {
            for (let i = 0; i < (current_level - level); i += 1) {
                str += '</ul>';
            }
        }
        if (level === current_level && chapterPathOrigin.split('/')[level] === '') {
            str += '</ul>';
        }
        let isFirstLevelDir = false;
        let isCurrentFirstLevelDir = false;
        if (level === 1 && chapterPathOrigin.split('/')[level] === '') {
            isFirstLevelDir = true;
            if (root.indexOf(Object.keys(c)[0]) === 0) {
                isCurrentFirstLevelDir = true;
            }
        }
        str += '<li>';
        str += '<a href="' + options.relative_root_path + chapterPath + '">' + c[Object.keys(c)[0]] + '</a>';
        if (isFirstLevelDir) {
            str += '<a><span></span></a>';
        }
        str += '</li>';
        if (level > current_level || (level === current_level && chapterPathOrigin.split('/')[level] === '')) {
            let collapseClass = '';
            if (isCurrentFirstLevelDir) collapseClass = ' chapter-level-1-current';
            str += '<ul>';
        }
        if (level === current_level && i === (chapterArr.length - 1)) {
            for (let n = 0; n < level; n += 1) {
                str += '</ul>';
            }
        }
        current_level = level;
    });
    str += '</ul>';
    options.chapterList = str;
    return options;
}

function markdownRender(root, options) {
    function highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + '</code></pre>';
            } catch (e) {
                throw e;
            }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
    options.toc = '';
    const md = markdownIt({
        html: true,
        linkify: true,
        highlight
    }).use(markdownItTocAndAnchor, {
        tocFirstLevel: 2,
        tocLastLevel: 3,
        anchorLinkBefore: false,
        tocCallback: (tocMarkdown, tocArray, tocHtml) => {
            options.toc = tocHtml;
        }
    });
    options.content = md.render(options.content);
    return options;
}

function writePage(root, options) {
    const pageContent = options.templates.index(options);
    let relativePath = root;
    if (relativePath === '/') {
        relativePath = './';
    }
    if (relativePath[relativePath.length - 1] === '/') {
        relativePath += 'index.html';
    } else {
        relativePath = relativePath.substr(0, relativePath.length - 3) + '.html';
    }
    fs.outputFileSync(path.resolve(process.cwd(), options.output_dir, relativePath), pageContent);
}

function makeCurrentPath(root, options) {
    options.current_path = root;
    return options;
}

function makeRelativeRootPath(root, options) {
    if (root === '/') {
        options.relative_root_path = './';
    } else {
        const pathArr = root.split('/');
        options.relative_root_path = _.repeat('../', pathArr.length - 1);
    }
    return options;
}

function createPage(root, options) {
    options = makeCurrentPath(root, options);
    options = makeRelativeRootPath(root, options);
    options = makeContent(root, options);
    options = createPageTitle(root, options);
    options = makeChapterList(root, options);
    options = markdownRender(root, options);
    writePage(root, options);
}
exports.createPage = createPage;