'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';
import minifycss from 'gulp-minify-css';
import browserSync from 'browser-sync';
import responsive from 'gulp-responsive';
import del from 'del';
import sequence from 'gulp-sequence';


const dirs = {
  src: 'src',
  dest: 'dist'
};

const sassPaths = {
  src: `${dirs.src}/sass/**/*.scss`,
  dest: `${dirs.dest}/css/`
};

const dataPaths = {
  src: `${dirs.src}/data/**/*.json`,
  dest: `${dirs.dest}/data/`
};

const jsPaths = {
  src: `${dirs.src}/js/**/*.js`,
  dest: `${dirs.dest}/js/`
};

const imgPaths = {
  src: `${dirs.src}/img/*.jpg`,
  dest: `${dirs.dest}/img/`
};

const htmlPaths = {
  src: `${dirs.src}/**/*.html`,
  dest: `${dirs.dest}/`
};


gulp.task('browser-sync', () => {
  browserSync({
    server: {
       baseDir: "./dist/"
    },
    https: true,
    open: false,
    port: 8000
  });
});

gulp.task('bs-reload', () => {
  browserSync.reload();
});

gulp.task('html', () => {
  return gulp.src(htmlPaths.src)
    .pipe(gulp.dest(htmlPaths.dest));
});

gulp.task('data', () => {
  return gulp.src(dataPaths.src)
    .pipe(gulp.dest(dataPaths.dest));
});


gulp.task('clean', () => {
  del(['dist/**']).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
  });
});

gulp.task('images', () => {
  gulp.src(imgPaths.src)
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest(imgPaths.dest));
});

// ToDo: Add responsive image sizes
gulp.task('responsive', () => {
  return gulp.src('src/*.jpg')
    .pipe(responsive({
      '1.jpg': [{
          width: 200 * 2,
          quality: 50,
          rename: '1@2x.png'
        }
      ]
    }))
    .pipe(gulp.dest('dist'));
});


gulp.task('styles', () => {
  gulp.src(sassPaths.src)
  .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(sassPaths.dest))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', () => {
  return gulp.src(jsPaths.src)
  .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(babel())
    // .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(jsPaths.dest))
    .pipe(browserSync.reload({stream:true}))
});


gulp.task('gulp-sequence',
  sequence(
    ['clean'],
    ['html',
    'data',
    'scripts',
    'styles',
    'images'],
    ['browser-sync']
  ));

gulp.task('default', ['gulp-sequence'], () => {
  gulp.watch(sassPaths.src, ['styles']);
  gulp.watch(jsPaths.src, ['scripts']);
  gulp.watch(htmlPaths.src, ['html','bs-reload']);
});
