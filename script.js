function init() {
    
        /*
        This is the "starting" Code for our data vis Project
        Just provisionally
        */
       
        var w = 500; 
        var h = 300;

        var padding = 40;

        var dataset = [
                        [5, 20, 10],
                        [500, 90, 10],
                        [250, 50, 12],
                        [100, 33, 18],
                        [330, 95, 6],
                        [410, 12, 8],
                        [475, 44, 17],
                        [25, 67, 9],
                        [85, 21, 8],
                        [220, 88, 10]
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
            .attr("r", d => d[2])
            .style("fill", d => d[0] > 300 ? "red" : "#2541B2");
        
        
        
        svg.append("g")
            .attr("transform", `translate(0, ${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);
            
}

window.onload = init;