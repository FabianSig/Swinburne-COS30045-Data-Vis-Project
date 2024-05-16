import { loadData } from './dataProcessing.js';

let loadedData = []; // Object to store loaded data (changed to array)
let currentCsvPath = './data/cleanedData/merged_data.csv'; // Default CSV path

// Debounce function to limit the rate at which updateChart is called
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

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

    var xAxisLabel = "GDP per Capita in USD"; //default value
    var yAxisLabel = "Life Expectancy in years";
    var xAxisVar = "gdpPerCapita"
    var isContinentView = false;

    var svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h);

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

    function updateChart(year) {
        
        year = Number(document.getElementById('yearSlider').value);

        //filtering for the year that is getting plotted and sort so countries with bigger population are on the canvas behind smaller ones
        let displayData = loadedData.filter(d => d.year === year).sort((a, b) => b.values.population - a.values.population);
        
        if(isContinentView){
            displayData = displayData.filter(d => d.country === "N/A")
        }
        else{
             displayData = displayData.filter(d => d.country !== "N/A")
        }

        yearLabel.text(year);
        document.getElementById("yearLabel").innerHTML = year;
        drawChart(displayData, year);
    }

    function drawChart(dataForPlot, year) {

        var xScale = d3.scaleLinear()
            .domain([0, d3.max(loadedData, d => d.values[xAxisVar])])
            .range([padding, w - padding]);
        var yScale = d3.scaleLinear()
            .domain([40, 90])
            .range([h - padding, padding]);
        var rScale = d3.scaleLinear()
            .domain([0, d3.max(dataForPlot, d => d.values.population)])
            .range([5, 20]);
    
        svg.select('.x-axis').call(d3.axisBottom(xScale).ticks(5));
        svg.select('.y-axis').call(d3.axisLeft(yScale).ticks(5));
    
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
            .attr('r', d => rScale(d.values.population))
            .attr('cx', d => xScale(d.values[xAxisVar]))
            .attr('cy', d => yScale(d.values.lifeExpec))
            .style('fill', d => continentColors[d.continent]);
    
        update.exit()
            .transition()
            .duration(750)
            .attr('r', 0)
            .remove();
    }
    

    loadData(currentCsvPath).then(data => {
        loadedData = data;
        updateChart();
    }).catch(err => console.error('Error loading data:', err));

    document.getElementById('gdpPerCapita').addEventListener('click', function () {
        xAxisLabel = "GDP per Capita in USD";
        xAxisVar = "gdpPerCapita";
        updateChart();
    });

    document.getElementById('gdp').addEventListener('click', function () {
        xAxisLabel = "GDP in Billion USD";
        xAxisVar = "gdp"
        updateChart();
    });

    document.getElementById('toggleView').addEventListener('click', function () {
        isContinentView = !isContinentView;
        updateChart();
    });

    document.getElementById('yearSlider').addEventListener('input', debounce(updateChart, 1));
}

window.onload = init;
