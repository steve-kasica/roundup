/**
 * SourceTables.jsx
 * 
 * A component for displaying and interacting with the set of source tables.
 */

import {TableLayout, ListLayout} from "./layouts";
import { useSelector } from "react-redux";
import { addTable, insertTableInGroup, removeTableFromTree } from "../../data/tableTreeSlice";
import { useDispatch } from "react-redux";
import { isTable } from "../../lib/types/Table";
import { ADD_TO_GROUP, setSearchString, SYSTEM_DECIDES } from "../../data/uiSlice";
import { STACK } from "../../lib/types/Operation";
import "./style.css"
import SearchBar from "./SearchBar";

import {useGetWorkflowSchemasQuery} from "../../services/workflows";

const TABLE_LAYOUT = "table";
const LIST_LAYOUT = "list";
const FIRST_PANE_THRESHOLD = 30;

export default function SourceTables() {
    const dispatch = useDispatch();

    const {ui, selectedTables} = useSelector(({ ui, tableTree }) => ({
        ui,
        // TODO: does the whole component re-render everytime a table is selected?        
        selectedTables: new Set(tableTree.tree
            .filter(node => isTable(node))
            .map(table => table.id))
    }));

    const layout = (ui.firstPaneWidth < FIRST_PANE_THRESHOLD) ? LIST_LAYOUT : TABLE_LAYOUT;
    const { data: sourceTables, error, isLoading } = useGetWorkflowSchemasQuery(ui.workflow.value);

    return (
        <>
            <h3>Source tables</h3>
            <SearchBar
                placeholder="Search tables"
                onChange={({currentTarget}) => dispatch(setSearchString(currentTarget.value))}
            />
            {(error || isLoading) ? (
                <p>TODO...</p>
            ) : (sourceTables && layout === LIST_LAYOUT) ? (
                <ListLayout 
                    searchString={ui.searchString} 
                    handleTablePrimaryClick={handleTablePrimaryClick}
                    sourceTables={sourceTables} 
                    selectedTables={selectedTables}
                />
            ) : (sourceTables && layout === TABLE_LAYOUT) ? (
                <TableLayout 
                    searchString={ui.searchString} 
                    handleTablePrimaryClick={handleTablePrimaryClick}
                    handleSelectAllClick={handleSelectAllClick}
                    sourceTables={sourceTables}
                    selectedTables={selectedTables}
                />
            ) : null}        
        </>
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
                .forEach(table => dispatch(addTable({table, operationType: STACK })));
        } else if (!checked) {
            // Unselect all selected soruce tables
            sourceTables
                .filter(({id}) => selectedTables.has(id))
                .forEach(table => dispatch(removeTableFromTree(table)));            
        }
    }
}