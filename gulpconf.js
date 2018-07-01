const BUILD_CONF = {
	//compiled-bundle temporarily unavailable
	xste_bundle_mode: ["raw"/*,'compiled'*/][0],
	site_url: "https://m98.be/",
};
/* eslint-disable sort-keys */
const PATH_CONF = {
	src_base              : "./src/",
	src_base_file         : "./src/base.html",
	src_template          : "./src/template",
	src_template_glob     : "./src/template/**/*.tpl",
	src_etc               : "./src/etc/",
	src_etc_js_glob       : "./src/etc/**/*.js",
	src_etc_css_glob      : "./src/etc/**/*.css",
	src_etc_etc_glob      : "./src/etc/**/*.!(js|css)",
	src_page_raw_glob     : "./src/page/**/*.html",
	src_page_md_glob      : "./src/page/**/*.md",
	src_page_template_glob: "./src/page/**/*.json",
	dest                  : "./dest/",
	dest_glob             : "./dest/**/*",
	dest_html_glob        : "./dest/**/*.html",
	dest_raw_js_glob      : "./dest/js/!(app).js",
	dest_bundle_file      : "./js/app.js",
};
/* eslint-enable sort-keys */

const TEST_SERVER_CONF = {
	port: 1337,
	root: PATH_CONF.dest,
};

module.exports = {
	BUILD_CONF,
	PATH_CONF,
	TEST_SERVER_CONF,
};
