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


d3graph.update(tnums);	

document.getElementById('literals').innerHTML = '';
for (var i = 0; i < tliterals.length; i++) {
 document.getElementById('literals').innerHTML += 
 '<a href="' + tliterals[i].link +'" ' +'target="_blank"' +'>' + tliterals[i].wrapper + '</a>'
 + '<br>';

}



}


