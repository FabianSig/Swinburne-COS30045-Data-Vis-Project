function init() {
    var w = 800; 
    var h = 600;
    var padding = 40;
    var svg = d3.select("#chart").append("svg")
                 .attr("width", w)
                 .attr("height", h);
    
    var lifeData = []; // To store life expectancy data
    var maxGDP = 0; 

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
        document.getElementById('yearLabel').textContent = year; // Update the year label dynamically
        drawChart(lifeData, year, label);
    }

    function drawChart(dataForPlot, year, label) {
        svg.selectAll("*").remove(); // Clear previous contents

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

        var xAxis = d3.axisBottom(xScale).ticks(5);
        var yAxis = d3.axisLeft(yScale).ticks(5);

        var tooltip = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);

        svg.append('g')
            .attr('transform', `translate(0,${h - padding})`)
            .call(xAxis);

        svg.append('g')
            .attr('transform', `translate(${padding},0)`)
            .call(yAxis);

        svg.selectAll('circle')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.gdp))
            .attr('cy', d => yScale(d.lifeExpec))
            .attr('r', 5)
            .style('fill', 'blue')
            .on('mouseover', function(event, d) {
                tooltip.transition()
                        .duration(200) // Time in ms to transition in
                        .style('opacity', .9);
                tooltip.html(d.country + "<br/> GDP: " + d.gdp + "<br/> Life Expectancy: " + d.lifeExpec)
                        .style('left', (event.pageX + 5) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function(d) {
                tooltip.transition()
                        .duration(500) // Time in ms to transition out
                        .style('opacity', 0);
            });

            svg.append("text")             
                .attr("transform", `translate(${w / 2}, ${h - 10})`)
                .style("text-anchor", "middle")
                .text(label);

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("x",0 - (h / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Life Expectancy (years)"); 

            svg.append("text")             
                .attr("transform", `translate(${w / 2}, ${h / 2})`)
                .style("text-anchor", "middle")
                .text(year);
    }

    loadLifeData();  // Initial load of life expectancy data
    document.getElementById('csvSelect').addEventListener('change', loadData);
    document.getElementById('yearSlider').addEventListener('input', function() {
        updateChart(this.value);
    });
}

window.onload = init;
