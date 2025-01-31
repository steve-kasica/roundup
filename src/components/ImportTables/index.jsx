


import { Grid3x3Icon } from "lucide-react";

import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Paper } from '@mui/material';
import TableSelection from "./TableSelection";
import { DataGrid } from '@mui/x-data-grid';
import WorkflowSelector from "./WorkflowSelector";

import { useState } from "react";
import TableStack from "./TableStack";

const TableIcon = Grid3x3Icon;

export default function ImportTables() {
    const sidebarSize = {min: 10, default: 20, max: 50};
    const [panelSize, setPanelSize] = useState(sidebarSize.default);

    return (
        <PanelGroup 
            autoSaveId="roundup-panel-layout"
            direction='horizontal'
        >
            <Panel
                collapsible={true}
                minSize={sidebarSize.min}
                defaultSize={sidebarSize.default}
                maxSize={sidebarSize.max}
                order={1}
                onResize={setPanelSize}
            >
                <WorkflowSelector />
                <br />
                <TableSelection 
                    size={panelSize} 
                />
            </Panel>
            <PanelResizeHandle 
                className="panel-resize-handle"
            />
            <Panel order={2}>
                <Paper sx={{
                    borderRadius: "5px",
                    padding: "10px"
                }}>
                    <TableStack />
                </Paper>
            </Panel>
      </PanelGroup>
    );

    function handleOnResize(size) {
        if (size < layoutThreshold && layout === TABLE_LAYOUT) {
            setLayout(LIST_LAYOUT);
        } else if (size > layoutThreshold && layout === LIST_LAYOUT) {
            setLayout(TABLE_LAYOUT);
        }
    }
}