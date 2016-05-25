var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();

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
      home: 'pages/home.md',
      pages: ['pages/*.md', '!pages/home.md'],
      posts: 'posts/*.md'
    }
  },
  dist: {
    styles: 'assets/styles/',
    contents: {
      home: '',
      pages: 'pages/',
      posts: 'posts/'
    }
  }
};

var configs = {
  highlightStyle: 'agate.css'
};

gulp.task('templates', ['build-posts', 'build-pages']);

gulp.task('build-homepage', function buildHomepage() {
  return buildTemplates(paths.sources.contents.home,
    dist.contents.home,
    paths.sources.template.home
  );
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
    paths.sources.templates.post
  );
});

function buildTemplates(src, dest, template) {
  var highlight = require('highlight.js');

  return gulp.src(src)
    .pipe(gulpPlugins.markdown({
      langPrefix: 'hljs ',
      highlight: function(code) {
        return highlight.highlightAuto(code).value;
      }
    }))
    .pipe(gulpPlugins.data(function(file) {
      // inject variables for Pug template
      file.data = {
        'highlightStyle': fileRelative(src , paths.sources.styles.vendor + 'highlight.js/' + configs.highlightStyle),
        'style': fileRelative(src, paths.dist.styles + 'styles.css')
      };
      // var contents = file.contents.toString().trim();
      // process.stdout.write(file.path + '\n' + contents + '\n');
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
