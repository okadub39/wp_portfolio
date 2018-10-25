const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const config = require('./config');

/****************************************************************
 ----------------------------------------------------------------

 server

 ----------------------------------------------------------------
 ****************************************************************/

let proxy = config.settings.proxy;

gulp.task('server:proxy', function() {
  browserSync.init({
    proxy: proxy,
    open:'external',
    ghostMode: false
  });
});

// Static server (development)
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: config.settings.distPath
    }
  });
});

module.exports = browserSync
