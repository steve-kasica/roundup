/**
 * ListLayout.jsx
 * 
 * An unordered list layout for tables when the sidebar is collasped to
 * a specific width.
 */
import { List } from "@mui/material";
import TableView, { TABLE_LAYOUT_LIST_ITEM } from "../../TableView";
import { isTable } from "../../../lib/types/Table";

export default function TablesList({
    searchString, 
    sourceTables,
    selectedTableIds
}) {

    return (
        <>
            <List
                className="list-layout" 
                dense 
                sx={{ 
                    height: "inherit", 
                    overflowY: "auto"
                }}
            >
                {
                sourceTables
                    .toSorted((tableA, tableB) => {
                        const [a, b] = [tableA.name.includes(searchString), tableB.name.includes(searchString)];
                        return (a === b) ? 0 : (a < b) ? 1 : -1;
                    })
                    .map(table => (
                        <TableView
                            key={table.id}
                            table={table}
                            layout={TABLE_LAYOUT_LIST_ITEM}
                            isSelected={selectedTableIds.has(table.id)}
                        />
                    ))
                }
            </List>
        </>
    );
}  // end ListLayout()