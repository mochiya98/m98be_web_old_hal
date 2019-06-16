const PLUGIN_NAME='gulp-evaluatejs';
const PluginError = require('plugin-error');
const {Transform} = require('stream');
const path = require('path');
const vm = require('vm');

module.exports=function(opts){
	let t = this;
	let transform = function(file, encoding, callback) {
		if (file.isNull()){
			return callback(null, file);
		}else if (file.isStream()){
			this.emit('error', new PluginError(PLUGIN_NAME, 'Stream not supported!'));
		}else if (file.isBuffer()){
			try{
 				const sandbox = {
 					__dirname:path.dirname(file.path),
					exports:null,
					module:{exports:null,},
					require,
				};
				vm.createContext(sandbox);
				vm.runInContext(file.contents.toString(), sandbox);
 				(sandbox.exports||sandbox.module.exports)().then(({ext="json",data})=>{
	 				file.contents = Buffer.from(data);
	 				{
	 					let parsed_path=path.parse(file.path);
	 					file.path=path.join(parsed_path.dir,parsed_path.name.replace(/\.(?:json|js|md)$/,"")+'.'+ext);
	 				}
					callback(null, file);
 				});
				return;
			}catch(e){
				this.emit('error', new PluginError(PLUGIN_NAME, e.message));
			}
		}else{
			this.push(file);
		}
		return callback();
	};
	return new Transform({ objectMode: true, transform });
};
