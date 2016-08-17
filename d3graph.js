var d3graph = (function () {
// init    
var w = 900;
var h = 300;

var margin = {top: 20, right: 20, bottom: 90, left: 40},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

var y = d3.scale.linear().domain([0, 100]).range([ height, 0]);
var xbar = d3.scale.ordinal().rangeBands([0, width ], .25)// width  - margin.left - margin.right], .25);
var x = d3.time.scale().range([0, width]);

var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

var tooltip = d3.select("#disp").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var svg = d3.select("#disp")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xAxis = d3.svg.axis()
    .scale(x)  //xbar
    .orient("bottom")
    .ticks(d3.time.days, 1)
    .tickFormat(d3.time.format('%m/%d')); 

var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickPadding(8);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-8px")
    .attr("dy", "-4px")
    .attr("transform", "rotate(-90)" );

svg.append('g')
  .attr('class', 'y axis')
  .call(yAxis);

var bars = svg.selectAll("rect");

// update function
var update = function(dataset) {
 
dataset.forEach(function(d) { 
  if(typeof(d.date) === "string"){ d.date = parseDate(d.date); }
});

dataset = dataset.sort(sortByDateAscending);
xbar.domain(dataset.map(function(d) { return d.date; }));
x.domain(d3.extent(dataset, function (d) { return d.date; }));
     
    
bars = svg.selectAll("rect").data( dataset);
bars.enter().append("rect");


bars   
    .attr("height", function(d) { return height - y(d.value.mag); })
    .attr("y", function(d) { return y(d.value.mag); })   
    .attr("x", function(d) { return xbar(d.date); })   
    .attr("width", xbar.rangeBand())
    .attr('fill',function(d){ return propClr(d.property); } )
    .style('opacity', function(d){ return rtnOpc(d.value.mag, d.property) });

// bars   
//     .attr("height", function(d) { return height - y(0); })
//     .attr("y", function(d) { return y(0); })    
//     .attr("x", function(d) { return xbar(d.date); })   
//     .attr("width", xbar.rangeBand())
//     .attr('fill',function(d){ return propClr(d.property); } )
//     .style('opacity', function(d){ return rtnOpc(d.value, d.property) })
//     .transition().duration(500)
//      .attr("height", function(d) { return height - y(d.value); })
//      .attr("y", function(d) { return y(d.value); });   

d3.selectAll(".tooltip").on("mouseover", function(){  tooltip.transition().duration(1000).style("opacity", .9);   });
d3.selectAll(".tooltip").on("mouseout", function(){  tooltip.transition().delay(1000).duration(1000).style("opacity", 0); });

bars 
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

svg.selectAll("g.y.axis")
    .call(yAxis);

svg.selectAll("g.x.axis")
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-8px")
  .attr("dy", "-4px")
  .attr("transform", "rotate(-90)" );

bars.exit().remove();

};

// private functions
function sortByDateAscending(a, b) {
    return Date.parse(a.date) - Date.parse(b.date);
};

function mouseover(d){
  
 var dformat = d3.time.format('%m/%d');
 var dformat2 = d3.time.format('%I:%M:%S %p');
// this.setAttribute('fill', 'yellow')
 var matrix = this.getScreenCTM()
    .translate(+ this.getAttribute("x"), + this.getAttribute("y"));
  
    tooltip.html(d)
    .style('pointer-events', 'auto')
    .style("left", (window.pageXOffset + matrix.e + xbar.rangeBand() ) + "px")
    .style("top", (window.pageYOffset + matrix.f - 45) + "px")
    .html(dformat(d.date) + '&nbsp' + '&nbsp' + dformat2(d.date)  + '<br>' + d.property 
    + ': ' + d.value.string + '<br>' + '<a href="' + d.link +'" ' +'target="_blank"' +'>' + 'truenumber' + '</a>')               
    .transition().duration(300).style("opacity", .9); 
}


function mouseout(d) {    
  tooltip.transition().delay(2800).duration(1000).style("opacity", 0); 
}

function rtnOpc(innum, inprop) {
 var num = Math.abs(innum); 
if(inprop == 'temperature'){ 
 return num / 110;
}
else if(inprop == 'humidity'){ 
 return num / 60;
}
};

function propClr(inprop){
if(inprop == 'temperature'){
  return 'red';
}
else if(inprop == 'humidity'){
  return 'blue';
}
};
 
// return module fncs
return {
    update: update
  }
})();
