'use strict'

/**
 * Load all of our dependencies
 */

import gulp from 'gulp'
import babel from 'gulp-babel'
import gutil from 'gulp-util'
import concat from 'gulp-concat'
import minifyJS from 'gulp-jsmin'
import sass from 'gulp-sass'
import imagemin from 'gulp-imagemin'
import minifyCSS from 'gulp-clean-css'
import browserSync from 'browser-sync'
import autoprefixer from 'gulp-autoprefixer'
import gulpSequence from 'gulp-sequence'
import clean from 'gulp-clean'
import plumber from 'gulp-plumber'
import critical from 'critical'

/**
 * Import configs
 */
import CONFIG from './package.json'
const PATHS = CONFIG.paths
const VARS = CONFIG.vars
const PROXY = CONFIG.proxy

/**
 * Variables
 */

 const allHTML = `${PATHS.app.base}/**/*.html`
 const allPHP = `${PATHS.app.base}/**/*.php`
 const allVendorJS = `${PATHS.app.jsVendor}/**/*.js`
 const allSrcJS = `${PATHS.app.jsSrc}/**/*.js`
 const allFont = `${PATHS.app.font}/**/*`
 const allSCSS = `${PATHS.app.scss}/**/*`
 const allIMAGE = `${PATHS.app.img}/**/*`

/**
 * Task Browser Sync for reload browser
 */

gulp.task('browserSync', () => {
  if (PROXY.open) {
    browserSync({
      proxy: PROXY.path,
      options: {
        reloadDelay: 250
      },
      notify: false
    })
  } else {
    browserSync({
      server: {
        baseDir: PATHS.app.base
      },
      options: {
        reloadDelay: 250
      },
      notify: false
    })
  }
})

/**
 * Compressing images
 */

gulp.task('images-build', () => {
  gulp
    .src([allIMAGE])
    .pipe(plumber())
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({ plugins: [{ removeViewBox: false }] })
      ])
    )
    .pipe(gulp.dest(PATHS.output.img))
})

/**
 * Compiling scripts
 */

gulp.task('scripts', () => {
  gulp
    .src([allVendorJS, allSrcJS])
    .pipe(plumber())
    .pipe(
      babel({
        presets: ['es2015'],
        only: /src/
      })
    )
    .pipe(concat(VARS.bundleJS))
    .on('error', gutil.log)
    .pipe(gulp.dest(PATHS.app.js))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('scripts-build', () => {
  gulp
    .src([allVendorJS, allSrcJS])
    .pipe(plumber())
    .pipe(
      babel({
        presets: ['es2015'],
        only: /src/
      })
    )
    .pipe(concat(VARS.bundleJS))
    .pipe(minifyJS()) // compress
    .on('error', gutil.log)
    .pipe(gulp.dest(PATHS.output.js))
})

/**
 * Compiling our SCSS files
 */

const scssSrc = `${PATHS.app.scss}/${VARS.scss}`
gulp.task('style', () => {
  gulp
    .src(scssSrc) // master SCSS file
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'compressed',
        errLogToConsole: true,
        includePaths: [PATHS.app.scss]
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: CONFIG.autoPrefixBrowserList,
        cascade: true
      })
    )
    .on('error', gutil.log)
    .pipe(concat(VARS.bundleCSS))
    .pipe(gulp.dest(PATHS.app.css))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('style-build', () => {
  gulp
    .src(scssSrc) // master SCSS file
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'compressed',
        includePaths: [PATHS.app.scss],
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: CONFIG.autoPrefixBrowserList,
        cascade: true
      })
    )
    .pipe(concat(VARS.bundleCSS))
    .pipe(minifyCSS())
    .pipe(gulp.dest(PATHS.output.css))
})


/**
 * Critical CSS
 */

gulp.task('critical-css', () => {
  gulp
    .src(allHTML)
    .pipe(
      critical.stream({
        base: PATHS.app.base,
        inline: true,
        minify: true,
        width: 1900,
        height: 1200
      })
    )
    .on('error', function(err) {
      gutil.log(gutil.colors.red(err.message))
    })
    .pipe(gulp.dest(PATHS.output.base))
})

/**
 * Watch HTML files for reload
 */

gulp.task('html', () => {
  gulp
    .src(allHTML)
    .pipe(plumber())
    .pipe(browserSync.reload({ stream: true }))
    .on('error', gutil.log)
})

gulp.task('php', () => {
  gulp
    .src(allPHP)
    .pipe(plumber())
    .pipe(browserSync.reload({ stream: true }))
    .on('error', gutil.log)
})

gulp.task('copy', () => {
  gulp
    .src(`${PATHS.app.base}/*`)
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.output.base))

  gulp
    .src(allHTML)
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.output.base))

  gulp
    .src(allPHP)
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.output.base))

  gulp
    .src(`${PATHS.app.base}/.*`)
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.output.base))

  gulp
    .src(allFont)
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.output.font))
})

/**
 * Clear folder output
 */

gulp.task('clean', function() {
  gulp.src(PATHS.output.base).pipe(clean({ force: true }))
})

/**
 * Startup the web server
 */

gulp.task('default', ['browserSync', 'scripts', 'style'], () => {
  gulp.watch(allSrcJS, ['scripts'])
  gulp.watch(allVendorJS, ['scripts'])
  gulp.watch(allSCSS, ['style'])
  gulp.watch(allHTML, ['html'])
  gulp.watch(allPHP, ['php'])
})

/**
 * Build project
 */

gulp.task('build', gulpSequence('scripts-build', 'style-build', 'images-build', 'copy', 'critical-css'))
