import TableView from "./TableView";
import ColumnIndex from "./ColumnIndex";
export default function OperationView({}) {
  return (
    <div className="StackDetail">
      <div className="left-panel">
        <div className="label">
          <span>{yAxisLabel}</span>
        </div>
        <div className="column-group">
          {tableIds.map((tableId) => (
            <TableView key={tableId} id={tableId} />
          ))}
        </div>
      </div>
      <div className="right-panel">
        <div className="x-axis label">{xAxisLabel}</div>
        <div ref={gridContainerRef} className="grid-container">
          {xScale.domain().map((j) => (
            <ColumnIndex
              key={j}
              index={j}
              columnIds={columnIdMatrix.map((row) => row[j])}
              tableIds={tables.map(({ id }) => id)} // TODO: do I need this?
              onCellClick={onCellClick}
              onColumnClick={onColumnClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
