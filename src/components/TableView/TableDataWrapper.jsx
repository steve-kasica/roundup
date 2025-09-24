/* eslint-disable react/prop-types */
import withTableData from "../HOC/withTableData";
import RawTableRows from "./RawTableRows";

const TableDataWrapper = ({
  table,
  activeColumnIds,
  hoveredColumnIds,
  hoverColumn,
  unhoverColumn,
}) => {
  const hoveredId = hoveredColumnIds[0];
  return (
    <RawTableRows
      tableId={table.id}
      columnIds={activeColumnIds}
      hoveredIndex={activeColumnIds.indexOf(hoveredId)}
      hoverColumn={hoverColumn}
      unhoverColumn={unhoverColumn}
    />
  );
};

TableDataWrapper.displayName = "TableDataWrapper";

const EnhancedTableDataWrapper = withTableData(TableDataWrapper);

export { EnhancedTableDataWrapper as TableDataWrapper };
