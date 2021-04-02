const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const stylelint = require("gulp-stylelint");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const htmlValidator = require("gulp-w3c-html-validator");
const htmlhint = require("gulp-htmlhint");
const lintspaces = require("gulp-lintspaces");
const twig = require("gulp-twig");
const data = require("gulp-data");
const htmlBeautify = require("gulp-html-beautify");
const gulpIf = require("gulp-if");
const { IS_OFFLINE } = process.env;


// HTML

const htmlTest = () => {
  return gulp.src("source/twig/**/*.twig")
    .pipe(lintspaces({
      editorconfig: ".editorconfig"
    }))
    .pipe(lintspaces.reporter());
};

const htmlBuild = () => {
  return gulp.src("source/twig/pages/**/*.twig")
    .pipe(data((file) => {
      const page = file.path.replace(/\\/g, "/").replace(/^.*?twig\/pages\/(.*)\.twig$/, "$1");
      return {
        page
      };
    }))
    .pipe(twig())
    .pipe(htmlBeautify())
    .pipe(htmlhint(".htmlhintrc"))
    .pipe(htmlhint.reporter())
    .pipe(gulpIf(!IS_OFFLINE, htmlValidator()))
    .pipe(gulpIf(!IS_OFFLINE, htmlValidator.reporter()))
    .pipe(gulp.dest("source"))
    .pipe(sync.stream());
};

const htmlTasks = gulp.parallel(htmlBuild, htmlTest);


// Styles

const stylesTest = () => {
  return gulp.src("src/less/**/*.less")
    .pipe(lintspaces({
      editorconfig: ".editorconfig"
    }))
    .pipe(lintspaces.reporter())
    .pipe(stylelint({
      reporters: [
        {
          console: true,
          formatter: "string"
        }
      ]
    }));
};

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
};

const stylesTasks = gulp.parallel(stylesTest, styles);


// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "source"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

// Watcher
const watcher = () => {
  gulp.watch("source/twig/**/*.twig", htmlTasks);
  gulp.watch("source/less/**/*.less", stylesTasks);
};

exports.test = gulp.parallel(htmlTest, stylesTest);
const build = gulp.parallel(htmlTasks, stylesTasks);
exports.build = build;
exports.default = gulp.series(build, server, watcher);
