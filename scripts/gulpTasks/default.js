import gulp from 'gulp'
import appPath from '../paths'

export default () => {
  gulp.watch(appPath.allSrcJS, ['scripts'])
  gulp.watch(appPath.allVendorJS, ['scripts'])
  gulp.watch(appPath.allSCSS, ['style'])
  gulp.watch(appPath.allHTML, ['html'])
  gulp.watch(appPath.allPHP, ['php'])
}
