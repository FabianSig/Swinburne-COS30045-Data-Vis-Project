import { lifeData, getMaxVal, setMaxVal, loadLifeData, loadData } from './dataProcessing.js';

function init() {
    var w = 800;
    var h = 600;
    var padding = 40;
    var svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h);
    var historicalData = {};
    var selectedCountry = null;


    function updateHistoricalData(filteredData) {
        filteredData.forEach(d => {
            if (!historicalData[d.country]) {
                historicalData[d.country] = [];
            }
            historicalData[d.country].push({ x: d.value, y: d.lifeExpec });
        });
    }

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - padding})`);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${padding},0)`);

    var yearLabel = svg.append("text")
        .attr("class", "year-label")
        .style("text-anchor", "end")
        .attr("x", w - padding)
        .attr("y", padding);

    function updateChart(year) {
        yearLabel.text(year);
        drawChart(lifeData, year);
    }

    function drawChart(dataForPlot, year) {
        let filteredData = dataForPlot.map(country => ({
            country: country.country,
            gdp: country.years[year] ? country.years[year].gdp : null,
            lifeExpec: country.years[year] ? country.years[year].expec : null
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

        // Lines for historical data
        var line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

        var countries = svg.selectAll('.line')
            .data(Object.keys(historicalData), d => d);

        countries.enter()
            .append('path')
            .attr('class', 'line')
            .merge(countries)
            .attr('d', d => line(historicalData[d]))
            .attr('fill', 'none')
            .attr('stroke', d => d === selectedCountry ? 'red' : 'gray')
            .attr('stroke-width', d => d === selectedCountry ? 2.5 : 1.5)
            .style('opacity', d => d === selectedCountry ? 1 : 0.1);

        countries.exit().remove();

        // Circles for current year data
        var update = svg.selectAll('circle')
            .data(filteredData, d => d.country);

        var enter = update.enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 5)
            .style('fill', 'blue');

        enter.merge(update)
            .on('click', function(event, d) {
                selectedCountry = selectedCountry === d.country ? null : d.country; // Toggle selection
                drawChart(dataForPlot, year); // Redraw chart to update styles
            })
            .on('mouseover', function(event, d) {
                d3.select('#tooltip')
                    .style('visibility', 'visible')
                    .html(`Country: ${d.country}<br>Life Expectancy: ${d.lifeExpec}<br>GDP: ${d.gdp}`)
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
            .attr('fill', d => d.country === selectedCountry ? 'red' : 'blue')
            .style('opacity', d => d.country === selectedCountry || !selectedCountry ? 1 : 0.1);

        update.exit().remove();
    }



    loadLifeData().then(() => {
        updateChart(document.getElementById('yearSlider').value);
    });

    document.getElementById('buttonCSV1').addEventListener('click', function () {
        var csvPath = './data/cleanedData/gdpPerCapita_csv.csv';
        setMaxVal(0); //Reset maxVal for scale
        historicalData = {}; //Reset traces
        loadData(csvPath).then(() => {
            updateChart(document.getElementById('yearSlider').value);
        });
    });

    document.getElementById('buttonCSV2').addEventListener('click', function () {
        var csvPath = './data/cleanedData/gdp_cleaned_csv.csv';
        setMaxVal(0); //Reset maxVal for scale
        historicalData = {}; //Reset traces
        loadData(csvPath).then(() => {
            updateChart(document.getElementById('yearSlider').value);
        });
    });

    document.getElementById('yearSlider').addEventListener('input', function() {
        updateChart(this.value);
    });
}

window.onload = init;
