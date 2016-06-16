const gulp = require('gulp');
const gulpPlugins = require('gulp-load-plugins')();

const env = process.env.NODE_ENV || 'dev';
const configs = require('./configs.' + env);

gulp.task('default', ['templates', 'styles']);

gulp.task('templates', ['build-posts', 'build-pages', 'build-homepage']);

var posts = [];
gulp.task('build-homepage', ['generate-archives'], function buildHomepage(done) {
  return gulp.src(configs.sources.templates.home)
    .pipe(gulpPlugins.data(function(file) {
      var segments = file.path.split('/');

      segments.pop();
      segments.push('index.html');
      file.path = segments.join('/');

      file.data = Object.assign(file.data || {}, {
        posts: posts,
        highlightStyle: fileRelative(file.relative, configs.sources.styles.vendor + 'highlight.js/' + configs.highlightStyle),
        style: fileRelative(file.relative, configs.dist.styles + 'style.css'),
        siteUrl: configs.siteUrl
      });
    }))
    .pipe(gulpPlugins.pug())
    .pipe(gulpPlugins.prettify({
      indent_size: 4,
      indent_char: ' '
    }))
    .pipe(gulp.dest(configs.dist.contents.home));
});

gulp.task('generate-archives', function generateArchive(done) {
  return gulp.src(configs.sources.contents.posts)
    .pipe(gulpPlugins.metaMarkdown())
    .pipe(gulpPlugins.data(function(file) {
      var fileContents = JSON.parse(file.contents.toString());

      posts.push(Object.assign({}, fileContents.meta, {
        link: [configs.dist.contents.posts, file.relative].join('')
      }));
    }));
});

gulp.task('build-posts', function buildPosts() {
  return buildTemplates(configs.sources.contents.posts,
    configs.dist.contents.posts,
    configs.sources.templates.post
  );
});

gulp.task('build-pages', function buildPages() {
  return buildTemplates(configs.sources.contents.pages,
    configs.dist.contents.pages,
    configs.sources.templates.page
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
        highlightStyle: fileRelative(src , configs.sources.styles.vendor + 'highlight.js/' + configs.highlightStyle),
        style: fileRelative(src, configs.dist.styles + 'style.css'),
        siteUrl: configs.siteUrl
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
  return gulp.src(configs.sources.styles.base)
    .pipe(gulpPlugins.sass().on('error', gulpPlugins.sass.logError))
    .pipe(gulpPlugins.rename(function (path) {
      path.basename = 'style';
      path.extname = '.css';
    }))
    .pipe(gulp.dest(configs.dist.styles));
});

// Get relative path between from and to files
function fileRelative(from, to) {
  var fromSegments = from.split('/'),
      toSegments = to.split('/'),
      segment = fromSegments.shift();

  if (fromSegments.length > 0) {
    do {
      if (segment) {
        toSegments.splice(0, 0, '..');
        segment = fromSegments.shift();
      }
    } while (fromSegments.length > 0);
  } else {
    toSegments.splice(0, 0, '.');
  }

  return toSegments.join('/');
}
