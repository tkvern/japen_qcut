gulp = require('gulp')
sass = require('gulp-ruby-sass')
autoprefixer = require('gulp-autoprefixer')
broeserSync = require('browser-sync')
imagemin = require('gulp-imagemin')
cache = require('gulp-cache')
minifycss = require('gulp-minify-css')
uglify = require('gulp-uglify')
jshint = require('gulp-jshint')

gulp.task 'browser-sync', ['rebuild'], ->
  broeserSync({
    server: {
      baseDir: './'
    },
    port: 8080,
    host: '0.0.0.0'
  })

gulp.task 'rebuild', ->
  broeserSync.reload()

gulp.task 'watch', ->
  gulp.watch(['./*.html'], ['rebuild'])


gulp.task 'css', -> 
  gulp.src('./gulptask/**/*.css') 
  .pipe autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')
  .pipe minifycss()
  .pipe gulp.dest('./')


gulp.task 'js', -> 
  gulp.src('./gulptask/**/*.js') 
  .pipe uglify()
  .pipe gulp.dest('./')

gulp.task 'image', -> 
  gulp.src('./gulptask/**/*.*') 
  .pipe cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
  .pipe gulp.dest('./')


gulp.task 'default', ['browser-sync', 'watch']