var runloop = true;

doit();
window.setInterval(function(){if(runloop){ doit(); }}, 10000);
  
function doit(){ 
var createCORSRequest = function(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Most browsers.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // IE8 & IE9
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}
//console.log('calling');
var url = 'http://pub.truenumbers.com/Numberflow/API?auth=ollie@truenum.com:Randal9?&ns=FortPointWeather&sto=1&order=order+by+date+desc+limit+5760+&cmd=dashboard-search&qry=subj:*';
var xhr = createCORSRequest('GET', url);
xhr.send();
xhr.onload = function() {
var data = JSON.parse(this.responseText);
mainCallback(data);
} 

}