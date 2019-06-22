//const fs = require("mz/fs");
import path from "path";
//const util = require("util");
//const {Transform} = require("stream");

import { BUILD_CONF, PATH_CONF, TEST_SERVER_CONF } from "./constants";

import gulp from "gulp";
import log from "fancy-log";
import colors from "ansi-colors";

import rename from "gulp-rename";
import htmlmin from "gulp-htmlmin";
import plumber from "gulp-plumber";
//import watch from "gulp-watch";
import mirror from "gulp-mirror";
import merge from "merge2";
import eol from "gulp-eol";
import concat from "gulp-concat";
const uglifyjs = require("gulp-uglify/composer")(require("uglify-es"), console);
import cleanCSS from "gulp-clean-css";
import changed from "gulp-changed";
import sitemap from "gulp-sitemap";

import lazypipe from "lazypipe";

const htmlmin_opts = { collapseWhitespace: true };
const plumber_custom = lazypipe().pipe(
	plumber,
	{
		errorHandler: function(e) {
			log(colors.bold(colors.red(`(${e.plugin}): ${e.message}`)));
		},
	},
);

import xste from "../lib/gulp-xste";
import xsspa from "../lib/gulp-xsspa";
import md2json from "../lib/gulp-md2json";
import ogp from "../lib/gulp-ogp";
import evaluatejs from "../lib/gulp-evaluatejs";
import {
	colorful,
	gulpColorfulEslint,
	gulpWatchColorful,
	watchColorful,
} from "gulp-colorfulkits";

import { HttpServer } from "http-server";

const any2lf = lazypipe().pipe(
	eol,
	"\n",
	false,
);

//init xste&xsspa instance
var xste_agent;
const xsspa_agent = new xsspa({
	base: PATH_CONF.src_base_file,
	base_title: "m98.be",
});
const updateXste = function() {
	xste_agent = new xste(PATH_CONF.src_template);
};
updateXste();

const gulpGeneralDest = lazypipe()
	.pipe(
		colorful,
		{
			color: "cyan",
			cwd: PATH_CONF.dest,
			indent: 0,
		},
	)
	.pipe(
		changed,
		PATH_CONF.dest,
		{ hasChanged: changed.compareContents },
	)
	.pipe(
		gulp.dest,
		PATH_CONF.dest,
	);

const gulpRenderedPageByTemplateBuilder = lazypipe()
	.pipe(
		xste_agent.compile,
		{ outputExtension: "html" },
	)
	.pipe(xsspa_agent.compile)
	.pipe(
		htmlmin,
		htmlmin_opts,
	)
	.pipe(any2lf)
	.pipe(
		ogp,
		{ image: "https://m98.be/pic/og.png" },
	);

const gulpSourcePageByTemplateBuilder = lazypipe().pipe(
	rename,
	{ extname: ".src.json" },
);

const gulpRenderedPageByRawBuilder = lazypipe()
	.pipe(xsspa_agent.compile)
	.pipe(
		htmlmin,
		htmlmin_opts,
	)
	.pipe(any2lf)
	.pipe(
		ogp,
		{ image: "https://m98.be/pic/og.png" },
	);

const gulpSourcePageByRawBuilder = lazypipe()
	.pipe(
		htmlmin,
		htmlmin_opts,
	)
	.pipe(any2lf)
	.pipe(
		rename,
		{ extname: ".src.json" },
	);

const gulpJsBuilder = lazypipe()
	.pipe(any2lf)
	.pipe(gulpColorfulEslint)
	.pipe(uglifyjs);

const gulpCssBuilder = lazypipe()
	.pipe(any2lf)
	.pipe(
		cleanCSS,
		{ level: 2 },
	);

const gulpPageByTemplateBuilder = lazypipe().pipe(() =>
	mirror(
		gulpRenderedPageByTemplateBuilder(),
		gulpSourcePageByTemplateBuilder(),
	),
);

const gulpPageByRawBuilder = lazypipe().pipe(() =>
	mirror(gulpRenderedPageByRawBuilder(), gulpSourcePageByRawBuilder()),
);

const gulpRenderedPageBuilder = function(opts = {}) {
	let rawSrc = gulp.src(PATH_CONF.src_page_raw_glob);
	if (opts.plumber) rawSrc = rawSrc.pipe(plumber_custom());
	rawSrc = rawSrc.pipe(gulpRenderedPageByRawBuilder());

	let tplSrc = gulp.src(PATH_CONF.src_page_template_glob);
	if (opts.plumber) tplSrc = tplSrc.pipe(plumber_custom());
	tplSrc = tplSrc.pipe(gulpRenderedPageByTemplateBuilder());

	let mdSrc = gulp.src(PATH_CONF.src_page_md_glob);
	if (opts.plumber) mdSrc = mdSrc.pipe(plumber_custom());
	mdSrc = mdSrc.pipe(md2json()).pipe(gulpRenderedPageByTemplateBuilder());

	return merge(rawSrc, tplSrc, mdSrc);
};
const gulpBuildXstaBundle = function(opts = {}) {
	let bundleStream = xste.bundle({
		mode: BUILD_CONF.xste_bundle_mode,
		src: [PATH_CONF.src_template],
	});
	if (opts.plumber) {
		bundleStream = bundleStream.pipe(plumber_custom());
	}
	return bundleStream;
};
const gulpBuildAppBundle = function() {
	return gulp
		.src(PATH_CONF.dest_raw_js_glob)
		.pipe(plumber_custom())
		.pipe(concat(PATH_CONF.dest_bundle_file));
};
const gulpBuildSitemap = function() {
	return gulp.src(PATH_CONF.dest_html_glob, { read: false }).pipe(
		sitemap({
			siteUrl: BUILD_CONF.site_url,
		}),
	);
};
const gulpBuildAll = function(callback) {
	const buildStream = merge([
		gulpBuildXstaBundle(),
		gulp
			.src(PATH_CONF.src_etc_js_glob, { base: PATH_CONF.src_etc })
			.pipe(gulpJsBuilder()),
		gulp
			.src(PATH_CONF.src_etc_css_glob, { base: PATH_CONF.src_etc })
			.pipe(gulpCssBuilder()),
		gulp.src(PATH_CONF.src_etc_etc_glob),
		gulp.src(PATH_CONF.src_page_raw_glob).pipe(gulpPageByRawBuilder()),
		gulp
			.src(PATH_CONF.src_page_md_glob)
			.pipe(md2json())
			.pipe(gulpPageByTemplateBuilder()),
		gulp
			.src(PATH_CONF.src_page_template_gen_glob)
			.pipe(evaluatejs())
			.pipe(gulpPageByTemplateBuilder()),
		gulp
			.src(PATH_CONF.src_page_template_glob)
			.pipe(gulpPageByTemplateBuilder()),
	]).pipe(gulpGeneralDest());
	buildStream.on("end", function() {
		const nextStream = merge([gulpBuildAppBundle(), gulpBuildSitemap()]).pipe(
			gulpGeneralDest(),
		);
		if (callback) nextStream.on("end", callback);
	});
};
const startLocalServer = function() {
	const testServer = new HttpServer({
		autoIndex: true,
		cache: 0,
		cors: true,
		gzip: true,
		root: TEST_SERVER_CONF.root,
		showDir: true,
	});
	testServer.listen(TEST_SERVER_CONF.port);
	log(
		colors.bold(
			colors.green(`Listening at 127.0.0.1:${TEST_SERVER_CONF.port}`),
		),
	);
};

gulp.task("build", gulpBuildAll);
gulp.task("deploy", () => {
	const ftp = require("vinyl-ftp");
	const ftp_conf = require("./keyconf.js");
	const conn = ftp.create(ftp_conf);
	const remotePath = "/";

	return gulp
		.src(PATH_CONF.dest_glob, { buffer: false })
		.pipe(conn.newerOrDifferentSize(remotePath))
		.pipe(
			colorful({
				color: "green",
				cwd: PATH_CONF.dest,
				indent: 1,
			}),
		)
		.pipe(conn.dest(remotePath));
});

gulp.task("watch", function() {
	//ファイルが直接的に関係するもの

	//js
	watchColorful(PATH_CONF.src_etc_js_glob, {
		base: PATH_CONF.src_etc,
		events: ["add", "change"],
	})
		.pipe(plumber_custom())
		.pipe(gulpJsBuilder())
		.pipe(gulpGeneralDest());
	//css
	watchColorful(PATH_CONF.src_etc_css_glob, {
		base: PATH_CONF.src_etc,
		events: ["add", "change"],
	})
		.pipe(plumber_custom())
		.pipe(gulpCssBuilder())
		.pipe(gulpGeneralDest());
	//!(js|css)
	watchColorful(PATH_CONF.src_etc_etc_glob, {
		events: ["add", "change"],
	})
		.pipe(plumber_custom())
		.pipe(gulpGeneralDest());
	//page/**/*.json
	watchColorful(PATH_CONF.src_page_template_glob, { events: ["add", "change"] })
		.pipe(plumber_custom())
		.pipe(gulpPageByTemplateBuilder())
		.pipe(gulpGeneralDest());
	//page/**/*.json.js
	watchColorful(PATH_CONF.src_page_template_gen_glob, {
		events: ["add", "change"],
	})
		.pipe(plumber_custom())
		.pipe(evaluatejs())
		.pipe(gulpPageByTemplateBuilder())
		.pipe(gulpGeneralDest());
	//page/**/*.md
	watchColorful(PATH_CONF.src_page_md_glob, { events: ["add", "change"] })
		.pipe(plumber_custom())
		.pipe(md2json())
		.pipe(gulpPageByTemplateBuilder())
		.pipe(gulpGeneralDest());
	//page/**/*.html
	watchColorful(PATH_CONF.src_page_raw_glob, { events: ["add", "change"] })
		.pipe(plumber_custom())
		.pipe(gulpPageByRawBuilder())
		.pipe(gulpGeneralDest());

	//ファイルが間接的に関係するもの

	//base.html
	gulpWatchColorful(PATH_CONF.src_base_file, function(type, filepath) {
		if (type === "change" || type === "add") {
			xsspa_agent.updateBase();
			gulpRenderedPageBuilder({ plumber: true }).pipe(gulpGeneralDest());
		}
	});
	//template/*.tpl
	gulpWatchColorful(PATH_CONF.src_template_glob, function(type, filepath) {
		console.log(type);
		if (type === "add" || type === "unlink") {
			updateXste();
		}
		gulpBuildXstaBundle().pipe(gulpGeneralDest());
		if (type === "change" || type === "add") {
			let template_name = path.parse(filepath).name;
			//Update Template
			xste_agent.xste.load(template_name, filepath);
			//Incremental Rebuild
			merge(
				gulp.src(PATH_CONF.src_page_template_glob),
				gulp.src(PATH_CONF.src_page_template_gen_glob).pipe(evaluatejs()),
				gulp.src(PATH_CONF.src_page_md_glob).pipe(md2json()),
			)
				.pipe(plumber_custom())
				.pipe(
					xste_agent.filter({
						scanDepend: true,
						template: template_name,
					}),
				)
				.pipe(gulpRenderedPageByTemplateBuilder())
				.pipe(gulpGeneralDest());
		}
	});
	//[dest/]js/(!app).js
	gulpWatchColorful(PATH_CONF.dest_raw_js_glob, function(type, filepath) {
		gulpBuildAppBundle().pipe(gulpGeneralDest());
	});
	//[dest/]**/*.html
	gulpWatchColorful(PATH_CONF.dest_html_glob, function(type, filepath) {
		gulpBuildSitemap().pipe(gulpGeneralDest());
	});

	//テスト用サーバー
	startLocalServer();
});
gulp.task("default", function() {
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
