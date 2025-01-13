/**
 * 
 */

import MuiDrawer from "@mui/material/Drawer";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from "@mui/material/Typography";

// All icon imports are aliases of default export
import SourceColumnsIcon from "@mui/icons-material/ViewColumn";
import IssuesIcon from "@mui/icons-material/Flag";
import SourceTablesIcon from "@mui/icons-material/Source";
import ExportIcon from "@mui/icons-material/Share";
import SettingsIcon from "@mui/icons-material/Settings"

import { useDispatch, useSelector } from "react-redux";
import { 
    setSidebarStatus, 
    initialState,
    SIDEBAR_SOURCE_COLUMNS, 
    SIDEBAR_ISSUES, 
    SIDEBAR_SOURCE_TABLES, 
    SIDEBAR_EXPORT, 
    SIDEBAR_CONFIG
} from "../data/uiSlice";

import { styled } from '@mui/material/styles';

const navigationItems = [
    {
        id: SIDEBAR_SOURCE_TABLES,
        label: "Source tables",
        icon: SourceTablesIcon,
    },
    {
        id: SIDEBAR_SOURCE_COLUMNS,
        label: "Select columns",
        icon: SourceColumnsIcon,
    },
    {
        id: SIDEBAR_ISSUES,
        label: "Issues",
        icon: IssuesIcon,
    },{
        id: SIDEBAR_EXPORT,
        label: "Export",
        icon: ExportIcon,
    },{
        id: SIDEBAR_CONFIG,
        label: "Settings",
        icon: SettingsIcon,
    }
];

const getStage = (ui, issues) => {
    const isWorkflow = (ui.workflow !== initialState.workflow);
    const areIssues = issues.areIssues;
    if (!isWorkflow && !areIssues) {
        return SIDEBAR_SOURCE_TABLES;
    } else if (isWorkflow && !areIssues) {
        return SIDEBAR_SOURCE_COLUMNS;
    } else if (isWorkflow && areIssues) {
        return SIDEBAR_ISSUES;
    } else {
        console.error("Strange app state");
        return -1;
    }
}

export default function() {
    const dispatch = useDispatch();
    const [activeItem, currentStage] = useSelector(({ui, issues}) => [
        ui.sidebarStatus,
        getStage(ui, issues)
    ]);

    return (
        <List sx={{
            height: "inherit"
        }}>
            {navigationItems.map((item, i) => (
                <ListItem 
                    key={`nav-item-${i}`} 
                    disablePadding
                >
                    <ListItemButton
                        onClick={() => dispatch(setSidebarStatus(item.id))}
                        selected={(activeItem === item.id)}
                        disabled={false}
                        sx={{
                            justifyContent: "center",
                            paddingBottom: "5px"
                        }}
                    >
                        <ListItemIcon sx={{
                            flexDirection: "column",
                            width: "100%"
                        }}>
                            <item.icon sx={{ 
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
                                {item.label}
                            </Typography>
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}