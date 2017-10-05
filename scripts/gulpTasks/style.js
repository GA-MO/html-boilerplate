import gulp from 'gulp'
import gutil from 'gulp-util'
import plumber from 'gulp-plumber'
import sass from 'gulp-sass'
import concat from 'gulp-concat'
import autoprefixer from 'gulp-autoprefixer'
import minifyCSS from 'gulp-clean-css'
import browserSync from 'browser-sync'
import appPath from '../paths'
import CONFIG from '../../package.json'

const autoPrefixBrowserList = [
  'last 2 version',
  'safari 5',
  'ie 8',
  'ie 9',
  'opera 12.1',
  'ios 6',
  'android 4'
]

const styleDev = () => {
  return gulp
    .src(appPath.scssSrc)
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'compressed',
        errLogToConsole: true,
        includePaths: [appPath.scssRoot]
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: autoPrefixBrowserList,
        cascade: true
      })
    )
    .on('error', gutil.log)
    .pipe(concat(CONFIG.vars.bundleCSS))
    .pipe(gulp.dest(appPath.cssDevOutput))
    .pipe(browserSync.reload({ stream: true }))
}

const styleBuild = () => {
  return gulp
    .src(appPath.scssSrc)
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'compressed',
        includePaths: [appPath.scssRoot]
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: autoPrefixBrowserList,
        cascade: true
      })
    )
    .pipe(concat(CONFIG.vars.bundleCSS))
    .pipe(minifyCSS())
    .pipe(gulp.dest(appPath.cssProdOutput))
}

export { styleDev, styleBuild }
