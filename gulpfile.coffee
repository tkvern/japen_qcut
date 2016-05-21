gulp = require('gulp')
sass = require('gulp-ruby-sass')
autoprefixer = require('gulp-autoprefixer')
broeserSync = require('browser-sync')
imagemin = require('gulp-imagemin')
cache = require('gulp-cache')
minifycss = require('gulp-minify-css')
uglify = require('gulp-uglify')
jshint = require('gulp-jshint')
extender = require('gulp-html-extend')

gulp.task 'browser-sync', ['rebuild'], ->
  broeserSync({
    server: {
      baseDir: './dist/'
    }
  })

gulp.task 'rebuild', ->
  broeserSync.reload()

gulp.task 'watch', ->
  gulp.watch(['./dist/**/*.*'], ['rebuild'])
  gulp.watch(['./source/**/*.html'], ['extend'])
  gulp.watch(['./source/**/*.css'], ['css'])
  gulp.watch(['./source/**/*.js'], ['js'])
  gulp.watch(['./source/img/**.*'], ['image'])
  gulp.watch(['./source/gallery/**/*.*'], ['image'])


gulp.task 'css', -> 
  gulp.src('./source/**/*.css') 
  .pipe autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')
  .pipe minifycss()
  .pipe gulp.dest('./dist/')

gulp.task 'extend', -> 
  gulp.src('./source/views/application/**/*.html') 
  .pipe extender({annotations:false,verbose:false})
  .pipe gulp.dest('./dist/')


gulp.task 'js', -> 
  gulp.src('./source/**/*.js') 
  .pipe uglify()
  .pipe gulp.dest('./dist/')

gulp.task 'image', -> 
  gulp.src('./source/**/*.*') 
  .pipe cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
  .pipe gulp.dest('./dist/')


gulp.task 'default', ['browser-sync', 'watch']




