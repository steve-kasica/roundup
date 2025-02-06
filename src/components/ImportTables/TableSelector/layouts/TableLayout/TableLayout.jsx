/**
 * TablesTable.jsx
 * -------------------------------
 */
import { isTable, properties as tableProperties } from "../../../../../lib/types/Table";
import { Button, Checkbox, Typography } from "@mui/material";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Fragment, useState } from "react";
import { ascending, descending } from "d3";
import { useSelector } from "react-redux";
import "./style.css"
import { ADD_TO_GROUP } from "../../../../../data/uiSlice";
import HighlightText from "../../../../ui/HighlightText";
import { CheckBox } from "@mui/icons-material";
import { DragPreviewImage, useDrag } from "react-dnd";
import tableIconImage from "../../../../../../public/images/table-icon.png";

const columns = tableProperties
  .map((prop) => ({
    prop,
    label: prop.replace("_", " ")
  }));

export default function TableLayout({ 
  searchString, 
  handleTablePrimaryClick,
  handleSelectAllClick,
  sourceTables,
  selectedTables,
}) {

  const [sortColumn, setSortColumn] = useState(columns.at(0).prop);
  const [isAscending, setIsAscending] = useState(true);

  const rows = sourceTables.toSorted((a, b) => {
    if (isAscending) {
      return ascending(a[sortColumn], b[sortColumn])
    } else {
      return descending(a[sortColumn], b[sortColumn])
    }
  });

  const areAllTablesSelected = (sourceTables.length === selectedTables.size);
  const areSomeTablesChecked = selectedTables.size > 0;

  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th>
              <Checkbox 
                edge="start"
                tabIndex={-1}
                checked={areAllTablesSelected}
                indeterminate={!areAllTablesSelected && areSomeTablesChecked}
                onChange={(event) => handleSelectAllClick(event.target)}
                disableRipple
              />
            </th>
            {columns.map((column) => (
              <th 
                key={column.prop}
                className="table-head"
              >
                  <Button 
                    color="danger"
                    sx={{
                      width: "100%", 
                      textAlign: "left"
                    }} 
                    onClick={() => {
                      if (sortColumn === column.prop) {
                        setIsAscending(!isAscending);
                      } else {
                        setSortColumn(column.prop)
                      }
                    }}
                  >
                    {column.label}
                    <SortIcon column={column} />
                  </Button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {
            rows.map(table => (
              <Row 
                key={table.id} 
                table={table}
              />
            ))
          }
        </tbody>
      </table>
    </div>
  ); // end return statement

  function Row({ table }) {
    const {id, name, type, row_count, column_count, date_created, last_modified} = table;

    const items = [name, type, column_count,  row_count, date_created, last_modified ];

    const isSelected = selectedTables.has(id);
    const isDisabled = useSelector(({ui}) => 
      (ui.insertionMode === ADD_TO_GROUP && isSelected) || 
      items.join("^").indexOf(searchString) < 0
    );
    const [{opacity}, dragRef, previewRef] = useDrag(
      () => ({
        type: "table",
        item: {table, searchString, isSelected},
        collect: (monitor) => ({
          opacity: monitor.isDragging() ? 0.5 : 1
        })
      })
    )

    return (
      <Fragment key={id}>
        <DragPreviewImage connect={previewRef} src={tableIconImage} />
        <tr 
            ref={dragRef}
            className={`table-row ${isDisabled ? "disabled" : ""}`}
            onClick={() => handleTablePrimaryClick(table, isSelected)}
          >
            <td className="table-data">
              <Checkbox 
                  edge="start"
                  checked={isSelected}
                  disabled={isDisabled}
                  tabIndex={-1}
                  disableRipple
              />
            </td>
            {items.map((text, i) => (
                <td 
                    key={i}
                    className="table-data"
                >
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        <HighlightText pattern={searchString} text={String(text)} />
                    </Typography> 
                </td>
            ))}
          </tr>
      </Fragment>
    )
} // Row

  function SortIcon({column}) {
    if (sortColumn === column.prop) {
      if (isAscending) {
        return <ArrowUp />
      } else {
        return <ArrowDown />
      }
    } else {
      return null;
    }
  }

} // TablesTable()
