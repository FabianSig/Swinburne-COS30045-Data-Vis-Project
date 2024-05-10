// This will store the fetched and processed data
export var lifeData = [];
var _maxVal = 0;

export function getMaxVal() {
    return _maxVal;
}

export function setMaxVal(value) {
    _maxVal = value;
}

// Function to process data
export function processData(data) {
    let result = {
        country: data.Country,
        years: {}
    };
    let localMax = 0;
    Object.keys(data).forEach(key => {
        if (key !== 'Country') {
            let gdpValue = +data[key];
            result.years[key] = {
                expec: gdpValue
            };
            if (gdpValue > localMax) localMax = gdpValue;
        }
    });

    if (localMax > _maxVal) {
        _maxVal = localMax;  // Update the global maximum GDP if the local max is higher
    }

    return result;
}

// Function to load life expectancy data
export function loadLifeData() {
    return d3.dsv(";", "./data/cleanedData/lifeExpectancy_cleaned_csv.csv", processData)
        .then(function(data) {
            lifeData = data; // Store life data
        });
}

// Function to load GDP data and merge with life data
export function loadGDPData(csvPath) {
    return d3.dsv(";", csvPath, processData)
        .then(function(gdpData) {
            let gdpMap = new Map(gdpData.map(item => [item.country, item.years]));
            lifeData.forEach(item => {
                if (gdpMap.has(item.country)) {
                    let gdpYears = gdpMap.get(item.country);
                    Object.keys(item.years).forEach(year => {
                        item.years[year].gdp = gdpYears[year] ? +gdpYears[year].expec : null;
                    });
                }
            });
        });
}
