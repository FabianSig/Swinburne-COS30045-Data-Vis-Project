// Loads and processes the CSV data, storing it in lifeData
export function loadData(csvPath) {
    return d3.dsv(";", csvPath, function(data) {
        let result = {
            country: data.Country,
            continent: data.Continent,
            year: +data.year,
            values: {
                lifeExpec: +data.lifeExpectancy,
                gdp: +data.gdp,
                gdpPerCapita: +data.gdpPerCapita,
                population: +data.population,
                childMortality: +data.childMortality
            }
        };
        return result;
    });
}
