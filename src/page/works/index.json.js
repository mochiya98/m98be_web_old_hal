const fs = require("fs").promises;
const path = require("path");
const fm = require("front-matter");
module.exports = async function(){
	const WORKS_PATH=path.join(__dirname,".");
	let works = [];
	for(let fn of await fs.readdir(WORKS_PATH)){
		if(fn.match(/^index\.(?:json|md|json\.js)$/))continue;
		let id = fn.match(/^([^.]+)\.md/);
		if(!id){
			console.log("Warning: invalid filename (" + fn + ")");
			continue;
		}
		id = id[1];
		let data = (await fs.readFile(path.join(WORKS_PATH,fn))).toString();
		let metadata = fm(data).attributes;
		let{title, desc, tag} = metadata;
		works[works.length] = {
			id,
			title,
			desc,
			tag,
		};
	}
	let works_index_json =
		JSON.stringify({
			title   : "works",
			template: "works",
			data    : {
				works,
			},
		});
	return {ext:"json",data:works_index_json};
};
