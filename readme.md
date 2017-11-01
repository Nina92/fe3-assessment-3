# Assessment 3

## Description
This is a data visualisation of worldwide alcohol consumption in 2010. 

## Background
I have made a bar chart that shows how much alcohol was consumed per person per country in 2010. If you hover over a bar, you see a pie chart for the corresponding country which is divided in servings of beer, spirits and wine.

### Bar Chart
The bar chart is based on [Mike Bostock's basic Bar Chart code](https://bl.ocks.org/mbostock/3885304).
You can sort the code which is based on [Titus Wormer's Sort code](https://github.com/cmda-fe3/course-17-18/tree/master/site/class-4/sort).

### Pie Chart
The pie chart is based on [Mike Bostock's Pie Chart code](https://bl.ocks.org/mbostock/3887235) and [Jaime's message](https://stackoverflow.com/questions/21325067/what-is-the-best-way-to-update-pie-chart-on-hover-of-bars-in-a-bar-chart-d3) on stackoverflow about how to update a pie chart. The legend for the pie chart is based on [Pasha's DashBoard code](http://bl.ocks.org/NPashaP/96447623ef4d342ee09b).

### Process

1. Changed the original bar chart code so that the x-axis is on the left, the y-axis is on top and the bars are drawn horizontal instead of vertical
2. Joined my data to the bar chart
3. Added sorting options
4. Changed the original pie chart code so that it worked with my data (I needed to reformat the data because I wanted 1 pie chart per row instead of 1 pie chart for the whole dataset) for a given country
5. Connected the pie chart to the bar chart by adding a `mouseover` to the bars that calls the function `showPieChart`, so the pie chart for the corresponding country is shown
6. Added code that updates the pie chart when you hover over another bar
7. Added a legend for the pie chart with use of `<table>`
8. Made everything pretty by adding some CSS

## Data
I used data from [fivethirtyeight](https://github.com/fivethirtyeight/data/blob/master/alcohol-consumption/drinks.csv). The CSV file contains data of alcohol consumption in 2010 in 193 countries.

Snippet of the data:

```
country,beer_servings,spirit_servings,wine_servings,total_litres_of_pure_alcohol
Afghanistan,0,0,0,0.0
Albania,89,132,54,4.9
Algeria,25,0,14,0.7
Andorra,245,138,312,12.4
Angola,217,57,45,5.9
```


## License
Released under the [MIT License](https://opensource.org/licenses/MIT) © Nina van den Berg