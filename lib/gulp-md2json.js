const PLUGIN_NAME = "gulp-md2json";
const PluginError = require("plugin-error");
const { Transform } = require("stream");
const path = require("path");

const fm = require("front-matter");
const marked = require("marked");

module.exports = function(opts) {
	let t = this;
	let transform = function(file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		} else if (file.isStream()) {
			this.emit("error", new PluginError(PLUGIN_NAME, "Stream not supported!"));
		} else if (file.isBuffer()) {
			try {
				let out = {};
				let fm_result = fm(file.contents.toString());
				out.data = fm_result.attributes; //pointer-copy
				if (out.data.template) out.template = out.data.template;
				if (out.data.title) out.title = out.data.title;
				out.data.contents = marked(fm_result.body, { headerIds: false });

				/*if(build_conf.data===undefined){
					this.emit('error', new PluginError(PLUGIN_NAME, 'build_conf.data is undefined!'));
					return callback();
				}*/
				file.contents = Buffer.from(JSON.stringify(out));
				{
					let parsed_path = path.parse(file.path);
					file.path = path.join(parsed_path.dir, parsed_path.name + ".json");
				}
				return callback(null, file);
			} catch (e) {
				this.emit("error", new PluginError(PLUGIN_NAME, e.message));
			}
		} else {
			this.push(file);
		}
		return callback();
	};
	return new Transform({ objectMode: true, transform });
};
