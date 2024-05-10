export var lifeData = [];
var _maxVal = 0;

export function getMaxVal() {
    return _maxVal;
}

export function setMaxVal(value) {
    _maxVal = value;
}

export function processData(data) {
    let result = {
        country: data.Country,
        years: {}
    };
    let localMax = 0;
    Object.keys(data).forEach(key => {
        if (key !== 'Country') {
            let value = +data[key];
            result.years[key] = {
                expec: value
            };
            if (value > localMax) localMax = value;
        }
    });

    if (localMax > _maxVal) {
        _maxVal = localMax;
    }

    return result;
}

export function loadLifeData() {
    return d3.dsv(";", "./data/cleanedData/lifeExpectancy_cleaned_csv.csv", processData)
        .then(function(data) {
            lifeData = data;
        });
}

export function loadData(csvPath) {
    return d3.dsv(";", csvPath, processData)
        .then(function(data) {
            let dataMap = new Map(data.map(item => [item.country, item.years]));
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
