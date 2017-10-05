import gulp from 'gulp'
import gutil from 'gulp-util'
import plumber from 'gulp-plumber'
import browserSync from 'browser-sync'
import webpack from 'webpack-stream'
import webpackConfigDev from '../configs/webpack.config.dev'
import webpackConfigProduction from '../configs/webpack.config.production'
import appPath from '../paths'

const scriptDev = () => {
  return gulp
    .src(appPath.jsRoot)
    .pipe(plumber())
    .pipe(webpack(webpackConfigDev))
    .pipe(gulp.dest(appPath.jsDevOutput))
    .pipe(browserSync.reload({ stream: true }))
}

const scriptBuild = () => {
  return gulp
    .src(appPath.jsRoot)
    .pipe(plumber())
    .pipe(webpack(webpackConfigProduction))
    .on('error', gutil.log)
    .pipe(gulp.dest(appPath.jsProdOutput))
}

export { scriptDev, scriptBuild }
