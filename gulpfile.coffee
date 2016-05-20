gulp = require('gulp')
sass = require('gulp-ruby-sass')
autoprefixer = require('gulp-autoprefixer')
broeserSync = require('browser-sync')
imagemin = require('gulp-imagemin')
cache = require('gulp-cache')

gulp.task 'browser-sync', ['rebuild'], ->
  broeserSync({
    server: {
      baseDir: './'
    }
  })

gulp.task 'rebuild', ->
  broeserSync.reload()

gulp.task 'watch', ->
  gulp.watch(['./*.html'], ['rebuild'])

gulp.task 'imagemin', -> 
  gulp.src('./gulpimg/**/*.*') 
  .pipe(
    cache(
      imagemin({ 
        optimizationLevel: 3, 
        progressive: true, 
        interlaced: true })
    )
  ) 
  .pipe(gulp.dest('./'))


gulp.task 'default', ['browser-sync', 'watch']