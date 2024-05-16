import { loadData } from './dataProcessing.js';
import { drawChart, updateChart} from './chartRendering.js';

let loadedData = [];
let currentCsvPath = './data/cleanedData/merged_data.csv';

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

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

    var xAxisLabel = "GDP per Capita in USD";
    var yAxisLabel = "Life Expectancy in years";
    var xAxisVar = "gdpPerCapita";
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

    loadData(currentCsvPath).then(data => {
        loadedData = data;
        updateChart(svg, loadedData, 1980, xAxisVar, xAxisLabel, isContinentView, continentColors);
    }).catch(err => console.error('Error loading data:', err));

    document.getElementById('gdpPerCapita').addEventListener('click', function () {
        xAxisLabel = "GDP per Capita in USD";
        xAxisVar = "gdpPerCapita";
        updateChart(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
    });

    document.getElementById('gdp').addEventListener('click', function () {
        xAxisLabel = "GDP in Billion USD";
        xAxisVar = "gdp";
        updateChart(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
    });

    document.getElementById('yearSlider').addEventListener('input', debounce(function () {
        updateChart(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
    }, 100));

    document.getElementById('toggleView').addEventListener('click', function () {
        isContinentView = !isContinentView;
        updateChart(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
    });
}

window.onload = init;
