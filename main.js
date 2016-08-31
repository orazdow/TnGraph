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




}






var anim = false;

function btnfunc(){
addObjs(tdata)
d3graph.update(tdata);	
}

function rmvfunc(){
tdata.pop(); tdata.pop();
d3graph.update(tdata);	
}

function shiftfunc(){
addObjs(tdata)
tdata.shift(); tdata.shift();
d3graph.update(tdata);	
}

function animfunc() {
	anim = !anim; 
}

window.setInterval(function(){ if(anim){btnfunc();} }, 1000);

function addObjs(arr) {
var h = JSON.parse(JSON.stringify(arr[arr.length-2])); 
var t = JSON.parse(JSON.stringify(arr[arr.length-1])); 

h.property = 'humidity'; h.unit = '\%';
t.property = 'temperature'; t.unit = 'F';

h.date = incDate(h);
h.value.mag = 15 + Math.floor(Math.random()*31);
h.value.string = ''+h.value.mag+' '+'\%';
t.date = incDate(t);
t.value.mag = 65 + Math.floor(Math.random()*28);
t.value.string = ''+t.value.mag+' '+'F';

arr.push(h);
arr.push(t);

function incDate(inobj){ 
var d = new Date(inobj.date);
var newdate = new Date(d.getTime());
var t = inc(d.getMinutes());
newdate.setMinutes(t);

return newdate;

function inc(innum){
var num = innum + 30; 
var rtn =  num < 10 ? '0'+ num : num;
return rtn.toString();
}
}
	
}	


