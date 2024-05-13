//Exported array to store life expectancy data from various countries
export var lifeData = [];

//Private variable to store the maximum value found in the dataset
var _maxVal = 0;

//Exported function to get the current maximum value stored
export function getMaxVal() {
    return _maxVal;
}

//Exported function to set a new maximum value
export function setMaxVal(value) {
    _maxVal = value;
}


//Loads life expectancy data from a specified CSV file, processes each row, and stores it in lifeData
export function loadLifeData() {
    return d3.dsv(";", "./data/cleanedData/lifeExpectancy.csv", processData)
        .then(function(data) {
            lifeData = data; //Update the lifeData array with the processed data
        });
}

export var continentMapping = {};

// Modified processData function to also parse and store continent data
export function processData(data) {
    // Initialize the structure for a country's data
    let result = {
        country: data.Country,
        continent: data.Continent, // Assuming 'Continent' is the column name in your CSV
        years: {}
    };
    let localMax = 0; // Temporary variable to find the maximum value in the current dataset

    // Loop over all properties in the data object
    Object.keys(data).forEach(key => {
        if (key !== 'Country' && key !== 'Continent') { // Exclude Country and Continent from the year data
            let value = +data[key]; // Convert the data value to a number
            result.years[key] = { expec: value }; // Assign the value to the corresponding year
            if (value > localMax) localMax = value; // Update local maximum if current value is higher
        }
    });

    // Update global maximum value if necessary
    if (localMax > _maxVal) {
        _maxVal = localMax;
    }
    return result;
}

// Modified loadData to build continentMapping dynamically
export function loadData(csvPath) {
    return d3.dsv(";", csvPath, processData)
        .then(function(data) {
            let dataMap = new Map(data.map(item => [item.country, item.years]));
            data.forEach(item => {
                continentMapping[item.country] = item.continent; // Build the continent mapping dynamically
            });

            // Merge the loaded data with existing lifeData
            lifeData.forEach(item => {
                if (dataMap.has(item.country)) {
                    let dataByYears = dataMap.get(item.country);
                    Object.keys(item.years).forEach(year => {
                        item.years[year].gdp = dataByYears[year] ? +dataByYears[year].expec : null;
                    });
                }
            });
        });
}
