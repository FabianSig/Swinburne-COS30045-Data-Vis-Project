import { loadData } from './dataProcessing.js';
import { drawChart, updateChart } from './chartRendering.js';
import { w, h, padding } from './globalVars.js'

let loadedData = [];
let currentCsvPath = './data/cleanedData/merged_data.csv';
let playInterval;
let svg;
let xAxisVar = "gdpPerCapita";
let xAxisLabel = "GDP per Capita in USD";
let isContinentView = false;
const continentColors = {
    "North America": "#1f77b4",
    "South America": "#ff7f0e",
    "Europe": "#2ca02c",
    "Africa": "#d62728",
    "Asia": "#9467bd",
    "Oceania": "#8c564b"
};

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
    container.innerHTML = '';
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
        checkbox.checked = true;

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

function playYears() {
    const yearSlider = document.getElementById('yearSlider');
    let currentYear = Number(yearSlider.value);
    let lastWholeYear = Math.floor(currentYear);
    yearSlider.disabled = true;     

    playInterval = setInterval(() => {
        if (currentYear < 2021) {
            currentYear += 0.1; // Increment by 0.1 for smoother animation
            yearSlider.value = currentYear.toFixed(1); // Update the slider with fractional value

            const wholeYear = Math.floor(currentYear);
            if (wholeYear !== lastWholeYear) { // Update chart only when whole year changes
                lastWholeYear = wholeYear;
                updateChartBasedOnCountrySelection(svg, loadedData, wholeYear, xAxisVar, xAxisLabel, isContinentView, continentColors);
            }
        } else {
            clearInterval(playInterval);
            yearSlider.disabled = false
        }
    }, 40); // Adjust the interval time as needed
}

function changeData(xAxisLabel, xAxisVar, button){
    updateActiveButton(button);
    updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
}

function init() {
    svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h);

    svg.append('g').attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - padding})`)
        .style("font-size","11px");

    svg.append('g').attr('class', 'y-axis')
        .attr('transform', `translate(${padding},0)`)
        .style("font-size","11px");

    var yearLabel = svg.append("text")
        .attr("class", "year-label")
        .style("text-anchor", "end")
        .attr("x", w - padding)
        .attr("y", padding);

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", padding - 25)
        .attr("x", -h / 2)
        .style("text-anchor", "middle")
        .text("Life Expectancy in years");

    loadData(currentCsvPath).then(data => {
        loadedData = data;
        populateCountryCheckboxes(loadedData, isContinentView); // Populate the checkboxes
        updateChart(svg, loadedData, 1980, xAxisVar, xAxisLabel, isContinentView, continentColors);


        document.getElementById('gdpPerCapita').addEventListener('click', function () {
            xAxisLabel = "GDP per Capita in USD";
            xAxisVar = "gdpPerCapita";
        });

        document.getElementById('gdp').addEventListener('click', function () {
            xAxisLabel = "GDP in Billion USD";
            xAxisVar = "gdp";
            updateActiveButton(this);
            updateChartBasedOnCountrySelection(svg, loadedData, document.getElementById('yearSlider').value, xAxisVar, xAxisLabel, isContinentView, continentColors);
        });

        document.getElementById('childMortality').addEventListener('click', function () {
            xAxisLabel = "Child Mortality out of 100";
            xAxisVar = "childMortality";
            updateActiveButton(this);
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

        document.getElementById('playButton').addEventListener('click', playYears); // Add event listener for play button

    }).catch(err => console.error('Error loading data:', err));
}

function updateActiveButton(button){
    document.querySelectorAll('.x-Axis-button').forEach(element => {
        element.style.backgroundColor = "#ffffff";
    });
    button.style.backgroundColor = "#a4b6ca";
}

window.onload = init;
