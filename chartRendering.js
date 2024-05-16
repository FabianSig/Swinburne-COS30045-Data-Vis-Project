import {loadData} from './dataProcessing.js';


let loadedData = []; // Object to store loaded data (changed to array)
let currentCsvPath = './data/cleanedData/merged_data.csv'; // Default CSV path

// Entry point for the script, executed when the document has loaded
function init() {
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
    var yAxisLabel = "Life Expectancy in years";

    var svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h);

    var historicalData = {};
    var selectedCountry = null;

    function updateHistoricalData(displayData) {
        displayData.forEach(d => {
            if (!historicalData[d.country]) {
                historicalData[d.country] = [];
            }
            historicalData[d.country].push({ x: d.values.gdp, y: d.values.lifeExpec });
        });
    }

    svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${h - padding})`);
    svg.append('g').attr('class', 'y-axis').attr('transform', `translate(${padding},0)`);

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

    function updateChart(xAxisVar, year) {
        year = Number(year); // Ensure the year is a number
        let displayData = loadedData.filter(d => d.year === year);
        yearLabel.text(year);
        document.getElementById("yearLabel").innerHTML = year;
        drawChart(displayData, xAxisVar, year);
    }

    function drawChart(dataForPlot, xAxisVar, year) {
        var xScale = d3.scaleLinear()
            .domain([0, 50000])
            .range([padding, w - padding]);
        var yScale = d3.scaleLinear()
            .domain([40, 90])
            .range([h - padding, padding]);

        svg.select('.x-axis').call(d3.axisBottom(xScale).ticks(5));
        svg.select('.y-axis').call(d3.axisLeft(yScale).ticks(5));

        var update = svg.selectAll('circle')
            .data(dataForPlot, d => d.country);

        var enter = update.enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 5)
            .style('fill', d => continentColors[d.continent]);

        svg.selectAll("text.x-axis-label").remove();

        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", `translate(${w / 2}, ${h - 5})`)
            .style("text-anchor", "middle")
            .text(`${xAxisLabel} (${year})`);

        enter.merge(update)
            .on('click', function (event, d) {
                selectedCountry = selectedCountry === d.country ? null : d.country;
                drawChart(dataForPlot, xAxisVar, year);
            })
            .on('mouseover', function (event, d) {
                d3.select('#tooltip')
                    .style('visibility', 'visible')
                    .html(`Country: ${d.country}<br>
                           Life Expectancy: ${Math.round(d.values.lifeExpec * 100) / 100}<br>
                           ${xAxisLabel}: ${Math.round(d.values[xAxisVar] * 100) / 100}
                        `)
                    .style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function () {
                d3.select('#tooltip').style('visibility', 'hidden');
            })
            .transition()
            .duration(750)
            .attr('cx', d => xScale(parseFloat(d.values[xAxisVar])))
            .attr('cy', d => yScale(parseFloat(d.values.lifeExpec)))
            .attr('fill', d => continentColors[d.continent]);

        update.exit()
            .transition()
            .duration(750)
            .attr('r', 0)
            .remove();
    }

    loadData(currentCsvPath).then(data => {
        loadedData = data;
        updateChart("gdpPerCapita", document.getElementById('yearSlider').value);
    }).catch(err => console.error('Error loading data:', err));

    document.getElementById('gdpPerCapita').addEventListener('click', function () {
        xAxisLabel = "GDP per Capita in USD";
        updateChart("gdpPerCapita", document.getElementById('yearSlider').value);
    });

    document.getElementById('gdp').addEventListener('click', function () {
        xAxisLabel = "GDP in Million USD";
        updateChart("gdp", document.getElementById('yearSlider').value);
    });

    document.getElementById('yearSlider').addEventListener('input', function () {
        updateChart("gdpPerCapita", this.value);
    });
}

window.onload = init;