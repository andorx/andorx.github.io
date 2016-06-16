module.exports = {
  siteUrl: 'http://andorx.github.io/',
  highlightStyle: 'agate.css',

  sources: {
    styles: {
      base: 'assets/styles/main.scss',
      vendor: 'assets/styles/vendor/'
    },
    templates: {
      base: 'index.pug',
      home: 'templates/home.pug',
      page: 'templates/page.pug',
      post: 'templates/post.pug'
    },
    contents: {
      pages: 'pages/*.md',
      posts: 'posts/*.md'
    }
  },

  dist: {
    styles: 'assets/styles/',
    contents: {
      home: './',
      pages: 'pages/',
      posts: 'posts/'
    }
  }
};