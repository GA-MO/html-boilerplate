import gulp from 'gulp'
import gutil from 'gulp-util'
import critical from 'critical'
import appPath from '../paths'

export default () => {
  return gulp
    .src(appPath.allHTML)
    .pipe(
      critical.stream({
        base: appPath.base,
        inline: true,
        minify: true,
        width: 1400,
        height: 900,
        timeout: 30000
      })
    )
    .on('error', function(err) {
      gutil.log(gutil.colors.red(err.message))
    })
    .pipe(gulp.dest(appPath.output))
}
