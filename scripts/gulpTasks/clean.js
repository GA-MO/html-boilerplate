import gulp from 'gulp'
import clean from 'gulp-clean'
import appPath from '../paths'

export default () => gulp.src(appPath.output).pipe(clean({ force: true }))
