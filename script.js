/* Bar Chart - Based on Mike Bostock's bar chart (https://bl.ocks.org/mbostock/3885304) */
/* Pie Chart - Based on Mike Bostock's pie chart (https://bl.ocks.org/mbostock/3887235) and Jaime's message on stackoverflow about how to update a pie chart (https://stackoverflow.com/questions/21325067/what-is-the-best-way-to-update-pie-chart-on-hover-of-bars-in-a-bar-chart-d3)*/

// setting the radius of the pie chart and the dimensions of the pie chart canvas
var radius = 110;
var pieChartSVG = d3.select("#pieChartContainer");
pieChartSVG.attr("width", radius * 2)
	.attr("height", radius * 2);

var pieChartGroup = pieChartSVG.append("g")
	.attr("transform", "translate(" + radius + "," + radius + ")");

// colors for the slices of the pie chart
var color = d3.scaleOrdinal(["#F2EBBF", "#F3B562", "#F06060"]);

// render the pie chart, sorting the slices in the order that is given in d.servings
var pie = d3.pie()
    .sort(null)
    .value(function(d) {
    	return d.servings;
    });

// setting the inner and outer radius for the slices of the pie chart
var path = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

// setting the dimensions of the bar chart canvas
var barChartSVG = d3.select("#barChartContainer");
var margin = {top: 70, right: 20, bottom: 30, left: 155};
var width = +barChartSVG.attr("width") - margin.left - margin.right;
var height = +barChartSVG.attr("height") - margin.top - margin.bottom;

// changed rangeRound([0, width]) to rangeRound([0, height]) because my x-axis is vertical and starts with 0 en ends with de height of the bar chart SVG
var x = d3.scaleBand()
	.rangeRound([0, height])
	.padding(0.1);

// changed rangeRound([height, 0]) to rangeRound([0, width]) because my y-axis is horizontal and starts with 0 and ends with de width of the bar chart SVG
var y = d3.scaleLinear()
	.rangeRound([0, width]); 

var barChartGroup = barChartSVG.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// loading the data
d3.csv("alcohol_consumption.csv", convertRow, onLoad);

function onLoad(error, data) {
	if (error) throw error; 

	// x-axis maps the country names
	x.domain(data.map(country));
 
	// y-axis starts with 0 and ends with the heighest number of litres of pure alcohol
	y.domain([0, d3.max(data, total_litres_of_pure_alcohol)]);

	// select all bars and join them to the data
	var bars = barChartGroup.selectAll(".bar")
		.data(data);

	// select all bar values and join them to the data
	var barValues = barChartGroup.selectAll(".barValue")
		.data(data);

	// removed attr("transform", "translate(0," + height + ")") because I don't want to move the x axis
	// changed d3.axisBottom(x) to d3.axisLeft(x) because I want the x-axis to be on the left side
	barChartGroup.append("g")
		.attr("class", "axis axis--x")
		.call(d3.axisLeft(x));

	// changed d3.axisLeft(y) to d3.axisTop(y) because I want the y-axis to be on the top side
	// changed ticks(10, "%") to ticks(15) because I want 15 ticks instead of 10 (which turns into 8 ticks because "d3 inteprets the ticks() value as a suggestion and overrides that suggestion with what it determines to be the most clean and human-readable values" (http://alignedleft.com/tutorials/d3/axes)) and I don't use percentages
	barChartGroup.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisTop(y).ticks(15))

		// adding a label "Litres of pure alcohol" for the y-axis
		.append("text")
		.attr("class", "label")
		.text("Litres of pure alcohol")
		.attr("x", width / 2)
		.attr("y", -30);

	bars.enter()
		.append("rect")
		.attr("class", "bar")

		// changed attr("x", function(d) { return x(d.letter); }) to attr("x", 0) because every bar starts at x = 0
		.attr("x", 0)

		// changed attr("y", function(d) { return y(d.frequency); }) to attr("y", function(d) { return x(d.country) + 4; }) because the y value of each bar is equal to the country it belongs to and + 4 because I reduced the height of each bar by 8
		.attr("y", function(d) {
			return x(d.country) + 4;
		})

		// changed attr("width", x.bandwidth()) to attr("height", x.bandwidth() - 8) because my bars are horizontal so the height of each bar must be equal to the bandwidth of x  and - 8 so the bars are a bit thinner which looks nicer
		.attr("height", x.bandwidth() - 8)

		// changed attr("height", function(d) { return height - y(d.frequency); }) to attr("width", function(d) { return y(d.total_litres_of_pure_alcohol); }) because the width of each bar is equal to the value of total litres of pure alcohol that it represents
		.attr("width", function(d) {
			return y(d.total_litres_of_pure_alcohol);
		})

		// show corresponding pie chart when hovering over a bar
		.on("mouseover", showPieChart);
    
	// adding a label to each bar that gives the exact value of total litres of pure alcohol
	barValues.enter()
		.append("text")
		.attr("class", "barValue")
		.text(function(d) {
			return d.total_litres_of_pure_alcohol;
		})
		.attr("x", function(d) {
			return y(d.total_litres_of_pure_alcohol + 0.2);
		})
		.attr("y", function(d) {
			return x(d.country) + x.bandwidth() / 2 + 4;
		});

	function showPieChart(d) {

		// creating an empty array to fill with the data for the selected country
		var dataForCountry = [];

	// putting the data for the selected country in the array
	// Based on Ethan Jewett's message on stackoverflow (https://stackoverflow.com/questions/43098717/creating-multiple-column-dimension-from-csv/43102186)
	data.forEach(function(select) {
		if (d.country == select.country) {
			dataForCountry.push({"drink": "Beer", "servings": d.beer_servings});
			dataForCountry.push({"drink": "Spirits", "servings": d.spirit_servings});
			dataForCountry.push({"drink": "Wine", "servings": d.wine_servings});
		}
		console.log("select = ", select);
	});

	console.log("d= " , d);
	console.log("data= " , data);


	// select all arcs and join them to the data
	var arc = pieChartGroup.selectAll(".arc")
		.data(pie(dataForCountry))
		.attr("d", path);

	// create the slices and fill them with the corresponding color
	arc.enter()
		.append("path")
		.attr("fill", function(d) {
			return color(d.data.drink);
		})
		.attr("d", path)
		.attr("class", "arc");

	// remove elements missing data
	arc.exit()
		.remove();


	/* Legend for the pie chart - Based on Pasha's DashBoard code (http://bl.ocks.org/NPashaP/96447623ef4d342ee09b) */

	// get the elements of the legend and his parent (the legendContainer)
	var legendContainer = document.getElementById("legendContainer");
	var legend = document.getElementById("legend");

	// if there is already a legend, it will be removed before adding the new legend
	// the first time you hover over a bar, there is no legend to remove so that's why the statements says legend != null
	if (legend != null) {
		legendContainer.removeChild(legend);	
	}

	// show the corresponding country name
	var countryName = document.getElementById("countryName");
	countryName.innerHTML = d.country;

	// append a table to the div with ID legendContainer
	var legendTable = d3.select("#legendContainer")
		.append("table")
		.attr("id", "legend");

	// select the tablerows and join the data to them
	var tr = legendTable.selectAll("tr")
		.data(pie(dataForCountry))
		.enter()
		.append("tr");

	// the first column shows a rectangle with the color of the corresponding slice
	tr.append("td")
		.append("svg")
		.attr("width", '16')
		.attr("height", '16')
		.append("rect")
        .attr("width", '16')
        .attr("height", '16')
		.attr("fill", function(d) {
			return color(d.data.drink);
		});

	// the second column shows the name of the drink
	tr.append("td")
		.text(function(d) {
			return d.data.drink;
		});

	// the third clumn shows the number of servings
	tr.append("td")
		.text(function(d) {
			return d.data.servings + " servings";
		});
	}
    

	/* Sorting - Based on Titus Wormer's Sort (https://github.com/cmda-fe3/course-17-18/tree/master/site/class-4/sort) */

	// listen to `sort`
	d3.select('#countryAToZ').on('change', onchange);
	d3.select('#litresAscending').on('change', onchange);
	d3.select('#litresDescending').on('change', onchange);

	function onchange(element) {

		// selecting the input elements
		var sortCountryAToZ = document.getElementById("countryAToZ");
		var sortLitresAscending = document.getElementById("litresAscending");
		var sortLitresDescending = document.getElementById("litresDescending");

		var sort;

		// value of `sort` depends on which radio button is checked
		if (sortCountryAToZ.checked) {
			sort = sortOnCountry;
		} else if (sortLitresAscending.checked) {
			sort = sortOnLitresOfAlcoholAscending;
		} else if (sortLitresDescending.checked) {
			sort = sortOnLitresOfAlcoholDescending;
		}

		// new scale for the x-axis (after transition)
		var x0 = x.domain(data.sort(sort).map(country)).copy();

		var transition = barChartSVG.transition();

		// initial sort
		barChartSVG.selectAll('.bar')
			.sort(sortBar);

		// move the bars
		transition.selectAll('.bar')
			.attr('y', barX0);

		// move the country names
		transition.select('.axis--x')
			.call(d3.axisLeft(x))
			.selectAll('g');

		// move the bar values
		transition.selectAll('.barValue')
			.attr('y', barValueX0);

		// calculates the position of each bar
		function sortBar(a, b) {
			return x0(country(a)) - x0(country(b));
		}

		// link bar to country name
		function barX0(d) {
			return x0(country(d));
		}

		// link bar value to country name
		function barValueX0(d) {
			return x0(country(d)) + 27;
		}
	}

	function change() {
		d3.select('input')
		.property('checked', true) // sets `checked` on true
		.dispatch('change');
	}
}

// convert the rows total litres of pure alcohol to numbers
function convertRow(d) {
  d.total_litres_of_pure_alcohol = +d.total_litres_of_pure_alcohol;
  return d;
}

// sort on country name
function sortOnCountry(value1, value2) {
	return d3.ascending(country(value1), country(value2));
}

// sort on litres of alcohol (descending)
function sortOnLitresOfAlcoholDescending(value1, value2) {
	return total_litres_of_pure_alcohol(value2) - total_litres_of_pure_alcohol(value1);
}

// sort on litres of alcohol (ascending)
function sortOnLitresOfAlcoholAscending(value1, value2) {
	return total_litres_of_pure_alcohol(value1) - total_litres_of_pure_alcohol(value2);
}

// get the country field for a row
function country(d) {
	return d.country;
}

// get the total litres of pure alcohol field for a row
function total_litres_of_pure_alcohol(d) {
	return d.total_litres_of_pure_alcohol;
}