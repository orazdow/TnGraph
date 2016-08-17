/*
function foo(callback) {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) { // request is done
            if (httpRequest.status === 200) { // successfully
                callback(httpRequest.responseText); // we're calling our method
            }
        }
    };
    httpRequest.open('GET', "truenumdata.json");
    httpRequest.send();
}
var a;
foo(function (result) {
    a = result;
    document.body.innerHTML = result;
});

console.log(a)
*/
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
};

var url = 'http://pub.truenumbers.com/Numberflow/API?auth=ollie@truenum.com:Randal9?&ns=FortPointWeather&sto=1&cmd=dashboard-search&qry=subj:*';
var method = 'GET';
var xhr = createCORSRequest(method, url);

xhr.onload = function() {
  //console.log(this.responseText);
  var data = JSON.parse(this.responseText);
  mainCallback(data);
};

xhr.onerror = function() {
  // Error code goes here.
};

xhr.send();

