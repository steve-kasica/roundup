/**
 * TablesTable.jsx
 * -------------------------------
 */
import { properties as tableProperties } from "../../../../lib/types/Table";
import { Button, Checkbox, Typography } from "@mui/material";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { ascending, descending } from "d3";
import TableView, { TABLE_LAYOUT_ROW } from "../../../TableView";

const columns = tableProperties
  .map((prop) => ({
    prop,
    label: prop.replace("_", " ")
  }));

export default function TableLayout({ 
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
    <div className="table-layout">
      <table>
        <thead>
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
        <tbody>
          {
            rows.map(table => (
              <TableView 
                key={table.id}
                table={table}
                layout={TABLE_LAYOUT_ROW}
              />
            ))
          }
        </tbody>
      </table>
    </div>
  ); // end return statement

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
