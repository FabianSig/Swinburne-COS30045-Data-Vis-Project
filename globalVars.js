export const w = 660;
export const h = 500;
export const padding = 56;

export var loadedData = [];
export var xAxisVar = "gdpPerCapita";
export var xAxisLabel = "GDP per Capita in USD";
export var trailsVisibility = false;

export function setLoadedData(data){
    loadedData = data;
}

export function setXAxisVar(_xAxisVar){
    xAxisVar = _xAxisVar;
}

export function setXAxisLabel(_xAxisLabel){
    xAxisLabel = _xAxisLabel;
}

export function toggleTrailsVisibility(){
    trailsVisibility = !trailsVisibility
}

export const stroke_colors = {
    "North America": "#051831",
    "South America": "#cc6602",
    "Europe": "#0a3311",
    "Africa": "#3b0f0a",
    "Asia": "#2a1c3a",
    "Oceania": "#231a14"
};

export const continentColors = {
    "North America": "#1f77b4",
    "South America": "#ff7f0e",
    "Europe": "#2ca02c",
    "Africa": "#d62728",
    "Asia": "#9467bd",
    "Oceania": "#8c564b"
};