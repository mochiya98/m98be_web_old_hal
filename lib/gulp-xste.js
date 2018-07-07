const PLUGIN_NAME = "gulp-xste";
const PluginError = require("gulp-util").PluginError;
const{Transform} = require("stream");
const xste = require("xste");
const gensrc = require("./gulp-gensrc");
const path = require("path");

var gulp_xste = function(src_list){
	var t = this;
	if(typeof src_list === "string")src_list = [src_list];
	t.xste = new xste();
	for(let src of src_list){
		t.xste.addSourceSync(src);
	}
	t.xste.loadAllFromSourceSync();
	t.filter = t.filter.bind(this);
	t.compile = t.compile.bind(this);
};
gulp_xste.prototype.compile = function(opts){
	let t = this;
	let transform = function(file, encoding, callback){
		if(file.isNull()){
			return callback(null, file);
		}else if(file.isStream()){
			this.emit("error", new PluginError(PLUGIN_NAME, "Stream not supported!"));
		}else if(file.isBuffer()){
			try{
				let json = String(file.contents);
				if(json[0] !== "{"){
					console.log("xste.compile skipped(not a json): " + file.path);
					this.push(file);
					return callback();
				}
				let build_conf = JSON.parse(json);
				if(build_conf.template === undefined){
					this.emit("error", new PluginError(PLUGIN_NAME, "build_conf.template is undefined!"));
					return callback();
				}
				if(build_conf.data === undefined){
					this.emit("error", new PluginError(PLUGIN_NAME, "build_conf.data is undefined!"));
					return callback();
				}
				let out = t.xste.compileSync(build_conf.template, build_conf.data);
				file.contents = Buffer.from(out);
				file.build_conf = build_conf;
				if(opts.outputExtension){
					let parsed_path = path.parse(file.path);
					file.path = path.join(parsed_path.dir, parsed_path.name + "." + opts.outputExtension);
				}
				return callback(null, file);
			}catch(e){
				this.emit("error", new PluginError(PLUGIN_NAME, e.message));
			}
		}else{
			this.push(file);
		}
		return callback();
	};
	return new Transform({objectMode: true,
		transform});
};
gulp_xste.prototype.filter = function(opts){
	let t = this;
	let template_depend = new Set();
	if(opts.template){
		template_depend.add(opts.template);
		if(opts.scanDepend){
			t.xste.scanDependents(opts.template, template_depend);
		}
	}
	let transform = function(file, encoding, callback){
		if(file.isNull()){
			return callback(null, file);
		}else if(file.isStream()){
			this.emit("error", new PluginError(PLUGIN_NAME, "Stream not supported!"));
		}else if(file.isBuffer()){
			try{
				let build_conf = JSON.parse(String(file.contents));
				if(template_depend.has(build_conf.template)){
					this.push(file);
				}
			}catch(e){
				this.emit("error", new PluginError(PLUGIN_NAME, e.message));
			}
		}else{
			this.push(file);
		}
		callback();
	};
	return new Transform({objectMode: true,
		transform});
};
gulp_xste.bundle = async function(opts){
	opts = opts || {};
	opts.filename = opts.filename || path.join("js", "xste-bundle.js");
	let source = await xste.bundle(opts);
	return gensrc(opts.filename, source);
};

module.exports = gulp_xste;
