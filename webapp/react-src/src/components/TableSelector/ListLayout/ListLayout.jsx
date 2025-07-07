/**
 * ListLayout.jsx
 *
 * An unordered list layout for tables when the sidebar is collasped to
 * a specific width.
 */
import { List } from "@mui/material";
// import { TableContainer } from "../../Containers";
import TableView from "./TableListItemView";
import withAllTablesData from "../../HOC/withAllTablesData";

export const LAYOUT_ID = "list";

function ListLayout({ searchString, tables, loading, error }) {
  return (
    <List
      className="list-layout"
      dense
      sx={{
        height: "inherit",
        overflowY: "auto",
      }}
    >
      {tables
        .toSorted((tableA, tableB) => {
          const [a, b] = [
            tableA.name.toLowerCase().includes(searchString),
            tableB.name.toLowerCase().includes(searchString),
          ];
          return a === b ? 0 : a < b ? 1 : -1;
        })
        .map((sourceTable) => (
          <TableView
            key={sourceTable.id}
            id={sourceTable.id}
            isDraggable={true}
            searchString={searchString}
          />
        ))}
    </List>
  );
} // end ListLayout()

const EnhancedListLayout = withAllTablesData(ListLayout);
export default EnhancedListLayout;
