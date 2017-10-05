import gulp from 'gulp'
import plumber from 'gulp-plumber'
import appPath from '../paths'

export default () => {
  gulp
    .src(`${appPath.base}/*`)
    .pipe(plumber())
    .pipe(gulp.dest(appPath.output))

  gulp
    .src(appPath.allHTML)
    .pipe(plumber())
    .pipe(gulp.dest(appPath.output))

  gulp
    .src(appPath.allPHP)
    .pipe(plumber())
    .pipe(gulp.dest(appPath.output))

  gulp
    .src(`${appPath.base}/.*`)
    .pipe(plumber())
    .pipe(gulp.dest(appPath.output))

  gulp
    .src(appPath.allFont)
    .pipe(plumber())
    .pipe(gulp.dest(appPath.fontOutput))
}
