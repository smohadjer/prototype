var gulp = require('gulp'),
	//sass support
	sourcemaps = require('gulp-sourcemaps'),
	sass = require('gulp-sass'),

	//local server
	connect = require('gulp-connect'),
	opn = require('opn'),

	//precompiling handlebars templates
	handlebars = require('gulp-handlebars'),
	wrap = require('gulp-wrap'),
	declare = require('gulp-declare'),
	concat = require('gulp-concat'),

	//linting
	htmlhint = require("gulp-htmlhint"),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	csslint = require('gulp-csslint'),

	//build
	del = require('del'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	cssnano = require('gulp-cssnano'),
	runSequence = require('run-sequence'),

	//include
	nunjucksRender = require('gulp-nunjucks-render');

gulp.task('clean:tmp', function () {
	return del([
		'.tmp/**/*'
	]);
});

//precompile handlebars templates
gulp.task('templates', function() {
	gulp.src('app/resources/templates/*.hbs')
		.pipe(handlebars({
			handlebars: require('handlebars')
		}))
		.pipe(wrap('Handlebars.template(<%= contents %>)'))
		.pipe(declare({
			namespace: 'MyApp.templates',
			noRedeclare: true, // Avoid duplicate declarations
		}))
		.pipe(concat('handlebars.templates.js'))
		.pipe(gulp.dest('.tmp/resources/js/'));
});

gulp.task('sass', function () {
	var stream = gulp.src('app/resources/css/styles.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write('/maps'))
		//.pipe(cssHint())
		.pipe(gulp.dest('.tmp/resources/css'))
		.pipe(connect.reload());

	return stream;
});

gulp.task('htmlHint', function() {
	var stream = gulp.src('.tmp/*.html')
		.pipe(htmlhint())
		.pipe(htmlhint.failReporter());
	return stream;
});

gulp.task('cssLint', function() {
	return gulp.src('.tmp/resources/css/styles.css')
		.pipe(csslint())
		.pipe(csslint.reporter())
		//.pipe(csslint.reporter('fail'));
});

gulp.task('jsHint', function() {
	return gulp.src('app/resources/js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(jshint.reporter('fail'))
		.pipe(connect.reload());
});

//include partials
gulp.task('nunjucks', function() {
	return gulp.src('app/*.html')
		// Renders template with nunjucks
		.pipe(nunjucksRender({
			path: ['app/_partials']
		}))
		.pipe(gulp.dest('.tmp'))
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch('app/resources/css/*.scss', ['sass']);
	gulp.watch('app/resources/templates/*.hbs', ['templates']);
	gulp.watch(['app/*.html', 'app/_partials/**/*.html'], ['nunjucks']);

	gulp.watch('app/resources/js/*.js', ['jsHint']);
	gulp.watch('.tmp/resources/css/styles.css', ['cssLint']);
	gulp.watch('.tmp/*.html', ['htmlHint']);
});

gulp.task('connectDev', function () {
	connect.server({
		root: ['.tmp', 'app'],
		port: 9000,
		livereload: true
	});
});

gulp.task('open', function () {
	return opn( 'http://localhost:9000' );
});

gulp.task('build:dev', function(callback) {
	runSequence(
		'clean:tmp',
		['nunjucks', 'templates', 'sass', 'jsHint'],
		['htmlHint', 'cssLint'], callback);
});

gulp.task('serve', ['build:dev'], function(callback) {
	runSequence(
		'connectDev',
		'open',
		'watch', callback);
});

/**************** build production files in dist folder *****************/
gulp.task('clean:dist', function () {
	return del([
		'./dist/**/*'
	]);
});

gulp.task('copy:assets', function() {
	var stream = gulp.src('app/_assets/**/*')
		.pipe(gulp.dest('dist/_assets'));
	return stream;
});

gulp.task('copy:img', function() {
	var stream = gulp.src('app/resources/img/**/*')
		.pipe(gulp.dest('dist/resources/img'));
	return stream;
});

gulp.task('useref', function() {
	var stream = gulp.src('.tmp/*.html')
		.pipe(useref())
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', cssnano()))
		.pipe(gulp.dest('dist'));
	return stream;
});

gulp.task('connect:build', function() {
	connect.server({
		port: 8080,
		root: 'dist'
	});
});

gulp.task('open:build', function () {
	return opn( 'http://localhost:8080' );
});

gulp.task('build', function(callback) {
	runSequence(
		['clean:dist', 'build:dev'],
		['copy:assets', 'copy:img', 'useref'],
		'connect:build',
		'open:build', callback);
});
