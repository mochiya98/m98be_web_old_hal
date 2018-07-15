const PLUGIN_NAME='gulp-ogp';
const PluginError = require('plugin-error');
const {Transform} = require('stream');
const path = require('path');

//セマンティクスに依存し過ぎている
//descriptionどっから抽出しようとしてこうなった(雑
//ASTは使ってない そこまで高級な要件じゃないので
module.exports=function(opts = {}){
	let t = this;
	let transform = function(file, encoding, callback) {
		if (file.isNull()){
			return callback(null, file);
		}else if (file.isStream()){
			this.emit('error', new PluginError(PLUGIN_NAME, 'Stream not supported!'));
		}else if (file.isBuffer()){
			let data = file.contents.toString();
			if(data.match(/^.{0,5}<!DOCTYPE/)){
				data = data.replace(/<title>([^<]+)?<\/title>/,function(title_tag, title, ex){
					let og_tag = "";
					let desc = data.match(/<h1>[^<]+?<\/h1>[\r\n\t ]*<p>([^<]+?)<\/p>/);
					if(desc){
						og_tag += `<meta name="description" content="${desc[1]}">`;
					}
					og_tag += `<meta property="og:title" content="${title}">`;
					if(desc){
						og_tag += `<meta property="og:description" content="${desc[1]}">`;
					}
					og_tag += `<meta property="og:image" content="${opts.image}">`;
					og_tag += `<meta name="twitter:card" content="summary">`;
					return title_tag + og_tag;
				});
				file.contents = Buffer.from(data);
			}
			this.push(file);
		}else{
			this.push(file);
		}
		return callback();
	};
	return new Transform({ objectMode: true, transform });
};
