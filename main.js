function mainCallback (truenumdata) {
     //console.log(truenumdata);

var Z = require('Zlib');
var tnums = []; 
var tliterals = [];

var corestr = new RegExp(/core=(.*)\"/);
var linkstr = new RegExp(/href=\"(.*)(\")(\>)/);

for (var i = 0; i < truenumdata.truenumbers.length; i++) {

var core = corestr.exec(truenumdata.truenumbers[i])[1];
var link = linkstr.exec(truenumdata.truenumbers[i])[1];

try {
	var obj = JSON.parse(Z.unzip(core));
	obj.link = link;
	if(obj['value-type'] == 'TsNumber'){
	tnums.push(obj); 
    } else { tliterals.push(obj); }
 }
	catch(e){
	console.log(e.message);
	break;
	}

}


for (var i = 0; i < tnums.length; i++) {
	console.log(tnums[i]);
}
console.log('');
for (var i = 0; i < tliterals.length; i++) {
	console.log(tliterals[i]);
}



d3graph.update(tnums);







}