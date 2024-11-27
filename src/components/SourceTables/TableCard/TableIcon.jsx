/**
 * table-icons.js
 * --------------------------------------------------------------------------------
 */
import * as d3 from "d3";

const shape = d3.scaleQuantize([0, 2], ["long", "square", "wide"]);

const createMatrix = (x, y) =>
    d3.cross(
      Array.from({ length: x }, (_, i) => i + 1),
      Array.from({ length: y }, (_, j) => j + 1)
    )

function TableIcon({
    width = 100,
    height = 100,
    columns = 10,
    rows = 10,
    roundness = 1,
    padding = 0.1,
    headerFill = "#ddd",
    fill = "#ddd",
    stroke = "#ddd"
  }) {
    const iconSize = d3.max([width, height]);
    const seq = (l) => Array.from({ length: l + 1 }, (_, i) => i);
    const tableShape = shape(columns / rows);
  
    let columnCount, rowCount;
    switch (tableShape) {
      case "wide":
        (columnCount = 5), (rowCount = 3);
        break;
      case "square":
        (columnCount = 5), (rowCount = 5);
        break;
      case "long":
        (columnCount = 3), (rowCount = 5);
        break;
    }
    
    const scale = d3
      .scaleBand(seq(d3.max([columnCount, rowCount])), [0, iconSize])
      .paddingInner(padding);
  
    const data = createMatrix(columnCount, rowCount);
  
    const tableWidth = (columnCount - 1) * scale.step() + scale.bandwidth();
    return (
      <svg width={width} height={height}>
        <rect 
          x="0" 
          y="0" 
          rx={roundness}
          ry={roundness}
          width={tableWidth} 
          height={scale.bandwidth()}
          fill={fill} 
        />
        {data.map(([x,y]) => (
          <rect
            key={`${x}-${y}`}
            x={scale(x - 1)}
            y={scale(y)}
            rx={roundness}
            ry={roundness}
            width={scale.bandwidth()}
            height={scale.bandwidth()}
            fill={fill}
            stroke={stroke}
          />
        ))}
      </svg>
    );
  }

  export default TableIcon;