'use strict';

const output = 'dist';
const proxy = false; // Input your server path 'localhost/your-project/app'
const scriptOutputName = 'main.js';
const styleOutputName = 'styles.css';
const masterSassFileName = 'styles.scss';
const autoPrefixBrowserList = [
  'last 2 version',
  'safari 5',
  'ie 8',
  'ie 9',
  'opera 12.1',
  'ios 6',
  'android 4',
];

/**
 * Load all of our dependencies
 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const minifyCSS = require('gulp-clean-css');
const browserSync = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');
const gulpSequence = require('gulp-sequence');
const shell = require('gulp-shell');
const plumber = require('gulp-plumber');

/**
 * Task Browser Sync for reload browser
 */

gulp.task('browserSync', () => {
  if (proxy) {
    browserSync({
      proxy: proxy,
      options: {
        reloadDelay: 250
      },
      notify: false
    });
  } else {
    browserSync({
      server: {
        baseDir: 'app/'
      },
      options: {
        reloadDelay: 250
      },
      notify: false
    });
  }
});

/**
 * Compressing images
 */

gulp.task('images-build', () => {
  gulp.src(['app/images/**/*'])
    .pipe(plumber())
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      // imagemin.svgo({ plugins: [{ removeViewBox: true }] })
    ]))
    .pipe(gulp.dest('' + output + '/images'));
});

/**
 * Compiling scripts
 */

gulp.task('scripts', () => {
  gulp.src(['app/scripts/output/vendors.js', 'app/scripts/output/src.js'])
    .pipe(plumber())
    .pipe(concat(scriptOutputName))
    .on('error', gutil.log) // catch errors
    .pipe(gulp.dest('app/scripts'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('src-scripts', () => {
  gulp.src(['app/scripts/src/**/*.js'])
    .pipe(plumber())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('src.js'))
    .on('error', gutil.log) // catch errors
    .pipe(gulp.dest('app/scripts/output'));
});

gulp.task('vendor-scripts', () => {
  gulp.src(['app/scripts/vendors/**/*.js'])
    .pipe(plumber())
    .pipe(concat('vendors.js'))
    .on('error', gutil.log) // catch errors
    .pipe(gulp.dest('app/scripts/output'));
})

gulp.task('scripts-build', () => {
  gulp.src(['app/scripts/' + scriptOutputName + ''])
    .pipe(plumber())
    .pipe(concat(scriptOutputName))
    .pipe(uglify()) // compress
    .pipe(gulp.dest('' + output + '/scripts'));
});

/**
 * Compiling our SCSS files
 */

gulp.task('styles', () => {
  gulp.src('app/styles/scss/' + masterSassFileName + '') // master SCSS file
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed',
      errLogToConsole: true,
      includePaths: [
        'app/styles/scss'
      ]
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: autoPrefixBrowserList,
      cascade: true
    }))
    .on('error', gutil.log) // catch errors
    .pipe(concat(styleOutputName))
    .pipe(gulp.dest('app/styles'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles-build', () => {
  gulp.src('app/styles/scss/' + masterSassFileName + '') // master SCSS file
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        'app/styles/scss',
      ]
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: autoPrefixBrowserList,
      cascade: true
    }))
    .pipe(concat(styleOutputName))
    .pipe(minifyCSS())
    .pipe(gulp.dest('' + output + '/styles'));
});

/**
 * Watch HTML files for reload
 */

gulp.task('html', () => {
  gulp.src('app/*.html')
    .pipe(plumber())
    .pipe(browserSync.reload({ stream: true }))
    .on('error', gutil.log); // catch errors
});

gulp.task('php', () => {
  gulp.src('app/*.php')
    .pipe(plumber())
    .pipe(browserSync.reload({ stream: true }))
    .on('error', gutil.log); // catch errors
});

gulp.task('html-build', () => {
  gulp.src('app/*')
    .pipe(plumber())
    .pipe(gulp.dest(output));

  gulp.src('app/.*')
    .pipe(plumber())
    .pipe(gulp.dest(output));

  gulp.src('app/fonts/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('' + output + '/fonts'));
});

/**
 * Clear folder output
 */

gulp.task('clean', () => {
  return shell.task([
    'rm -rf ' + output + ''
  ]);
});

/**
 * Create folders using shell
 */

gulp.task('createFolder', () => {
  return shell.task([
    'mkdir ' + output + '',
    'mkdir ' + output + '/fonts',
    'mkdir ' + output + '/images',
    'mkdir ' + output + '/scripts',
    'mkdir ' + output + '/styles'
  ]
  );
});

/**
 * Startup the web server
 */

gulp.task('default', ['browserSync', 'scripts', 'styles'], () => {
  gulp.watch('app/scripts/src/**/*.js', ['src-scripts']);
  gulp.watch('app/scripts/vendors/*.js', ['vendor-scripts']);
  gulp.watch('app/scripts/output/*.js', ['scripts']);
  gulp.watch('app/styles/scss/**', ['styles']);
  gulp.watch('app/*.html', ['html']);
  gulp.watch('app/*.php', ['php']);
});

/**
 * Build project
 */

gulp.task('build', gulpSequence('clean', 'createFolder', ['scripts-build', 'styles-build', 'images-build'], 'html-build'));
