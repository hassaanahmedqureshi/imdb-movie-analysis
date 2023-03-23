const COUNTRIES_DATA = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json'
function drawMap(data) {
    const width = $('.map-container').width();
    const height = width;

    d3.select('#world-heatmap').selectAll('*').remove();

    const svg = d3.select("#world-heatmap")
        .append("svg")
        .style("background", "#e8e8e8")
        .attr("width", width)
        .attr("height", width);

    const projection = d3.geoMercator()
        .scale(100)
        .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);



    const newData = data.reduce((acc, curr) => {
        const existingCountry = acc.find(item => item.country === curr.country);
        if (existingCountry) {
            existingCountry.budgetsum += curr.budget;
            existingCountry.grosssum += curr.gross;
        } else {
            acc.push({
                country: curr.country,
                budgetsum: curr.budget,
                grosssum: curr.gross
            });
        }
        return acc;
    }, []);

    const countryData = d3.rollup(newData, v => d3.mean(v, d => (d.grosssum - d.budgetsum)), d => d.country);

    const colorRange = ["#c5faf6", "#aeebe6", "#8dd9d3", "#71d1ca", "#40bdb4", "#23a198", "#0a6b64"];

    const colorScale = d3.scaleQuantile()
        .domain(countryData)
        .range(colorRange);

    d3.json(COUNTRIES_DATA)
        .then(worldData => {
            features = topojson.feature(worldData, worldData.objects.countries).features;
            const mergedData = features.map(feature => {
                const country = feature.properties.name;
                const value = countryData.get(country) || 0;

                return { ...feature, value };
            });

            colorScale.domain(d3.extent(mergedData, d => { return d.value }));
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
            format = d3.format(",");
            svg.selectAll("path")
                .data(mergedData)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", d => {
                    if (d.value != 0) {
                        console.log(d);
                        return colorScale(d.value)
                    }
                    return '#ccc'

                })
                .style("stroke", "white")
                .style("stroke-width", 0.5)
                .on("mouseover", function (event, d) {

                    d3.select("#tooltip")
                        .html(`<p>Country: ${d.properties.name}</p>` + `<p>Net Profit: ${format(d.value)}</p>`)
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + 10 + "px");
                })
                .on("mouseout", function (d) {
                    d3.select("#tooltip")
                        .style("opacity", 0);
                });
        });

}