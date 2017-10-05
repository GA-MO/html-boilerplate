import gulp from 'gulp'
import plumber from 'gulp-plumber'
import imagemin from 'gulp-imagemin'
import appPath from '../paths'

export default () => {
  return gulp
    .src(appPath.allIMAGE)
    .pipe(plumber())
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({ plugins: [{ removeViewBox: false }] })
      ])
    )
    .pipe(gulp.dest(appPath.imageOutput))
}
