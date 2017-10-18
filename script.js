// var map = new Datamap({element: document.getElementById('container')});

/* BAR CHART - Based on Mike Bostock's bar chart (https://bl.ocks.org/mbostock/3885304) */

// imensions of the canvas
var svg = d3.select("svg");
var margin = {top: 80, right: 20, bottom: 30, left: 130};
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;

// changed rangeRound([0, width]) to rangeRound([0, height]) because my x-axis is vertical and starts with 0 en ends with de height of the SVG
var x = d3.scaleBand().rangeRound([0, height]).padding(0.1);

// changed rangeRound([height, 0]) to rangeRound([0, width]) because my y-axis is horizontal and starts with 0 and ends with de width of the SVG
var y = d3.scaleLinear().rangeRound([0, width]); 

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("alcohol_consumption.csv", cleanRow, onload);

function onload(error, data) {
	if (error) throw error;

	// x-axis maps the country names
	x.domain(data.map(country));
 
	// y-axis starts with 0 and ends with the heighest number of litres of pure alcohol
	y.domain([0, d3.max(data, total_litres_of_pure_alcohol)]);

	// select all bars
	var bars = g
		.selectAll(".bar")
		.data(data);

	var barValues = g
		.selectAll(".barValue")
		.data(data);

	// removed attr("transform", "translate(0," + height + ")") because I don't want to move the x axis
	// changed d3.axisBottom(x) to d3.axisLeft(x) because I want the x-axis on the left side
	g.append("g")
		.attr("class", "axis axis--x")
		.call(d3.axisLeft(x));

	// changed d3.axisLeft(y) to d3.axisTop(y) because I want the y-axis on the top side
	// changed ticks(10, "%") to ticks(15) because I want 15 ticks instead of 10 (which turns into 8 ticks because "d3 inteprets the ticks() value as a suggestion and overrides that suggestion with what it determines to be the most clean and human-readable values" (http://alignedleft.com/tutorials/d3/axes)) and I don't use percentages
	g.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisTop(y).ticks(15));

    // I don't know exactly why Mike Bostock wrote the following code, it seems like there isn't a notable change when I don't use it. I left it in comments just in case. I guess it is some kind of fallback when there isn't any data.

    // .append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 6)
    //   .attr("dy", "0.71em")
    //   .attr("text-anchor", "end")
    //   .text("total litres of pure alcohol");

    bars.exit().remove();

	bars.enter()
		.append("rect")
		.attr("class", "bar")
		// changed attr("x", function(d) { return x(d.letter); }) to attr("x", 0) because every bar starts at x = 0
		.attr("x", 0)

		// changed attr("y", function(d) { return y(d.frequency); }) to attr("y", function(d) { return x(d.country); }) because the y value of each bar is equal to the country it belongs to
		.attr("y", function(d) {
			return x(d.country);
		})

		// changed attr("width", x.bandwidth()) to attr("height", x.bandwidth()) because my bars are horizontal so the height of each bar must be equal to the bandwidth of x
		.attr("height", x.bandwidth())

		// changed attr("height", function(d) { return height - y(d.frequency); }) to attr("width", function(d) { return y(d.total_litres_of_pure_alcohol); }) because the width of each bar is equal to the value of total litres of pure alcohol that it represents
		.attr("width", function(d) {
			return y(d.total_litres_of_pure_alcohol);
		});
    
	barValues.exit().remove();

	// adding a label to each bar that gives the exact value of total litres of pure alcohol
	// inspired by Hannah Recht's Simple horizontal barchart (https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3)
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
    

	/* Sorting and filtering - Based on Titus Wormer's Sort (https://github.com/cmda-fe3/course-17-18/tree/master/site/class-4/sort) */

	// listen to `sort`
	d3.select('#countryAToZ').on('change', onchange);
	d3.select('#litresAscending').on('change', onchange);
	d3.select('#litresDescending').on('change', onchange);

	// listen to `filter`
	d3.select("#valuesGreaterThenZero").on("change", onchange);

	// bars.exit().remove();
	// barValues.exit().remove();

	function onchange(element) {

		// selecting the input elements
		var sortCountryAToZ = document.getElementById("countryAToZ");
		var sortLitresAscending = document.getElementById("litresAscending");
		var sortLitresDescending = document.getElementById("litresDescending");
		var filterValuesGreaterThenZero = document.getElementById("valuesGreaterThenZero"); 

		var sort;
		var filter;

		// value of `sort` depends on which radio button is checked
		if (sortCountryAToZ.checked) {
			sort = sortOnCountry;
		} else if (sortLitresAscending.checked) {
			sort = sortOnLitresOfAlcoholAscending;
		} else if (sortLitresDescending.checked) {
			sort = sortOnLitresOfAlcoholDescending;
		}

		// value of `filter` depends on whether the checkbox is checked or not 
		if (filterValuesGreaterThenZero.checked) {
			filter = valuesGreaterThenZero
		} else {
			filter = noFilter;
		}

		// new scale for the x-axis (after transition)
		var x0 = x.domain(data.filter(filter).sort(sort).map(country)).copy();

	
		var transition = svg.transition();

		// initial sort
		svg.selectAll('.bar')
			.filter(filter)
			.sort(sortBar);

		// move the bars
		transition.selectAll('.bar')
			.attr('y', barX0); // no y when filtered?

		// move the country names
		transition.select('.axis--x')
			.call(d3.axisLeft(x))
			.selectAll('g');

		// move the bar values
		transition.selectAll('.barValue')
			.attr('y', barValueX0); //NaN when filtered?

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
function cleanRow(d) {
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

// filter on values greater then zero
function valuesGreaterThenZero(d) {
	return d.total_litres_of_pure_alcohol > 0;
}

// turn the filter off when the checkbox is unchecked
function noFilter() {
	return true;
}

// get the country field for a row
function country(d) {
	return d.country;
}

// get the total litres of pure alcohol field for a row
function total_litres_of_pure_alcohol(d) {
	return d.total_litres_of_pure_alcohol;
}