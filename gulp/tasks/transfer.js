const gulp = require('gulp');

const config = require('./config');

/****************************************************************
 ----------------------------------------------------------------

 transfer

 ----------------------------------------------------------------
 ****************************************************************/

function transferFiles () {
  if (config.settings.transfers && config.settings.transfers.length > 0) {
    config.settings.transfers.forEach((transfer) => {
      const from = transfer[0] + '/**/*.*';
      const to = transfer[1];
      gulp.src([from])
        .pipe(gulp.dest(to));
    });
  }
}

gulp.task('transfer', transferFiles);
