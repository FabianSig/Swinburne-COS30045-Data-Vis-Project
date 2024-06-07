/**
 * util.js contains constants, variables, and functions related to the
 * configuration and state management of the chart.
 *
 * - Constants for chart dimensions and padding.
 * - Variables to hold loaded data, x-axis settings, and trail visibility state.
 * - Functions to update the state of these variables.
 * - Color mappings for different continents.
 */

// Constants for chart dimensions and padding
export const w = 660;
export const h = 500;
export const padding = 56;

// Variables for chart data and settings
export var loadedData = [];
export var xAxisVar = "gdpPerCapita";
export var xAxisLabel = "GDP per Capita in USD";
export var csvPath = 'data.csv';

/**
 * The visibility of the trails in the chart.
 * @type {boolean}
 */
export var trailsVisibility = false;

/**
 * Sets the loaded data for the chart.
 * @param {Array<Object>} data - The data to set.
 */
export function setLoadedData(data){
    loadedData = data;
}

/**
 * Sets the variable to be used for the x-axis.
 * @param {string} _xAxisVar - The variable to set.
 */
export function setXAxisVar(_xAxisVar){
    xAxisVar = _xAxisVar;
}

/**
 * Sets the label for the x-axis.
 * @param {string} _xAxisLabel - The label to set.
 */
export function setXAxisLabel(_xAxisLabel){
    xAxisLabel = _xAxisLabel;
}

/**
 * Toggles the visibility of the trails in the chart.
 */
export function toggleTrailsVisibility(){
    trailsVisibility = !trailsVisibility;
}

/**
 * The stroke colors for different continents.
 * @type {Object<string, string>}
 */
export const stroke_colors = {
    "North America": "#051831",
    "South America": "#cc6602",
    "Europe": "#0a3311",
    "Africa": "#3b0f0a",
    "Asia": "#2a1c3a",
    "Oceania": "#231a14"
};

/**
 * The fill colors for different continents.
 * @type {Object<string, string>}
 */
export const continentColors = {
    "North America": "#1f77b4",
    "South America": "#ff7f0e",
    "Europe": "#2ca02c",
    "Africa": "#d62728",
    "Asia": "#9467bd",
    "Oceania": "#8c564b"
};
