const gulp = require('gulp');
const plumber = require('gulp-plumber');
const browserSync = require('./server')

const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const config = require('./config');
let webpackConfig = require('../config/webpack.config');

const utlis = require('./utils');

/****************************************************************
 ----------------------------------------------------------------

 webpack

 ----------------------------------------------------------------
 ****************************************************************/

function webpackError(err, status) {
}

const stream = webpackStream(webpackConfig, webpack, webpackError);

let distPath = '';

if (config.isProxyMode && config.settings.proxyAssetsPath) {
  distPath = config.settings.proxyAssetsPath;
} else {
  distPath = config.settings.distPath + '/' + config.settings.assetsDir;
}

function compileWebpack () {
  return gulp.src([jsSrc])
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
      }
    }))
    .pipe(stream)
    .pipe(gulp.dest(distPath))
    .pipe(browserSync.stream());
}

const jsSrc = utlis.resolveSrc('/js/**/*.[js|vue]');

gulp.task('webpack', compileWebpack);
