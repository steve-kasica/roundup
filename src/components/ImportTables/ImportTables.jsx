/**
 * ImportTables.jsx
 * ----------------------------------------------------------
 * This file handles the layout for the ImportTables component
 */
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Paper } from '@mui/material';
import WorkflowSelector from "./WorkflowSelector";
import SearchBar from "../ui/SearchBar";
import { useState } from "react";
import TableStack from "./TableStack/TableStack";
import { useSelector } from "react-redux";
import TableSelector from './TableSelector/TableSelector';
import {useGetWorkflowSchemasQuery} from "../../services/workflows";
import { DragIndicator } from '@mui/icons-material';

export const TABLE_LAYOUT = "table";
export const LIST_LAYOUT = "list";

const SIDEBAR_MIN = 20;         // size before hidden 
const SIDEBAR_DEFAULT = 50;     // size on page load
const SIDEBAR_THRESHOLD = SIDEBAR_DEFAULT - 1;   // when sidebar goes from list to table layout
const SIDEBAR_MAX = 75;         // maximum size of sidebar

export default function ImportTables() {
    const [layout, setLayout] = useState(TABLE_LAYOUT);
    const [searchString, setSearchString] = useState("");

    const { workflow } = useSelector(({ui}) => ui);
    const { data: sourceTables, error, isLoading } = useGetWorkflowSchemasQuery(workflow);

    return (
        <PanelGroup 
            autoSaveId="roundup-panel-layout"
            direction='horizontal'
        >
            <Panel
                collapsible={true}
                minSize={SIDEBAR_MIN}
                defaultSize={SIDEBAR_DEFAULT}
                maxSize={SIDEBAR_MAX}
                order={1}
                style={{
                    height: "100vh"
                }}
                onResize={handleOnResize}
            >
                <WorkflowSelector />
                <br />
                <SearchBar
                    placeholder="Search tables"
                    onChange={({currentTarget}) => setSearchString(currentTarget.value)}                                
                />
                <TableSelector 
                    searchString={searchString} 
                    layout={layout}
                    sourceTables={sourceTables}
                    error={error}
                    isLoading={isLoading}
                />                
            </Panel>
            <PanelResizeHandle style={{
                width: "15px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <DragIndicator />
            </PanelResizeHandle>
            <Panel order={2}>
                <Paper sx={{
                    borderRadius: "5px",
                    padding: "10px",
                    height: "100vh"
                }}>
                    <TableStack />
                </Paper>
            </Panel>
      </PanelGroup>
    );

    function handleOnResize(size) {
        if (size < SIDEBAR_THRESHOLD && layout === TABLE_LAYOUT) {
            setLayout(LIST_LAYOUT);
        } else if (size > SIDEBAR_THRESHOLD && layout === LIST_LAYOUT) {
            setLayout(TABLE_LAYOUT);
        }
    }
}