//const fs = require("mz/fs");
const path = require("path");
//const util = require("util");
//const {Transform} = require("stream");

const{
	BUILD_CONF,
	PATH_CONF,
	TEST_SERVER_CONF,
} = require("./gulpconf");

const gulp = require("gulp");
const gutil = require("gulp-util");

const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const plumber = require("gulp-plumber");
//const watch = require("gulp-watch");
const mirror = require("gulp-mirror");
const merge = require("merge2");
const eol = require("gulp-eol");
const concat = require("gulp-concat");
const uglifyjs = require("gulp-uglify/composer")(require("uglify-es"), console);
const cleanCSS = require("gulp-clean-css");

const lazypipe = require("lazypipe");

const htmlmin_opts = {collapseWhitespace: true};
const plumber_custom = lazypipe()
	.pipe(plumber, {
		errorHandler: function(e){
			gutil.log(gutil.colors.bold(gutil.colors.red(`(${e.plugin}): ${e.message}`)));
		},
	});

const xste = require("./lib/gulp-xste");
const xsspa = require("./lib/gulp-xsspa");
const md2json = require("./lib/gulp-md2json");
const any2lf = lazypipe()
	.pipe(eol, "\n", false);
const{
	colorful,
	gulpColorfulEslint,
	gulpWatchColorful,
	watchColorful,
} = require("gulp-colorfulkits");

const{HttpServer} = require("http-server");


//init xste&xsspa instance
var xste_agent;
const xsspa_agent = new xsspa({
	base: PATH_CONF.src_base_file,
});
const updateXste = function(){
	xste_agent = new xste(PATH_CONF.src_template);
};
updateXste();


const gulpGeneralDest = lazypipe()
	.pipe(colorful, {
		color : "cyan",
		cwd   : PATH_CONF.dest,
		indent: 0,
	})
	.pipe(gulp.dest, PATH_CONF.dest);

const gulpRenderedPageByTemplateBuilder = lazypipe()
	.pipe(xste_agent.compile, {outputExtension: "html"})
	.pipe(xsspa_agent.compile)
	.pipe(htmlmin, htmlmin_opts)
	.pipe(any2lf);

const gulpSourcePageByTemplateBuilder = lazypipe()
	.pipe(rename, {extname: ".src.json"});

const gulpRenderedPageByRawBuilder = lazypipe()
	.pipe(xsspa_agent.compile)
	.pipe(htmlmin, htmlmin_opts)
	.pipe(any2lf);

const gulpSourcePageByRawBuilder = lazypipe()
	.pipe(htmlmin, htmlmin_opts)
	.pipe(any2lf)
	.pipe(rename, {extname: ".src.json"});

const gulpJsBuilder = lazypipe()
	.pipe(any2lf)
	.pipe(gulpColorfulEslint)
	.pipe(uglifyjs);

const gulpCssBuilder = lazypipe()
	.pipe(any2lf)
	.pipe(cleanCSS);

const gulpPageByTemplateBuilder = lazypipe()
	.pipe(()=>mirror(
		gulpRenderedPageByTemplateBuilder(),
		gulpSourcePageByTemplateBuilder()
	));

const gulpPageByRawBuilder = lazypipe()
	.pipe(()=>mirror(
		gulpRenderedPageByRawBuilder(),
		gulpSourcePageByRawBuilder()
	));

const gulpRenderedPageBuilder = function(opts = {}){
	let rawSrc = gulp.src(PATH_CONF.src_page_raw_glob);
	if(opts.plumber)rawSrc = rawSrc.pipe(plumber_custom());
	rawSrc = rawSrc.pipe(gulpRenderedPageByRawBuilder());
	
	let tplSrc = gulp.src(PATH_CONF.src_page_template_glob);
	if(opts.plumber)tplSrc = tplSrc.pipe(plumber_custom());
	tplSrc = tplSrc.pipe(gulpRenderedPageByTemplateBuilder());
	
	let mdSrc = gulp.src(PATH_CONF.src_page_md_glob);
	if(opts.plumber)mdSrc = mdSrc.pipe(plumber_custom());
	mdSrc = mdSrc
		.pipe(md2json())
		.pipe(gulpRenderedPageByTemplateBuilder());
	
	return merge(rawSrc, tplSrc, mdSrc);
};
const gulpBuildXstaBundle = async function(opts = {}){
	let bundleStream = await xste.bundle({
		mode: BUILD_CONF.xste_bundle_mode,
		src : [PATH_CONF.src_template],
	});
	if(opts.plumber){
		bundleStream = bundleStream.pipe(plumber_custom());
	}
	return bundleStream;
};
const gulpBuildAppBundle = function(){
	return gulp.src(PATH_CONF.dest_raw_js_glob)
		.pipe(plumber_custom())
		.pipe(concat(PATH_CONF.dest_bundle_file))
		.pipe(gulpGeneralDest());
};
const gulpBuildAll = function(callback){
	(async function(){
		const buildStream = merge([
			await gulpBuildXstaBundle(),
			gulp.src(PATH_CONF.src_etc_js_glob, {base: PATH_CONF.src_etc})
				.pipe(gulpJsBuilder()),
			gulp.src(PATH_CONF.src_etc_css_glob, {base: PATH_CONF.src_etc})
				.pipe(gulpCssBuilder()),
			gulp.src(PATH_CONF.src_page_raw_glob)
				.pipe(gulpPageByRawBuilder()),
			gulp.src(PATH_CONF.src_page_md_glob)
				.pipe(md2json())
				.pipe(gulpPageByTemplateBuilder()),
			gulp.src(PATH_CONF.src_page_template_glob)
				.pipe(gulpPageByTemplateBuilder()),
		])
			.pipe(gulpGeneralDest());
		buildStream.on("end", function(){
			const bundleStream = gulpBuildAppBundle();
			if(callback)bundleStream.on("end", callback);
		});
	})();
};
const startLocalServer = function(){
	const testServer = new HttpServer({
		autoIndex: true,
		cache    : 0,
		cors     : true,
		gzip     : true,
		root     : TEST_SERVER_CONF.root,
		showDir  : true,
	});
	testServer.listen(TEST_SERVER_CONF.port);
	gutil.log(gutil.colors.bold(gutil.colors.green(
		`Listening at 127.0.0.1:${TEST_SERVER_CONF.port}`
	)));
};

gulp.task("build", gulpBuildAll);
gulp.task("deploy", () => {
	const ftp = require("vinyl-ftp");
	const ftp_conf = require("./keyconf.js");
	const conn = ftp.create(ftp_conf);
	const remotePath = "/";
	
	return gulp.src(PATH_CONF.dest_glob, {buffer: false})
		.pipe(conn.newerOrDifferentSize(remotePath))
		.pipe(colorful({
			color : "green",
			cwd   : PATH_CONF.dest,
			indent: 1,
		}))
		.pipe(conn.dest(remotePath));
});

gulp.task("watch", function(){
	//ファイルが直接的に関係するもの
	
	//js
	watchColorful(PATH_CONF.src_etc_js_glob, {
		base  : PATH_CONF.src_etc,
		events: ["add", "change"],
	})
		.pipe(plumber_custom())
		.pipe(gulpJsBuilder())
		.pipe(gulpGeneralDest());
	//css
	watchColorful(PATH_CONF.src_etc_css_glob, {
		base  : PATH_CONF.src_etc,
		events: ["add", "change"],
	})
		.pipe(plumber_custom())
		.pipe(gulpCssBuilder())
		.pipe(gulpGeneralDest());
	//page/**/*.json
	watchColorful(PATH_CONF.src_page_template_glob, {events: ["add", "change"]})
		.pipe(plumber_custom())
		.pipe(gulpPageByTemplateBuilder())
		.pipe(gulpGeneralDest());
	//page/**/*.md
	watchColorful(PATH_CONF.src_page_md_glob, {events: ["add", "change"]})
		.pipe(plumber_custom())
		.pipe(md2json())
		.pipe(gulpPageByTemplateBuilder())
		.pipe(gulpGeneralDest());
	//page/**/*.html
	watchColorful(PATH_CONF.src_page_raw_glob, {events: ["add", "change"]})
		.pipe(plumber_custom())
		.pipe(gulpPageByRawBuilder())
		.pipe(gulpGeneralDest());
	
	//ファイルが間接的に関係するもの
	
	//base.html
	gulpWatchColorful(PATH_CONF.src_base_file, function(type, filepath){
		if(type === "change" || type === "add"){
			xsspa_agent.updateBase();
			gulpRenderedPageBuilder({plumber: true})
				.pipe(gulpGeneralDest());
		}
	});
	//template/*.tpl
	gulpWatchColorful(PATH_CONF.src_template_glob, async function(type, filepath){
		console.log(type);
		if(type === "add" || type === "unlink"){
			updateXste();
		}
		(await gulpBuildXstaBundle())
			.pipe(gulpGeneralDest());
		if(type === "change" || type === "add"){
			let template_name = path.parse(filepath).name;
			//Update Template
			xste_agent.xste.load(template_name, filepath);
			//Incremental Rebuild
			merge(
				gulp.src(PATH_CONF.src_page_template_glob),
				gulp.src(PATH_CONF.src_page_md_glob)
					.pipe(md2json())
			)
				.pipe(plumber_custom())
				.pipe(xste_agent.filter({
					scanDepend: true,
					template  : template_name,
				}))
				.pipe(gulpRenderedPageByTemplateBuilder())
				.pipe(gulpGeneralDest());
		}
	});
	//[dest/]js/(!app).js
	gulpWatchColorful(PATH_CONF.dest_raw_js_glob, function(type, filepath){
		gulpBuildAppBundle();
	});
	
	//テスト用サーバー
	startLocalServer();
});
gulp.task("default", function(){
	console.log(`
 usage:
   gulp build
     build all files.
   gulp watch
     watch files.
     if found changes, run incremental-build.
   gulp deploy
     deploy github-pages.
`);
});
