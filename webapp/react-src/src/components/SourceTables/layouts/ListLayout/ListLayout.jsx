/**
 * ListLayout.jsx
 * 
 * An unordered list layout for tables when the sidebar is collasped to
 * a specific width.
 */
import { List } from "@mui/material";
import TableView, { TABLE_LAYOUT_LIST_ITEM } from "../../../TableView";
import ListItem from "./ListItem";

export default function TablesList({
    searchString, 
    sourceTables,
    loading,
    error,
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
                    .map(sourceTable => (
                        <ListItem 
                            key={sourceTable.id}
                            sourceTable={sourceTable}
                            searchString={searchString}
                        />
                    ))
                }
            </List>
        </>
    );
}  // end ListLayout()