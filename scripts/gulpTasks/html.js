import gulp from 'gulp'
import gutil from 'gulp-util'
import plumber from 'gulp-plumber'
import browserSync from 'browser-sync'
import appPath from '../paths'

export default () => {
  return gulp
    .src(appPath.allHTML)
    .pipe(plumber())
    .pipe(browserSync.reload({ stream: true }))
    .on('error', gutil.log)
}
