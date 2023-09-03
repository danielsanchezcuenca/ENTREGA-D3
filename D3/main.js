
let years;
let originalData;
let maxWins;

const margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleBand().range([height, 0]).padding(0.1);

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")");

svg.append("g")
    .attr("class", "y-axis");

// data:
d3.csv("data.csv").then(data => {
    originalData = data;
    years = d3.set(data.map(d => d.Year)).values().map(d => +d);
    maxWins = d3.max(data, d => d.Winner.length);
    update(years[0]);
    slider();
})

function update(year) {
    const filteredData = originalData.filter(d => d.Year <= year);
    const data = d3.nest()
        .key(d => d.Winner)
        .rollup(v => v.length)
        .entries(filteredData);

    x.domain([0, d3.max(data, d => d.value)]);
    y.domain(data.map(d => d.key));

    svg.select(".x-axis")
        .call(d3.axisBottom(x).ticks(d3.max(data, d => d.value)).tickFormat(d3.format('d')));

    svg.select(".y-axis")
        .call(d3.axisLeft(y));

    const bars = svg.selectAll(".bar")
        .data(data, d => d.key);

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.value))
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.value));

    bars.exit()
        .transition()
        .duration(1000)
        .attr("width", 0)
        .remove();
}



function slider() {
    const dataTime = d3.range(0, years.length).map(d => new Date(years[d], 10, 3));

    const x = d3.scaleTime()
        .domain([d3.min(dataTime), d3.max(dataTime)])
        .range([0, 500])
        .clamp(true);

    const slider = d3.select('div#slider-time')
        .append('svg')
        .attr('width', 600)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    slider.append('line')
        .attr('class', 'track')
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-inset')
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-overlay')
        .call(d3.drag()
            .on('start.interrupt', function() { slider.interrupt(); })
            .on('start drag', function() {
                const year = d3.timeFormat('%Y')(x.invert(d3.event.x));
                update(+year);
                handle.attr('cx', x(new Date(+year, 10, 3)));
                d3.select('p#value-time').text(year);
            })
        );

    slider.insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .attr('transform', 'translate(0,4)')
        .selectAll('text')
        .data(x.ticks(10))
        .enter()
        .append('text')
        .attr('x', x)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .text(d => d3.timeFormat('%Y')(d));


    const handle = slider.insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(new Date(years[0], 10, 3)));

    d3.select('p#value-time').text(years[0]);
}



