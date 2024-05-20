var highlightedContinent = "";

export function drawChart(svg, dataForPlot, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors) {
    
    var w = 640;
    var h = 480;
    var padding = 36;

    var xScale = d3.scaleLog().base(2)
        .domain([d3.min(isContinentView ? loadedData.filter(d => d.country === "N/A") : loadedData.filter(d => d.country !== "N/A"), d => d.values[xAxisVar]), d3.max(isContinentView ? loadedData.filter(d => d.country === "N/A") : loadedData.filter(d => d.country !== "N/A"), d => d.values[xAxisVar])])
        .range([padding, w - padding]);

    var yScale = d3.scaleLinear()
        .domain([40, 90])
        .range([h - padding, padding]);

    var rScale = d3.scaleLinear()
        .domain([0, d3.max(loadedData.filter(d => d.year === year), d => d.values.population)])
        .range([5, 60]);

    svg.select('.x-axis').call(d3.axisBottom(xScale).ticks(5));
    svg.select('.y-axis').call(d3.axisLeft(yScale).ticks(5));

    var selectedCountries = new Set(dataForPlot.map(d => isContinentView ? d.continent : d.country));

    var filteredData = loadedData.filter(d => d.year <= year 
                                            && (isContinentView ? d.country === "N/A" : d.country !== "N/A")
                                            && selectedCountries.has(isContinentView ? d.continent : d.country)
                                        );

    var countryData = d3.group(filteredData, d => isContinentView ? d.continent : d.country);

    var line = d3.line()
                .curve(d3.curveBasis)
                .x(d => xScale(d.values[xAxisVar]))
                .y(d => yScale(d.values.lifeExpec));

    var lines = svg.selectAll(".history-line")
        .data(Array.from(countryData.values()), d => d[0].continent || d[0].country);

    lines.enter()
        .append("path")
        .attr("class", "history-line")
        .attr("fill", "none")
        .attr("stroke", d => continentColors[d[0].continent])
        .attr("stroke-width", 1)
        .attr("d", line)
        .style("opacity", 0)
        .transition()
        .duration(750)
        .style('opacity', d => (d[0].continent === highlightedContinent) || !highlightedContinent ? 1 : 0.1)

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
                .style('visibility', d.continent === highlightedContinent || !highlightedContinent ? 'visible' : 'invisible')
                .html(`${isContinentView ? `Continent: ${d.continent}` : `Country: ${d.country}`}<br>
                       ${isContinentView ? 'Average' : ''} Life Expectancy: ${Math.round(d.values.lifeExpec * 100) / 100}<br>
                       ${isContinentView ? 'Average' : ''} ${xAxisLabel}: ${Math.round(d.values[xAxisVar] * 100) / 100}
                    `)
                .style('top', (event.pageY - 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
            d3.select(this)
                .style('cursor', 'pointer')
                .attr('stroke-width', 2);
        })
        .on('mouseout', function () {
            d3.select('#tooltip').style('visibility', 'hidden');
            d3.select(this)
                .style('cursor', 'default') 
                .attr('stroke-width', 1);
        })
        .on('click', (d, e) => updateHighlightedContinent(e.continent, svg))
        .transition()
        .duration(750)
        .attr('r', d => rScale(d.values.population))
        .attr('cx', d => xScale(d.values[xAxisVar]))
        .attr('cy', d => yScale(d.values.lifeExpec))
        .style('fill', d => continentColors[d.continent])
        .style('opacity', d => d.continent === highlightedContinent || !highlightedContinent ? 1 : 0.1);;

    update.exit()
        .transition()
        .duration(750)
        .attr('r', 0)
        .remove();

    svg.selectAll('circle').raise();

    addLegend(continentColors, svg);
}

export function updateChart(svg, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors) {
    year = Number(document.getElementById('yearSlider').value);

    let displayData = loadedData.filter(d => d.year === year).sort((a, b) => b.values.population - a.values.population);

    isContinentView ? displayData = displayData.filter(d => d.country === "N/A") : displayData = displayData.filter(d => d.country !== "N/A");

    drawChart(svg, displayData, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors);
}

function addLegend(continentColors, svg){
    var legendContainer = d3.select("#legend-container");
    var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

    var legend = legendContainer.selectAll(".legend-item")
        .data(continents);

    var legendEnter = legend.enter()
        .append("div")
        .attr("class", "legend-item")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin-bottom", "5px")
        .on('click', (_, d) => updateHighlightedContinent(d, svg));

    legendEnter.append("div")
        .attr("class", "legend-color")
        .style("width", "10px")
        .style("height", "10px")
        .style("margin-right", "5px")
        .style("background-color", d => continentColors[d]);

    legendEnter.append("div")
        .attr("class", "legend-text")
        .text(d => d);

    legend.exit().remove();
}

function updateHighlightedContinent(continent, svg){

    if(continent === highlightedContinent) {
        svg.selectAll('.node')
                .transition()
                .duration(750)
                .style('opacity', 1);

        svg.selectAll('.history-line')
                .transition()
                .duration(750)
                .style('opacity', 1);
                
        d3.selectAll('.legend-item')
                .transition()
                .duration(750)
                .style('opacity', 1);

        highlightedContinent = ""
    }

    else{
        svg.selectAll('.node')
                .transition()
                .duration(750)
                .style('opacity', d => d.continent === continent ? 1 : 0.1);

        svg.selectAll('.history-line')
            .transition()
            .duration(750)
            .style('opacity', d => d[0].continent === continent ? 1 : 0.1);

        d3.selectAll('.legend-item')
            .transition()
            .duration(750)
            .style('opacity', d => d === continent ? 1 : 0.3);
        
        highlightedContinent = continent;
    }


}

