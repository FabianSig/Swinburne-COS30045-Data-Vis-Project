export function drawChart(svg, dataForPlot, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors) {
    var w = 640;
    var h = 480;
    var padding = 36;

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(isContinentView ? loadedData.filter(d => d.country === "N/A") : loadedData.filter(d => d.country !== "N/A"), d => d.values[xAxisVar])])
        .range([padding, w - padding]);

    var yScale = d3.scaleLinear()
        .domain([40, 90])
        .range([h - padding, padding]);

    var rScale = d3.scaleLinear()
        .domain([0, d3.max(dataForPlot, d => d.values.population)])
        .range([5, 20]);

    svg.select('.x-axis').call(d3.axisBottom(xScale).ticks(5));
    svg.select('.y-axis').call(d3.axisLeft(yScale).ticks(5));

    var filteredData = loadedData.filter(d => d.year <= year && (isContinentView ? d.country === "N/A" : d.country !== "N/A"));

    var countryData = d3.group(filteredData, d => isContinentView ? d.continent : d.country);

    var line = d3.line()
                .x(d => xScale(d.values[xAxisVar]))
                .y(d => yScale(d.values.lifeExpec));

    var lines = svg.selectAll(".history-line")
        .data(Array.from(countryData.values()), d => d[0].continent || d[0].country);

    lines.enter()
        .append("path")
        .attr("class", "history-line")
        .attr("fill", "none")
        .attr("stroke", d => continentColors[d[0].continent])
        .attr("stroke-width", 2)
        .attr("d", line)
        .style("opacity", 0)
        .transition()
        .duration(750)
        .style("opacity", 1);

    lines.transition()
        .duration(750)
        .attr("d", line);

    lines.exit()
        .transition()
        .duration(750)
        .style("opacity", 0)
        .remove();

    var update = svg.selectAll('circle')
        .data(dataForPlot, d => isContinentView ? d.continent : d.country);

    var enter = update.enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', 0)
        .style('fill', d => continentColors[d.continent])
        .style('stroke', 'black')
        .style('stroke-width', 1);

    svg.selectAll("text.x-axis-label").remove();

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${w / 2}, ${h - 5})`)
        .style("text-anchor", "middle")
        .text(`${xAxisLabel} (${year})`);

    enter.merge(update)
        .on('mouseover', function (event, d) {
            d3.select('#tooltip')
                .style('visibility', 'visible')
                .html(`${isContinentView ? `Continent: ${d.continent}` : `Country: ${d.country}`}<br>
                       ${isContinentView ? 'Average' : ''} Life Expectancy: ${Math.round(d.values.lifeExpec * 100) / 100}<br>
                       ${isContinentView ? 'Average' : ''} ${xAxisLabel}: ${Math.round(d.values[xAxisVar] * 100) / 100}
                    `)
                .style('top', (event.pageY - 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function () {
            d3.select('#tooltip').style('visibility', 'hidden');
        })
        .transition()
        .duration(750)
        .attr('r', d => rScale(d.values.population))
        .attr('cx', d => xScale(d.values[xAxisVar]))
        .attr('cy', d => yScale(d.values.lifeExpec))
        .style('fill', d => continentColors[d.continent]);

    update.exit()
        .transition()
        .duration(750)
        .attr('r', 0)
        .remove();

    svg.selectAll('circle').raise();
}

export function updateChart(svg, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors) {

    year = Number(document.getElementById('yearSlider').value);

    let displayData = loadedData.filter(d => d.year === year).sort((a, b) => b.values.population - a.values.population);

    isContinentView ? displayData = displayData.filter(d => d.country === "N/A") : displayData = displayData.filter(d => d.country !== "N/A");

    document.getElementById("yearLabel").innerHTML = year;
    drawChart(svg, displayData, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors);
}
