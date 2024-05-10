import { lifeData, getMaxVal, setMaxVal, loadLifeData, loadData } from './dataProcessing.js';
function init() {
    var w = 800;
    var h = 600;
    var padding = 40;
    var svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h);

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
        console.log(dataForPlot)
        let filteredData = dataForPlot.map(country => ({
            country: country.country,
            gdp: country.years[year] ? country.years[year].gdp : null,
            lifeExpec: country.years[year] ? country.years[year].expec : null
            })).filter(item => item.gdp && item.lifeExpec);
        console.log("Filtered Data: ", filteredData);

        var xScale = d3.scaleLinear()
            .domain([0, getMaxVal()])
            .range([padding, w - padding]);

        var yScale = d3.scaleLinear()
            .domain([40, 90])
            .range([h - padding, padding]);

        svg.select('.x-axis').call(d3.axisBottom(xScale).ticks(5));
        svg.select('.y-axis').call(d3.axisLeft(yScale).ticks(5));

        var update = svg.selectAll('circle')
            .data(filteredData, d => d.country);

        var enter = update.enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 5)
            .style('fill', 'blue')
            .on('mouseover', function(event, d) {
                d3.select('#tooltip')
                    .style('visibility', 'visible')
                    .html(`Country: ${d.country}<br>Life Expectancy: ${d.lifeExpec}`)
                    .style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select('#tooltip').style('visibility', 'hidden');
            });

        enter.merge(update)
            .transition()
            .duration(750)
            .attr('cx', d => xScale(d.gdp))
            .attr('cy', d => yScale(d.lifeExpec));

        update.exit().remove();
    }

    loadLifeData().then(() => {
        updateChart(document.getElementById('yearSlider').value);
    });

    document.getElementById('csvSelect').addEventListener('change', function () {
        console.log(this.value);
        var csvPath = `./data/cleanedData/${this.value}`;
        setMaxVal(0); // Reset maxGDP
        loadData(csvPath).then(() => {
            updateChart(document.getElementById('yearSlider').value, this.options[this.selectedIndex].text);
        });
    });

    document.getElementById('yearSlider').addEventListener('input', function() {
        updateChart(this.value);
    });
}

window.onload = init;
