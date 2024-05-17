import { loadData } from './dataProcessing.js';
import { drawChart, updateChart } from './chartRendering.js';

let loadedData = [];
let currentCsvPath = './data/cleanedData/merged_data.csv';

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function populateCountryDropdown(loadedData, isContinentView) {
    var dropdown = document.getElementById('countryDropdown');
    var countries = isContinentView
        ? [...new Set(loadedData.filter(d => d.country === "N/A").map(d => d.continent))]
        : [...new Set(loadedData.filter(d => d.country !== "N/A").map(d => d.country))];

    countries.sort().forEach(country => {
        var option = document.createElement('option');
        option.value = country;
        option.text = country;
        dropdown.add(option);
    });
}

function updateChartBasedOnCountry(svg, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors, selectedCountry) {
    year = Number(document.getElementById('yearSlider').value);

    let displayData = loadedData.filter(d => d.year === year)
                                .sort((a, b) => b.values.population - a.values.population);

    if (isContinentView) {
        displayData = displayData.filter(d => d.country === "N/A" && (selectedCountry === "all" || d.continent === selectedCountry));
    } else {
        displayData = displayData.filter(d => d.country !== "N/A" && (selectedCountry === "all" || d.country === selectedCountry));
    }

    document.getElementById("yearLabel").innerHTML = year;
    drawChart(svg, displayData, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors);
}

function init() {
    var w = 640;
    var h = 480;
    var padding = 36;

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
        populateCountryDropdown(loadedData, isContinentView);
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
        updateChartBasedOnCountry(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors, document.getElementById('countryDropdown').value);
    }, 100));

    document.getElementById('toggleView').addEventListener('click', function () {
        isContinentView = !isContinentView;
        populateCountryDropdown(loadedData, isContinentView);
        updateChartBasedOnCountry(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors, document.getElementById('countryDropdown').value);
    });

    document.getElementById('countryDropdown').addEventListener('change', function () {
        updateChartBasedOnCountry(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors, this.value);
    });
}

window.onload = init;