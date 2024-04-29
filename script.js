function init() {
    
        /*
        This is the "starting" Code for our data vis Project
        Just provisionally
        */
       
        var w = 500; 
        var h = 300;

        var padding = 40;

        var dataset = [
                        [5, 20],
                        [500, 90],
                        [250, 50],
                        [100, 33],
                        [330, 95],
                        [410, 12],
                        [475, 44],
                        [25, 67],
                        [85, 21],
                        [220, 88]
                        ];

        var circleRadius = 3

            
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
            .attr("r", d => circleRadius)
            .style("fill", d => d[0] > 300 ? "red" : "#2541B2");
        

       
        svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(d => d[0] + "," + d[1])
            .attr("x", d => xScale(d[0])) 
            .attr("y", d => yScale(d[1]) - circleRadius)
            .style("font-family", "sans-serif")
            .style("font-size", "10px");
        
        
        svg.append("g")
            .attr("transform", `translate(0, ${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);
            
}

window.onload = init;