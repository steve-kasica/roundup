/**
 * TableLayout.jsx
 * -------------------------------
 */
import { Button } from "@mui/material";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowUp10,
  ArrowUpDown,
  ArrowUpWideNarrow,
  ArrowUpZA,
} from "lucide-react";
import { useState } from "react";
import { ascending, descending } from "d3";
import TableRowView from "./TableRowView";
import "./TableLayout.scss";

// TODO: move this to SourceColumn Type
const COLUMN_TYPE_CATEGORICAL = "categorical";
const COLUMN_TYPE_NUMERIC = "numeric";
const COLUMN_TYPE_DATE = "date";

export const LAYOUT_ID = "table";

export default function TableLayout({
  searchString,
  tables,
  tableSelection,
  setTableSelection,
  loading,
  error,
}) {
  const [sortAttribute, setSortAttribute] = useState(null);
  const [isAscending, setIsAscending] = useState(true);

  const tableIds = tables
    .toSorted((a, b) =>
      isAscending
        ? ascending(a[sortAttribute], b[sortAttribute])
        : descending(a[sortAttribute], b[sortAttribute])
    )
    .map((table) => table.id);

  const headers = [
    {
      attr: "name",
      label: "Name",
      tooltip: "Sort by selected tables",
      attrType: COLUMN_TYPE_CATEGORICAL,
    },
    { attr: "tags", label: "Tags", tooltip: "" },
    {
      attr: "rowCount",
      label: "Rows",
      tooltip: "Sort by total rows",
      attrType: COLUMN_TYPE_NUMERIC,
    },
    {
      attr: "columnCount",
      label: "Columns",
      tooltip: "Sort by total columns",
      attrType: COLUMN_TYPE_NUMERIC,
    },
    {
      attr: "dateCreated",
      label: "Created",
      tooltip: "Sort by date created",
      attrType: COLUMN_TYPE_DATE,
    },
    {
      attr: "dateLastModified",
      label: "Modified",
      tooltip: "Sort by date last modified",
      attrType: COLUMN_TYPE_DATE,
    },
  ];

  return (
    <div className="TableLayout">
      <table>
        <thead>
          <tr>
            <th></th>
            {headers.map((header) => (
              <th key={header.attr}>
                <Button
                  color="inherit"
                  fullWidth
                  onClick={() => {
                    if (header.attr === sortAttribute) {
                      setIsAscending(!isAscending);
                    } else {
                      setSortAttribute(header.attr);
                    }
                  }}
                >
                  {/* <Tooltip placement="top" title={header.tooltip}> */}
                  {header.label}
                  {/* </Tooltip> */}
                  &nbsp;
                  <SortIcon
                    isSort={header.attr === sortAttribute}
                    attrType={header.attrType}
                  />
                </Button>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading || error ? (
            <tr>
              <td>Loading/error</td>
            </tr>
          ) : (
            tableIds.map((id, i) => (
              <TableRowView
                key={id}
                id={id}
                isDraggable={true}
                setTableSelection={setTableSelection}
                isSelectedRow={tableSelection.includes(id)} // avoids name collision with isSelected
                // updateTableSelection={updateTableSelection}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  ); // end return statement

  function SortIcon({ attr, isSort, attrType }) {
    const iconProps = { strokeWidth: 1, size: 18 };

    let AscIcon, DescIcon;
    if (attrType === COLUMN_TYPE_CATEGORICAL) {
      [AscIcon, DescIcon] = [ArrowDownAZ, ArrowUpZA];
    } else if (attrType === COLUMN_TYPE_NUMERIC) {
      [AscIcon, DescIcon] = [ArrowDown01, ArrowUp10];
    } else {
      [AscIcon, DescIcon] = [ArrowDownNarrowWide, ArrowUpWideNarrow];
    }

    return isSort ? (
      isAscending ? (
        <AscIcon {...iconProps} />
      ) : (
        <DescIcon {...iconProps} />
      )
    ) : (
      <ArrowUpDown {...iconProps} />
    );
  }

  function getTrueRange(arr) {
    let maxStart = -1,
      maxEnd = -1,
      maxLen = 0;
    let currStart = -1,
      currLen = 0;

    arr.forEach((val, i) => {
      if (val) {
        if (currStart === -1) currStart = i;
        currLen++;
        if (currLen > maxLen) {
          maxLen = currLen;
          maxStart = currStart;
          maxEnd = i;
        }
      } else {
        currStart = -1;
        currLen = 0;
      }
    });

    return maxLen > 0 ? [maxStart, maxEnd] : null;
  }
}
