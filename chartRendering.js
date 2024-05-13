import { lifeData, getMaxVal, setMaxVal, loadLifeData, loadData, continentMapping} from './dataProcessing.js';

//Entry point for the script, executed when the document has loaded
function init() {
    //Define chart dimensions and padding
    var w = 800; 
    var h = 600;
    var padding = 40;

    const continentColors = {
        "North America": "#1f77b4",
        "South America": "#ff7f0e",
        "Europe": "#2ca02c",
        "Africa": "#d62728",
        "Asia": "#9467bd",
        "Oceania": "#8c564b"
    };

    var xAxisLabel = ""; 
    var yAxisLabel = "Life Expectancy in years"
    //Select the chart container and append an SVG element to it
    var svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h);

    //Initialize object to store historical data per country
    var historicalData = {};
    //Variable to track selected country for highlighting
    var selectedCountry = null;

    //Updates the historicalData object with new data entries
    function updateHistoricalData(filteredData) {
        filteredData.forEach(d => {
            if (!historicalData[d.country]) {
                historicalData[d.country] = [];
            }
            historicalData[d.country].push({ x: d.gdp, y: d.lifeExpec });
        });
    }

    //Append x-axis and y-axis groups to the SVG
    svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${h - padding})`);
    svg.append('g').attr('class', 'y-axis').attr('transform', `translate(${padding},0)`);

    //Append and style a label for displaying the year
    var yearLabel = svg.append("text")
        .attr("class", "year-label")
        .style("text-anchor", "end")
        .attr("x", w - padding)
        .attr("y", padding);

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 12)  
        .attr("x", -h / 2)
        .style("text-anchor", "middle")  
        .text(yAxisLabel);

    //Updates the chart for a specified year
    function updateChart(year) {
        yearLabel.text(year); //Update the year label
        document.getElementById("yearLabel").innerHTML = year; //Update slider label
        drawChart(lifeData, year); //Redraw the chart with current data
    }


//Draws the chart using filtered data for a specific year
function drawChart(dataForPlot, year) {
    
    let filteredData = dataForPlot.map(country => ({
        country: country.country,
        gdp: country.years[year] ? country.years[year].gdp : null,
        lifeExpec: country.years[year] ? country.years[year].expec : null,
        continent: continentMapping[country.country] 
    })).filter(item => item.gdp && item.lifeExpec);

    updateHistoricalData(filteredData);

    var xScale = d3.scaleLinear()
        .domain([0, getMaxVal()])
        .range([padding, w - padding]);
    var yScale = d3.scaleLinear()
        .domain([40, 90])
        .range([h - padding, padding]);
    svg.select('.x-axis').call(d3.axisBottom(xScale).ticks(5));
    svg.select('.y-axis').call(d3.axisLeft(yScale).ticks(5));

    // Update circles for current year data
    var update = svg.selectAll('circle')
        .data(filteredData, d => d.country);

    var enter = update.enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', 5)
        .style('fill', d => continentColors[d.continent]); // Use continent color

    enter.merge(update)
        .on('click', function(event, d) {
            selectedCountry = selectedCountry === d.country ? null : d.country;
            drawChart(dataForPlot, year); // Redraw chart to update styles
        })
        .on('mouseover', function(event, d) {
            d3.select('#tooltip')
                .style('visibility', 'visible')
                .html(`Country: ${d.country}<br>Life Expectancy: ${d.lifeExpec}<br>GDP: ${Math.round(d.gdp * 100) / 100}`)
                .style('top', (event.pageY - 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select('#tooltip').style('visibility', 'hidden');
        })
        .transition()
        .duration(750)
        .attr('cx', d => xScale(d.gdp))
        .attr('cy', d => yScale(d.lifeExpec))
        .attr('fill', d => continentColors[d.continent]);

    update.exit().remove();
}


    //Load initial data and set up event listeners for UI elements like sliders and buttons
    loadLifeData().then(() => {
        updateChart(document.getElementById('yearSlider').value);
    });

    //Event listeners for buttons to load different datasets and update chart
    document.getElementById('buttonCSV1').addEventListener('click', function () {
        var csvPath = './data/cleanedData/gdpPerCapita.csv';
        xAxisLabel = "GDP per Capita in USD"
        setMaxVal(0); //Reset maximum value for scale
        historicalData = {}; //Reset historical data
        loadData(csvPath).then(() => {
            updateChart(document.getElementById('yearSlider').value);
        });
    });

    document.getElementById('buttonCSV2').addEventListener('click', function () {
        var csvPath = './data/cleanedData/gdp.csv';
        xAxisLabel = "GDP in Million USD"
        setMaxVal(0); //Reset maximum value for scale
        historicalData = {}; //Reset historical data
        loadData(csvPath).then(() => {
            updateChart(document.getElementById('yearSlider').value);
        });
    });

    //Event listener for the year slider to update the chart as the user changes the year
    document.getElementById('yearSlider').addEventListener('input', function() {
        updateChart(this.value);
    });

    document.getElementById('buttonCSV1').click(); //Click the button so on window reload the GDP per Capita is the default x-Axis
}

window.onload = init;
