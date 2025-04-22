/**
 * ListLayout.jsx
 *
 * An unordered list layout for tables when the sidebar is collasped to
 * a specific width.
 */
import { List } from "@mui/material";
import { TableContainer } from "../../Containers";
import TableListItemView from "./TableListItemView";

export const LAYOUT_ID = "list";

export default function ListLayout({
  searchString,
  sourceTables,
  loading,
  error,
}) {
  return (
    <List
      className="list-layout"
      dense
      sx={{
        height: "inherit",
        overflowY: "auto",
      }}
    >
      {sourceTables
        .toSorted((tableA, tableB) => {
          const [a, b] = [
            tableA.name.includes(searchString),
            tableB.name.includes(searchString),
          ];
          return a === b ? 0 : a < b ? 1 : -1;
        })
        .map((sourceTable) => (
          <TableContainer
            key={sourceTable.id}
            id={sourceTable.id}
            isDraggable={true}
          >
            <TableListItemView />
          </TableContainer>
        ))}
    </List>
  );
} // end ListLayout()
