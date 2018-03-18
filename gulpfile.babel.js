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
import clean from 'gulp-rimraf';
import gutil from 'gulp-util';
import critical from 'critical';
import gzip from 'gulp-gzip';
import htmlmin from 'gulp-htmlmin';
import compression from 'compression';

const  criticalStream = critical.stream;


const dirs = {
  src: 'src',
  dest: 'dist'
};

const sassPaths = {
  src: `${dirs.src}/sass/*.scss`,
  dest: `${dirs.dest}/css/`
};

const dataPaths = {
  src: `${dirs.src}/data/*.json`,
  dest: `${dirs.dest}/data/`
};

const jsPaths = {
  src: `${dirs.src}/js/*.js`,
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

const serviceworkerPaths = {
  src: `${dirs.dest}/js/service-worker.js`,
  dest: `${dirs.dest}/`
};

// Run browserSync server on port:8000
gulp.task('browser-sync', () => {
  browserSync({
    server: {
       baseDir: "./dist/",
       middleware: compression()
    },
    open: false,
    port: 8000
  });
});

// Reload browser on changes
gulp.task('bs-reload', () => {
  browserSync.reload();
});

// Copy HTML files to dist
gulp.task('html', () => {
  return gulp.src(htmlPaths.src)
    .pipe(gulp.dest(htmlPaths.dest));
});

// Copy restaurants.json file to dist
gulp.task('data', () => {
  return gulp.src(dataPaths.src)
    .pipe(gulp.dest(dataPaths.dest));
});

// Clean out the /dist folder before build
gulp.task('clean', () => {
  return del([
    'dist/data',
    'dist/img',
    'dist/js',
    'dist/css',
    'dist/index.html',
    'dist/restaurant.html',
    'dist/service-worker.js'
  ]);
});

// Copy images and optimize
gulp.task('images', () => {
  return gulp.src(imgPaths.src)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest(imgPaths.dest));
});

// ToDo: Add responsive image sizes
gulp.task('responsive', () => {
  return gulp.src('src/img/*.jpg')
    .pipe(responsive({
      '1.jpg': [{
          width: '375',
          quality: 70,
          rename: '1-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '1-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '1-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '1-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '1-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '1-mobile-s.webp',
          format: 'webp'
        }],
        '2.jpg': [{
          width: '375',
          quality: 70,
          rename: '2-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '2-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '2-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '2-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '2-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '2-mobile-s.webp',
          format: 'webp'
        }],
        '3.jpg': [{
          width: '375',
          quality: 70,
          rename: '3-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '3-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '3-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '3-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '3-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '3-mobile-s.webp',
          format: 'webp'
        }],
        '4.jpg': [{
          width: '375',
          quality: 70,
          rename: '4-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '4-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '4-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '4-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '4-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '4-mobile-s.webp',
          format: 'webp'
        }],
        '5.jpg': [{
          width: '375',
          quality: 70,
          rename: '5-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '5-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '5-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '5-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '5-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '5-mobile-s.webp',
          format: 'webp'
        }],
        '6.jpg': [{
          width: '375',
          quality: 70,
          rename: '6-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '6-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '6-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '6-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '6-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '6-mobile-s.webp',
          format: 'webp'
        }],
        '7.jpg': [{
          width: '375',
          quality: 70,
          rename: '7-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '7-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '7-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '7-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '7-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '7-mobile-s.webp',
          format: 'webp'
        }],
        '8.jpg': [{
          width: '375',
          quality: 70,
          rename: '8-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '8-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '8-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '8-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '8-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '8-mobile-s.webp',
          format: 'webp'
        }],
        '9.jpg': [{
          width: '375',
          quality: 70,
          rename: '9-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '9-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '9-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '9-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '9-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '9-mobile-s.webp',
          format: 'webp'
        }],
        '10.jpg': [{
          width: '375',
          quality: 70,
          rename: '10-lrg-desktop.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '10-desktop.webp',
          format: 'webp'
        },
        {
          width: '330',
          quality: 70,
          rename: '10-tablet.webp',
          format: 'webp'
        },
        {
          width: '363',
          quality: 70,
          rename: '10-mobile-l.webp',
          format: 'webp'
        },
        {
          width: '313',
          quality: 70,
          rename: '10-mobile-m.webp',
          format: 'webp'
        },
        {
          width: '290',
          quality: 70,
          rename: '10-mobile-s.webp',
          format: 'webp'
        }],
    }))
    .pipe(gulp.dest('dist/img'));
});

// Minifiy and optimize CSS for build
gulp.task('styles', () => {
  return gulp.src(sassPaths.src)
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

// Watch JS file for changes and build
gulp.task('scripts', () => {
  return gulp.src(jsPaths.src)
  .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(babel())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(jsPaths.dest))
    .pipe(browserSync.reload({stream:true}))
});

// Move service worker file to root
gulp.task('serviceworker', () => {
  return gulp.src(serviceworkerPaths.src)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(clean({force: true}))
    .pipe(gulp.dest(serviceworkerPaths.dest));
});


// Generate & Inline Critical-path CSS
gulp.task('critical', () => {
  return gulp.src('dist/*.html')
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
      }}))
      .pipe(criticalStream({
        base: 'dist/',
        inline: true,
        css: ['dist/css/styles.css'],
        timeout: 120000,
      }))
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('dist'));
});


// Watch JS file changes
function watchAppJs(done) {
  return gulp.watch(jsPaths.src, gulp.series('scripts', 'serviceworker'))
    .on('all', function(event, path, stats) {
    console.log('File ' + path + ' was ' + event + ', running tasks...');
  });
}

// Watch HTML file changes
function watchAppHTML(done) {
  return gulp.watch(htmlPaths.src, gulp.series('html','critical','bs-reload'))
    .on('all', function(event, path, stats) {
    console.log('File ' + path + ' was ' + event + ', running tasks...');
  });
}

// Watch CSS file changes
function watchAppCSS(done) {
  return gulp.watch(sassPaths.src, gulp.series('styles', 'critical'))
    .on('all', function(event, path, stats) {
    console.log('File ' + path + ' was ' + event + ', running tasks...');
  });
}

// Default watch task
gulp.task('watch',
  gulp.series(gulp.parallel(watchAppJs, watchAppCSS, watchAppHTML)));

// Default task
gulp.task('default', gulp.series(
  'clean',
  'styles',
  'responsive',
  'html',
  'data',
  'scripts',
  'critical',
  'serviceworker',
  gulp.parallel('browser-sync','watch')
));
