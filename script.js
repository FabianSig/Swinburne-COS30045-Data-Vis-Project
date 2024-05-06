function init() {
    var w = 800; 
    var h = 600;
    var padding = 40;
    var svg = d3.select("#chart").append("svg") // Initialize the SVG element here for global access
                 .attr("width", w)
                 .attr("height", h);

    // Function to process CSV data
    function processData(data) {
        let result = {
            country: data.Country,
            years: {}
        };
        Object.keys(data).forEach(key => {
            if (key !== 'Country') {
                result.years[key] = {
                    expec: +data[key] // Store life expectancy
                };
            }
        });
        return result;
    }

    // Load datasets
    Promise.all([
        d3.dsv(";", "./data/cleanedData/lifeExpectancy_cleaned_csv.csv", processData),
        d3.dsv(";", "./data/cleanedData/gdp_cleaned_csv.csv", processData)
    ]).then(function([lifeData, gdpData]) {
        let gdpMap = new Map(gdpData.map(item => [item.country, item.years]));
        lifeData.forEach(item => {
            if (gdpMap.has(item.country)) {
                let gdpYears = gdpMap.get(item.country);
                Object.keys(item.years).forEach(year => {
                    item.years[year].gdp = gdpYears[year] ? +gdpYears[year].expec : null;
                });
            }
        });

        var slider = document.getElementById('yearSlider');
        var label = document.getElementById('yearLabel');

        function updateChart(year) {
            label.innerHTML = `Year: ${year}`; // Update the label
            svg.selectAll("*").remove(); // Clear the SVG

            let dataForPlot = lifeData.map(country => ({
                country: country.country,
                gdp: country.years[year] ? country.years[year].gdp : null,
                lifeExpec: country.years[year] ? country.years[year].expec : null
            })).filter(item => item.gdp && item.lifeExpec);

            drawChart(dataForPlot, year);
        }

        function drawChart(dataForPlot, year) {
            var xScale = d3.scaleLinear()
                .domain([0, d3.max(dataForPlot, d => d.gdp)])
                .range([padding, w - padding]);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(dataForPlot, d => d.lifeExpec)])
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
                .data(dataForPlot)
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

            // Optional: Add tooltips or additional SVG elements here

            svg.append("text")             
                .attr("transform", `translate(${w / 2}, ${h - 10})`)
                .style("text-anchor", "middle")
                .text("GDP in Billion USD (2021)");

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

        slider.addEventListener('input', () => updateChart(slider.value));
        updateChart(slider.value); // Draw the initial chart
    });
}

window.onload = init;