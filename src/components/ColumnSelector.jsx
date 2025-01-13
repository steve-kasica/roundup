/**
 * SourceTables/index.js
 * -------------------------------------------------------------------------
 */

import { useState } from "react"
import { ascending, descending, group } from "d3"

// MUI components
import { Box, Button, Checkbox, Collapse, Divider, IconButton, Input, InputAdornment, InputBase, Menu, MenuItem, OutlinedInput, ToggleButton, ToggleButtonGroup } from "@mui/material"
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Popover from "@mui/material/Popover";
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import ColumnDetailIcon from '@mui/icons-material/InfoOutlined';
import CategoricalTypeIcon from '@mui/icons-material/AbcRounded';
import { ExpandMore, MoreVert, Search } from "@mui/icons-material"
import AscendingIcon from "@mui/icons-material/ArrowUpward";
import DescendingIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import ColumnGroupMenuIcon from "@mui/icons-material/MoreHoriz";
import { Check } from "@mui/icons-material"

// in-house components
import HighlightText from "./HighlightText.jsx";

import { useGetWorkflowSchemasQuery } from "@/services/workflows";
import { useDispatch, useSelector } from "react-redux"

import { toggleColumnSelection, selectColumns, selectColumn, deselectColumns } from "../data/schemaSlice.js"
import ColumnDetail from "./ColumnDetail.jsx"
import { ImportContacts } from "@mui/icons-material"

const itemPaddingY = 8;
const itemPaddingX = 16;
const iconWidth = 40;
const iconHeight = iconWidth;

// func return double as grouping key and sub-heading label for
// each list group
const columnGroups = [
    {
        label: "None",
        func: () => ""  // puts all columns in one big group
    },
    {
        label: "Table name",
        func: (column) => column.tableName
    },{
        label: "Column name",
        func: (column) => column.name
    },{
        label: "Column index",
        func: (column) => `Index ${column.index + 1}` 
    },{
        label: "Column type",
        func: (column) => column.columnType
    }
];

columnGroups.initalState = 0;

const sortDirectionOptions = [
    {
        value: 1,
        label: "ascending",
        Icon: AscendingIcon
    },{
        value: -1,
        label: "descending",
        Icon: DescendingIcon
    }
];

// const columnGroups = (function() {
//     // Define valid options for column groups
//     const optionNone = 0;
//     const optionTableName = 1;
//     const optionColumnName = 2;
//     const optionColumnIndex = 3;
//     const optionColumnType = 4;

//     const map = new Map();
    
//     map.set(optionTableName, { 

//     });
    
//     map.set(optionColumnName, { 

//     });
    
//     map.set(optionColumnIndex, {
//     });

//     map.set(optionColumnType, {
//     });

//     return { 
//         getGroup: (id) => map.get(id),
//         optionNone,
//         initialState: {id: optionNone, label: map.get(optionNone).label},
//         options: [...map.keys()].map(id => ({id, label: map.get(id).label}))
//     };

// })();

function ColumnTypeIcon({columnType}) {
    const props = {sx: {marginLeft: "auto", marginRight: "auto" }};
    switch(columnType) {
        default:
            return <CategoricalTypeIcon {...props}/>
    }
}


const selectId = "column-group-select";
const selectLabelId = "column-group-select-label";

// Component
// ------------------------------------------------------------------------------------------------------
export default () => {
    const dispatch = useDispatch();

    // Search state
    const [columnGroupIndex, setColumnGroupIndex] = useState(columnGroups.initalState);
    const [sortDirection, setSortDirection] = useState(sortDirectionOptions.at(0).value);
    const [searchString, setSearchString] = useState("");
    const [searchMenuEl, setSearchMenuEl] = useState(null);
    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);

    const [focusedColumn, setFocusedColumn] = useState({anchorEl: null});
    const isPopoverOpen = Boolean(focusedColumn.anchorEl);

    const [subheaderMenu, setSubheaderMenu] = useState({anchorEl: null, columnInstances: []});
    const isSubheaderMenuOpen = Boolean(subheaderMenu.anchorEl);

    let columns;

    const {workflow, selectedColumns} = useSelector(({ui, schema}) => {
        return {
            ...ui,
            selectedColumns: schema.data.flat().filter(column => column).map(column => column.id)
        };
    });

    const { data: tables, error, isLoading } = useGetWorkflowSchemasQuery(workflow);
    
    if (tables) {
        columns = !tables ? [] : tables
            .map(table => table.columns.map(column => ({
                ...column, 
                tableName: table.name,
                isSelected: selectedColumns.includes(column.id)
            })))
            .flat();

        columns = Array.from(group(columns, columnGroups.at(columnGroupIndex).func));
        columns.sort((sortDirection === 1) ? ascending : descending)
    }

    const subheaderMenuItems = [
        {
            text: "Select all", 
            isDisabled: subheaderMenu.columnInstances.filter(column => !column.isSelected).length === 0,
            onClickHandler: () => dispatch(selectColumns(subheaderMenu.columnInstances))
        },{
            text: "Deselect all",
            isDisabled: subheaderMenu.columnInstances.filter(column => column.isSelected).length === 0,
            onClickHandler: () => dispatch(
                deselectColumns(
                    subheaderMenu.columnInstances.filter(column => column.isSelected)
                )
            )
        }
    ]

    return (error || isLoading) 
        ? (
            <p>Loading</p>
        ) : (
            <>
                <Box sx={{
                    padding: "5px 10px", 
                    margin: "5px",
                    backgroundColor: "#ECECEC", 
                    borderRadius: "10px"
                }}>
                    <Input
                        id="column-search-input"
                        type="text"
                        fullWidth
                        dense
                        disableUnderline={true}
                        placeholder={columnGroups.at(columnGroupIndex).label}
                        onChange={({target}) => setSearchString(target.value)}
                        startAdornment={
                            <InputAdornment sx={{padding: "0 10px 0 0"}}>
                                <SearchIcon />
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment>
                                <IconButton
                                        aria-label="Search settings"
                                        edge="end"
                                        size="small"
                                        onClick={() => setIsSearchMenuOpen(!isSearchMenuOpen)}
                                    >
                                        <ExpandMore />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <Collapse 
                        in={isSearchMenuOpen}
                    >
                        <Box sx={{padding: "10px", backgroundColor: "inherit"}}>
                        <FormControl fullWidth sx={{maxHeight: "15vh" }}>
                            <InputLabel id={selectLabelId}>Sort by</InputLabel>
                            <Select
                                labelId={selectLabelId}
                                id={selectId}
                                value={columnGroupIndex}
                                onChange={(event) => setColumnGroupIndex(event.target.value)}
                                label="Sort by"
                            >
                                {columnGroups.map(({label}, i) => (
                                    <MenuItem 
                                        key={`${i}-item`} 
                                        value={(i > 0) ? i : ""}
                                    >
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{margin: "10px 0"}}>
                            <InputLabel id="column-sort-input-label">Sort direction</InputLabel>
                            <Select
                                labelId="column-sort-input-label"
                                id="column-sort-input"
                                value={sortDirection}
                                onChange={({target}) => {
                                    setSortDirection(target.value)}
                                }
                                label="Sort direction"
                            >
                                {sortDirectionOptions.map(({value, label, Icon}, i) => (
                                    <MenuItem
                                        key={i}
                                        value={value}
                                    >
                                        <Icon />
                                        &nbsp;
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl> 
                        </Box>
                    </Collapse>
                </Box>
                <List
                    sx={{ 
                        maxHeight: "100vh", 
                        overflow: "auto",
                        padding: "0"
                    }}
                    dense
                >
                {columns.map(([groupLabel, columnInstances]) => (
                    <>
                    <li key={`section-${groupLabel}`}>
                        <ul style={{
                            margin: "5px",
                            outline: "1px solid #ddd",
                            borderRadius: "10px"
                        }}>
                        {
                            (false) ? (
                                <ListSubheader sx={{ 
                                    display: (groupLabel !== "") ? "flex" : "none", 
                                    padding: "0 0 0 5px",
                                    lineHeight: "20px"
                                }}>                    
                                    <HighlightText 
                                        pattern={searchString} 
                                        text={groupLabel} 
                                    />
                                    <Menu
                                        id={`column-${groupLabel}-submenu`}
                                        anchorEl={subheaderMenu.anchorEl}
                                        open={isSubheaderMenuOpen}
                                        onClose={() => setSubheaderMenu({
                                            columnInstances: [],
                                            anchorEl: null
                                        })}
                                    >
                                        {subheaderMenuItems.map(({text, isDisabled,onClickHandler}, i) => (
                                            <MenuItem 
                                                key={i}
                                                onClick={onClickHandler}
                                                disabled={isDisabled}
                                            >
                                                {text}
                                            </MenuItem>                                            
                                        ))}
                                    </Menu>
                                </ListSubheader>                                    
                            ) : null
                        }
                        {columnInstances.map((column) => (
                            <ListItem 
                                key={column.id}
                                secondaryAction={  
                                    <Checkbox
                                        checked={column.isSelected}
                                        size="small"
                                        color="default"
                                        onChange={() => dispatch(toggleColumnSelection({column}))}
                                        sx={{ 
                                            left: `${16 + 10 - itemPaddingX}px`, // offset secondaryAction CSS
                                            padding: "10px",
                                            margin: 0,
                                        }}
                                    ></Checkbox>
                                }
                                disablePadding
                                sx={{margin: 0}}
                            >
                                <ListItemButton 
                                    role={undefined} 
                                    onClick={({currentTarget}) => {
                                        setFocusedColumn({
                                            ...column,
                                            anchorEl: currentTarget
                                        })
                                    }}
                                    sx={{ 
                                        padding: `${itemPaddingY}px ${itemPaddingX}px`,
                                        margin: 0,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            backgroundColor: "#ddd",
                                            borderRadius: "50%",
                                            padding: 0,
                                            margin: `0 ${itemPaddingX}px 0 0`,
                                            width: `${iconWidth}px`,
                                            height: `${iconHeight}px`,
                                            minWidth: 0,
                                            alignItems: "center"
                                        }}
                                    >
                                        <ColumnTypeIcon columnType={column.columnType}/>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="list headline" noWrap={true}>
                                                <HighlightText
                                                    pattern={searchString}
                                                    text={column.name} 
                                                />
                                            </Typography>
                                        } 
                                        secondary={
                                            <Typography 
                                                variant="list supporting text" 
                                                noWrap={true}
                                            >
                                                <HighlightText 
                                                    pattern={searchString}
                                                    text={column.tableName}
                                                /> &bull; #<HighlightText 
                                                    pattern={searchString}
                                                    text={String(column.index + 1)}
                                                />
                                            </Typography>
                                        }
                                        sx={{
                                            lineHeight: "normal",
                                            margin:0,
                                            padding: 0 
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        </ul>
                    </li>
                    </>
                ))}
                </List>
                <Popover
                    id="column-detail-popover"
                    open={isPopoverOpen}
                    onClose={closePopover}
                    anchorEl={focusedColumn.anchorEl}
                    anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'center', horizontal: 'left' }}   
                    sx={{padding: "5px"}}    
                >
                    {
                    isPopoverOpen ? (<>
                        <ColumnDetail 
                            {...focusedColumn}
                            onIconClick={closePopover} 
                        />
                        <Button 
                            variant="contained"
                            onClick={() => { 
                                dispatch(selectColumn({column: focusedColumn}));
                                closePopover();
                            }}
                            sx={{float: "right"}}
                        >
                            Add
                        </Button>
                    </>) : null
                    }
                </Popover>
            </>
        );

    function closePopover() {
        setFocusedColumn({anchorEl: null});
    }
}