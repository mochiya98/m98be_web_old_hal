var PLUGIN_NAME = "gulp-xsspa-builder";
var PluginError = require("gulp-util").PluginError;
const{Transform} = require("stream");
const path = require("path");
const fs = require("fs");

var gulp_xsspa_builder = function(opts){
	this.opts = opts;
	this.compile = this.compile.bind(this);
	this.updateBase = this.updateBase.bind(this);
	this.updateBase();
};
gulp_xsspa_builder.prototype.updateBase = function(){
	let t = this;
	let opts = t.opts;
	let base_html = fs.readFileSync(opts.base)
		.toString();
	let regex = /<%= *contents? *%>/ig;
	let match = regex.exec(base_html);
	t.baseHeader = Buffer.from(base_html.slice(0, match.index));
	t.baseFooter = Buffer.from(base_html.slice(regex.lastIndex));
};
gulp_xsspa_builder.prototype.compile = function(opts){
	let t = this;
	let transform = function(file, encoding, callback){
		if(file.isNull()){
			return callback(null, file);
		}else if(file.isStream()){
			this.emit("error", new PluginError(PLUGIN_NAME, "Stream not supported!"));
		}else if(file.isBuffer()){
			file.contents = Buffer.concat([t.baseHeader, file.contents, t.baseFooter]);
			return callback(null, file);
		}else{
			this.push(file);
		}
		callback();
	};
	return new Transform({objectMode: true,
		transform});
};

module.exports = gulp_xsspa_builder;
