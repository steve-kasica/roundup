import { useEffect, useRef } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

const DonutChart = ({
  data,
  width = 500,
  showLabels = false,
  colorScheme = "spectral",
  colors = null,
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Calculate dimensions
    const height = Math.min(width, 500);
    const radius = Math.min(width, height) / 2;

    // Define arc and pie generators
    const arc = d3
      .arc()
      .innerRadius(radius * 0.67)
      .outerRadius(radius - 1);

    const pie = d3
      .pie()
      .padAngle(1 / radius)
      .sort(null)
      .value((d) => d.value);

    // Define color scale
    let colorRange;
    if (colors) {
      // Use custom colors array
      colorRange = colors;
    } else {
      // Use d3 color scheme
      const schemes = {
        spectral: (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
        rainbow: d3.interpolateRainbow,
        sinebow: d3.interpolateSinebow,
        turbo: d3.interpolateTurbo,
        viridis: d3.interpolateViridis,
        inferno: d3.interpolateInferno,
        magma: d3.interpolateMagma,
        plasma: d3.interpolatePlasma,
        warm: d3.interpolateWarm,
        cool: d3.interpolateCool,
        blues: d3.interpolateBlues,
        greens: d3.interpolateGreens,
        greys: d3.interpolateGreys,
        oranges: d3.interpolateOranges,
        purples: d3.interpolatePurples,
        reds: d3.interpolateReds,
      };
      const interpolator = schemes[colorScheme] || schemes.spectral;
      colorRange = d3.quantize(interpolator, data.length);
    }

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(colorRange);

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Add donut segments
    svg
      .append("g")
      .selectAll()
      .data(pie(data))
      .join("path")
      .attr("fill", (d) => color(d.data.name))
      .attr("d", arc)
      .append("title")
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    // Add labels
    if (showLabels) {
      svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .selectAll()
        .data(pie(data))
        .join("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .call((text) =>
          text
            .append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text((d) => d.data.name)
        )
        .call((text) =>
          text
            .filter((d) => d.endAngle - d.startAngle > 0.25)
            .append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text((d) => d.data.value.toLocaleString("en-US"))
        );
    }
  }, [data, width, showLabels, colorScheme, colors]);

  return <svg ref={svgRef} />;
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  width: PropTypes.number,
  showLabels: PropTypes.bool,
  colorScheme: PropTypes.oneOf([
    "spectral",
    "rainbow",
    "sinebow",
    "turbo",
    "viridis",
    "inferno",
    "magma",
    "plasma",
    "warm",
    "cool",
    "blues",
    "greens",
    "greys",
    "oranges",
    "purples",
    "reds",
  ]),
  colors: PropTypes.arrayOf(PropTypes.string),
};

export default DonutChart;
