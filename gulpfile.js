var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var beautify = require('gulp-html-beautify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var exec = require('child_process').exec;
var gutil = require('gulp-util');

// Set the banner content
var banner = ['/*!\n',
	' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
	' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
	' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
	' */\n',
	''
].join('');

// Publish third party libraries into /app/static/app/static/vendor
gulp.task('vendor:publish', function() {

	// Bootstrap
	gulp.src([
		'node_modules/bootstrap/dist/**/*',
		'!node_modules/bootstrap/dist/css/bootstrap-grid*',
		'!node_modules/bootstrap/dist/css/bootstrap-reboot*'
	])
		.pipe(gulp.dest('app/static/vendor/bootstrap'));

	// Bootstrap-notify
	gulp.src([
		'node_modules/bootstrap-notify/*.js',
		'!node_modules/bootstrap-notify/*.min.js',
	])
		.pipe(gulp.dest('app/static/vendor/bootstrap-notify'));

	// DataTables
	gulp.src([
		'node_modules/datatables.net/js/*.js',
		'node_modules/datatables.net-bs4/js/*.js',
		'node_modules/datatables.net-bs4/css/*.css',
		'node_modules/datatables.net-responsive/js/*'
	])
		.pipe(gulp.dest('app/static/vendor/datatables/'));

	// Font Awesome
	gulp.src([
		'node_modules/font-awesome/**/*',
		'!node_modules/font-awesome/{less,less/*}',
		'!node_modules/font-awesome/{scss,scss/*}',
		'!node_modules/font-awesome/.*',
		'!node_modules/font-awesome/*.{txt,json,md}'
	])
		.pipe(gulp.dest('app/static/vendor/font-awesome'));

	// jQuery
	gulp.src([
		'node_modules/jquery/dist/*',
		'!node_modules/jquery/dist/core.js'
	])
		.pipe(gulp.dest('app/static/vendor/jquery'));

	// jQuery
	gulp.src([
		'node_modules/jquery.easing/*.js',
		'!node_modules/jquery.easing/*.min.js'
	])
		.pipe(gulp.dest('app/static/vendor/jquery-easing'));

	// Pe-icon
	gulp.src([
		'node_modules/pe7-icon/dist/*/*'
	])
		.pipe(gulp.dest('app/static/vendor/pe7-icon'));

	// animate.css
	gulp.src([
		'node_modules/animate.css/*.css',
		'!node_modules/animate.css/*.min.css',
	])
		.pipe(gulp.dest('app/static/vendor/animate-css'));
});

// Minify vendor js
gulp.task('vendor:js', function() {
	gulp.src([
		'app/static/vendor/**/*.js',
		'!app/static/vendor/**/*.min.js'
	])
		.pipe(uglify())
		.on('error', function (err) {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('app/static/vendor'))
});

// Minify vendor css
gulp.task('vendor:css', function() {
	gulp.src([
		'app/static/vendor/**/*.css',
		'!app/static/vendor/**/*.min.css'
	])
		.pipe(cleanCSS())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('app/static/vendor'))
});

// Complete vendor
gulp.task('vendor', ['vendor:publish', 'vendor:css', 'vendor:js']);

// Compile SASS 
gulp.task('css:compile', function() {
	return gulp.src('app/static/sass/**/*.sass')
		.pipe(sass.sync({
			outputStyle: 'expanded'
		}).on('error', sass.logError))
		.pipe(rename({
			suffix: '.compiled'
		}))
		.pipe(gulp.dest('app/static/css'));
});

// Minify CSS
gulp.task('css:minify', function() {
	return gulp.src([
		'app/static/css/**/*.css',
		'!app/static/css/**/*.min.css',
		'!app/static/css/vendor'
	])
		.pipe(cleanCSS())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('app/static/css'))
		.pipe(browserSync.stream({match: 'app/static/css/**/*.css'}));
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js', function() {
	return gulp.src([
		'app/static/js/**/*.js',
		'!app/static/js/**/*.min.js',
		'!app/static/css/vendor'
	])
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('app/static/js'))
		.pipe(browserSync.stream());
});

// Default task
gulp.task('default', ['css', 'js']);

// Configure the browserSync task
gulp.task('browserSync', function() {
	browserSync.init({
		notify: false,
		proxy: '127.0.0.1:5000',
		open: false
	});
});

//Run Flask server
gulp.task('runserver', function() {
	exec('pipenv run ./start.sh');
});

// Dev task
gulp.task('dev', ['runserver', 'browserSync'], function() {
	gulp.watch([
		'app/templates/**/*.html',
		'app/**/*.py',
	], browserSync.reload);
	gulp.watch([
		'app/static/sass/**/*.sass',
	], ['css:compile']);
	gulp.watch([
		'app/static/css/**/*.css',
		'!app/static/css/**/*.min.css',
	], ['css:minify']);
	gulp.watch([
		'app/static/js/**/*.js',
		'!app/static/js/**/*.min.js'
	], ['js']);
});
