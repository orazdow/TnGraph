var d3graph = (function () {

//if no css
var w = 800;
var h = 250;

var drawLines = true;

var drawArea = true;

var ylines = true;
// if no css
var ylinestyle = ["stroke-dasharray", "2,4"];
var ylinecolor = "gray";

//date label x bumps
var aa = 14;  
var bb = 29;
var linebreaks = true;

//property colors if no css specified
var colors = {
                'temperature' : 'red',
                'humidity' : 'blue',
                'windspeed' : 'orange',
                'blip' : 'green',
                'backup' : ['orange','green','purple', 'black']
              };

if(checkRules('#disp', 'width'))
w = d3.select("#disp").style("width").replace("px", "");
if(checkRules('#disp', 'height'))
h = d3.select("#disp").style("height").replace("px", "");

var margin = {top: 20, right: 40, bottom: 40, left: 40},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

var svg = d3.select("#disp")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.time.scale().range([0, width]);

var dformat = d3.time.format('%m/%d');

var bisectDate = d3.bisector(function(d) { return d.date; }).left;
var focus;

var timeformat = d3.time.format('%I:%M:%S %p')

 var wind = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() { focus.style("display", null); }); 

  var y = d3.scale.linear()
    .domain([0, 100])
    .range([height, 0]);

  var line = d3.svg.line()
    .interpolate("cardinal")
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.value.mag);
    });  


  var area = d3.svg.area()
    .interpolate("cardinal")
    .x(line.x())
    .y1(line.y())
    .y0(y(0));

  var xAxis = d3.svg.axis()
      .scale(x)  
      .orient("bottom")
      .ticks(0)
      .tickFormat(d3.time.format('%m/%d %I:%M%p')); 

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(4) //make var
      .tickPadding(8)
      // .tickSize(0);
     .innerTickSize([0])
     .outerTickSize([6])
    ;

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(+"+0+"," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end");

    svg.append('g')
      .attr('class', 'y axis').attr("transform", "translate(-"+0+"," +0 + ")")
      .call(yAxis);

 if(ylines){
     svg.selectAll("line.ygrid")
        .data(y.ticks(4))
        .enter().append("line")
        .attr({
        "class":"ygrid",
        "x1" :0,
        "x2" : width,
        "y1" : function(d){ return y(d);},
        "y2" : function(d){ return y(d);},
        "fill" : "none",
        "shape-rendering" : "crispEdges",
        "stroke-width" : "1px"})
        .attr("stroke", ylinecolor); 
        if(!checkRules('.ygrid', 'stroke-dasharray'))
        svg.selectAll("line.ygrid").style(ylinestyle[0], ylinestyle[1]);              
         }

focus = svg.append("g").style("display", "none");  

var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

var parentel = document.querySelector('#disp').parentNode;

var firstappend = false;
var lastid;
var lines = svg.selectAll('.property');
var lE;
var props = [];

function update(dataset){
//console.log('calling');
dataset.forEach(function(d) { 
  if(typeof(d.date) === "string"){ d.date = parseDate(d.date); }
});

dataset = dataset.sort(sortByDateAscending);

var lastnums = [];

x.domain(d3.extent(dataset, function (d) { return d.date; }));

//////////

// var ext = d3.extent(dataset, function (d) { return d.date; });
// console.log( (ext[1].getTime() - ext[0].getTime())/(1000*60*60) )

///////////////

// do first append once
if(!firstappend){
  init(dataset); 
  firstappend = true;
}

svg.selectAll("g.y.axis")
    .call(yAxis);

svg.selectAll("g.x.axis")
  .attr('id', 'xaxs')
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "+"+aa+"px")
  .attr("dy", "+10px");

if(linebreaks)
svg.selectAll('#xaxs g text').each(insertLinebreaks);

getProperties(props, dataset, 'property')

// update new data
for (var i = 0; i < props.length; i++) {

if(drawLines){

lE.select(".line."+props[i])
// .transition().duration(500)
 .attr("d", function(d) {
      return line(dataset.filter(function(d){ return d.property == props[i] }));
    });
}

if(drawArea){

 lE.select(".area."+props[i])
// .transition().duration(500)
 .attr("d", function(d) {
      return area(dataset.filter(function(d){ return d.property == props[i] }));
    });

 }

// array for lastread display
for (var a = dataset.length - 1; a >= 0; a--) {
   if(dataset[a].property == props[i]){
    lastnums.push(dataset[a]); //console.log(i)
    break; 
   }
 }


}

// lastread display
for (var i = 0; i < lastnums.length; i++) {

 d3.select('#lastread .'+lastnums[i].property).html(    
   dformat(lastnums[i].date) + '&nbsp&nbsp' + timeformat(lastnums[i].date)  + '<br>'
   + lastnums[i].property+':&nbsp' + lastnums[i].value.string + '<br>'
   +  '<a href="' + lastnums[i].link +'" ' +'target="_blank"' +'>' + 'truenumber' + '</a>'
 );
}

 // animate lastread display
if(dataset[dataset.length-1].id != lastid &&  firstappend){ 
  lastid = dataset[dataset.length-1].id;
  d3.select('#lastread').style('background-color', 'white')
  .transition().duration(990).style('background-color', 'red');
  d3.select('#lastread').transition().delay(400).duration(100).style('background-color', 'white');
}

wind.on("mousemove", mousemove);
svg.on("touchmove", mousemove);

function mousemove() {
  var m;

  if(d3.mouse(this)[0] <= width-20){
    m = d3.mouse(this)[0]-20
  }else if(d3.mouse(this)[0] <= width-5){
    m = d3.mouse(this)[0]-5
  }else{
    m = width-1;
  }


  for (var a = 0; a < props.length; a++) {
   	 
      var set = dataset.filter(function(d){ return d.property == props[a] });
      var x0 = x.invert(m), 
      i = bisectDate(set, x0, 1),
      d0 = set[i - 1],
      d1 = set[i],
      d = x0 - d0.date > d1.date - x0 ? d1 : d0; 

    focus.select("circle."+props[a])
      .attr("transform", "translate(" + x(d.date) + "," + y(d.value.mag) + ")");  

    focus.select('line.'+props[a]) 
      .attr("transform", "translate(" + x(d.date) + "," +  0 + ")");   

    d3.select('.tooltip.'+props[a]).style("left", x(d.date)+53 + "px").style("top", y(d.value.mag) - 18 + "px")
      .style('visibility', 'visible');

    d3.select('.tooltip.'+props[a]).html(timeformat(d.date) + '<br>' + '<a href="' + d.link +
     '" ' +'target="_blank"' +'>' + d.property + ': ' + d.value.string + '</a>');

  }	

} 

}

function init(dataset){

lines = svg.selectAll('.property')
      .data(dataset, function(d) {
        return d.property;
      });

lE = lines.enter()
      .append('g')
      .attr('class', 'property');

xAxis.ticks(d3.time.hours, 1);

var el = document.getElementById('spinner'); 
    el.parentNode.removeChild(el);

}

function pinit(prop, dataset) {

if(drawLines){
      lE.append("path")
        .attr("class", "line "+prop)
        .style('fill', 'none')
        .attr("d", function(d) {
          return line(dataset.filter(function(d){ return d.property == prop }));
        }); 

//check for no css 
if(( lE.selectAll(".line."+prop).style('stroke') == 'none' || lE.selectAll(".line").style('stroke') == 'none')){ 
                    lE.selectAll(".line."+prop).style('stroke', rtncolor(prop));  //use colors array
}else{ colors[prop] = lE.selectAll(".line."+prop).style('stroke'); } //add to colors array

  
}
if(drawArea){
      lE.append("path")
        .attr("class", "area "+prop)
        .attr("d", function(d) {
          return area(dataset.filter(function(d){ return d.property == prop }));
        });

if(( lE.selectAll(".area."+prop).style('fill') == 'rgb(0, 0, 0)')){ 
      //area fill always returns black, so check style sheet instead of computed style for rule
      if(!(checkRules(".area."+prop, 'fill') || checkRules(".area", 'fill') ) )
      lE.selectAll(".area."+prop).style('fill', rtncolor(prop));  
}else{ if(!colors[prop]){colors[prop] = lE.selectAll(".area."+prop).style('fill');} }


}
  focus.append("line")
        .attr("class", prop)
        .style("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.2)
        .attr("y1", 0)
        .attr("y2", height);

  focus.append("circle")
        .attr("class", prop)
        .style("fill", "none")
        .attr("r", 5);

if(( focus.selectAll("circle."+prop).style('stroke') == 'none' || focus.selectAll("circle").style('stroke') == 'none')){
    focus.selectAll("circle."+prop).style('stroke', rtncolor(prop));
}

        var d = document.createElement('div');
        d.style.position = 'absolute';
        d.style.visibility = 'hidden';
        d.className = 'tooltip ' + prop;
        parentel.appendChild(d);

}

function sortByDateAscending(a, b) {
    return Date.parse(a.date) - Date.parse(b.date);
};


function getProperties(arr, data, key){

var props = [];

data.forEach( function(d){
  if(!arr.includes(d[key])){
    arr.push(d[key]); 
    pinit(d[key], data);
  }
   
  if(!props.includes(d[key]))
  props.push(d[key]); 

});

for(var i = arr.length-1; i >= 0; i--){
  if(!props.includes(arr[i]))
    arr.splice(i,1);
}

}

function rtncolor(prop){ 
 if(!colors.hasOwnProperty(prop)){
   colors[prop] = colors.backup.length > 1 ? colors.backup.shift() : colors.backup[0]; 
 }
  return colors[prop];
}

function checkRules(seltext, cssprop){
//for checking the stylesheet directly
 var rtn = false; 
 for (var i = 0; i < document.styleSheets.length; i++){ 
  for (var j = 0; j < document.styleSheets[i].cssRules.length; j++){ 
     if(document.styleSheets[i].cssRules[j].selectorText == seltext){ 
     for (var k = 0; k < document.styleSheets[i].cssRules[j].style.length; k++) {
       if(document.styleSheets[i].cssRules[j].style[k] == cssprop){
         rtn = true; break;
       }
      }      
    }     
   }
 } 
 return rtn;
}

var insertLinebreaks = function (d) {
  var el = d3.select(this);
  var words=d3.select(this).text().split(' ');

  el.text('');

  for (var i = 0; i < words.length; i++) {
var tspan = el.append('tspan').text(words[i]);
if (i > 0)
      tspan.attr('x', bb).attr('dy', '15');
  }
 }


return {
    update : update
  }
})();
