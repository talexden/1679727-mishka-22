const { src, dest, watch, series } = require('gulp');
const htmlValidator = require('gulp-w3c-html-validator');
const htmlhint = require('gulp-htmlhint');
const lintspaces = require('gulp-lintspaces');
const twig = require('gulp-twig');
const data = require('gulp-data');
const htmlBeautify = require('gulp-html-beautify');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();

const { IS_OFFLINE } = process.env;

const htmlTest = () => src('source/twig/**/*.twig')
  .pipe(lintspaces({
    editorconfig: '.editorconfig'
  }))
  .pipe(lintspaces.reporter());

const htmlBuild = () => src('source/twig/pages/**/*.twig')
  .pipe(data(async (file) => {
    const page = file.path.replace(/\\/g, '/').replace(/^.*?twig\/pages\/(.*)\.twig$/, '$1');
    return {
      page
    };
  }))
  .pipe(twig())
  .pipe(htmlBeautify())
  .pipe(htmlhint('.htmlhintrc'))
  .pipe(htmlhint.reporter())
  .pipe(gulpIf(!IS_OFFLINE, htmlValidator()))
  .pipe(gulpIf(!IS_OFFLINE, htmlValidator.reporter()))
  .pipe(dest('source'));

const reload = (done) => {
  browserSync.reload();
  done();
};

const watchTask = () => {
  browserSync.init({
    cors: true,
    notify: false,
    server: 'source',
    ui: false
  });

  watch('source/twig/**/*.twig', series(htmlTest, htmlBuild, reload));
};

exports.test = htmlTest;
exports.default = series(htmlTest, htmlBuild, watchTask);
