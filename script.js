function init() {
    var w = 800;
    var h = 600;
    var padding = 40;

    var svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h);

    var lifeData = []; // To store life expectancy data
    var maxGDP = 0;

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - padding})`);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${padding},0)`);

    // Add a text label for the year in the top right corner
    var yearLabel = svg.append("text")
        .attr("class", "year-label")
        .style("text-anchor", "end")
        .attr("x", w - padding)
        .attr("y", padding);  // Positioned at the top right

    function processData(data) {
        let result = {
            country: data.Country,
            years: {}
        };
        let localMax = 0;
        Object.keys(data).forEach(key => {
            if (key !== 'Country') {
                let gdpValue = +data[key];
                result.years[key] = {
                    expec: gdpValue
                };
                if (gdpValue > localMax) localMax = gdpValue;
            }
        });

        if (localMax > maxGDP) {
            maxGDP = localMax;  // Update the global maximum GDP if the local max is higher
        }

        return result;
    }

    function loadLifeData() {
        d3.dsv(";", "./data/cleanedData/lifeExpectancy_cleaned_csv.csv", processData)
            .then(function(data) {
                lifeData = data; // Store life data
                updateChart(document.getElementById('yearSlider').value);
            });
    }

    function loadData() {
        maxGDP = 0;
        var csvSelect = document.getElementById('csvSelect');
        var label = csvSelect.options[csvSelect.selectedIndex].text;

        d3.dsv(";", `./data/cleanedData/${csvSelect.value}`, processData)
            .then(function(gdpData) {
                let gdpMap = new Map(gdpData.map(item => [item.country, item.years]));
                lifeData.forEach(item => {
                    if (gdpMap.has(item.country)) {
                        let gdpYears = gdpMap.get(item.country);
                        Object.keys(item.years).forEach(year => {
                            item.years[year].gdp = gdpYears[year] ? +gdpYears[year].expec : null;
                        });
                    }
                });
                updateChart(document.getElementById('yearSlider').value, label);
            });
    }

    function updateChart(year, label) {
        yearLabel.text(year); // Correctly update the year in the label
        drawChart(lifeData, year, label);
    }

    function drawChart(dataForPlot, year, label) {
        let filteredData = dataForPlot.map(country => ({
            country: country.country,
            gdp: country.years[year] ? country.years[year].gdp : null,
            lifeExpec: country.years[year] ? country.years[year].expec : null
        })).filter(item => item.gdp && item.lifeExpec);

        var xScale = d3.scaleLinear()
            .domain([0, maxGDP])
            .range([padding, w - padding]);

        var yScale = d3.scaleLinear()
            .domain([60, 90])
            .range([h - padding, padding]);

        svg.select('.x-axis').call(d3.axisBottom(xScale).ticks(5));
        svg.select('.y-axis').call(d3.axisLeft(yScale).ticks(5));

        var circles = svg.selectAll('circle')
            .data(filteredData, d => d.country);

        circles.enter().append('circle')
            .attr('r', 5)
            .style('fill', 'blue')
            .merge(circles)
            .transition()
            .duration(750)
            .attr('cx', d => xScale(d.gdp))
            .attr('cy', d => yScale(d.lifeExpec));

        circles.exit()
            .transition()
            .duration(750)
            .attr('r', 0)
            .remove();
    }

    loadLifeData();
    document.getElementById('csvSelect').addEventListener('change', loadData);
    document.getElementById('yearSlider').addEventListener('input', function() {
        updateChart(this.value);
    });
}

window.onload = init;
