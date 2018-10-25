const gulp = require('gulp');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const browserSync = require('./server')

const imagemin = require('gulp-imagemin');

const config = require('./config');

/****************************************************************
 ----------------------------------------------------------------

 copy

 ----------------------------------------------------------------
 ****************************************************************/

const staticImgPath = './static/img/**/*.+(jpg|png|gif)';

let distPath = '';

if (config.isProxyMode && config.settings.proxyAssetsPath) {
  distPath = config.settings.proxyAssetsPath;
} else {
  distPath = config.settings.distPath + '/' + config.settings.assetsDir;
}

function compileImage () {
  return gulp.src([staticImgPath])
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(imagemin())
    .pipe(gulp.dest(distPath +'/img'));
}

gulp.task('img', compileImage);
gulp.task('img:watch', function () {
  compileImage();
  return watch([staticImgPath], compileImage);
});

const staticOtherPath = './static/**/*';
const staticOtherExcludePath = '!./static/img/**/*.+(jpg|png|gif)';

function copyStaticFiles () {
  return gulp.src([staticOtherPath, staticOtherExcludePath], {base: 'static'})
    .pipe(gulp.dest(distPath + '/'));
}

gulp.task('copy', copyStaticFiles);
gulp.task('copy:watch', function () {
  copyStaticFiles();
  return watch([staticOtherPath], copyStaticFiles);
});

