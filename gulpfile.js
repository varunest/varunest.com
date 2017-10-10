'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('default', ['sass'], function () {
    console.log('GULP process completed successfully :)');
});

gulp.task('watch', ['default'], function () {
    gulp.watch('./sass/**/*.scss', ['default']);
});

gulp.task('sass', function () {
    return gulp.src('./sass/*.scss')
        .pipe(sass(
            {
                includePaths: [__dirname + '/sass/', __dirname + '/bootstrap/scss', __dirname + '/bootstrap/scss/mixins'],
                outputStyle: 'compressed'
            }
        ).on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});