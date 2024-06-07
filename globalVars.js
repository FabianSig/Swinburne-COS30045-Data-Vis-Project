/**
 * The width of the chart.
 * @type {number}
 */
export const w = 660;

/**
 * The height of the chart.
 * @type {number}
 */
export const h = 500;

/**
 * The padding for the chart.
 * @type {number}
 */
export const padding = 56;

/**
 * The loaded data for the chart.
 * @type {Array<Object>}
 */
export var loadedData = [];

/**
 * The variable to be used for the x-axis.
 * @type {string}
 */
export var xAxisVar = "gdpPerCapita";

/**
 * The label for the x-axis.
 * @type {string}
 */
export var xAxisLabel = "GDP per Capita in USD";

/**
 * The csv path of the data.
 * @type {string}
 */
export var csvPath = './data/cleanedData/merged_data.csv';

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
