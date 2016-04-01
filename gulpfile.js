var gulp = require("gulp");
var compass = require("gulp-compass");
var connect = require("gulp-connect");
var copy = require("gulp-copy");
var watch = require("gulp-watch");
var cssmin = require("gulp-cssmin");
var jade = require("gulp-jade");
var uglify = require("gulp-uglify");
var imagemin = require("gulp-imagemin");
var del = require("del");
var runSequence = require("run-sequence");

var path = {
	src : "src",
	deploy : "deploy",
	release : "_release"
}

//copy
gulp.task("copy:deploy_to_release", function(){
	return gulp.src(path.deploy + "/**", {base:path.deploy})
		.pipe(gulp.dest(path.release));
});


//clean
gulp.task("clean:release", function(callback){
	return del(path.release, callback);
});

var path_scss = {
	pc : "",
	//sp : "/sp"
}

//compass
gulp.task("compass", function(callback){
	var compassTasks = [];
	for(var name in path_scss){
		compassTasks.push(name);
		gulp.task(name, compassFunc(path_scss[name]))
	}
	return runSequence(compassTasks, callback);
});

var compassFunc = function(inner_path){
	return function(){
		return gulp.src(path.src + "/scss" + inner_path + "/*.scss")
			.pipe(compass({
				config_file : path.src + "/scss" + inner_path + "/_config.rb",
				css : path.deploy + inner_path + "/css",
				sass : path.src + "/scss" + inner_path
			}));
	}
}

//jade
gulp.task("jade", function(){
	return gulp.src([path.src + "/jade/{,**/}*.jade", "!"+path.src+"/jade/{,**}_*.jade"])
		.pipe(jade({pretty:true}))
		.pipe(gulp.dest(path.deploy));
});


//imagemin
gulp.task("imagemin", function(){
	return 	gulp.src(path.deploy + "/img/{,**/}*.{png,jpg,gif}")
		.pipe(imagemin())
		.pipe(gulp.dest(path.release + "/img"));
});


//cssmin
gulp.task("cssmin", function(){
	return gulp.src(path.deploy + "/css/{,**/}*.css")
		.pipe(cssmin())
		.pipe(gulp.dest(path.release + "/css"));
});

//uglify
gulp.task("uglify", function(){
	return gulp.src(path.deploy + "/js/*.js")
		.pipe(uglify({preserveComments : "some"}))
		.pipe(gulp.dest(path.release+"/js"));
});

//connect
gulp.task("connect", function(){
	return browserSync({
		server:{
			port : 9001,
			baseDir : path.deploy
		}
	});
});


//reload
gulp.task("reload", function(){
	return browserSync.reload();
});

//watch
gulp.task("watch", function(){
	gulp.watch([
		path.deploy + "/{,**/}*.html",
		path.deploy + "/{,**/}*.css",
		path.deploy + "/{,**/}*.js",
	], ["reload"]);
});

/*
gulp.task("release", function(callback){
	return runSequence(
		"clean:release",
		"copy:deploy_to_release",
		["uglify", "cssmin", "imagemin"],
		callback
	);
});*/

gulp.task("compile", function(callback){
	return runSequence(
		["jade", "compass"],
		"clean:release",
		"copy:deploy_to_release",
		["uglify", "cssmin", "imagemin"],
		callback
	);
});

gulp.task("watchstart", ["connect", "watch"]);
gulp.task("default", ["compile"]);
