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

