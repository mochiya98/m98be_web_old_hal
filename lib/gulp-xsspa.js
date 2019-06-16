var PLUGIN_NAME = "gulp-xsspa-builder";
const PluginError = require("plugin-error");
const { Transform } = require("stream");
const path = require("path");
const fs = require("fs");

var gulp_xsspa_builder = function(opts) {
	this.opts = opts;
	this.compile = this.compile.bind(this);
	this.updateBase = this.updateBase.bind(this);
	this.updateBase();
};
gulp_xsspa_builder.prototype.updateBase = function() {
	let t = this;
	let opts = t.opts;
	let base_html = fs.readFileSync(opts.base).toString();
	let regex_contents = /<%= *contents? *%>/gi;
	let regex_title = /<%= *title? *%>/gi;
	let match_contents = regex_contents.exec(base_html);
	let match_title = regex_title.exec(base_html);
	t.p1 = Buffer.from(base_html.slice(0, match_title.index));
	t.p2 = Buffer.from(
		base_html.slice(regex_title.lastIndex, match_contents.index),
	);
	t.p3 = Buffer.from(base_html.slice(regex_contents.lastIndex));
};
gulp_xsspa_builder.prototype.compile = function(opts) {
	let t = this;
	let transform = function(file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		} else if (file.isStream()) {
			this.emit("error", new PluginError(PLUGIN_NAME, "Stream not supported!"));
		} else if (file.isBuffer()) {
			let title_buf = Buffer.from(t.opts.base_title);
			if (!file.build_conf) file.build_conf = {};
			if (file.build_conf.title)
				title_buf = Buffer.from(
					`${file.build_conf.title} - ${t.opts.base_title}`,
				);
			file.contents = Buffer.concat([
				t.p1,
				title_buf,
				t.p2,
				file.contents,
				t.p3,
			]);
			return callback(null, file);
		} else {
			this.push(file);
		}
		callback();
	};
	return new Transform({ objectMode: true, transform });
};

module.exports = gulp_xsspa_builder;
