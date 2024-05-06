function init() {
    
        /*
        This is the "starting" Code for our data vis Project
        Just provisionally
        */
       
        var w = 500; 
        var h = 300;

        var padding = 40;
        
        d3.dsv(";", "./data/cleanedData/lifeExpectancy_cleaned_csv.csv", function(data) {
            // Log each row to see the structure
            //console.log(data);
        
            // Create an object to hold the country and life expectancy per year
            var result = {
                country: data.Country, // Local Government Area
                lifeExpectancy: {}
            };
        
            // Iterate over all properties in the data object
            Object.keys(data).forEach(key => {
                // Check if the property is a year and not the country field
                if (key !== 'Country') {
                    // Store the year and its corresponding life expectancy
                    result.lifeExpectancy[key] = +data[key];
                }
            });
        
            return result;
        }).then(data => {
            console.log("Processed data:", data);  // Logs all processed data including years
        
            // You can still set the color domain or do other processing here
            // color.domain([d3.min(data, d => d.unemployed), d3.max(data, d => d.unemployed)]);
            // dataset = data;
            // chart(dataset);
        });
        

        var circleRadius = 3

        function chart(dataset){
            
            var xScale = d3.scaleLinear()
                            .domain([d3.min(dataset, d => d[0]), d3.max(dataset, d => d[0])])
                            .range([padding, w - padding]);
    
            var yScale = d3.scaleLinear()
                            .domain([d3.min(dataset, d => d[1]), d3.max(dataset, d => d[1])])
                            .range([h - padding, padding]);
            
            
            var xAxis = d3.axisBottom()
                            .ticks(5)
                            .scale(xScale);
    
            var yAxis = d3.axisLeft()
                            .ticks(5)
                            .scale(yScale);
    
            
            var svg = d3.select("#chart")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h)
    
            
            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d[0]))
                .attr("cy", d => yScale(d[1]))
                .attr("r", d => d[2])
                .style("fill", d => d[0] > 300 ? "red" : "#2541B2");
            
            
            
            svg.append("g")
                .attr("transform", `translate(0, ${h - padding})`)
                .call(xAxis);
    
            svg.append("g")
                .attr("transform", `translate(${padding}, 0)`)
                .call(yAxis);
                
        }
            
}

window.onload = init;