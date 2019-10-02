/**********************************************************************/
// CHART DEFINITIONS:
/**********************************************************************/

// Canvas Dimensions:
const svgWidth = 1350;
const svgHeight = 600;

// Margin Definitions:
const margin = {
    top: 20,
    right: 100,
    bottom: 80,
    left: 100
};

// Chart Dimensions:
const chartWidth = svgWidth - margin.left - margin.right;
const chartHeight = svgHeight - margin.top - margin.bottom;

// SVG Wrapper:
let svg = d3.select('#thischart')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

// Append an SVG group:
let chartGroup = svg.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`);

                    
/**********************************************************************/
// Initialize Parameters:
/**********************************************************************/
var chosenXAxis = "screensize";
var chosenYAxis = "price";


/**********************************************************************/
// FUNCTION DEFINITIONS:
/**********************************************************************/

// Function: To update x scale upon axis label clicking:
function xScaleThis(response, chosenXAxis) {
    // create x scale:
    let xLinearScale = d3.scaleLinear()
                         .domain([d3.min(response, data => data[chosenXAxis]) * 0.95,
                                  d3.max(response, data => data[chosenXAxis]) * 1.05])
                         .range([0, chartWidth]);
    return xLinearScale;
}

// Function: To update y scale upon axis label clicking:
function yScaleThis(response, chosenYAxis) {
    // create y scale:
    let yLinearScale = d3.scaleLinear()
                         .domain([d3.min(response, data => data[chosenYAxis]) * 0.8,
                                  d3.max(response, data => data[chosenYAxis]) * 1.2])
                         .range([chartHeight, 0]);
    return yLinearScale;
}


// Function: To update x Axis when a new axis label is clicked:
function renderXAxes(newXScale, xAxis, bottomAxis) {
    bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
         .duration(1000)
         .call(bottomAxis);
    
    return xAxis;
}


// Function: To update y Axis when a new axis label is clicked:
function renderYAxes(newYScale, yAxis, leftAxis) {
    leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
         .duration(1000)
         .call(leftAxis);
    
    return yAxis;
}


//Function: To update circle group when a new x Axis is selected:
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
                .duration(1000)
                .attr('cx', d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}


//Function: To update circle group when a new y Axis is selected:
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
                .duration(1000)
                .attr('cy', d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}


//Function: To update text group when a new x Axis is selected:
function renderXtexts(textGroup, newXScale, chosenXAxis) {
    textGroup.transition()
             .duration(1000)
             .attr('dx', d => newXScale(d[chosenXAxis])-8);
    return textGroup;
}


//Function: To update text group when a new x Axis is selected:
function renderYtexts(textGroup, newYScale, chosenYAxis) {
    textGroup.transition()
             .duration(1000)
             .attr('dy', d => newYScale(d[chosenYAxis])+5);
    return textGroup;
}


// Function: To update circles group with new tooltip:
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let xlabel = 'Screensize';
    let ylabel = 'Price';
    let xPostfix = 'inches';

    switch(chosenXAxis) {
        case 'hd'           : xlabel = 'HD:'; break;
        case 'ram'          : xlabel = 'RAM:'; break;
        case 'screensize'   : xlabel = 'Screensize:'; break;
    }

    switch(chosenYAxis) {
        case 'price'      : ylabel = 'Price: $'; break;
    }

    switch(chosenXAxis) {
        case 'hd'           : xPostfix = 'GB'; break;
        case 'ram'          : xPostfix = 'GB'; break;
        case 'screensize'   : xPostfix = 'inches'; break;
    }
    
    // initialize toolTip:
    let toolTip = d3.tip()
                    .attr('class', 'd3-tip')
                    .direction('w')
                    .html(function(d) {                  
                        return (`<h6>${d.store}<br>
                                 ${d.brand}<br>${d.cpu}<br>
                                 ${xlabel} ${d[chosenXAxis]}${xPostfix}<br>
                                 ${ylabel} ${d[chosenYAxis]}</h6>`);
                    });

    // create the tooltip in chartGroup:
    circlesGroup.call(toolTip);

    // create mouseover and mouseout event listeners to display tooltip:
    circlesGroup.on('mouseover', toolTip.show)

    circlesGroup.on('mouseout', toolTip.hide)

                
    return circlesGroup;
}





/**********************************************************************/
// Pull data from the CSV file:
// d3.csv('url of csv from index.html point of view', conversion functions, callback function)
/**********************************************************************/
// d3.csv('./both_tables.csv').then(function(response, error) {
d3.json("/api/data").then(function(response, error) {

    // throw the error because we can't proceed otherwise:
    if (error) return console.warn(error);
    // console.log(error);
    // console.log(typeof(response));

    // convert strings to numbers for numeric values:
    response.forEach(function(data) {
        //use shorthand for parseInt:
        data.price = +data.price;
        data.screensize = +data.screensize;
        data.ram = +data.ram;
        data.hd = +data.hd;
        data.code = +data.code
        data.store = data.store

    });

    // response.forEach(function(data) {
    //     console.log(data.store);
    // });
    

    
    // call the ScaleThis functions for the csv file:
    let xLinearScale = xScaleThis(response, chosenXAxis);
    let yLinearScale = yScaleThis(response, chosenYAxis);

    // create inital axis functions:
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis:
    let xAxis = chartGroup.append('g')
                          .classed('x-axis', true)
                          .attr('transform', `translate(0, ${chartHeight})`)
                          .call(bottomAxis);

    

    // append y axis:
    let yAxis = chartGroup.append('g')
                          .call(leftAxis);


    // plot the chart:
    let circlesGroup = chartGroup.selectAll('circle')
                                 .data(response)
                                 .enter()
                                 .append('circle')
                                 .attr('cx', d => xLinearScale(d[chosenXAxis]))
                                 .attr('cy', d => yLinearScale(d[chosenYAxis]))
                                 .attr('r', 10)
                                //  .attr('fill', 'red');
                                // .attr('fill', d => d.store === "Bestbuy" ? "blue" : "red");
                                // .attr('fill', function(d) {
                                //     const className = d.store === "Bestbuy" ? "blue" : "red";
                                    .attr('fill', d => d.store === "Bestbuy" ? "blue" : "red");

                                //     const className;
                                //     if(d.store === "Bestbuy") {
                                //         className = "blue";
                                //     }  else if(d.store === "Fry's") {
                                //         className = "red";
                                //     } else {
                                //         className = "green";
                                //     }

                                //     return className;
                                // });
                                
 
                              

    // add the plot labels:                            
    let textGroup = chartGroup.selectAll('circleLabel')
                              .data(response)
                              .enter()
                              .append('text')
                              .attr('dx', d => xLinearScale(d[chosenXAxis])-8)
                              .attr('dy', d => yLinearScale(d[chosenYAxis])+5)
                              .attr('font-size', 11)
                              .attr('font-weight', 'bold')
                              .attr('fill', 'white')
                              .text(function(d) {return d.abbr});
    
    // add x axis label group:
    let xLabelGrp = chartGroup.append('g')
                                .attr('transform', `translate(${chartWidth/2}, ${chartHeight+20})`);

    let screensizeLabel = xLabelGrp.append('text')
                                    .attr('x', 0)
                                    .attr('y', 20)
                                    .attr('value', 'screensize')
                                    .classed('active', true)
                                    .text('Screensize (Inches)');
    
    let ramLabel = xLabelGrp.append('text')
                                .attr('x', 0)
                                .attr('y', 40)
                                .attr('value', 'ram')
                                .classed('inactive', true)
                                .text('RAM (GB)');
    
    let hdLabel = xLabelGrp.append('text')
                            .attr('x', 0)
                            .attr('y', 60)
                            .attr('value', 'hd')
                            .classed('inactive', true)
                            .text('HD (GB)');
    
    // add y axis label group:
    let yLabelGrp = chartGroup.append('g');

    let priceLabel = yLabelGrp.append('text')
                                    .attr('transform', 'rotate(-90)')
                                    .attr('y', 0 - margin.left)
                                    .attr('x', 0 - (chartHeight/2))
                                    .attr('dy', '3em')
                                    .attr('value', 'price')
                                    .classed('active', true)
                                    .classed('axis-text', true)
                                    .text('Price ($)');    


    

    // Initialize the tooltips:
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


    /******************************************************/
    //x axis labels event listener:
    /******************************************************/
    xLabelGrp.selectAll('text')
             .on('click', function() {

                let currentX = d3.select(this).attr('value');
                
                if (currentX !== chosenXAxis) {
                    //replace x axis:
                    chosenXAxis = currentX;

                    //call the function to scale the x axis:
                    xLinearScale = xScaleThis(response, chosenXAxis);
                    
                    //update x axis:
                    xAxis = renderXAxes(xLinearScale, xAxis, bottomAxis);

                    //update circle group:
                    circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

                    //upate text group:
                    textGroup = renderXtexts(textGroup, xLinearScale, chosenXAxis);

                    //update tooltip:
                    updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    //change the active x Axis label:
                    switch(chosenXAxis) {
                        case 'screensize':
                            screensizeLabel.classed('active', true)
                                            .classed('inactive', false);
                            ramLabel.classed('active', false)
                                        .classed('inactive', true);
                            hdLabel.classed('active', false)
                                        .classed('inactive', true);
                            break;
                        case 'ram':
                            ramLabel.classed('active', true)
                                        .classed('inactive', false);
                            hdLabel.classed('active', false)
                                        .classed('inactive', true);
                            screensizeLabel.classed('active', false)
                                            .classed('inactive', true);
                            break;
                        case 'hd': 
                            hdLabel.classed('active', true)
                                        .classed('inactive', false);
                            screensizeLabel.classed('active', false)
                                            .classed('inactive', true);
                            ramLabel.classed('active', false)
                                        .classed('inactive', true);
                            break;
                        
                        default: 
                            screensizeLabel.classed('active', true)
                                           .classed('inactive', false);
                            ramLabel.classed('active', false)
                                        .classed('inactive', true);
                            hdLabel.classed('active', false)
                                       .classed('inactive', true);
                            break;
                    }
                }

             });
       

    /******************************************************/         
    //y axis labels event listener:
    /******************************************************/
    yLabelGrp.selectAll('text')
            .on('click', function() {
                
                let currentY = d3.select(this).attr('value');

                if (currentY !== chosenYAxis) {
                    //replace y axis:
                    chosenYAxis = currentY;

                    //call the function to scale the y axis:
                    yLinearScale = yScaleThis(response, chosenYAxis);
                    
                    //update y axis:
                    yAxis = renderYAxes(yLinearScale, yAxis, leftAxis);

                    //update circle group:
                    circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                    //upate text group:
                    textGroup = renderYtexts(textGroup, yLinearScale, chosenYAxis);

                    //update tooltip:
                    updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    //change the active y Axis label:
                    switch(chosenYAxis) {
                        case 'price':
                            priceLabel.classed('active', true)
                                      .classed('inactive', false);
                            break;

                    }           
                
                }
            });             
});
