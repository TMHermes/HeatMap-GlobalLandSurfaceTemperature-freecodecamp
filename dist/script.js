var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const colors = ["#4dffff", "#00e6e6", "#00FFCC", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];

d3.json(url).
then(data => createThing(data)).
catch(err => console.log(err));

var tooltip = d3.
select('.graph').
append('div').
attr('class', 'd3-tip hidden').
attr('id', 'tooltip');

function createThing(data) {
  console.log(data);
  console.log(data.monthlyVariance);
  var section = d3.select('.graph').append('section');
  var header = section.append('header');
  header.
  append('h1').
  attr('id', 'title').
  text('Monthly Global Land-Surface Temperature');
  header.
  append('h3').
  attr('id', 'description').
  html(
  data.monthlyVariance[0].year +
  ' - ' +
  data.monthlyVariance[data.monthlyVariance.length - 1].year +
  ': base temperature ' +
  data.baseTemperature +
  '&#8451;');


  const fontSize = 16;
  var width = 5 * Math.ceil(data.monthlyVariance.length / 12);
  const height = 33 * 12;
  const padding = {
    left: 9 * fontSize,
    right: 9 * fontSize,
    top: 1 * fontSize,
    bottom: 8 * fontSize };


  var svg = d3.
  select('.graph').
  append('svg').
  attr('width', width + padding.left + padding.right).
  attr('height', height + padding.top + padding.bottom);

  data.monthlyVariance.forEach(function (val) {
    val.month -= 1;
  });

  var yScale = d3.
  scaleBand().
  domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).
  rangeRound([0, height]).
  padding(0);

  var yAxis = d3.
  axisLeft().
  scale(yScale).
  tickValues(yScale.domain()).
  tickFormat(function (month) {
    var date = new Date(0);
    date.setUTCMonth(month);
    var format = d3.utcFormat('%B');
    return format(date);
  }).
  tickSize(10, 1);

  svg.
  append('g').
  classed('y-axis', true).
  attr('id', 'y-axis').
  attr('transform', 'translate(' + padding.left + ',' + padding.top + ')').
  call(yAxis).
  append('text').
  text('Months').
  style('text-anchor', 'middle').
  attr(
  'transform',
  'translate(' + -7 * fontSize + ',' + height / 2 + ')' + 'rotate(-90)').

  attr('fill', 'black');

  var xScale = d3.
  scaleBand().
  domain(
  data.monthlyVariance.map(function (val) {
    return val.year;
  })).

  range([0, width]).
  paddingInner(0).
  paddingOuter(0);

  var xAxis = d3.
  axisBottom().
  scale(xScale).
  tickValues(
  xScale.domain().filter(function (year) {
    return year % 10 === 0;
  })).

  tickFormat(function (d) {
    var date = new Date(0);
    date.setUTCFullYear(d);
    var format = d3.timeFormat('%Y');
    return format(date);
  }).
  tickSize(10, 1);

  svg.
  append('g').
  classed('x-axis', true).
  attr('id', 'x-axis').
  attr(
  'transform',
  'translate(' + padding.left + ',' + (height + padding.top) + ')').

  call(xAxis).
  append('text').
  text('Years').
  style('text-anchor', 'middle').
  attr('transform', 'translate(' + width / 2 + ',' + 3 * fontSize + ')').
  attr('fill', 'black');

  var legendColors = colors;
  var legendW = 400;
  var legendH = 300 / legendColors.length;

  var variance = data.monthlyVariance.map(function (val) {
    return val.variance;
  });
  var minTemp = data.baseTemperature + Math.min.apply(null, variance);
  var maxTemp = data.baseTemperature + Math.max.apply(null, variance);

  var legendThreshold = d3.
  scaleThreshold().
  domain(
  function (min, max, count) {
    var array = [];
    var step = (max - min) / count;
    var base = min;
    for (var i = 0; i < count; i++) {
      array.push(base + i * step);
    }
    return array;
  }(minTemp, maxTemp, legendColors.length)).

  range(legendColors);

  var legendX = d3.scaleLinear().domain([minTemp, maxTemp]).range([0, legendW]);

  var legendXAxis = d3.
  axisBottom().
  scale(legendX).
  tickSize(10, 0).
  tickValues(legendThreshold.domain()).
  tickFormat(d3.format('.1f'));

  var legend = svg.
  append('g').
  classed('legend', true).
  attr('id', 'legend').
  attr(
  'transform',
  'translate(' +
  padding.left +
  ',' + (
  padding.top + height + padding.bottom - 2 * legendH) +
  ')');


  legend.
  append('g').
  selectAll('rect').
  data(
  legendThreshold.range().map(function (color) {
    var d = legendThreshold.invertExtent(color);
    if (d[0] === null) {
      d[0] = legendX.domain()[0];
    }
    if (d[1] === null) {
      d[1] = legendX.domain()[1];
    }
    return d;
  })).

  enter().
  append('rect').
  style('fill', function (d) {
    return legendThreshold(d[0]);
  }).
  attr('x', function (d) {
    return legendX(d[0]);
  }).
  attr('y', 0).
  attr('width', function (d) {
    return legendX(d[1]) - legendX(d[0]);
  }).
  attr('height', legendH);

  legend.
  append('g').
  attr('transform', 'translate(' + 0 + ',' + legendH + ')').
  call(legendXAxis);

  // ...

  svg.
  append('g').
  classed('map', true).
  attr('transform', 'translate(' + padding.left + ',' + padding.top + ')').
  selectAll('rect').
  data(data.monthlyVariance).
  enter().
  append('rect').
  attr('class', 'cell').
  attr('data-month', function (d) {
    return d.month;
  }).
  attr('data-year', function (d) {
    return d.year;
  }).
  attr('data-temp', function (d) {
    return data.baseTemperature + d.variance;
  }).
  attr('x', function (d) {
    return xScale(d.year);
  }).
  attr('y', function (d) {
    return yScale(d.month);
  }).
  attr('width', (width - padding.left - padding.right) / (data.monthlyVariance.length / 12)).
  attr('height', yScale.bandwidth()).
  attr('fill', function (d) {
    return legendThreshold(data.baseTemperature + d.variance);
  }).
  on('mouseover', function (event, d) {
    var date = new Date(d.year, d.month - 1);
    var str =
    "<span class='date'>" +
    d3.timeFormat('%Y - %B')(date) +
    '</span>' +
    '<br />' +
    "<span class='variance'>" +
    d3.format('+.1f')(d.variance) +
    '&#8451;' +
    '</span>';
    var xPosition = event.pageX;
    var yPosition = event.pageY;
    showTooltip(str, xPosition, yPosition, d.year);
  }).
  on('mouseout', function () {
    hideTooltip();
  });

  function showTooltip(content, x, y, year) {
    tooltip.
    html(content).
    style('left', x + 'px').
    style('top', y + 'px').
    classed('hidden', false);
    tooltip.attr('data-year', year);
  }

  function hideTooltip() {
    var tooltip = d3.select('#tooltip');
    tooltip.classed('hidden', true);
  }
}