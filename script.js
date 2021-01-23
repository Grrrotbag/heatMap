// set the dimensions and margins of the graph
const margin = { top: 50, right: 50, bottom: 150, left: 90 },
  width = 1560 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

const monthName = (month) => {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][month - 1];
};

// append the svg object to the body of the page
const svg = d3
  .select("#chartContainer")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.json(
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json",
  (data) => {
    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    var years = d3.map(data.monthlyVariance, (d) => d.year).keys();
    var months = d3.map(data.monthlyVariance, (d) => monthName(d.month)).keys();

    var baseTemp = data.baseTemperature;
    console.log("base temp: ", baseTemp);
    console.log("years: ", years);
    console.log("months: ", months);

    // Build X scales and axis:
    var x = d3.scaleBand().range([0, width]).domain(years);
    svg
      .append("g")
      .style("font-size", 10)
      .attr("transform", "translate(0," + height + ")")
      .attr("id", "x-axis")
      .call(
        d3
          .axisBottom(x)
          .tickSize(10)
          .tickValues(
            x.domain().filter((year) => {
              // set ticks to years divisible by 10
              return year % 10 === 0;
            })
          )
      )
      .select(".domain")
      .remove();

    // Build Y scales and axis:
    var y = d3.scaleBand().range([height, 0]).domain(months);
    svg
      .append("g")
      .style("font-size", 10)
      .attr("id", "y-axis")
      .call(d3.axisLeft(y).tickSize(10))
      .select(".domain")
      .remove();

    // Build color scale
    var max = d3.max(data.monthlyVariance, function (d) {
      return d.variance;
    });
    var min = d3.min(data.monthlyVariance, function (d) {
      return d.variance;
    });
    var color = d3.scaleSequential().interpolator(d3.interpolatePlasma).domain([min, max]);

    // create a tooltip
    var tooltip = d3.select("#chartContainer").append("div").attr("id", "tooltip");

    // tooltip mouse event functions
    var mouseover = function (d) {
      tooltip.style("opacity", 1).attr("data-year", d.year);
    };
    var mousemove = function (d) {
      tooltip
        .html(
          monthName(d.month).slice(0, 3) +
            " " +
            d.year +
            "<br>" +
            d3.format(".1f")(data.baseTemperature + d.variance) +
            "°C" +
            "<br>" +
            d3.format(".1f")(d.variance) +
            "°C"
        )
        .style("left", d3.mouse(this)[0] + 440 + "px")
        .style("top", d3.mouse(this)[1] + 280 + "px");
    };
    var mouseleave = function (d) {
      tooltip.style("opacity", 0);
    };

    // add the squares
    svg
      .selectAll()
      .data(data.monthlyVariance)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance)
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(monthName(d.month)))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", (d) => color(d.variance))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // color legend
    // https://d3-legend.susielu.com/
    svg.append("g").attr("id", "legend").attr("transform", "translate(0,480)");

    var legend = d3.legendColor().shapeWidth(40).cells(15).orient("horizontal").scale(color);

    svg.select("#legend").call(legend);

    svg.append("text").text("Temperature variance from 8.66°C").attr("transform", "translate(0,460)");
  }
);
