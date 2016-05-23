gulp         = require('gulp')
del          = require('del')
cache        = require('gulp-cache')
uglify       = require('gulp-uglify')
concat       = require('gulp-concat')
jshint       = require('gulp-jshint')
sass         = require('gulp-ruby-sass')
imagemin     = require('gulp-imagemin')
broeserSync  = require('browser-sync')
minifycss    = require('gulp-minify-css')
extender     = require('gulp-html-extend')
minifyHTML   = require('gulp-minify-html')
autoprefixer = require('gulp-autoprefixer')

gulp.task 'browser-sync', ['rebuild'], ->
  broeserSync({
    server: {
      baseDir: './dist/'
    },
    port: 8080,
    host: '0.0.0.0',
    ui: {
      port: 8081
    }
  })

gulp.task 'rebuild', ->
  broeserSync.reload()

gulp.task 'watch', ->
  gulp.watch(['./dist/**/*.*'], ['rebuild'])
  gulp.watch(['./source/**/*.html'], ['extend'])
  gulp.watch(['./source/**/*.css'], ['css'])
  gulp.watch(['./source/**/*.js'], ['js'])
  gulp.watch(['./source/**/*.jpg','./source/**/*.png'], ['image'])


gulp.task 'css', -> 
  gulp.src('./source/**/*.css') 
  .pipe autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')
  .pipe concat('style.css')
  .pipe minifycss()
  .pipe gulp.dest('./dist/css/')

gulp.task 'extend', -> 
  gulp.src('./source/views/application/**/*.html') 
  .pipe extender({annotations:false,verbose:false})
  .pipe minifyHTML()
  .pipe gulp.dest('./dist/')

gulp.task 'js', -> 
  gulp.src('./source/**/*.js') 
  .pipe uglify()
  .pipe gulp.dest('./dist/')

gulp.task 'image', -> 
  gulp.src(['./source/**/*.jpg','./source/**/*.png']) 
  .pipe cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
  .pipe gulp.dest('./dist/')

gulp.task 'clean', -> 
  del ['./dist/css','./dist/js','./dist/gallery', './dist/img', './dist/**/*.html']

gulp.task 'build', ['css', 'js', 'image', 'extend']

gulp.task 'default', ['browser-sync', 'watch']




