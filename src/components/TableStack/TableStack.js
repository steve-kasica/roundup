import * as d3 from "d3";
import ColumnSchema from "../utilities/data/Column";

export default class TableStack {
  constructor(config, svg) {
    this.width = config.width || 400;
    this.height = config.height || 200;
    this.fontSize = config.fontSize || 10;  // TODO, separate style
    this.marginTop = config.marginTop || 20;
    this.marginRight = config.marginRight || 10;
    this.marginBottom = config.marginBottom || 10;
    this.marginLeft = config.marginLeft || 10;
    this.yInnerPadding = config.yInnerPadding || 0.01;
    this.xInnerPadding = config.xInnerPadding || 0.01;
    this.rectRoundness = config.rectRoundness || 0;
    this.deselectedOpacity = config.deselectedOpacity || 0.4;  // TODO: separate style
    this.dropShadowStyle = config.dropShadowStyle || "drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))";
    this.maxRectHeight = 100;
    this.maxRectWidth = 100;
    this.minRectWidth = 0;
    this.minRectHeight = this.minRectWidth;

    // Test if svg object is already a D3 selection
    this.svg = svg.hasOwnProperty("_groups") ? svg : d3.select(svg);
    
    // Callback functions
    this.onDataChange = config.onDataChange || null;

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

  setXScale(data) {
    const domain = [...new Set(data.map(d => d.x))].sort(d3.ascending);
    const range = [this.marginLeft, this.width - this.marginRight];

    this.xScale = d3
      .scaleBand(domain, range)
      .paddingInner(this.xInnerPadding);

    return this;
  }

  setYScale(data) {
    const domain = [...new Set(data.map(d => d.y))].sort(d3.ascending);
    const range = [this.marginTop, this.height - this.marginBottom];

    this.yScale = d3
      .scaleBand(domain, range)
      .paddingInner(this.yInnerPadding);

    return this;
  }

  updateXAxis() {
    const axis = d3.axisTop(this.xScale);
    this.xAxis.call(axis);
    return this;
  }

  updateYAxis() {
    const axis = d3.axisLeft(this.yScale);
    this.yAxis.call(axis);
    return this;
  }

  setData(data) {
    // `backfill` can be an empty array
    const backfill = (function(xScale, yScale) {
      const universe = new Set(d3.cross(xScale, yScale).map(([x,y]) => `${x}-${y}`));
      const domain = new Set(data.map(d => `${d.x}-${d.y}`));
      const diff = Array.from(universe.difference(domain)).map(key => key.split("-"));
      const focusColumns = data.filter(d => d.isFocused);
      return diff.map(([x,y]) => ({
        x: parseInt(x),
        y,
        key: `${x}-${y}`,
        isFocused: focusColumns.length > 0 && parseInt(x) === focusColumns[0].x,
        isEmpty: true,
        text: null
      }));
    })(this.xScale.domain(), this.yScale.domain());

    this.data = data.concat(backfill);

    return this;
  }

  updateRects(data) {
    const vis = this;

    const drag = d3.drag()
      .on("start", function (ev, d) { d3.select(this).classed("dragging", true).raise(); })
      .on("drag", function ({ x, dx }, d) {
        const cell = d3.select(this);
        const [min, max] = d3.extent(vis.xScale.domain()).map(vis.xScale);
        const cellWidth = vis.xScale.bandwidth();

        // Update cell x position
        cell.attr("x", () => {
          let value = (+cell.attr("x")) + dx;
          return (value <= min) ? min : (value >= max) ? max : value;        
        });

        // Highlight cell being dragged over
        // TODO: is there a way to simplify this equality since cell width is equal
        // between line segments?
        const threshold = 0.5;  // Percentage of overlap [0, 1]        
        d3.select(this.parentNode)
          .selectAll(".cell:not(.dragging)")
          .classed("dragged-over", function() {
            const a1 = parseInt(cell.attr("x"));
            const a2 = a1 + cellWidth;
            const b1 = parseInt(d3.select(this).attr("x"));
            const b2 = b1 + cellWidth;
            const delta = Math.max(0, Math.min(a2, b2) - Math.max(a1, b1)) / cellWidth;
            return (threshold <= delta && delta <= 1);
          });
      })
      .on("end", function (event, sourceData) {
        const targetCell = d3.select(".dragged-over");
        const sourceCell = d3.select(this);

        if (!targetCell.empty()) {
          // A cell swap has occured
          const temp = targetCell.data()[0].x;
          targetCell.datum(d => {
            d.x = sourceCell.data()[0].x;
            return d;
          });

          sourceCell.datum(d => {
            d.x = temp;
            return d;
          });

          vis.onDataChange(sourceCell.data()[0], targetCell.data()[0]);

        }
        // else no-op, return dragging cell to original position

        vis.updateRects(vis.data);

        sourceCell.classed("dragging", false);
        targetCell.classed("dragged-over", false);
      });
    
    const cells = this.svg.selectAll("svg.cell")
      .data(data, d => d.key)
      .join(
        enter => {
          const svg = enter.append("svg")
            .classed("cell", true)
            .classed("null", d => d.isEmpty)
            .call(drag);
          
          svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", this.rectRoundness)
            .attr("ry", this.rectRoundness)
            .append("title")
              .text(d => d.title);

          svg.append("text")
            .attr("x", "50%")
            .attr("y", "50%");

          return svg;
      }, 
      update => update
        .style("fill", "black")
        .transition()
          .attr("x", d => vis.xScale(d.x))
          .attr("width", () => d3.max([this.xScale.bandwidth(), this.minRectWidth]))
    );

    // Cells contains both enter + update selection <svg> elements
    cells
      .classed("focused", d => d.isFocused)
      .attr("x", d => this.xScale(d.x))
      .attr("y", d => this.yScale(d.y))
      .attr("width", () => d3.max([this.xScale.bandwidth(), this.minRectWidth]))      
      .attr("height", vis.yScale.bandwidth());
    
    cells.select("text")
      .text(d => (this.xScale.bandwidth() > this.minRectWidth) ? d.text : "");

    return this;
  }

  update(data) {
    this.setXScale(data)
      .setYScale(data)
      .updateXAxis()
      .updateYAxis()
      .setData(data)
      .updateRects(this.data);
      // .updateMargins();
    
    // if (this.onDataChange) {
    //   this.onDataChange(this.data);
    // }
  }

  // updateMargins() {
  //   const isNameEqual = (a, b) => (a.name.length > 0) && (a.name === b.name);

  //   const data = this.data.reduce((acc, curr, i, arr) => {
  //     if (i < arr.length - 1) {
  //       for (let j = 0; j < curr.length; j++) {
  //         if (isNameEqual(arr[i][j], arr[i + 1][j])) {
  //           acc.push([[i,j], [i + 1,j]]);
  //         }
  //       }
  //     }
  //     return acc;
  //   }, []);

  //   this.svg.selectAll("rect.cell-margin")
  //     .data(data, ([d1, d2]) => `${d1.join("-")}/${d2.join("-")}`)
  //     .join("rect")
  //       .classed("cell-margin", true)
  //       .attr("y", ([d1, d2]) => this.yScale(d1[0]) + this.yScale.bandwidth())
  //       .attr("x", ([d1, d2]) => this.xScale(d1[1]))
  //       .attr("width", this.xScale.bandwidth())
  //       .attr("height", this.yScale.paddingInner() * this.yScale.step());

  //   return this;
  // }

  swapCells(i, a, b) {
    // i: the index of the tables
    // a: a d3 selection of a SVG representing a ColumnSchema
    // b: a d3 selection of a SVG representing a ColumnSchema
    const t = this.data[i];

    // Swap data in instance
    const aIndex = parseInt(a.attr("data-index"));
    const bIndex = parseInt(b.attr("data-index"));
    [t[aIndex], t[bIndex]] = [t[bIndex], t[aIndex]];

    if (this.onDataChange) {
      this.onDataChange(this.data);
    }

    return this;  // for chaining

  }
  
  // renderColumnRenameInputs() {
  //   const setId =  x => `column-index-${x}`;
    
  //   const foreignObjects = this.svg
  //     .append("g")
  //     .attr("class", "column-renames")
  //     .selectAll("foreignObject")
  //     .data(this.xScale.domain())
  //     .join("foreignObject")
  //       .attr("x", x => this.xScale(x))
  //       .attr("y", 0)
  //       .attr("width", this.xScale.bandwidth())
  //       .attr("height", 100);
    
  //   foreignObjects.append("xhtml:label")
  //       .attr("for", setId)
  //       .text(i => i);
    
  //   foreignObjects.append("xhtml:input")
  //       .attr("type", "text")
  //       .attr("id", setId)
  //       .attr("name", setId);
    
  //   return this;  // for chaining
  // }
  
  // renderYAxis() {
    
  //   const vis = this;
  //   const yScale = this.yScale; // alias for use within callback functions
    
  //   // draw axis
  //   const yAxis = this.svg
  //     .append("g")
  //     .attr("transform", `translate(${(this.marginTop, this.marginLeft)})`)
  //     .call(this.yAxis);
    
  //   yAxis
  //     .select("path,line") // Remove axis line
  //     .remove();

  //   // Define row interactivity      
  //   yAxis
  //     .selectAll("g.tick")
  //     .attr("data-index", (yIndex) => yIndex)
  //     .style("cursor", "grab")
  //     .style("user-select", "none")
  //     .call(d3.drag()
  //       .on("start", function() {
  //         const tick = d3.select(this);
  //         tick.style("cursor", "grabbing");
            
  //         vis.svg
  //           .selectAll(`g.row[data-index="${tick.attr("data-index")}"] g.cell`)
  //           .attr("fill", "red")
  //       })
  //       .on("drag", function ({ x, y }, d) {
  //         const initialIndex = parseInt(d3.select(this).attr("data-index"));
  
  //         const currentIndex = (function (initIdx, maxIdx, minIdx, diff) {
  //           // diff > 0 if moving right, < 0 if moving left
  //           let idx = initIdx + Math.floor(diff / vis.yScale.step());
  //           return idx > maxIdx ? maxIdx : idx < minIdx ? minIdx : idx;
  //         })(initialIndex, 3, 1, y - vis.yScale(initialIndex));
  
  //         if (initialIndex !== currentIndex) {
  //           // Move y-axis tick vertically
  //           d3.select(this)
  //             .attr("data-index", currentIndex)
  //             .attr(
  //               "transform",
  //               `translate(0, ${vis.yScale(currentIndex) + vis.yScale.bandwidth() / 2})`
  //             );
  
  //           // Move row of columns vertically
  //           d3.select(`g.row[data-index="${initialIndex}"]`)
  //             .attr("data-index", currentIndex)
  //             .attr("transform", `translate(0, ${vis.yScale(currentIndex)})`);
  
  //           let nextIndex =
  //             currentIndex - initialIndex > 0
  //               ? currentIndex - 1
  //               : currentIndex + 1;
  
  //           // Move tick under selected tick
  //           d3.select(this.parentElement)
  //             .select(`g.tick[data-index="${currentIndex}"]`)
  //             .attr("data-index", nextIndex)
  //             .attr(
  //               "transform",
  //               `translate(0, ${vis.yScale(nextIndex) + vis.yScale.bandwidth() / 2})`
  //             );
  
  //           // Move row of column under dragging row of columns
  //           d3.select(`g.row[data-index="${currentIndex}"]`)
  //             .attr("data-index", nextIndex)
  //             .attr("transform", `translate(0, ${vis.yScale(nextIndex)})`);
  //           }
  //         })
  //         .on("end", function() {
  //           const tick = d3.select(this);
            
  //           tick.style("cursor", "grab");
              
  //           vis.svg
  //             .selectAll(`g.row[data-index="${tick.attr("data-index")}"] g.cell`)
  //             .attr("fill", null);
            
  //           // Update margins with new data
  //           vis.serialize.call(vis)
  //              .renderMargins();
  //         })
  //     );
  //     return yAxis;
      
  // }  // renderYAxis
  
  // update(updatedData) {
  //   const data = updatedData || this.data;
    
  //   // const margins = this.renderMargins(data);
    
  //   const rows = this.svg
  //     .selectAll("g.row")
  //     .data(d3.group(data, (d) => d["yIndex"]))
  //     .join("g")
  //     .attr("class", "row")
  //     .attr("data-index", ([yIndex, d]) => yIndex)
  //     .attr("data-name", ([yIndex, d]) => d[0]['tableName'])
  //     .attr(
  //       "transform",
  //       ([yIndex, data]) => `translate(0,${this.yScale(yIndex)})`
  //     );
      
  //   const cells = this.renderCells(rows);
    
  // }
  
}