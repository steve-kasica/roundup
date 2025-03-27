/**
 * SourceTables.jsx
 * 
 * A component for displaying and interacting with the set of source tables.
 */

import {TableLayout, ListLayout} from "./layouts";
import { useSelector } from "react-redux";
import { addTable, insertTableInGroup, removeTable } from "../../data/tableTreeSlice";
import { useDispatch } from "react-redux";
import { isTable } from "../../lib/types/Table";
import { ADD_TO_GROUP, setSearchString, SYSTEM_DECIDES } from "../../data/uiSlice";
import { STACK } from "../../lib/types/Operation";
import SearchBar from "./SearchBar";
import "./SourceTables.scss"

import {useGetWorkflowSchemasQuery} from "../../services/workflows";
import { createSelector } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { fetchTablesRequest } from "../../data/slices/sourceTablesSlice";

const TABLE_LAYOUT = "table";
const LIST_LAYOUT = "list";
const FIRST_PANE_THRESHOLD = 30;

const selectTree = (state) => state.tableTree.tree;
const selectSelectedTableIds = createSelector(
    [selectTree], 
    (tree) => new Set(tree
        .filter(isTable)
        .map(table => table.id))
);

export default function SourceTables() {
    const dispatch = useDispatch();
    // const selectedTableIds = useSelector(selectSelectedTableIds);
    const {firstPaneWidth, searchString} = useSelector(({ui}) => ui);

    const layout = (firstPaneWidth < FIRST_PANE_THRESHOLD) ? LIST_LAYOUT : TABLE_LAYOUT;

    return (
        <div className="SourceTables">
            <h3>Source tables</h3>
            <SearchBar
                placeholder="Search tables"
                onChange={({currentTarget}) => dispatch(setSearchString(currentTarget.value))}
            />
            {(layout === LIST_LAYOUT && false) ? (
                <ListLayout 
                    searchString={searchString} 
                    handleTablePrimaryClick={handleTablePrimaryClick}
                />
            ) : (
                <TableLayout 
                    handleTablePrimaryClick={handleTablePrimaryClick}
                    handleSelectAllClick={handleSelectAllClick}
                />
            )}        
        </div>
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
                dispatch(addTable({table, operationType: STACK}));
            } else {
                dispatch(removeTable(table));
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
                .filter(({id}) => !selectedTableIds.has(id))
                .forEach(table => dispatch(addTable({table, operationType: STACK })));
        } else if (!checked) {
            // Unselect all selected soruce tables
            sourceTables
                .filter(({id}) => selectedTableIds.has(id))
                .forEach(table => dispatch(removeTable(table)));            
        }
    }
}