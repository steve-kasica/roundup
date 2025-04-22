/**
 * NavigationRail.jsx
 * 
 * A component for rendering the navigation bar on the left-hand side of the application
 * The order of menu items in the navigation bar corresponds to the intended
 * workflow stages the user iterates through when rounding up tables.
 */

import { List, ListItem, ListItemButton, ListItemIcon, Typography } from "@mui/material";

// All icon imports are aliases of default export
import SourceColumnsIcon from "@mui/icons-material/ViewColumn";
import SourceTablesIcon from "@mui/icons-material/TableChart";
import ExportIcon from "@mui/icons-material/Share";
import SourcesIcon from "@mui/icons-material/Source";
import SettingsIcon from "@mui/icons-material/Settings";

import { useDispatch, useSelector } from "react-redux";
import { 
    setStage, 
    STAGE_ARRANGE_TABLES,
    STAGE_REFINE_OPS,
    STAGE_CONFIG_SOURCES,
    STAGE_EXPORT,
    initialState
} from "../data/uiSlice";
import { createSelector } from "@reduxjs/toolkit";

// TODO: is this necessary
const selectTree = (state) => state.tableTree.tree;
const selectIsTreeEmpty = createSelector([selectTree], (tree) => tree.length === 0);

export default function({currentStage}) {
    const dispatch = useDispatch();
    const {workflow} = useSelector(({ui}) => ui)
    const isTreeEmpty = useSelector(selectIsTreeEmpty);

    const navigationItems = [
        {
            stage: STAGE_CONFIG_SOURCES,
            label: "Configure data sources",
            Icon: SourcesIcon,
            isDisabled: false,
        },
        {
            stage: STAGE_ARRANGE_TABLES,
            label: "Select and arrange tables",
            Icon: SourceTablesIcon,
            isDisabled: (workflow === initialState.workflow),
        },
        {
            stage: STAGE_REFINE_OPS,        
            label: "Refine operations",
            Icon: SourceColumnsIcon,
            isDisabled: (isTreeEmpty),
        },
        {
            stage: STAGE_EXPORT,
            label: "Export table",
            Icon: ExportIcon,
            isDisabled: true,                
        },
        // {
        //     id: "config",
        //     label: "Settings",
        //     Icon: SettingsIcon,
        //     isDisabled: true,                
        // }
    ];

    return (
        <List sx={{
            height: "inherit"
        }}>
            {navigationItems.map(({stage, isDisabled, label, Icon}) => (
                <ListItem 
                    key={stage} 
                    disablePadding
                >
                    <ListItemButton
                        onClick={() => dispatch(setStage(stage))}
                        selected={(stage === currentStage)}
                        disabled={isDisabled}
                        sx={{
                            justifyContent: "center",
                            paddingBottom: "5px"
                        }}
                    >
                        <ListItemIcon sx={{
                            flexDirection: "column",
                            width: "100%"
                        }}>
                            <Icon sx={{ 
                                marginLeft: "auto", 
                                marginRight: "auto"}}
                            />
                            <Typography 
                                variant="button" 
                                sx={{
                                    fontSize: "10px",
                                    textAlign: "center"
                                }}
                            >
                                {label}
                            </Typography>
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}