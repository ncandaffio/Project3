(function() {
  ////////////////////////////////////////
  //// Process data //////////////////////
  ////////////////////////////////////////
  d3.csv("congress_data.csv").then(function(data) {
    data.forEach(function(d) {
      d.party = d.party_code === "200" ? "r" : "d";
      d.x_dimension = +d.x_dimension;
      d.alt_dimension = +d.alt_dimension;
    });

    // Group the data by congress number
    // https://github.com/d3/d3-collection#nest
    var dataByCongressNumber = d3
      .nest()
      .key(function(d) {
        return d.congress_number;
      })
      .entries(data);
    // console.log(dataByCongressNumber);

    var dataByCongressNumberByParty = d3
      .nest()
      .key(function(d) {
        return d.congress_number;
      })
      .key(function(d) {
        return d.party;
      })
      .rollup(function(leaves) {
        return d3.mean(leaves, function(d) {
          return d.x_dimension;
        });
      })
      .entries(data);

    var lineDData = [];
    var lineRData = [];
    dataByCongressNumberByParty.forEach(function(d) {
      d.values.forEach(function(e) {
        if (e.key === "d") {
          lineDData.push({
            x: +d.key,
            y: e.value
          });
        } else if (e.key === "r") {
          lineRData.push({
            x: +d.key,
            y: e.value
          });
        }
      });
    });

    ////////////////////////////////////////
    //// Select dropdown ///////////////////
    ////////////////////////////////////////
    d3.select("#congress-number-select")
      .on("change", function() {
        // Update congress number and both charts
        selectedCongressNumber = this.value;
        // Get that congress number's data
        var data = dataByCongressNumber.find(function(d) {
          return d.key === selectedCongressNumber;
        }).values;
        // console.log(data);
        scatter.update(data);
        histogram.update(data);
      })
      .selectAll("option")
      .data(dataByCongressNumber)
      .enter()
      .append("option")
      .attr("value", function(d) {
        return d.key;
      })
      .text(function(d) {
        return getCongressNumberOptionText(d.key);
      });

    function getCongressNumberOptionText(number) {
      var startYear = 1789 + (+number - 1) * 2;
      var endYear = startYear + 2;
      return "Congress #" + number + ", " + startYear + "–" + endYear;
    }

    ////////////////////////////////////////
    //// Line Chart ////////////////////////
    ////////////////////////////////////////
    // https://www.chartjs.org/docs/latest/charts/line.html
    function renderLine() {
      var chartContainer = document.getElementById("line").parentNode;
      chartContainer.style.height = 300 + "px";
      var canvas = d3.select("#line");
      var ctx = canvas.node().getContext("2d");

      var chart = new Chart(ctx, {
        type: "line",

        data: {
          datasets: [
            {
              label: "Democrats",
              backgroundColor: "#6666ff",
              borderColor: "#6666ff",
              fill: false,
              pointRadius: 0,
              data: lineDData
            },
            {
              label: "Republicans",
              backgroundColor: "#e60000",
              borderColor: "#e60000",
              fill: false,
              pointRadius: 0,
              data: lineRData
            }
          ]
        },

        options: {
          maintainAspectRatio: false,
          tooltips: {
            enabled: false
          },
          scales: {
            xAxes: [
              {
                type: "linear",
                ticks: {
                  min: 1,
                  max: 114,
                  fontSize: 10
                }
              }
            ],
            yAxes: [
              {
                type: "linear",
                ticks: {
                  fontSize: 10
                }
              }
            ]
          },
          elements: {
            line: {
              tension: 0 // disables bezier curves
            }
          }
        }
      });
    }

    ////////////////////////////////////////
    //// Scatter ///////////////////////////
    ////////////////////////////////////////
    // https://www.d3-graph-gallery.com/graph/scatter_basic.html
    function renderScatter() {
      // Dimension
      var margin = { top: 10, right: 10, left: 30, bottom: 20 };
      var chartContainer = document.getElementById("scatter").parentNode;
      var svgWidth = chartContainer.clientWidth;
      var svgHeight = 300;
      var width = svgWidth - margin.left - margin.right;
      var height = svgHeight - margin.top - margin.bottom;

      var circleRadius = 4;

      // Scale
      var x = d3
        .scaleLinear()
        .domain([-1, 1])
        .range([0, width]);

      var y = d3
        .scaleLinear()
        .domain([-1, 1])
        .range([height, 0]);

      var colorD = d3
        .scaleLinear()
        .range(["#9999ff", "#6666ff", "#0000ff", "#00004d"])
        .domain([1, 0, -0.5, -1]);

      var colorR = d3
        .scaleLinear()
        .range(["#ffb3b3", "#e60000", "#8b0000", "#4d0000"])
        .domain([-1, 0, 0.5, 1]);

      // Axis
      var xAxis = d3.axisBottom().scale(x);

      var yAxis = d3.axisLeft().scale(y);

      // Render
      var svg = d3
        .select("#scatter")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      var g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("line") // Add 0 vertical line
        .attr("class", "zero-line")
        .attr("x1", x(0) + 0.5)
        .attr("x2", x(0) + 0.5)
        .attr("y1", 0)
        .attr("y2", -height);

      g.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .select(".domain")
        .remove();

      var gCircles = g.append("g").attr("class", "circles");

      function update(data) {
        // Transition
        var t = d3.transition().duration(500);

        // Update circles
        var circle = gCircles.selectAll(".circle").data(data, function(d) {
          return d.icpsr_id;
        });

        var circleEnter = circle
          .enter()
          .append("circle")
          .attr("class", "circle")
          .attr("cx", function(d) {
            return x(d.x_dimension);
          })
          .attr("cy", function(d) {
            return y(d.alt_dimension);
          })
          .attr("r", 0)
          .attr("fill", function(d) {
            if (d.party === "d") {
              return colorD(d.x_dimension);
            } else if (d.party === "r") {
              return colorR(d.x_dimension);
            }
          })
          .transition(t)
          .attr("r", circleRadius);

        circle
          .transition(t)
          .attr("cx", function(d) {
            return x(d.x_dimension);
          })
          .attr("cy", function(d) {
            return y(d.alt_dimension);
          })
          .attr("fill", function(d) {
            if (d.party === "d") {
              return colorD(d.x_dimension);
            } else if (d.party === "r") {
              return colorR(d.x_dimension);
            }
          });

        circle
          .exit()
          .transition(t)
          .attr("r", 0)
          .remove();
      }

      function resize() {
        svgWidth = chartContainer.clientWidth;
        width = svgWidth - margin.left - margin.right;

        x.range([0, width]);

        svg.attr("width", svgWidth);

        g.select(".x.axis")
          .call(xAxis)
          .select(".zero-line")
          .attr("x1", x(0) + 0.5)
          .attr("x2", x(0) + 0.5);

        gCircles
          .selectAll(".circle")
          .attr("cx", function(d) {
            return x(d.x_dimension);
          })
          .attr("cy", function(d) {
            return y(d.alt_dimension);
          });
      }

      return {
        update: update,
        resize: resize
      };
    }

    ////////////////////////////////////////
    //// Histogram /////////////////////////
    ////////////////////////////////////////
    // https://www.d3-graph-gallery.com/graph/histogram_basic.html
    function renderHistogram() {
      // Dimension
      var margin = { top: 10, right: 10, left: 30, bottom: 20 };
      var chartContainer = document.getElementById("scatter").parentNode;
      var svgWidth = chartContainer.clientWidth;
      var svgHeight = 300;
      var width = svgWidth - margin.left - margin.right;
      var height = svgHeight - margin.top - margin.bottom;

      // Scale

      // https://github.com/d3/d3-array#range
      var x = d3
        .scaleLinear()
        .domain([-1.05, 1.05])
        .range([0, width]);

      var y = d3
        .scaleLinear()
        .domain([0, 90])
        .range([height, 0]);

      var colorD = d3
        .scaleLinear()
        .range(["#9999ff", "#6666ff", "#0000ff", "#00004d"])
        .domain([1, 0, -0.5, -1]);

      var colorR = d3
        .scaleLinear()
        .range(["#ffb3b3", "#e60000", "#8b0000", "#4d0000"])
        .domain([-1, 0, 0.5, 1]);

      // Axis
      var xAxis = d3.axisBottom().scale(x);

      var yAxis = d3.axisLeft().scale(y);

      // Histogram
      var thresholds = d3.range(-95, 96, 10).map(function(d) {
        return d / 100;
      }); // [-0.95, -0.85, -0.75, ..., 0.75, 0.85, 0.95]
      // https://github.com/d3/d3-array#bin_thresholds
      var bin = d3
        .histogram()
        .value(function(d) {
          return d.x_dimension;
        })
        .domain([-1, 1])
        .thresholds(thresholds);

      // Render
      var svg = d3
        .select("#histogram")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      var g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      g.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .select(".domain")
        .remove();

      var gBars = g.append("g").attr("class", "bars");

      function update(data) {
        // Bin data for each party
        var binsD = bin(
          data.filter(function(d) {
            return d.party === "d";
          })
        );
        binsD.forEach(function(d) {
          d.color = colorD((d.x0 + d.x1) / 2);
        });

        var binsR = bin(
          data.filter(function(d) {
            return d.party === "r";
          })
        );
        binsR.forEach(function(d) {
          d.color = colorR((d.x0 + d.x1) / 2);
        });

        var bins = binsD.concat(binsR);

        // Transition
        var t = d3.transition().duration(500);

        // Update bars
        var bar = gBars.selectAll(".bar").data(bins, function(d) {
          return d.color; // Use color as key for each bar
        });

        var barEnter = bar
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("fill", function(d) {
            return d.color;
          })
          .attr("x", function(d) {
            return x(d.x0);
          })
          .attr("y", height)
          .attr("width", function(d) {
            return x(d.x1) - x(d.x0);
          })
          .attr("height", 0)
          .transition(t)
          .attr("y", function(d) {
            return y(d.length);
          })
          .attr("height", function(d) {
            return height - y(d.length);
          });

        bar
          .transition(t)
          .attr("y", function(d) {
            return y(d.length);
          })
          .attr("height", function(d) {
            return height - y(d.length);
          });

        bar
          .exit()
          .transition(t)
          .attr("y", height)
          .attr("height", 0)
          .remove();
      }

      function resize() {
        svgWidth = chartContainer.clientWidth;
        width = svgWidth - margin.left - margin.right;

        x.range([0, width]);

        svg.attr("width", svgWidth);

        g.select(".x.axis").call(xAxis);

        gBars
          .selectAll(".bar")
          .attr("y", function(d) {
            return y(d.length);
          })
          .attr("height", function(d) {
            return height - y(d.length);
          });
      }

      return {
        update: update,
        resize: resize
      };
    }

    ////////////////////////////////////////
    //// Initialization ////////////////////
    ////////////////////////////////////////
    var scatter = renderScatter();
    var histogram = renderHistogram();
    renderLine();

    // Initial screen shows the latest congress number
    var selectedCongressNumber =
      dataByCongressNumber[dataByCongressNumber.length - 1].key;

    var dropdown = document.getElementById("congress-number-select");
    dropdown.value = selectedCongressNumber;
    dropdown.dispatchEvent(new Event("change"));

    window.addEventListener("resize", function() {
      scatter.resize();
      histogram.resize();
    });
  });
})();
