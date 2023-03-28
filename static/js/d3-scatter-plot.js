// SCATTERPLOT VISUALIZATION

var width = $('.graph_container').width();
var height = width;
var spacing = 120;

function makeScatterPlot(data1, compareAverage) {
    let data = data1

    d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("opacity", 0);

    d3.select('#scatterplot_dataviz').selectAll('*').remove();

    var svg = d3.select('#scatterplot_dataviz')
        .append("svg")
        .attr("id", "scattersvg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#e8e8e8")
        .append("g")
        .attr("transform", "translate(" + spacing / 2 + "," + spacing / 2 + ")");

    var xScale = d3.scaleLinear()
        .domain([
            d3.max(data, function (d) {
                return d[window.xAxisLabel];
            }),
            d3.min(data, function (d) {
                return d[window.xAxisLabel];
            })])
        .range([width - spacing, 0]);

    var yScale = d3.scaleLinear()
        .domain([
            d3.min(data, function (d) {
                return d[window.yAxisLabel];
            }), d3.max(data, function (d) {
                return d[window.yAxisLabel];
            })])
        .range([height - spacing, 0])


    var xAxis = d3.axisBottom(xScale).tickFormat(d => {
        const formatValue = d3.format(".0f")(d);
        return formatValue.replace(/,/g, '');
    });
    var yAxis = d3.axisLeft(yScale).tickFormat(d => {
        const formatValue = d3.format(".0f")(d);
        return formatValue.replace(/,/g, '');
    });

    svg.append("g")
        .attr("transform", "translate(" + 0 + "," + (height - spacing) + ")")
        .call(xAxis);
    svg.append("g").call(yAxis);

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 250)
        .attr('y', 520)
        .text(xAxisLabel);

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', -250)
        .attr('y', -30)
        .attr('transform', 'rotate(-90)')
        .text(yAxisLabel);

    var tooltip = d3.select("#scatterplot_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    var mouseover = function (d) {
        d3.select(this)
            .classed("selected", true);
        tooltip
            .style("opacity", 1);
    }

    var mousemove = function (event, d) {
        tooltip
            .html(d.name)
            .style("left", (d3.pointer(event)[0]) + "px")
            .style("top", (d3.pointer(event)[1]) + "px")
    }

    var mouseleave = function (d) {
        d3.select(this)
            .classed("selected", false);
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
    }

    const circle = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d[xAxisLabel]))
        .attr("cy", d => yScale(d[yAxisLabel]))
        .attr("r", 3)
        .attr("fill", "#3FB8AF")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    var brush = d3.brush()
        .extent([[0, 0], [width - spacing, height - spacing]])
        .on("end", brushed);

    var toggleBrush = true

    svg.append("g")
        .attr("class", "brush")
        .call(brush)

    $('.toggle-brush').on('click', () => {
        toggleBrush = !toggleBrush
        if (toggleBrush) {
            svg.append("g")
                .attr("class", "brush")
                .call(brush)


            $('.toggle-brush').removeClass("fa-toggle-off").addClass("fa-toggle-on")

        } else {
            $('.brush').remove()
            $('.toggle-brush').removeClass("fa-toggle-on").addClass("fa-toggle-off")
        }

    });
    svg.append("g")
        .attr("class", "brush")
        .call(brush);
    $('.brush')
    function brushed(event) {
        if (event.selection) {
            var selected = data.filter(function (d) {
                return (xScale(d[window.xAxisLabel]) >= event.selection[0][0] &&
                    xScale(d[window.xAxisLabel]) <= event.selection[1][0] &&
                    yScale(d[window.yAxisLabel]) >= event.selection[0][1] &&
                    yScale(d[window.yAxisLabel]) <= event.selection[1][1]);
            });
            d3.selectAll("circle")
                .classed("selected", function (d) {
                    return selected.includes(d);
                })
                .attr("fill", function (d) {
                    return selected.includes(d) ? "#2f8aa8" : "#3FB8AF";
                });

            if (!compareAverage) {
                populateTable(selected)
                makeProcessedBiplot(selected)
            }

        }
    }
}

function populateTable(selected) {
    const table = document.querySelector('.table-body');
    document.querySelector('.table-body').innerHTML = ''
    selected.forEach(item => {
        const row = table.insertRow();

        Object.values(item).forEach(value => {
            const cell = row.insertCell();

            cell.textContent = value;
        });
    });
}