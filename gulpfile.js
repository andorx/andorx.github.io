const gulp = require('gulp');
const gulpPlugins = require('gulp-load-plugins')();

var paths = {
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

var configs = {
  highlightStyle: 'agate.css'
};

gulp.task('default', ['templates', 'styles']);

gulp.task('templates', ['build-posts', 'build-pages', 'build-homepage']);

var posts = [];
gulp.task('build-homepage', ['generate-archives'], function buildHomepage(done) {
  return gulp.src(paths.sources.templates.home)
    .pipe(gulpPlugins.data(function(file) {
      var tokens = file.path.split('/');

      tokens.pop();
      tokens.push('index.html');
      file.path = tokens.join('/');

      file.data = Object.assign(file.data || {}, {
        posts: posts,
        highlightStyle: fileRelative(file.relative, paths.sources.styles.vendor + 'highlight.js/' + configs.highlightStyle),
        style: fileRelative(file.relative, paths.dist.styles + 'styles.css')
      });
    }))
    .pipe(gulpPlugins.pug())
    .pipe(gulpPlugins.prettify({
      indent_size: 4,
      indent_char: ' '
    }))
    .pipe(gulp.dest(paths.dist.contents.home));
});

gulp.task('generate-archives', function generateArchive(done) {
  return gulp.src(paths.sources.contents.posts)
    .pipe(gulpPlugins.metaMarkdown())
    .pipe(gulpPlugins.data(function(file) {
      var fileContents = JSON.parse(file.contents.toString());

      posts.push(Object.assign({}, fileContents.meta, {
        link: [paths.dist.contents.posts, file.relative].join()
      }));
    }));
});

gulp.task('build-posts', function buildPosts() {
  return buildTemplates(paths.sources.contents.posts,
    paths.dist.contents.posts,
    paths.sources.templates.post
  );
});

gulp.task('build-pages', function buildPages() {
  return buildTemplates(paths.sources.contents.pages,
    paths.dist.contents.pages,
    paths.sources.templates.page
  );
});

function buildTemplates(src, dest, template, extraVars) {
  var highlight = require('highlight.js');

  extraVars = extraVars || {};

  return gulp.src(src)
    .pipe(gulpPlugins.metaMarkdown({
      langPrefix: 'hljs ',
      highlight: function(code) {
        return highlight.highlightAuto(code).value;
      }
    }))
    .pipe(gulpPlugins.data(function(file) {
      var fileContents = JSON.parse(file.contents.toString());

      // inject variables for Pug template
      file.data = Object.assign({
        highlightStyle: fileRelative(src , paths.sources.styles.vendor + 'highlight.js/' + configs.highlightStyle),
        style: fileRelative(src, paths.dist.styles + 'styles.css')
      }, fileContents.meta, extraVars);
      file.contents = new Buffer(fileContents.html.toString());
    }))
    .pipe(gulpPlugins.assignToPug(template, {
      varName: 'content'
    }))
    .pipe(gulpPlugins.prettify({
      indent_size: 4,
      indent_char: ' '
    }))
    .pipe(gulp.dest(dest));
}

gulp.task('styles', function buildStyles() {
  return gulp.src(paths.sources.styles.base)
    .pipe(gulpPlugins.sass().on('error', gulpPlugins.sass.logError))
    .pipe(gulpPlugins.rename(function (path) {
      path.basename = 'styles';
      path.extname = '.css';
    }))
    .pipe(gulp.dest(paths.dist.styles));
});

// Get relative path between from and to files
function fileRelative(from, to) {
  var fromTokens = from.split('/'),
      toTokens = to.split('/'),
      token = fromTokens.shift();

  if (fromTokens.length > 0) {
    do {
      if (token) {
        toTokens.splice(0, 0, '..');
        token = fromTokens.shift();
      }
    } while (fromTokens.length > 0);
  } else {
    toTokens.splice(0, 0, '.');
  }

  return toTokens.join('/');
}
