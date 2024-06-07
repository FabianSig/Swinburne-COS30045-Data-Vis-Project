/**
 * main.js initializes and manages the main interactions and rendering logic for the chart.
 *
 * - Imports utility functions and variables from other modules.
 * - Sets up the SVG canvas and axes.
 * - Loads data and populates checkboxes for country selection.
 * - Handles updates to the chart based on user interactions such as selecting countries, changing x-axis variables, and playing through years.
 */

import { loadData, populateCountryCheckboxes, debounce} from './util.js';
import { drawChart} from './chartRendering.js';
import {w, h, padding, loadedData, csvPath, toggleTrailsVisibility, setLoadedData, setXAxisLabel, setXAxisVar} from './globalVars.js'

let playInterval;
let svg;
let isContinentView = false;

/**
 * Updates the chart based on the selected countries and the current year.
 */
function updateChartBasedOnCountrySelection() {
    let year = Number(document.getElementById('yearSlider').value);
    let selectedCountries = Array.from(document.querySelectorAll('.country-checkbox:checked')).map(cb => cb.value);

    let displayData = loadedData.filter(d => d.year === year)
                                .sort((a, b) => b.values.population - a.values.population);

    if (selectedCountries.length === 0) {
        displayData = [];
    } else if (isContinentView) {
        displayData = displayData.filter(d => d.country === "N/A" && selectedCountries.includes(d.continent));
    } else {
        displayData = displayData.filter(d => d.country !== "N/A" && selectedCountries.includes(d.country));
    }

    drawChart(svg, displayData, year, isContinentView);
}

/**
 * Animates the chart by incrementing through the years.
 */
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
                updateChartBasedOnCountrySelection(svg, wholeYear, xAxisVar, xAxisLabel, isContinentView);
            }
        } else {
            clearInterval(playInterval);
            yearSlider.disabled = false
        }
    }, 40);
}

/**
 * Changes the data displayed on the chart based on the button event.
 * @param {string} newXAxisLabel - The new label for the x-axis.
 * @param {string} newXAxisVar - The new variable for the x-axis.
 * @param {HTMLElement} button - The button element that triggered the event.
 */
function changeDataOnButtonEvent(newXAxisLabel, newXAxisVar, button) {

    setXAxisLabel(newXAxisLabel);
    setXAxisVar(newXAxisVar);

    //Change the colors of the buttons so the new one appears as active
    document.querySelectorAll('.x-Axis-button').forEach(element => {
        element.style.backgroundColor = "#ffffff";
    });
    button.style.backgroundColor = "#a4b6ca";

    updateChartBasedOnCountrySelection();
}

/**
 * Initializes the SVG canvas, loads data, and sets up event listeners for interactions.
 */
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

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", padding - 25)
        .attr("x", -h / 2)
        .style("text-anchor", "middle")
        .text("Life Expectancy in years");

    loadData(csvPath).then(data => {

        setLoadedData(data);
        populateCountryCheckboxes(loadedData, isContinentView); // Populate the checkboxes
        updateChartBasedOnCountrySelection();

        document.getElementById('yearSlider').addEventListener('input', debounce(function () {
          updateChartBasedOnCountrySelection();
        }, 100));

        document.getElementById('toggleView').addEventListener('click', function () {
            isContinentView = !isContinentView;
            populateCountryCheckboxes(loadedData, isContinentView); // Repopulate the checkboxes based on the view
          updateChartBasedOnCountrySelection();
        });

        document.getElementById('toggleTrails').addEventListener('click', function () {
            toggleTrailsVisibility();
          updateChartBasedOnCountrySelection();
        });

        document.getElementById('countryCheckboxes').addEventListener('change', function () {
          updateChartBasedOnCountrySelection();
        });

        document.getElementById('checkAll').addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.country-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
          updateChartBasedOnCountrySelection();
        });

        document.getElementById('playButton').addEventListener('click', playYears); // Add event listener for play button

    }).catch(err => console.error('Error loading data:', err));
}

window.changeData = changeDataOnButtonEvent;
window.onload = init;
