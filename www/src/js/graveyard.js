let svg = d3.select('svg');
let activeFacet = 'cost';
const colourRangeMax = 8000;

let colorScale = d3.scaleLinear().domain([1,colourRangeMax])
  .interpolate(d3.interpolateHcl)
  .range([d3.rgb("#f00"), d3.rgb('#0f0')]);

function changeFacet(facet) {
  activeFacet = facet;
  updateData(data);
}

function colourByFilter(d) {
  if (activeFacet == 'cost') {
    width = d.coords.split(",")[2] - d.coords.split(",")[0];
    height = d.coords.split(",")[3] - d.coords.split(",")[1];
    size = width * height;
    return colorScale(size);
  
  } else if (activeFacet == 'registration') {
    if (d.title.toLowerCase().startsWith('reserved for')) {
      return colorScale(colourRangeMax - 2000);
    }
    if (d.title == 'Pending Order') {
      return colorScale(colourRangeMax - 5000);
    } else if (d.title == 'Link Suspended') {
      return colorScale(0);
    } else {
      return colorScale(colourRangeMax); 
    }

  } else if (activeFacet == 'domain') {
    if (d.response.squatter == true) {
      return colorScale(colourRangeMax - 3000);
    } else if (d.response.redirect) {
      return '#00f';
    } else if (d.response.status == 200) {
      return colorScale(colourRangeMax);
    } else if (d.response.status >= 400) {
      return colorScale(2000);
    } else if (d.response.error) {
      return colorScale(0);
    } else {
      return colorScale(0); 
    }

  } else {
    return '#000'
  }
}

function updateData(data) {

  rect = svg.selectAll("rect")
    .data(data, function(d) { return d.coords; });

  rect.exit()
    .remove();

  rect.enter()
    .append('rect')
    .merge(rect)
      .on('mouseover', function(d) {
        console.log(d)
      })
      .attr('x', function(d) { return d.coords.split(",")[0]; })
      .attr('x', function(d) { return d.coords.split(",")[0]; })
      .attr('width', function(d) { return d.coords.split(",")[2] - d.coords.split(",")[0]; })
      .attr('y', function(d) { return d.coords.split(",")[1]; })
      .attr('height', function(d) { return d.coords.split(",")[3] - d.coords.split(",")[1]; })
      .transition()
      .duration(1000)
      .attr('fill', colourByFilter);
}

d3.json("data/data.json", function(d) {
  data = d;
  updateData(d);
});
