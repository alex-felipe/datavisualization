

var scrollVis = function () {

  var width = 600;
  var height = 520;
  var margin = { top: 0, left: 20, bottom: 40, right: 10 };

  var lastIndex = -1;
  var activeIndex = 0;

  var squareSize = 8;
  var squarePad = 5;
  var numPerRow = width / (squareSize + squarePad);

  var svg = null;

  var g = null;

  var xBarScale = d3.scaleLinear()
    .range([0, width]);

  var yBarScale = d3.scaleBand()
    .paddingInner(0.08)
    .domain([0, 1, 2])
    .range([0, height - 50], 0.1, 0.1);

  var barColors = { 0: '#008080', 1: '#399785', 2: '#5AAF8C' };

  var xHistScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width - 20]);

  var yHistScale = d3.scaleLinear()
    .range([height, 0]);

  var coughColorScale = d3.scaleLinear()
    .domain([0, 1.0])
    .range(['#008080', 'red']);

  var xAxisBar = d3.axisBottom()
    .scale(xBarScale);

  // @v4 using new axis name
  var xAxisHist = d3.axisBottom()
    .scale(xHistScale)
    .tickFormat(function (d) { return d + ' min'; });

  var activateFunctions = [];

  var updateFunctions = [];


  var chart = function (selection) {
    selection.each(function (rawData) {
      svg = d3.select(this).selectAll('svg').data([dataData]);
      var svgE = svg.enter().append('svg');
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');

      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var dataData = getdatas(rawData);
      var genderdatas = getgenderdatas(dataData);

      var genderCounts = groupBydata(genderdatas);
      var countMax = d3.max(genderCounts, function (d) { return d.value;});
      xBarScale.domain([0, countMax]);

      var histData = getHistogram(genderdatas);
      var histMax = d3.max(histData, function (d) { return d.age; });
      yHistScale.domain([0, histMax]);

      setupVis(dataData, genderCounts, histData);

      setupSections();
    });
  };


  var setupVis = function (dataData, genderCounts, histData) {
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxisBar);
    g.select('.x.axis').style('opacity', 0);

    g.append('text')
      .attr('class', 'title openvis-title')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('Survey 2019')
      .style("font-size", "50px");

    g.append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('Data Hackers');

    g.selectAll('.openvis-title')
      .attr('opacity', 0);

    g.append('text')
      .attr('class', 'title count-title highlight')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('1765');

    g.append('text')
      .attr('class', 'sub-title count-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('Cientistas de Dados')
      .style("font-size", "50px");

    g.selectAll('.count-title')
      .attr('opacity', 0);

    var squares = g.selectAll('.square').data(dataData, function (d) { return d.age; });
    var squaresE = squares.enter()
      .append('rect')
      .classed('square', true);
    squares = squares.merge(squaresE)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', '#fff')
      .classed('fill-square', function (d) { return d.age; })
      .attr('x', function (d) { return d.x;})
      .attr('y', function (d) { return d.y;})
      .attr('opacity', 0);

  };


  var setupSections = function () {
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showgenderTitle;
    activateFunctions[2] = showGrid;
    activateFunctions[3] = highlightGrid;
    activateFunctions[4] = showBar;


    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function () {};
    }
    updateFunctions[7] = updateCough;
  };


  function showTitle() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.openvis-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
  }

  function showgenderTitle() {
    g.selectAll('.openvis-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.square')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.count-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
  }


  function showGrid() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.square')
      .transition()
      .duration(600)
      .delay(function (d) {
        return 5 * d.row;
      })
      .attr('opacity', 1.0)
      .attr('fill', '#ddd');
  }


  function highlightGrid() {
    hideAxis();
    g.selectAll('.bar')
      .transition()
      .duration(600)
      .attr('width', 0);

    g.selectAll('.bar-text')
      .transition()
      .duration(0)
      .attr('opacity', 0);


    g.selectAll('.square')
      .transition()
      .duration(0)
      .attr('opacity', 1.0)
      .attr('fill', '#ddd');


    g.selectAll('.fill-square')
      .transition('move-fills')
      .duration(800)
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y;
      });

    g.selectAll('.fill-square')
      .transition()
      .duration(800)
      .attr('opacity', 1.0)
      .attr('fill', function (d) { return d.gender ? 'pink' : '#ddd'; });
  }


  function showBar() {
    showAxis(xAxisBar);

    g.selectAll('.square')
      .transition()
      .duration(800)
      .attr('opacity', 0);

    g.selectAll('.fill-square')
      .transition()
      .duration(800)
      .attr('x', 0)
      .attr('y', function (d, i) {
        return yBarScale(i % 3) + yBarScale.bandwidth() / 2;
      })
      .transition()
      .duration(0)
      .attr('opacity', 0);

  
  }


  function showHistPart() {
    showAxis(xAxisHist);

    g.selectAll('.bar-text')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.bar')
      .transition()
      .duration(600)
      .attr('width', 0);

    g.selectAll('.hist')
      .transition()
      .duration(600)
      .attr('y', function (d) { return (d.x0 < 15) ? yHistScale(d.length) : height; })
      .attr('height', function (d) { return (d.x0 < 15) ? height - yHistScale(d.length) : 0; })
      .style('opacity', function (d) { return (d.x0 < 15) ? 1.0 : 1e-6; });
  }


  function showHistAll() {
    showAxis(xAxisHist);

    g.selectAll('.cough')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.hist')
      .transition('color')
      .duration(500)
      .style('fill', '#008080');

    g.selectAll('.hist')
      .transition()
      .duration(1200)
      .attr('y', function (d) { return yHistScale(d.length); })
      .attr('height', function (d) { return height - yHistScale(d.length); })
      .style('opacity', 1.0);
  }


  function showCough() {
    showAxis(xAxisHist);

    g.selectAll('.hist')
      .transition()
      .duration(600)
      .attr('y', function (d) { return yHistScale(d.length); })
      .attr('height', function (d) { return height - yHistScale(d.length); })
      .style('opacity', 1.0);
  }


  function showAxis(axis) {

  }


  function hideAxis() {
    g.select('.x.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }


  function updateCough(progress) {
    g.selectAll('.cough')
      .transition()
      .duration(0)
      .attr('opacity', progress);

    g.selectAll('.hist')
      .transition('cough')
      .duration(0)
      .style('fill', function (d) {
        return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
      });
  }

 
  function getdatas(rawData) {
    return rawData.map(function (d, i) {
      // is this data a gender data?
      d.gender = (d.gender == "Feminino") ? true : false;

      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      return d;
    });
  }

  function getgenderdatas(data) {
    return data.filter(function (d) {return d.gender; });
  }


  function getHistogram(data) {

    return d3.histogram()
      .value(function (d) { return d.age; })(0);
  }


  function groupBydata(datas) {
    return d3.nest()
      .key(function (d) { return d.id; })
      .rollup(function (v) { return v.length; })
      .entries(datas)
      .sort(function (a, b) {return b.value - a.value;});
  }


  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };


  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };


  return chart;
};



function display(data) {

  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  var scroll = scroller()
    .container(d3.select('#graphic'));


  scroll(d3.selectAll('.step'));

  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display
d3.tsv('data/datahackers.tsv', display);
