/**
 * ValueMatrix.js
 * ---------------------------------------------------
 */

import * as d3 from "d3";

export default class ValueMatrix {
    constructor(config, svg) {
        this.width = config.width || 100;
        this.height = config.height || this.width;  // Defaults to square
        this.marginTop = config.marginTop || 20;
        this.marginRight = config.marginRight || 10;
        this.marginBottom = config.marginBottom || 10;
        this.marginLeft = config.marginLeft || 10;

        this.svg = d3.select(svg);

        this.init();
    }

    init() {
        this.svg
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("width", this.width)
            .attr("height", this.height)
            // Clean SVG of all child element
            .selectAll("*")
            .remove();
        
        this.xAxis = this.svg
            .append("g")
            .attr("transform", `translate(0, ${this.marginTop})`);
        
        this.yAxis = this.svg
            .append("g")
            .attr("transform", `translate(${this.marginLeft}, 0)`);        
    }

    update(data) {
        this.setXScale(data)
            .setYScale(data)
            .setColorScale(data)
            .updateBubbles(data)
            .updateXAxis()
            .updateYAxis();

        return this;
    }

    setXScale(data) {
        const domain = new Set(data.map(d => d.x).sort(d3.ascending));
        const range = [this.marginTop, this.height - this.marginBottom];
        this.xScale = d3.scaleBand(domain, range);
        return this;
    }

    /**
     * Set the y-scale to be different tables
     */
    setYScale(data) {
        const domain = new Set(data.map(d => d.y).sort(d3.ascending));
        const range = [this.marginTop, this.height - this.marginBottom];
        this.yScale = d3.scaleBand(domain, range);
        return this;
    }

    setColorScale(data) {
        const domain = d3.extent(data, d => d.count);
        const range = d3.interpolateBlues;
        this.colorScale = d3.scaleSequential(domain, range);
        return this;
    }

    updateXAxis() {
        // update
        this.xAxis
            // .transition()
            // .duration(250)
            .call(d3.axisTop(this.xScale))
            .selectAll("text")
                .attr("dx", "0.5em")
                .attr("dy", "0.25em")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "start")
            // Remove axis and tick lines
            // .selectAll("path, line")
            // .remove();
      
          return this;
    }

    updateYAxis() {
        // update
        this.yAxis.call(d3.axisLeft(this.yScale));
        // .selectAll("path, line") // Remove axis line
        // .remove();

        return this;
    }

    updateBubbles(data) {
        const dx = this.xScale.bandwidth() / 2;
        const dy = this.yScale.bandwidth() / 2;

        const bubbles = this.svg.selectAll("g.bubble")
            .data(data, d => d.key)
            .join(
                enter => {
                    const g = enter.append("g")
                         .classed("bubble", true);

                    g.append("circle")
                        // .attr("fill", d => this.colorScale(d.count))
                        .append("title")
                            .text(d => d.count);

                    // g.append("text")
                    //      .style("text-anchor", "middle")
                    //      .attr("dominant-baseline", "middle")
                    //      .text(d => d.count > 0 ? d.count : null);
                         
                    return g;
                }
            );

            // bubbles contains enter + update selection of <g> elements
            bubbles
                .attr("transform", d => `translate(${this.xScale(d.x)}, ${this.yScale(d.y)})`);

            bubbles.select("circle")
                .attr("r", d3.min([dx, dy]))
                .attr("cx", dx)
                .attr("cy", dy);

            // bubbles.select("text")
            //     .attr("x", dx)
            //     .attr("y", dy);

        return this;  // For chaining
    }
}