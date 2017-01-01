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

const gulp         = require('gulp');
const gutil        = require('gulp-util');
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify');
const sass         = require('gulp-sass');
const sourceMaps   = require('gulp-sourcemaps');
const imagemin     = require('gulp-imagemin');
const minifyCSS    = require('gulp-clean-css');
const browserSync  = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');
const gulpSequence = require('gulp-sequence');
const shell        = require('gulp-shell');
const plumber      = require('gulp-plumber');

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

gulp.task('images', () => {
  gulp.src(['app/images/*.jpg', 'app/images/*.png'])
  .pipe(plumber())
  .pipe(imagemin({
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
  }))
  .pipe(gulp.dest('app/images'));
});

gulp.task('images-build', () => {
  gulp.src(['app/images/**/*'])
  .pipe(plumber())
  .pipe(gulp.dest(''+output+'/images'));
});

/**
 * Compiling scripts
 */

gulp.task('scripts', () => {
  gulp.src(['app/scripts/src/**/*.js'])
    .pipe(plumber())
    .pipe(concat(scriptOutputName))
    .on('error', gutil.log) // catch errors
    .pipe(gulp.dest('app/scripts'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts-build', () => {
  gulp.src(['app/scripts/src/**/*.js'])
    .pipe(plumber())
    .pipe(concat(scriptOutputName))
    .pipe(uglify()) // compress
    .pipe(gulp.dest(''+output+'/scripts'));
});

/**
 * Compiling our SCSS files
 */

gulp.task('styles', () => {
  gulp.src('app/styles/scss/'+masterSassFileName+'') // master SCSS file
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sourceMaps.init())
    .pipe(sass({
      errLogToConsole: true,
      includePaths: [
        'app/styles/scss'
      ]
    }))
    .pipe(autoprefixer({
       browsers: autoPrefixBrowserList,
       cascade:  true
    }))
    .on('error', gutil.log) // catch errors
    .pipe(concat(styleOutputName))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('app/styles'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('styles-build', () => {
  gulp.src('app/styles/scss/'+masterSassFileName+'') // master SCSS file
    .pipe(plumber())
    .pipe(sass({
      includePaths: [
        'app/styles/scss',
      ]
    }))
    .pipe(autoprefixer({
      browsers: autoPrefixBrowserList,
      cascade:  true
    }))
    .pipe(concat(styleOutputName))
    .pipe(minifyCSS())
    .pipe(gulp.dest(''+output+'/styles'));
});

/**
 * Watch HTML files for reload
 */

gulp.task('html', () => {
  gulp.src('app/*.html')
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}))
    .on('error', gutil.log); // catch errors
});

gulp.task('php', () => {
  gulp.src('app/*.php')
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}))
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
    .pipe(gulp.dest(''+output+'/fonts'));

  // gulp.src(['app/styles/*.css', '!app/styles/styles.css'])
  //   .pipe(plumber())
  //   .pipe(gulp.dest(''+output+'/styles'));
});

/**
 * Clear folder output
 */

gulp.task('clean', () => {
  return shell.task([
    'rm -rf '+output+''
  ]);
});

/**
 * Create folders using shell
 */

gulp.task('createFolder', () => {
  return shell.task([
      'mkdir '+output+'',
      'mkdir '+output+'/fonts',
      'mkdir '+output+'/images',
      'mkdir '+output+'/scripts',
      'mkdir '+output+'/styles'
    ]
  );
});

/**
 * Startup the web server
 */

gulp.task('default', ['browserSync', 'scripts', 'styles', 'images'], () => {
  gulp.watch('app/scripts/src/**', ['scripts']);
  gulp.watch('app/styles/scss/**', ['styles']);
  // gulp.watch('app/images/**', ['images']);
  gulp.watch('app/*.html', ['html']);
  gulp.watch('app/*.php', ['php']);
});

/**
 * Build project
 */

gulp.task('build', gulpSequence('clean', 'createFolder', ['scripts-build', 'styles-build', 'images-build'], 'html-build'));
