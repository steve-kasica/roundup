/**
 * TableLayout.jsx
 * -------------------------------
 */
import { Button, IconButton } from "@mui/material";
import { ArrowDown01, ArrowDownAZ, ArrowDownNarrowWide, ArrowUp10, ArrowUpDown, ArrowUpWideNarrow, ArrowUpZA } from "lucide-react";
import { useState } from "react";
import { ascending, descending } from "d3";
import { CheckBoxOutlineBlank } from "@mui/icons-material";
import TableContainer from "../../../TableContainer";

// TODO: move this to SourceColumn Type
const COLUMN_TYPE_CATEGORICAL = "categorical";
const COLUMN_TYPE_NUMERIC = "numeric";
const COLUMN_TYPE_DATE = "date";

export default function TableLayout({ searchString, sourceTables, loading, error }) {
  const [sortAttribute, setSortAttribute] = useState(null);
  const [isAscending, setIsAscending] = useState(true);

  // const areAllTablesSelected = (sourceTables.length === selectedTableIds.size);
  // const areSomeTablesChecked = selectedTableIds.size > 0;
  const areAllTablesSelected = false;
  const areSomeTablesChecked = false;

  const headers=[
    {attr: "name", label: "Name", tooltip: "Sort by selected tables", attrType: COLUMN_TYPE_CATEGORICAL},
    {attr: "tags", label: "Tags", tooltip: "", },
    {attr: "rowCount", label: "Rows", tooltip: "Sort by total rows", attrType: COLUMN_TYPE_NUMERIC},
    {attr: "columnCount", label: "Columns", tooltip: "Sort by total columns", attrType: COLUMN_TYPE_NUMERIC},
    {attr: "dateCreated", label: "Created", tooltip: "Sort by date created", attrType: COLUMN_TYPE_DATE},
    {attr: "dateLastModified", label: "Modified", tooltip: "Sort by date last modified", attrType: COLUMN_TYPE_DATE},
  ];

  return (
    <div className="table-layout">
      <table>
        <thead>
          <tr>
            {/* <Tooltip placement="top" title="Sort by selected tables"> */}
            <th style={{minWidth: "65px"}}>
              <IconButton
                onClick={() => {
                  if ("isSelected" === sortAttribute) {
                    setIsAscending(!isAscending)
                  } else {
                    setSortAttribute("isSelected");
                  }
                }}
              >
                  <CheckBoxOutlineBlank />
                  {/* &nbsp;
                  <SortIcon isSort={"isSelected"=== sortAttribute} attrType="boolean" />                   */}
              </IconButton>
            </th>
            {/* </Tooltip>             */}
            {headers.map(header => (
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
                  <SortIcon isSort={header.attr === sortAttribute} attrType={header.attrType}/>
                </Button>
              </th>
            ))}
            </tr>
        </thead>
        <tbody>
          {
            (loading || error) 
              ? (<tr><td>Loading/error</td></tr>)
              : sourceTables
                .toSorted((a, b) => (isAscending)
                  ? ascending(a[sortAttribute], b[sortAttribute])
                  : descending(a[sortAttribute], b[sortAttribute]))
                .map(table => (
                  <TableContainer id={table.id} layout="row" isDraggable={true} />
                ))
          }
        </tbody>
      </table>
    </div>
  ); // end return statement

  function SortIcon({attr, isSort, attrType}) {
    const iconProps = {strokeWidth: 1, size: 18};

    let AscIcon, DescIcon;
    if (attrType === COLUMN_TYPE_CATEGORICAL) {
      [AscIcon, DescIcon] = [ArrowDownAZ, ArrowUpZA];
    } else if (attrType === COLUMN_TYPE_NUMERIC) {
      [AscIcon, DescIcon] = [ArrowDown01, ArrowUp10];
    } else {
      [AscIcon, DescIcon] = [ArrowDownNarrowWide, ArrowUpWideNarrow];          
    }

    return (
      (isSort) 
        ? (isAscending)
          ? <AscIcon {...iconProps} /> 
          : <DescIcon {...iconProps} />
        : <ArrowUpDown {...iconProps} />
    );
  }
}
