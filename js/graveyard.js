const svg = d3.select('svg');
let activeFacet = 'domain';
const colourRangeMax = 8000;

const colorScale = d3.scaleSqrt().domain([1,colourRangeMax])
  .interpolate(d3.interpolateHcl)
  .range([d3.rgb("#fff"), d3.rgb('#2f2')]);

const colorOrdinal = d3.scaleOrdinal(d3.schemeCategory10);

function changeFacet(facet) {
  activeFacet = facet;
  updateData(data);
  $('#facet-menu .item').removeClass('active');
  $('#facet-menu .item.' + facet).addClass('active');
}

function colourByFilter(d) {
  if (activeFacet == 'original') {
    $('.ad-grid').addClass('coloured');
    return 'rgba(0,0,0,0)'

  } else if (activeFacet == 'cost') {
    $('.ad-grid').removeClass('coloured');
    width = d.coords.split(",")[2] - d.coords.split(",")[0];
    height = d.coords.split(",")[3] - d.coords.split(",")[1];
    size = width * height;
    return colorScale(size);
  
  } else if (activeFacet == 'registration') {
    $('.ad-grid').removeClass('coloured');
    if (d.title.toLowerCase().startsWith('reserved for')) {
      return colorOrdinal(colourRangeMax - 2000);
    }
    if (d.title == 'Pending Order') {
      return colorOrdinal(colourRangeMax - 5000);
    } else if (d.title == 'Link Suspended') {
      return colorOrdinal(0);
    } else {
      return colorOrdinal(colourRangeMax); 
    }

  } else if (activeFacet == 'domain') {
    $('.ad-grid').removeClass('coloured');
    if (d.response.squatter == true) {
      return colorOrdinal(colourRangeMax - 5000);
    } else if (d.response.redirected) {
      return colorOrdinal(colourRangeMax - 3000);
    } else if (d.response.status == 200) {
      return colorOrdinal(colourRangeMax);
    } else if (d.response.status >= 400) {
      return colorOrdinal(1000);
    } else if (d.response.error) {
      return colorOrdinal(0);
    } else {
      return colorOrdinal(0); 
    }

  } else {
    return '#000'
  }
}

function updateData(data) {

  rect = svg.selectAll("rect")
    .data(data, function(d, i ) { return i; });

  rect.exit()
    .remove();

  rect.enter()
    .append('rect')
    .merge(rect)
      .on('dblclick', function(d) {
        document.location = d.href;
      })
      .on('mouseover', function(d) {
        if (!$('.tooltip').hasClass('sticky')) {
          width = d.coords.split(",")[2] - d.coords.split(",")[0];
          height = d.coords.split(",")[3] - d.coords.split(",")[1];
          size = width * height;
          $('.tooltip').attr('style', "left: " + d.coords.split(",")[0] + "; top:" + d.coords.split(",")[1]);
          $('.tooltip .header').html(d.title);
          $('.tooltip .meta').text("$" + size);
          $('.tooltip .status').text(status(d.response));
          $('.tooltip .description a').text(d.href);
          $('.tooltip .description a').attr('href', d.href);
        }
      })
      .on('click', function(d) {
        $('.tooltip').toggleClass('sticky');
      })
      .attr('x', function(d) { return d.coords.split(",")[0]; })
      .attr('x', function(d) { return d.coords.split(",")[0]; })
      .attr('width', function(d) { return d.coords.split(",")[2] - d.coords.split(",")[0]; })
      .attr('y', function(d) { return d.coords.split(",")[1]; })
      .attr('height', function(d) { return d.coords.split(",")[3] - d.coords.split(",")[1]; })
      .attr('stroke-width', 1)
      .attr('stroke', 'rgba(0,0,0,0.3')
      .transition()
      .duration(1000)
      .attr('fill', colourByFilter)
      .style("cursor", "pointer")
}

d3.json("data/data.json", function(d) {
  data = d;
  updateData(d);
});

function status(response) {
  if (response.redirected) {
    return "redirected";
  } else if (response.error) {
    return "error crawling";
  } else {
    return "code: " + response.status;
  }
}

$('document').ready(function(){
  $('.ad-grid').on('mouseover', function() {
    $('.tooltip').addClass('active');
  })
  $('.ad-grid').on('mouseout', function() {
    if (!$('.tooltip').hasClass('sticky')) {
      $('.tooltip').removeClass('active');
    }
  })
});
