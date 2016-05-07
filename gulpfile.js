'use strict';
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var minify = require('gulp-minify');

var scripts = {
      name: 'mosaic.js',
      min: 'mosaic.min.js',
      main: 'dist/mosaic.js',
      src: 'js/*.js',
      list: [
        'js/utils.js',
        'js/core.js',
        'js/mosaicCollection.js',
        'js/pool.js',
        'js/imagePainter.js',
        'js/client.js'
      ],
      all:[
  		  'js/core.js',
        'js/pool.js',
        'js/imagePainter.js',
        'js/mosaicCollection.js',
        'js/client.js',
        'js/average.js',
        'js/columnLoader.js',
        'js/getRowAverage.js',
        'js/httprequest.js',
        'js/imageRemoteLoad.js',
        'js/mosaic.js',
        'js/utils.js'
      ],
      dest: 'dist',
};
 
gulp.task('compress', ['js+'], function() {
  gulp.src(scripts.main)
    .pipe(minify())
    .pipe(gulp.dest('dist'));
});

gulp.task('js+', function () {
  return gulp.src(scripts.list)
    .pipe(plugins.concat(scripts.name))
    .pipe(gulp.dest(scripts.dest));
});


gulp.task('jshint', ['js+'], function () {
  return gulp.src(scripts.all)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'));
});

gulp.task('watch', function () {
  gulp.watch(scripts.list, ['compress']);
});

gulp.task('default', ['watch']);

