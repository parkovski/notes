'use strict';

var gulp = require('gulp');
var react = require('gulp-react');
var less = require('gulp-less');
var nodemon = require('gulp-nodemon');

var paths = {
  components: {
    src: 'src/clientjs/components/*.jsx',
    dest: 'out/clientjs/components'
  },
  less: {
    src: 'style/*.less',
    dest: 'style/css'
  }
};

gulp.task('jsx', function() {
  return gulp.src(paths.components.src)
    .pipe(react())
    .pipe(gulp.dest(paths.components.dest));
});

gulp.task('less', function() {
  return gulp.src(paths.less.src)
    .pipe(less())
    .pipe(gulp.dest(paths.less.dest));
});

gulp.task('dev', function() {
  gulp.watch(paths.components.src, ['less']);
  nodemon({ script: 'main.js', ext: 'js html' });
});

gulp.task('default', ['less']);
