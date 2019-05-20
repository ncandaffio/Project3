'use strict';

(function() {

  let data = "no data"; //current data (data of one year)
  let allYearData = ""; //complete data
  let svgContainer = ""; // keep SVG reference in global scope
  let currentYear = 1; //default year
  let options = "";

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('#graph1')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/congress_data.csv")
      .then((csvData) => {
        allYearData = csvData;
        makeDropdown();
        makeScatterPlot(1); //default year for graph
      });
  }

  //make dropdown and buttons that select previous or next year
  function makeDropdown() {

    //dropdown with years as selections
    let dropDown = d3.select("#graph1").append("div")
      .append("select")
      .attr("class", "dropdown"); //for styling

    // get array of years
    let optionData = d3.map(allYearData, function(d) {return d.congress_number;}).keys();

    options = dropDown.selectAll("option")
      .data(optionData)
      .enter()
      .append("option")

    options.text(function (d) {return d; })
      .attr("value", function (d) {return d; });

    dropDown.on("change", function() {
      currentYear = +this.value;
      makeScatterPlot(currentYear);
    });

    //button to select previous year
    let leftButton = d3.select("#graph1").append("div")
      .append("button")
      .attr("id", "leftButton")
      .text("<");

    leftButton.on("click", function() {
        makeScatterPlot(currentYear -= 1);
    });

    //button to select next year
    let rightButton = d3.select("#graph1").append("div")
    .append("button")
    .attr("id", "rightButton")
    .text(">");

    rightButton.on("click", function() {
      makeScatterPlot(currentYear += 1);
    });
  }

  // make scatter plot
  function makeScatterPlot(cnumber) {
    svgContainer.html(""); //clears axes (from previous hovering)

    //updates text on dropdown
    options.property("selected", function(d) {return d == cnumber});

    //disable button for selecting previous year when on first year (1960)
    if (currentYear == 1) {
      document.getElementById("leftButton").disabled = true;
    } else {
      document.getElementById("leftButton").disabled = false;
    }

    //disable button for selecting next year when on last year (2014)
    if (currentYear == 114) {
      document.getElementById("rightButton").disabled = true;
    } else {
      document.getElementById("rightButton").disabled = false;
    }

    data = allYearData.filter((row) => row['congress_number'] == cnumber);
    console.log(data);

    // get arrays of fertility rate data and life Expectancy data
    let x_dimension_data = data.map((row) => parseFloat(row["x_dimension"]));
    let alt_dimension_data = data.map((row) => parseFloat(row["alt_dimension"]));

    // find data limits
    let axesLimits = findMinMax(x_dimension_data, alt_dimension_data);
    console.log(axesLimits);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "x_dimension", "alt_dimension");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Political Polarization Analysis");

    svgContainer.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Ideology (Right - Left)');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Ideology (Social Issues)');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    let pop_data = data.map((row) => +row["geometric_mean_probability"]);
    let pop_limits = d3.extent(pop_data);
    console.log(pop_data);
    console.log(pop_limits);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("#graph1").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


    var rep_color_scale = d3.scaleLinear()
			.range(["#ffb3b3","#e60000","#8b0000","#4d0000"])
			.domain([-1,0,.5,1]);
    var dem_color_scale = d3.scaleLinear()
      .range(["#9999ff","#6666ff","#0000ff","#00004d"])
      .domain([1,0,-.5,-1]);
   


    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        // .attr('r', (d) => pop_map_func(d["geometric_mean_probability"]))
        .attr("r", "5")

        // .attr('fill', "#4286f4")

        // .attr("fill", function(d) {
        //   if (d.x_dimension) {
        //     return rep_color_scale(d.xScale); 
        //   }
        //   return dem_color_scale(d.xScale); 
        // })
        .style("fill", function(d) {
          if (d.x_dimension <= 0) {return "blue"}
          else 	{ return "darkred" }
      ;})



        // .style("fill", function(d) {
        //   var returnColor;
        //       if (d.x_dimension > -1) { returnColor = "green";
        //       } else if (d.x_dimension > 0) { returnColor = "purple";
        //       } else if (d.x_dimension > 0.5) { returnColor = "red"; 
        //       } else if (d.x_dimension > 1) { returnColor = "red"; }
        //       return returnColor;
        //       });



        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html("Country: " + d.name + "<br/>" +
                    "Year: " + d.congress_number + "<br/>" +
                    "Life expectancy: " + d.num_votes + "<br/>" )
                    // "Population: " + numberWithCommas(d["pop_mlns"]*1000000))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([50, 450]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 0, limits.yMin - 0]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
