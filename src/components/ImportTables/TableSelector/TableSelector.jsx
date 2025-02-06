/**
 * TableSelector.jsx
 * ------------------------------------
 */

import {TableLayout, ListLayout} from "./layouts";
import { useSelector } from "react-redux";
import { LIST_LAYOUT, TABLE_LAYOUT } from "../ImportTables";
import { addTableToTree, insertTableInGroup, removeTableFromTree } from "../../../data/tableTreeSlice";
import { useDispatch } from "react-redux";
import { isTable } from "../../../lib/types/Table";
import { ADD_TO_GROUP, SYSTEM_DECIDES } from "../../../data/uiSlice";

export default function TableSelector({
    searchString,
    layout,
    sourceTables,
    error,
    isLoading
}) {

    const dispatch = useDispatch();
    const {insertionMode, selectedTables, focusedNode} = useSelector(({ ui, tableTree }) => ({
        insertionMode: ui.insertionMode,
        focusedNode: ui.focusedNode,
        // TODO: does the whole component re-render everytime a table is selected?        
        selectedTables: new Set(tableTree.tree
            .filter(node => isTable(node))
            .map(table => table.id))
    }));

    return (
        (error || isLoading) ? (
            <p>TODO...</p>
        ) : (sourceTables && layout === LIST_LAYOUT) ? (
            <ListLayout 
                searchString={searchString} 
                handleTablePrimaryClick={handleTablePrimaryClick}
                sourceTables={sourceTables} 
                selectedTables={selectedTables}
            />
        ) : (sourceTables && layout === TABLE_LAYOUT) ? (
            <TableLayout 
                searchString={searchString} 
                handleTablePrimaryClick={handleTablePrimaryClick}
                handleSelectAllClick={handleSelectAllClick}
                sourceTables={sourceTables}
                selectedTables={selectedTables}
            />
        ) : null
    );

    function handleTablePrimaryClick(table, isSelected) {
        if (insertionMode === ADD_TO_GROUP) {
            if (!isSelected) {
                // Add table to a specific operation and conclude MODE_ADD_TABLE_TO_GROUP
                dispatch(insertTableInGroup({table, focusedNode}));
                dispatch(setInsertionMode(SYSTEM_DECIDES));
                dispatch(setFocusedNode(null));
            } else {
                throw Error("Table should be disabled");   
            }
        } else if (insertionMode === SYSTEM_DECIDES) {
            if (!isSelected) {
                dispatch(addTableToTree(table));
            } else {
                dispatch(removeTableFromTree(table));
            }
        } else {
            throw Error("Unknown app state!");
        }
    }

    function handleSelectAllClick({checked}) {
        // TODO: refactor into one dispatch event for adding and removing
        if (checked) {
            // Select all unseleted source tables
            sourceTables
                .filter(({id}) => !selectedTables.has(id))
                .forEach(table => dispatch(addTableToTree(table)));
        } else if (!checked) {
            // Unselect all selected soruce tables
            sourceTables
                .filter(({id}) => selectedTables.has(id))
                .forEach(table => dispatch(removeTableFromTree(table)));            
        }
    }
}