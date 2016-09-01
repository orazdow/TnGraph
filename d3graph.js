var d3graph = (function () {

  var w = 800;
  var h = 280;

  var aa = 14;
  var bb = 29;
  var maxdata = 6000;
  var firstappend = false;

  var margin = {top: 20, right: 20, bottom: 60, left: 40},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

  var svg = d3.select("#disp").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   var x = d3.time.scale().range([0, width]);

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
        .scale(x)  //xbar
        .orient("bottom")
        .ticks(d3.time.hours, 6)
        .tickFormat(d3.time.format('%m/%d %I:%M%p')); 

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickPadding(8);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(+"+0+"," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
      ;//  .attr("transform", "rotate(-90)" );

    svg.append('g')
      .attr('class', 'y axis').attr("transform", "translate(-"+0+"," +0 + ")")
      .call(yAxis);

var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    var lines = svg.selectAll('.property');

    var lE;


/////////////////////////tooltip code:
var tfocus; 
var hfocus;

    
var  bisectDate = d3.bisector(function(d) { return d.date; }).left;
      
   
 var wind = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() { tfocus.style("display", null); hfocus.style("display", null); });
    //  .on("mouseout", function() { focus.style("display", "none"); });
        
/////////////////////////////////
function update(dataset){
// parse new date strings
 dataset.forEach(function(d) { 
  if(typeof(d.date) === "string"){ d.date = parseDate(d.date); }
});
// sort by date
dataset = dataset.sort(sortByDateAscending);
// update domain
if(dataset.length > maxdata){ console.log('sliced');
  dataset = dataset.slice(dataset.length-maxdata);
}

lastReading(dataset);

x.domain(d3.extent(dataset, function (d) { return d.date; }));

svg.selectAll("g.y.axis")
    .call(yAxis);

svg.selectAll("g.x.axis")
  .attr('id', 'xaxs')
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "+"+aa+"px")
  .attr("dy", "+10px")
;//  .attr("transform", "rotate(-90)" );

svg.selectAll('#xaxs g text').each(insertLinebreaks);

// do first append once
if(!firstappend){
  init(dataset); 
  firstappend = true;
}

var tset = dataset.filter(function(d){ return d.property == 'temperature'});
var hset = dataset.filter(function(d){ return d.property == 'humidity'});

// update new data
lE.select(".tarea")
// .transition().duration(500)
 .attr("d", function(d) {
      return area(tset);
    });
     

lE.select(".harea")
// .transition().duration(500)
 .attr("d", function(d) {
      return area(hset);
    });
  

/////////////////////////tooltip code:
 var dformat = d3.time.format('%m/%d');
 var dformat2 = d3.time.format('%I:%M:%S %p');

wind.on("mousemove", mousemove);

function mousemove() {


  var tx0 = x.invert(d3.mouse(this)[0]),
      ti = bisectDate(tset, tx0, 1),
      td0 = tset[ti - 1],
      td1 = tset[ti],
      td = tx0 - td0.date > td1.date - tx0 ? td1 : td0;

  tfocus.select("circle.y")
      .attr("transform", "translate(" + x(td.date) + "," + y(td.value.mag) + ")");                      

  var hx0 = x.invert(d3.mouse(this)[0]),
      hi = bisectDate(hset, hx0, 1),
      hd0 = hset[hi - 1],
      hd1 = hset[hi],
      hd = hx0 - hd0.date > hd1.date - hx0 ? hd1 : hd0;

  hfocus.select("circle.y")
      .attr("transform", "translate(" + x(hd.date) + "," +  y(hd.value.mag) + ")");
           
   tfocus.select('line.x') 
    .attr("transform", "translate(" + x(td.date) + "," +  0 + ")");      

  hfocus.select('line.x') 
    .attr("transform", "translate(" + x(hd.date) + "," +  0 + ")");  

      d3.select('#treadout').html(
         dformat(td.date) + '&nbsp&nbsp' + dformat2(td.date)  + '<br>'
         + td.property+':&nbsp' + td.value.string + '<br>'
         +  '<a href="' + td.link +'" ' +'target="_blank"' +'>' + 'truenumber' + '</a>'
        );


      d3.select('#hreadout').html(
         dformat(hd.date) + '&nbsp&nbsp' + dformat2(hd.date)  + '<br>'
         + hd.property+':&nbsp' + hd.value.string + '<br>'
         +  '<a href="' + hd.link +'" ' +'target="_blank"' +'>' + 'truenumber' + '</a>'
        );

  }     

//////////////////////////////////

}

function init(dataset){

lines = svg.selectAll('.property')
      .data(dataset, function(d) {
        return d.property;
      });

lE = lines.enter()
      .append('g')
      .attr('class', 'property');

      lE.append("path")
        .attr("class", "tarea")
        .style('fill', 'red')
        .style('opacity', '0.3')
        .attr("d", function(d) {
          return area(dataset.filter(function(d){ return d.property == 'temperature'}));
        });
      
      lE.append("path")
        .attr("class", "harea")
        .style('fill', 'steelblue')
        .style('opacity', '0.9')
        .attr("d", function(d) {
          return area(dataset.filter(function(d){ return d.property == 'humidity'}));
        });

    svg.append("rect")
        .attr("x", 6)
        .attr("y", 0)
        .style('fill', 'red')
        .style('opacity', '0.8')
        .attr("width", 10)
        .attr("height", 10);

    svg.append('text')
        .text('Temperature F')
        .attr('x', 19)
        .attr('y', 9);

    svg.append("rect")
        .attr("x", 100)
        .attr("y", 0)
        .style('fill', 'steelblue')
        .style('opacity', '0.8')
        .attr("width", 10)
        .attr("height", 10);

    svg.append('text')
        .text('humidity %')
        .attr('x', 113)
        .attr('y', 9);

 tfocus = svg.append("g").style("display", "none"); 
 hfocus = svg.append("g").style("display", "none");

      // append the x line
    tfocus.append("line")
        .attr("class", "x")
        .style("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.2)
        .attr("y1", 0)
        .attr("y2", height);

    hfocus.append("line")
        .attr("class", "x")
        .style("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.2)
        .attr("y1", 0)
        .attr("y2", height);

    tfocus.append("circle")
        .attr("class", "y")
        .style("fill", "red")
        .style("stroke", "black")
       // .style('opacity', '0.5')
        .attr("r", 5);
     
     hfocus.append("circle")
        .attr("class", "y")
        .style("fill", "#2679FF")
        .style("stroke", "black")
       // .style('opacity', '0.5')
        .attr("r", 5);   

}

  function sortByDateAscending(a, b) {
    return Date.parse(a.date) - Date.parse(b.date);
};

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

function lastReading(dataset){
var d = dataset[dataset.length-1];
var d2 = dataset[dataset.length-2];
var dformat = d3.time.format('%m/%d');
var dformat2 = d3.time.format('%I:%M:%S %p');


d3.select('#treport').html(
   
   dformat(d.date) + '&nbsp&nbsp' + dformat2(d.date)  + '<br>'
   + d.property+':&nbsp' + d.value.string + '<br>'
   +  '<a href="' + d.link +'" ' +'target="_blank"' +'>' + 'truenumber' + '</a>'
  );

d3.select('#hreport').html(
   
   dformat(d2.date) + '&nbsp&nbsp' + dformat2(d2.date)  + '<br>'
   + d2.property+':&nbsp' + d2.value.string + '<br>'
   +  '<a href="' + d2.link +'" ' +'target="_blank"' +'>' + 'truenumber' + '</a>'
  );

}

return {
    update : update
  }
})();
