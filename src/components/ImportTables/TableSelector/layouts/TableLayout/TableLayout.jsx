/**
 * TablesTable.jsx
 * -------------------------------
 */
import { properties as tableProperties } from "../../../../../lib/types/Table";
import { Button, Checkbox, Typography } from "@mui/material";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { ascending, descending } from "d3";
import "./style.css"
import HighlightText from "../../../../ui/HighlightText";
import SourceTableItem from "../../SourceTableItem";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";

const columns = tableProperties
  .map((prop) => ({
    prop,
    label: prop.replace("_", " ")
  }));

export default function TableLayout({ 
  searchString, 
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
              <SourceTableItem 
                key={table.id} 
                table={table}
                ContainerElement="tr"
              >
                <TableDetail 
                  {...table} 
                  isSelected={selectedTables.has(table.id)}
                />
              </SourceTableItem>
            ))
          }
        </tbody>
      </table>
    </div>
  ); // end return statement

  function TableDetail({
    id, 
    name, 
    type, 
    row_count, 
    column_count, 
    date_created, 
    last_modified,
    isSelected
  }) {

    const items = [name, type, column_count,  row_count, date_created, last_modified ];
    const isDisabled = items.join("^").indexOf(searchString) < 0;

    return (
      <>
            <td className="table-data">
                {(isSelected) ? (
                    <CheckBox />
                ) : (
                    <CheckBoxOutlineBlank />
                )}
            </td>
            {items.map((text, i) => (
                <td key={i} className="table-data">
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        <HighlightText pattern={searchString} text={String(text)} />
                    </Typography> 
                </td>
            ))}
          </>
    )
} // TableDetail

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
