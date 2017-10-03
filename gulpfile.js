'use strict'

/**
 * Load all of our dependencies
 */

const gulp = require('gulp')
const babel = require('gulp-babel')
const gutil = require('gulp-util')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const imagemin = require('gulp-imagemin')
const minifyCSS = require('gulp-clean-css')
const browserSync = require('browser-sync')
const autoprefixer = require('gulp-autoprefixer')
const gulpSequence = require('gulp-sequence')
const clean = require('gulp-clean')
const plumber = require('gulp-plumber')
const critical = require('critical').stream

/**
 * Import configs
 */

const CONFIG = require('./package.json')
const PATHS = CONFIG.paths
const VARS = CONFIG.vars
const PROXY = CONFIG.proxy

/**
 * Variables
 */

 const allHTML = PATHS.app.base + '/**/*.html'
 const allPHP = PATHS.app.base + '/**/*.php'
 const allVendorJS = PATHS.app.jsVendor + '/**/*.js'
 const allSrcJS = PATHS.app.jsSrc + '/**/*.js'
 const allFont = PATHS.app.font + '/**/*'
 const allSCSS = PATHS.app.scss + '/**/*'
 const allIMAGE = PATHS.app.img + '/**/*'

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
        imagemin.optipng({ optimizationLevel: 5 })
        // imagemin.svgo({ plugins: [{ removeViewBox: true }] })
      ])
    )
    .pipe(gulp.dest(PATHS.output.img))
})

/**
 * Compiling scripts
 */

gulp.task('scripts-babel', () => {
 gulp
   .src([allSrcJS])
   .pipe(plumber())
   .pipe(
     babel({
       presets: ['es2015']
     })
   )
   .pipe(concat(VARS.tempJS))
   .on('error', gutil.log)
   .pipe(gulp.dest(PATHS.app.jsVendor))
})

gulp.task('scripts', () => {
  gulp
    .src([allVendorJS])
    .pipe(plumber())
    .pipe(concat(VARS.bundleJS))
    .on('error', gutil.log)
    .pipe(gulp.dest(PATHS.app.js))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('scripts-build', () => {
  gulp
    .src([allVendorJS])
    .pipe(plumber())
    .pipe(concat(VARS.bundleJS))
    // .pipe(uglify()) // compress
    .pipe(gulp.dest(PATHS.output.js))
})

/**
 * Compiling our SCSS files
 */

const scssSrc = PATHS.app.scss + '/' + VARS.scss
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
      critical({
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
    .src(PATHS.app.base + '/*')
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
    .src(PATHS.app.base + '/.*')
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

gulp.task('default', ['browserSync', 'scripts-babel', 'scripts', 'style'], () => {
  gulp.watch(allSrcJS, ['scripts'])
  gulp.watch(allVendorJS, ['scripts'])
  gulp.watch(allSCSS, ['style'])
  gulp.watch(allHTML, ['html'])
  gulp.watch(allPHP, ['php'])
})

/**
 * Build project
 */

gulp.task('build', gulpSequence('scripts-babel', 'scripts-build', 'style-build', 'images-build', 'copy', 'critical-css'))
