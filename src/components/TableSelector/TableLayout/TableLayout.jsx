/**
 * TableLayout.jsx
 * -------------------------------
 */
import { Button, Tooltip } from "@mui/material";
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
import PropTypes from "prop-types";
import {
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_DATE,
  COLUMN_TYPE_CATEGORICAL,
} from "../../../slices/columnsSlice";

// TODO: move this to SourceColumn Type

export const LAYOUT_ID = "table";

const headers = [
  {
    attr: "name",
    label: "Name",
    tooltip: "Sort by selected tables",
    attrType: COLUMN_TYPE_CATEGORICAL,
  },
  {
    attr: "mimeType",
    label: "Type",
    tooltip: "Sort by file type",
    attrType: COLUMN_TYPE_CATEGORICAL,
  },
  {
    attr: "??",
    label: "Group",
    tooltip: "Sort by group",
    attrType: COLUMN_TYPE_CATEGORICAL,
  },
  {
    attr: "size",
    label: "Size",
    tooltip: "Sort by file size",
    attrType: COLUMN_TYPE_NUMERICAL,
  },
  {
    attr: "rowCount",
    label: "Rows",
    tooltip: "Sort by total rows",
    attrType: COLUMN_TYPE_NUMERICAL,
  },
  {
    attr: "columnCount",
    label: "Columns",
    tooltip: "Sort by total columns",
    attrType: COLUMN_TYPE_NUMERICAL,
  },
  {
    attr: "dateLastModified",
    label: "Modified",
    tooltip: "Sort by date last modified",
    attrType: COLUMN_TYPE_DATE,
  },
];

export default function TableLayout({
  searchString,
  tables,
  rowMax,
  columnMax,
  bytesMax,
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
                  <Tooltip placement="top" title={header.tooltip}>
                    {header.label}
                  </Tooltip>
                  &nbsp;
                  <SortIcon
                    attr={header.attr}
                    isSort={header.attr === sortAttribute}
                    attrType={header.attrType}
                    isAscending={isAscending}
                  />
                </Button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableIds.map((id) => (
            <TableRowView
              key={id}
              id={id}
              searchString={searchString}
              rowMax={rowMax}
              columnMax={columnMax}
              bytesMax={bytesMax}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

TableLayout.propTypes = {
  searchString: PropTypes.string,
  tables: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowMax: PropTypes.number.isRequired,
  columnMax: PropTypes.number.isRequired,
  bytesMax: PropTypes.number.isRequired,
};

function SortIcon({ attr, isSort, attrType, isAscending }) {
  const iconProps = { strokeWidth: 1, size: 18 };

  let AscIcon, DescIcon;
  if (attrType === COLUMN_TYPE_CATEGORICAL) {
    [AscIcon, DescIcon] = [ArrowDownAZ, ArrowUpZA];
  } else if (attrType === COLUMN_TYPE_NUMERICAL) {
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

SortIcon.propTypes = {
  attr: PropTypes.string,
  isSort: PropTypes.bool,
  attrType: PropTypes.string,
  isAscending: PropTypes.bool.isRequired,
};
