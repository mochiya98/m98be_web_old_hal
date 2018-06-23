const fs = require("fs").promises;
const fm = require("front-matter");
(async function(){
	let works=[];
	for(let fn of await fs.readdir("./src/page/works/")){
		if(fn.match(/^index\.(?:json|md)$/))continue;
		let id=fn.match(/^([^.]+)\.md/);
		if(!id){
			console.log("Warning: invalid filename ("+fn+")");
			continue;
		}
		id=id[1];
		let data=(await fs.readFile("./src/page/works/"+fn)).toString();
		let metadata=fm(data).attributes;
		let {title,desc,tag}=metadata;
		works[works.length]={id,title,desc,tag};
	}
	let works_index_json=
		JSON.stringify({
			template:"works",
			data:{
				works,
			},
		});
	await fs.writeFile("./src/page/works/index.json",works_index_json);
})();