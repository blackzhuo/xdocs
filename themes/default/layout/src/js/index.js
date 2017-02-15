(function() {
    console.log('blog init');
    var blogContainer = document.querySelector('.blog-container');
    var blogMasthead = window.getComputedStyle(document.querySelector('.blog-masthead')).height;
    var blogFooter = window.getComputedStyle(document.querySelector('.blog-footer')).height;
    var minHeight = document.documentElement.clientHeight - parseInt(blogMasthead) - parseInt(blogFooter);
    blogContainer.style.minHeight = minHeight + 'px';
}());