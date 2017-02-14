'use strict';
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const markdownIt = require('markdown-it');
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default;
const hljs = require('highlight.js');

function makeContent(root, pageOption) {
    if (root[root.length - 1] !== '/') {
        const filePath = path.resolve(process.cwd(), pageOption.source_dir, root);
        pageOption.content = fs.readFileSync(filePath, 'utf8');
        return pageOption;
    }
    if (fs.existsSync(path.resolve(process.cwd(), pageOption.source_dir, root, 'index.md'))) {
        pageOption.content = fs.readFileSync(path.posix.resolve(process.cwd(), pageOption.source_dir, root, 'index.md'), 'utf8');
    } else {
        const chapters = pageOption.posts.filter(p => Object.keys(p)[0].indexOf(root) === 0).filter((p) => {
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
        pageOption.content = contentStr;
    }
    return pageOption;
}

function findRootPosition(root, pageOption) {
    for (let i = 0; i < pageOption.posts.length; i += 1) {
        if (pageOption.posts[i][root]) {
            return i;
        }
    }
}

function createPageTitle(root, pageOption) {
    if (root.substr(-3).toLowerCase() === '.md') {
        if (pageOption.content) {
            const contentArr = pageOption.content.split('\n');
            const hasTitle = /^#\s*(.*)\s*$/.exec(contentArr[0]);
            if (hasTitle) {
                pageOption.page_title = hasTitle[1];
                contentArr.shift();
                pageOption.content = contentArr.join('\n');
            } else {
                const position = findRootPosition(root, pageOption);
                pageOption.page_title = pageOption.posts[position][root];
            }
        } else {
            const position = findRootPosition(root, pageOption);
            pageOption.page_title = pageOption.posts[position][root];
        }
        return pageOption;
    }
    if (root[root.length - 1] === '/' && root !== '/') {
        const contentArr = pageOption.content.split('\n');
        const hasTitle = /^#\s*(.*)$/.exec(contentArr[0]);
        if (hasTitle) {
            pageOption.page_title = hasTitle[1];
            contentArr.shift();
            pageOption.content = contentArr.join('\n');
        } else {
            const position = findRootPosition(root, pageOption);
            pageOption.page_title = pageOption.posts[position][root];
        }
        return pageOption;
    }
    if (root === '/') {
        if (pageOption.content !== '') {
            const contentArr = pageOption.content.split('\n');
            const hasTitle = /^#\s*(.*)$/.exec(contentArr[0]);
            if (hasTitle) {
                pageOption.page_title = hasTitle[1];
                contentArr.shift();
                pageOption.content = contentArr.join('\n');
            } else {
                pageOption.page_title = pageOption.site;
            }
        } else {
            pageOption.page_title = pageOption.site;
        }
        return pageOption;
    }
    pageOption.page_title = pageOption.site;
    return pageOption;
}

function makeChapterList(root, pageOption) {
    let chapterArr = pageOption.posts;
    if (!pageOption.posts) {
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
        str += '<a href="' + pageOption.relative_root_path + chapterPath + '">' + c[Object.keys(c)[0]] + '</a>';
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
    pageOption.chapterList = str;
    return pageOption;
}

function markdownRender(root, pageOption) {
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
    pageOption.toc = '';
    const md = markdownIt({
        html: true,
        linkify: true,
        highlight
    }).use(markdownItTocAndAnchor, {
        tocFirstLevel: 2,
        tocLastLevel: 3,
        anchorLinkBefore: false,
        tocCallback: (tocMarkdown, tocArray, tocHtml) => {
            pageOption.toc = tocHtml;
        }
    });
    pageOption.content = md.render(pageOption.content);
    return pageOption;
}

function writePage(root, pageOption) {
    const pageContent = pageOption.templates.index(pageOption);
    let relativePath = root;
    if (relativePath === '/') {
        relativePath = './';
    }
    if (relativePath[relativePath.length - 1] === '/') {
        relativePath += 'index.html';
    } else {
        relativePath = relativePath.substr(0, relativePath.length - 3) + '.html';
    }
    fs.outputFileSync(path.resolve(process.cwd(), pageOption.output_dir, relativePath), pageContent);
}

function makeCurrentPath(root, pageOption) {
    pageOption.current_path = root;
    return pageOption;
}

function makeRelativeRootPath(root, pageOption) {
    if (root === '/') {
        pageOption.relative_root_path = './';
    } else {
        const pathArr = root.split('/');
        pageOption.relative_root_path = _.repeat('../', pathArr.length - 1);
    }
    return pageOption;
}

function createPage(root, pageOption) {
    pageOption = makeCurrentPath(root, pageOption);
    pageOption = makeRelativeRootPath(root, pageOption);
    pageOption = makeContent(root, pageOption);
    pageOption = createPageTitle(root, pageOption);
    pageOption = makeChapterList(root, pageOption);
    pageOption = markdownRender(root, pageOption);
    writePage(root, pageOption);
}
exports.createPage = createPage;