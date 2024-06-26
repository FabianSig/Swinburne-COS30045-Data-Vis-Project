/**
 * chartRendering.js contains functions for rendering the chart using D3.js.
 * It handles the creation of scales, axes, circles, and lines for the chart, and manages
 * interactions such as tooltips and highlighting.
 *
 * - Imports necessary variables from globalVars.js.
 * - Defines and exports functions for drawing the chart and managing interactions.
 * - Contains helper functions for updating the highlighted continent and adding a legend.
 */

import { w, h, padding, loadedData, xAxisLabel, xAxisVar, stroke_colors, continentColors, trailsVisibility} from './globalVars.js'

// Variable to store the currently highlighted continent
var highlightedContinent = "";

/**
 * Draws the chart with the given data and settings.
 * @param {Object} svg - The SVG element to draw the chart in.
 * @param {Array<Object>} dataForPlot - The data to plot on the chart.
 * @param {number} year - The year for which the data is being plotted.
 * @param {boolean} isContinentView - Indicates whether the view is by continent.
 */
export function drawChart(svg, dataForPlot, year, isContinentView) {

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
        .style('opacity', d => trailsVisibility ? ((d[0].continent === highlightedContinent) || !highlightedContinent ? 1 : 0.1) : 0);

    lines.transition()
        .duration(750)
        .attr("d", line)
        .style('opacity', d => trailsVisibility ? ((d[0].continent === highlightedContinent) || !highlightedContinent ? 1 : 0.1) : 0);

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
        .style('stroke', d => stroke_colors[d.continent])
        .style('stroke-width', 1);


    svg.selectAll("text.x-axis-label").remove();

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${w / 2}, ${h - 20})`)
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

    addLegend(svg);
}

/**
 * Adds a legend to the chart.
 * @param {Object} svg - The SVG element to add the legend to.
 */
function addLegend(svg){
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

/**
 * Updates the highlighted continent in the chart, adjusting the opacity of elements.
 * @param {string} continent - The continent to highlight.
 * @param {Object} svg - The SVG element containing the chart.
 */
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