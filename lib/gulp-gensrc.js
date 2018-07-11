const Vinyl = require("vinyl");
const {Readable} = require("stream");

module.exports = function(filename, src){
	return new Readable({
		objectMode: true,
		read      : function(){
			this.push(new Vinyl({
				base    : ".",
				contents: Buffer.isBuffer(src) ? src : Buffer.from(src),
				cwd     : "",
				path    : filename,
			}));
			this.push(null);
		},
	});
};
