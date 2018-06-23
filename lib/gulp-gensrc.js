const gutil = require("gulp-util");
const {Readable} = require("stream");

module.exports = function(filename, src){
	return new Readable({
		objectMode: true,
		read      : function(){
			this.push(new gutil.File({
				base    : "",
				contents: Buffer.isBuffer(src) ? src : Buffer.from(src),
				cwd     : "",
				path    : filename,
			}));
			this.push(null);
		},
	});
};
