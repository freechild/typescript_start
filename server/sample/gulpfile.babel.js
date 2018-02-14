'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import Cache from 'gulp-file-cache';
import nodemon from 'gulp-nodemon'
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import babel from 'gulp-babel';
import del from 'del';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config.js';
import browserSync from 'browser-sync';

let cache = new Cache();


const DIR = {
    SRC: 'src',
    DEST: 'dist',
    BOOTSTRAP: 'bootstrap',
    CDMS: 'cdms'
};

const SRC = {
    BOOTSTRAPJS : DIR.SRC +'/' + DIR.BOOTSTRAP + '/js/*.js',
    BOOTSTRAPCSS : DIR.SRC +'/' + DIR.BOOTSTRAP + '/css/*.css',
    BOOTSTRAPCSSPUG : DIR.SRC +'/' + DIR.BOOTSTRAP + '/css/pug/*.css',
    BOOTSTRAPFONT : DIR.SRC +'/' + DIR.CDMS + '/fonts/*',
    CDMSJS : DIR.SRC +'/' + DIR.CDMS + '/js/*.js',
    CDMSCSS : DIR.SRC +'/' + DIR.CDMS + '/css/*.css',
    CDMSIMAGES : DIR.SRC +'/' + DIR.CDMS + '/images/*',
    JS: DIR.SRC +'/javascripts/*',
    SERVER: 'app_server/**/**/*.js',
    VIEWS: 'app_server/views/**/*'
};

const DEST = {
    BOOTSTRAPJS : DIR.DEST +'/' + DIR.BOOTSTRAP + '/js',
    BOOTSTRAPCSS : DIR.DEST +'/' + DIR.BOOTSTRAP + '/css',
    BOOTSTRAPCSSPUG : DIR.DEST +'/' + DIR.BOOTSTRAP + '/css/pug',
    BOOTSTRAPFONT : DIR.DEST +'/' + DIR.CDMS + '/fonts',
    CDMSJS : DIR.DEST +'/' + DIR.CDMS + '/js',
    CDMSCSS : DIR.DEST +'/' + DIR.CDMS + '/css',
    CDMSIMAGES : DIR.DEST +'/' + DIR.CDMS + '/images',
    JS: DIR.DEST +'/javascripts',
    SERVER: 'app/',
    VIEWS: 'app/views'
};

//default
gulp.task('default', ['clean',
                      'webpack','js',
                      'bootstrapJS', 'bootstrapCSS','bootstrapCSSPUG','bootstrapFONT',
                      'cdmsJS','cdmsCSS','cdmsImages','views',
                      'watch','start','browser-sync'], () => {
    gutil.log('Gulp is running');
});

gulp.task('browser-sync', () => {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ["dist/**/*.*","app/views/**/*.*"],
        port: 7000
    })
});



//webpack
gulp.task('webpack', () => {
    return gulp.src('app.js')
           .pipe(webpack(webpackConfig))
           .pipe(gulp.dest('dist/js'));
});

//nodemon
gulp.task('start', ['babel'], () => {
    return nodemon({
        script:'./bin/www',
        watch: DEST.SERVER
    });
});
gulp.task('babel', () => {
    return gulp.src(SRC.SERVER)
           .pipe(cache.filter())
           .pipe(babel({
              presets: ['es2015']
           }))
           .pipe(cache.cache())
           .pipe(gulp.dest(DEST.SERVER));
});


// views
gulp.task('views', function buildHTML() {
  return gulp.src(SRC.VIEWS)
        .pipe(gulp.dest(DEST.VIEWS));
});

//common

gulp.task('js', () => {
  return gulp.src(SRC.JS)
        //  .pipe(babel({presets: ['babili']}))
         .pipe(gulp.dest(DEST.JS));
});

//bootstrap
gulp.task('bootstrapJS', () => {
  return gulp.src(SRC.BOOTSTRAPJS)
         .pipe(babel({presets: ['babili']}))
         .pipe(uglify())
         .pipe(gulp.dest(DEST.BOOTSTRAPJS));
});
gulp.task('bootstrapCSS', () => {
  return gulp.src(SRC.BOOTSTRAPCSS)
         .pipe(cleanCSS({compatibility: 'ie8'}))
         .pipe(gulp.dest(DEST.BOOTSTRAPCSS));
});
gulp.task('bootstrapCSSPUG', () => {
  return gulp.src(SRC.BOOTSTRAPCSSPUG)
         .pipe(cleanCSS({compatibility: 'ie8'}))
         .pipe(gulp.dest(DEST.BOOTSTRAPCSSPUG));
});
gulp.task('bootstrapFONT', () => {
  return gulp.src(SRC.BOOTSTRAPFONT)
         .pipe(gulp.dest(DEST.BOOTSTRAPFONT));
});

//CDMS
gulp.task('cdmsJS', () => {
  return gulp.src(SRC.CDMSJS)
         .pipe(babel({presets: ['babili']}))
         .pipe(uglify())
         .pipe(gulp.dest(DEST.CDMSJS));
});

gulp.task('cdmsCSS', () => {
    return gulp.src(SRC.CDMSCSS)
           .pipe(cleanCSS({compatibility: 'ie8'}))
           .pipe(gulp.dest(DEST.CDMSCSS));
});

gulp.task('cdmsImages', () => {
    return gulp.src(SRC.CDMSIMAGES)
           .pipe(imagemin())
           .pipe(gulp.dest(DEST.CDMSIMAGES));
});

gulp.task('clean', () => {
    return del.sync([DIR.DEST]);
});


// html example
// gulp.task('html', () => {
//     return gulp.src(SRC.HTML)
//           .pipe(htmlmin({collapseWhitespace: true}))
//           .pipe(gulp.dest(DEST.HTML))
// });

// gulp watch
gulp.task('watch', () => {
  let watcher = {
      //bundle.js
      webpack: gulp.watch(SRC.JS, ['webpack']),

      //bootstrap watch
      bootstrapJS: gulp.watch(SRC.BOOTSTRAPJS, ['bootstrapJS']),
      bootstrapCSS: gulp.watch(SRC.BOOTSTRAPCSS, ['bootstrapCSS']),
      //js
      JS: gulp.watch(SRC.JS, ['js']),
      //cdms watch
      cdmsJS: gulp.watch(SRC.CDMSJS, ['cdmsJS']),
      cdmsCSS: gulp.watch(SRC.CDMSCSS, ['cdmsCSS']),
      cdmsImages: gulp.watch(SRC.CDMSIMAGES, ['cdmsImages']),
      //html: gulp.watch(SRC.HTML, ['html']),
      babel: gulp.watch(SRC.SERVER, ['babel']),
      views: gulp.watch(SRC.VIEWS, ['views']),


  };

    let notify = (event) => {
        gutil.log('File', gutil.colors.yellow(event.path), 'was', gutil.colors.magenta(event.type));
    };

    for(let key in watcher) {
        watcher[key].on('change', notify);
    }
});
