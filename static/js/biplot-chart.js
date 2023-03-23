function makeProcessedBiplot(data) {
    fetch('/processdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(responseText => {
            generateBiplot(JSON.parse(responseText))
        })
        .catch(error => console.error(error));


}

function generateBiplot(data) {

    const width = $('.graph_container').width();
    const height = width;

    const margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };
    d3.select('#biplot_dataviz').selectAll('*').remove();

    const svg = d3.select("#biplot_dataviz")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#e8e8e8");

    const plotArea = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const uniqueGenres = Array.from(new Set(data.map(d => d.genre)));

    const color = d3.scaleOrdinal()
        .domain(uniqueGenres)
        .range(d3.schemeCategory10);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PC1))
        .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PC2))
        .range([height - margin.top - margin.bottom, 0]);


    function drawBiplot() {

        const points = plotArea.selectAll(".point")
            .data(data)
            .join("circle")
            .attr("class", "point")
            .attr("r", 3)
            .attr("cx", d => xScale(d.PC1))
            .attr("cy", d => yScale(d.PC2))
            .style("fill", d => color(d.genre))
            .style("opacity", 0.7);

        const xAxis = d3.axisBottom(xScale);
        plotArea.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
            .call(xAxis);

        const yAxis = d3.axisLeft(yScale);
        plotArea.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        plotArea.append("text")
            .attr("class", "axis-label")
            .attr("x", width - margin.left - margin.right)
            .attr("y", height - margin.top - margin.bottom / 2)
            .text("PC1");

        plotArea.append("text")
            .attr("class", "axis-label")
            .attr("x", -margin.left)
            .attr("y", height - margin.top - margin.bottom / 2)
            .attr("transform", `rotate(-90, ${-margin.left}, ${height - margin.top - margin.bottom / 2})`)
            .text("PC2");
    }

    const legend = svg.append("g")
        .attr("class", "chart-legend")
        .attr("transform", `translate(${width - (margin.right + margin.right)}, ${margin.top})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(uniqueGenres)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => color(d));

    legendItems.append("text")
        .attr("x", 15)
        .attr("y", 8)
        .text(d => d);

    drawBiplot();

    window.drawMap(data)
}