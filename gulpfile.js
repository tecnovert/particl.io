/*! particl.io v2.0 | Author: Martin Allien <martin@particl.io> */

/*
  GULP TAKS OVERVIEW
  ----
  * gulp - continuous compilation of SCSS, JS etc. + starts local server with live refresh (browser code injecting)
*/

'use strict';

/* ------------------------------------ *\
    Modules
\* ------------------------------------ */

// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const svgmin = require('gulp-svgmin');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');


/* ------------------------------------ *\
    Variables etc.
\* ------------------------------------ */

sass.compiler = require('node-sass');

const server = browserSync.create();
const fontName = 'icons';

const paths = {
  template: '*.html',
  // CSS
  scss: './_sass/**/*.scss',
  css: './assets/css',
  // JS
  js: './assets/js/src/',
  js_in: './assets/js/src/*.js',
  js_out: './assets/js',
  // iconfont
  ico_input: './assets/img/icons/**/*.svg',
  ico_output: './assets/img/icons/',
  font_output: './assets/fonts/',
}


/* ------------------------------------ *\
    Tasks
    Gulp 3 => 4 guides:
      - https://www.joezimjs.com/javascript/complete-guide-upgrading-gulp-4/
      - https://coder-coder.com/gulp-4-walk-through/
      - https://github.com/gulpjs/gulp/blob/master/docs/recipes/minimal-browsersync-setup-with-gulp4.md
\* ------------------------------------ */

function styles(){
  return src([paths.scss], {base: '.'})
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({cascade: false}))
    .pipe(sourcemaps.write(''))
    .pipe(dest(paths.css)
    .pipe(browserSync.stream())
  );
}


function scripts(){
  return src([
    paths.js + 'jquery-1.11.2.min.js',
    paths.js + 'modernizr.min.js',
    paths.js + 'owl.carousel.min.js',
    paths.js + 'jquery.countdown.min.js', // http://hilios.github.io/jQuery.countdown/
    paths.js + 'moment.min.js', // countdown-related
    paths.js + 'moment-timezone-with-data-2012-2022.min.js', // countdown-related
    paths.js + 'jquery.magnific-popup.min.js', // pop-ups
    paths.js + 'aos.js', // AnimateOnScroll
    paths.js + 'particl.js',
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write(''))
    .pipe(dest(paths.js_out)
    .pipe(browserSync.stream())
  );
}

function icons(){
  return src([paths.ico_input])
    .pipe(svgmin())
    .pipe(dest(paths.ico_output))
    .pipe(iconfontCss({
      fontName: fontName,
      fontPath: '/assets/fonts/',
      targetPath: '../../_sass/_icons.scss',
      cssClass: 'ico'
    }))
    .pipe(iconfont({
      fontName: fontName,
      prependUnicode: true,
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      normalize: true,
      fontHeight: 1001,
      descent: 140
    }))
    .pipe(dest(paths.font_output))
    .pipe(browserSync.stream())
  ;
}


// BrowserSync - start server
function serve(done) {
  server.init({
    server: {
      baseDir: '_site/',
      index: 'index.html'
    }
  });
  done();
}

// BrowserSync - reload page
function reload(done) {
  server.reload();
  done();
}

// Watch task
function watcher(){
  watch([
    paths.scss,
    paths.js_in,
    paths.template
  ],
    parallel(
      styles,
      scripts,
      reload
    )
  );
}


// Default task
exports.default = series( parallel(styles, scripts, serve), watcher );
exports.webfont = series( icons );