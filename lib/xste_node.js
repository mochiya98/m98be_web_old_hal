const fs = require("mz/fs");
const path = require("path");
const xste = function(){
	this.t = new Map();
	this.filelist = new Map();
};
xste.prototype.add = function(name, template){
	template = template.replace(/\r\n?/g, "\n");
	let source = "var include=this.compileSync.bind(this),x=\"\";";
	let sliceIndex = 0,
		tagRegEx = /<%(=?)([\s\S]*?)%>/g;
	let appendTextOutput = function(sliceEndIndex){
		if(sliceIndex === sliceEndIndex)return;//===""
		source
			+= "x+=\""
			+ template
				.slice(sliceIndex, sliceEndIndex)
				.replace(/"/g, "\\\"")
				.replace(/\n/g, "\\n")
			+ "\";";
	};
	let depend = [];
	for(let match; match = tagRegEx.exec(template); sliceIndex = tagRegEx.lastIndex){
		appendTextOutput(match.index);
		if(match[1]){
			let include_regex = /include *\( *['"]([^'"]+)['"] *,/g;
			let include_match;
			while(include_match = include_regex.exec(match[2])){
				depend.push(include_match[1]);
			}
			source += "x+=" + match[2] + ";";
		}else{
			source += match[2];
		}
	}
	appendTextOutput();
	this.t.set(name, {
		compiler: new Function("self", source.replace(/[\r\n]+/g, "") + "return x")
			.bind(this),
		depend,
	});
};
//"
xste.prototype.addSource = async function(dir){
	//console.log("AsyncAddSource");
	for(let filename of await fs.readdir(dir + "/")){
		let fullpath = path.join(dir, filename);
		if((await fs.stat(fullpath))
			.isDirectory()){
			await this.addSource(fullpath);
		}else{
			this.filelist.set(path.parse(fullpath).name, fullpath);
		}
	}
};
xste.prototype.addSourceSync = function(dir){
	for(let filename of fs.readdirSync(dir + "/")){
		let fullpath = path.join(dir, filename);
		if(fs.statSync(fullpath)
			.isDirectory()){
			this.addSourceSync(fullpath);
		}else{
			this.filelist.set(path.parse(fullpath).name, fullpath);
		}
	}
};
xste.prototype.load = async function(name, fp){
	//console.log("Async Load");
	this.add(name, (await fs.readFile(fp))
		.toString());
};
xste.prototype.loadSync = function(name, fp){
	this.add(name, fs.readFileSync(fp)
		.toString());
};
xste.prototype.loadAllFromSourceSync = function(){
	for(let[key, value]of this.filelist){
		this.loadSync(key, value);
	}
};
xste.prototype.loadAllFromSource = async function(){
	for(let[key, value]of this.filelist){
		await this.load(key, value);
	}
};
xste.prototype.compile = async function(name, template){
	//console.log("ASYNC Compile");
	if(!this.t.has(name)){
		if(this.filelist.has(name)){
			await this.load(name, this.filelist.get(name));
		}else{
			throw new Error("unknown template name");
		}
	}
	return this.t.get(name)
		.compiler(template);
};
xste.prototype.compileSync = function(name, template){
	if(!this.t.has(name)){
		if(this.filelist.has(name)){
			this.loadSync(name, this.filelist.get(name));
		}else{
			throw new Error("unknown template name");
		}
	}
	return this.t.get(name)
		.compiler(template);
};
xste.prototype.scanDependents = function(name, depend){
	if(!depend)depend = new Set();
	depend.add(name);
	for(let[name_sc, template]of this.t){
		let isDepend = template.depend.includes(name);
		if(isDepend && !depend.has(name_sc)){
			this.scanDependents(name_sc, depend);
		}
	}
	return depend;
};
xste.bundle = async function(opts){
	let source = "";
	let xste_agent = new xste();
	opts = opts || {};
	opts.src = opts.src || [];
	opts.mode = opts.mode || "raw";
	if(typeof opts.src === "string"){
		opts.src = [opts.src];
	}
	for(let srcdir of opts.src){
		await xste_agent.addSource(srcdir);
	}
	if(opts.mode === "raw"){
		let xste_browser_filename =
			path.join(path.dirname(module.filename), "./xste.js");
		source += (await fs.readFile(xste_browser_filename, "utf8"))
			.replace(/[\r\n]+/g, "");
		for(let[template_name, template_filename]of xste_agent.filelist){
			let template_data = (await fs.readFile(template_filename, "utf8"))
				.replace(/'/g, "\\'")
				.replace(/\r\n?/g, "\n")
				//.replace(/\n/g, "\\n");
				.replace(/[\t\n]/g, "");
			template_data = `xste.add(\'${template_name}\',\'${template_data}\');`;
			source += template_data;
		}
	}else{
		throw"UnknownBundleMode!";
	}
	return source;
};

module.exports = xste;
