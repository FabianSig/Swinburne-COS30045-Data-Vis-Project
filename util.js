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
                childMortality: +data.childMortality,
                humanRightsIndex: +data.humanRightsIndex
            }
        };
        return result;
    });
}


export function populateCountryCheckboxes(loadedData, isContinentView) {
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

export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
