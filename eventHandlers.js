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

function populateCountryCheckboxes(loadedData, isContinentView) {
    const container = document.getElementById('countryCheckboxes');
    if (!container) return;
    container.innerHTML = ''; // Clear any existing checkboxes
    const countries = isContinentView
        ? [...new Set(loadedData.filter(d => d.country === "N/A").map(d => d.continent))]
        : [...new Set(loadedData.filter(d => d.country !== "N/A").map(d => d.country))];

    countries.sort().forEach(country => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('country-checkbox-wrapper');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = country;
        checkbox.id = `checkbox-${country}`;
        checkbox.classList.add('country-checkbox');
        checkbox.checked = true; // Check the checkbox by default

        const label = document.createElement('label');
        label.htmlFor = `checkbox-${country}`;
        label.textContent = country;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
}


function getSelectedCountries() {
    const checkboxes = document.querySelectorAll('.country-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateChartBasedOnCountrySelection(svg, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors) {
    year = Number(document.getElementById('yearSlider').value);
    var selectedCountries = getSelectedCountries();

    let displayData = loadedData.filter(d => d.year === year)
                                .sort((a, b) => b.values.population - a.values.population);

    if (selectedCountries.length === 0) {
        displayData = [];
    } else if (isContinentView) {
        displayData = displayData.filter(d => d.country === "N/A" && selectedCountries.includes(d.continent));
    } else {
        displayData = displayData.filter(d => d.country !== "N/A" && selectedCountries.includes(d.country));
    }

    drawChart(svg, displayData, loadedData, year, xAxisVar, xAxisLabel, isContinentView, continentColors);
}

function init() {
    const w = 640;
    const h = 480;
    const padding = 36;

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
        populateCountryCheckboxes(loadedData, isContinentView); // Populate the checkboxes
        updateChart(svg, loadedData, 1980, xAxisVar, xAxisLabel, isContinentView, continentColors);

        document.getElementById('gdpPerCapita').addEventListener('click', function () {
            xAxisLabel = "GDP per Capita in USD";
            xAxisVar = "gdpPerCapita";
            updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
        });

        document.getElementById('gdp').addEventListener('click', function () {
            xAxisLabel = "GDP in Billion USD";
            xAxisVar = "gdp";
            updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
        });

        document.getElementById('yearSlider').addEventListener('input', debounce(function () {
            updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
        }, 100));

        document.getElementById('toggleView').addEventListener('click', function () {
            isContinentView = !isContinentView;
            populateCountryCheckboxes(loadedData, isContinentView); // Repopulate the checkboxes based on the view
            updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
        });

        document.getElementById('countryCheckboxes').addEventListener('change', function () {
            updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
        });

        document.getElementById('checkAll').addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.country-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
        });
    }).catch(err => console.error('Error loading data:', err));
}

window.onload = init;