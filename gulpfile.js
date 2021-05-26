const gulp = require("gulp");
const plumber = require("gulp-plumber");
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
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");
const cssBase64 = require("gulp-css-base64");
const webp = require("gulp-webp");
const cssnano = require('cssnano');

const { IS_DEV, IS_OFFLINE } = process.env;
const SVGO_PLUGINS_CONFIG = {
  floatPrecision: 2
};
const SVGO_CONFIG = {
  plugins: [
    { removeViewBox: false },
    { removeTitle: true },
    { cleanupNumericValues: SVGO_PLUGINS_CONFIG },
    { convertPathData: SVGO_PLUGINS_CONFIG },
    { transformsWithOnePath: SVGO_PLUGINS_CONFIG },
    { convertTransform: SVGO_PLUGINS_CONFIG },
    { cleanupListOfValues: SVGO_PLUGINS_CONFIG }
  ]
};

const stylesEntries = ["source/less/style.less"];
if (IS_DEV) {
  stylesEntries.push("source/less/dev.less");
}


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
      const rootSrc = page.split("/");
      rootSrc.pop();

      return {
        page,
        root: rootSrc.fill("../").join(""),
        IS_DEV,
        ver: IS_DEV ? `?${Date.now()}` : ""
      };
    }))
    .pipe(twig({
      filters: [
        {
          name: "typograph",
          func(str, nbsp) {
            // Висячие предлоги, союзы и единицы измерения
            return str.replace(/( | |&nbsp;|\(|>){1}([№а-уА-У]{1}|\d+) /gu, `$1$2${nbsp || " "}`);
          }
        }
      ]
    }))
    .pipe(htmlBeautify())
    .pipe(htmlhint(".htmlhintrc"))
    .pipe(htmlhint.reporter())
    .pipe(gulpIf(!IS_OFFLINE, htmlValidator()))
    .pipe(gulpIf(!IS_OFFLINE, htmlValidator.reporter()))
    .pipe(gulp.dest("build"))
    // .pipe(sync.stream());
};

const htmlTasks = gulp.parallel(htmlBuild, htmlTest);


// Styles
const stylesTest = () => {
  return gulp.src("source/less/**/*.less")
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
  return gulp.src(stylesEntries)
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(cssBase64({
      baseDir: "../img/icons",
      extensionsAllowed: [".svg", ".png"],
      maxWeightResource: 10000
    }))
    .pipe(gulp.dest("build/css"))
    .pipe(postcss([
      cssnano()
    ]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("build/css"))
    // .pipe(sync.stream());
};

const stylesTasks = gulp.parallel(stylesTest, styles);


// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};


// Сборка спрайта
const iconsmin = () => gulp.src("source/img/icons/**/*.svg")
  .pipe(imagemin([imagemin.svgo(SVGO_CONFIG)]))
  .pipe(gulp.dest("build/img/icons"));

const spriteBuild = () => gulp.src("build/img/icons/**/*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));


// Перезагрузка страницы в браузере
const reload = (done) => {
  sync.reload();
  done();
};


// Watcher
const watcher = () => {
  gulp.watch("source/twig/**/*.twig", gulp.series(htmlTasks, reload));
  gulp.watch("source/less/**/*.less", gulp.series(stylesTasks, reload));
  gulp.watch("source/img/icons/**/*.svg", gulp.series(gulp.parallel(styles, spriteBuild), reload));
};


// Очищаем папку
const del = require("del");
const clean = () => { return del("build");
};


// Оптимизируем растровые изображения
const images = () => {
return gulp.src("source/img/**/*.{jpg,png}")
.pipe(imagemin([
  imagemin.mozjpeg({quality: 75, progressive: true}),
  imagemin.optipng({optimizationLevel: 3}),
]))
.pipe(gulp.dest("build/img"))
.pipe(webp({quality: 75}))
.pipe(gulp.dest("build/img"))
}
exports.images = images;


// Копируем файлы
  const copy = () => {
  return gulp.src("src/as-is/**/*")
    .pipe(gulp.dest("build"));
  };

exports.test = gulp.parallel(htmlTest, stylesTest);
const build = gulp.series(clean, copy, images, iconsmin, gulp.parallel(htmlTasks, stylesTasks, spriteBuild));
exports.build = build;
exports.default = gulp.series(build, server, watcher);
