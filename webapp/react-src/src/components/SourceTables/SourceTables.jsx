/**
 * SourceTables.jsx
 * 
 * A component for displaying and interacting with the set of source tables.
 */


import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {TableLayout, ListLayout} from "./layouts";
import { fetchTablesRequest } from "../../data/slices/sourceTablesSlice";
import { Button, Chip, FormControl, FormControlLabel, FormGroup, Grid2 as Grid, InputLabel, MenuItem, OutlinedInput, Select, Switch, TextField } from "@mui/material";
import { styled } from '@mui/material/styles';

import "./SourceTables.scss"
import { getAllSourceTables, getSelectedSourceTables, getSourceTablesError, getSourceTablesLoadingStatus } from "../../data/selectors";
import {TABLE_LAYOUT, LIST_LAYOUT} from "./layouts"

const FIRST_PANE_THRESHOLD = 30;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const LayoutSwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
      margin: 1,
      padding: 0,
      transform: 'translateX(6px)',
      '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& .MuiSwitch-thumb:before': {
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-icon lucide-list"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>')`,
        },
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: '#aab4be',
          ...theme.applyStyles('dark', {
            backgroundColor: '#8796A5',
          }),
        },
      },
    },
    '& .MuiSwitch-thumb': {
    //   backgroundColor: '#001e3c',
    backgroundColor: '#ddd',    
      width: 32,
      height: 32,
      '&::before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table-icon lucide-table"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>')`,
      },
      ...theme.applyStyles('dark', {
        backgroundColor: '#003892',
      }),
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: '#aab4be',
      borderRadius: 20 / 2,
      ...theme.applyStyles('dark', {
        backgroundColor: '#8796A5',
      }),
    },
  }));

export default function SourceTables() {
    const dispatch = useDispatch();
    const [selectedTag, setSelectedTag] = useState("");
    const [searchString, setSearchString] = useState("");

    const {firstPaneWidth} = useSelector(({ui}) => ui);    
    const [layout, setLayout] = useState(TABLE_LAYOUT);

    const sourceTables = useSelector(getAllSourceTables);
    const selectedSourceTables = useSelector(getSelectedSourceTables);
    const isLoading = useSelector(getSourceTablesLoadingStatus);
    const error = useSelector(getSourceTablesError);

    useEffect(() => {
        dispatch(fetchTablesRequest());
    }, [dispatch]);

    const filteredTables = sourceTables
        .filter(table => selectedSourceTables.includes(table.id) || table.name.includes(searchString))
        .filter(table => selectedSourceTables.includes(table.id) || selectedTag.length === 0 || table.tags.includes(selectedTag));

    const tags = Array.from(new Set((!(isLoading && error)) 
        ? sourceTables.map(table => table.tags).flat()
        : []));

    return (
        <div className="SourceTables">
            <Grid container spacing={1} sx={{marginBottom: "10px"}}>
                <Grid size={5}>
                    <TextField
                        label="Search tables"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchString}
                        onChange={(event) => dispatch(setSearchString(event.target.value))}
                    />
                </Grid>
                <Grid size={3}>
                    <FormControl fullWidth>
                            <InputLabel 
                                size="small" 
                                id="tag-filter-label"
                                sx={{
                                    backgroundColor: "white",
                                    paddingRight: "5px"
                                }}
                            >
                                Filter by tag
                            </InputLabel>
                            <Select
                                labelId="tag-filter-label"
                                variant="outlined"
                                id="tag-filter-select"
                                fullWidth
                                size="small"
                                value={selectedTag}
                                onChange={event => setSelectedTag(event.target.value)}
                                input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
                                renderValue={tag => ( <Chip label={tag} /> )}
                                MenuProps={MenuProps}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {tags.map(tag => (
                                    <MenuItem
                                        key={tag}
                                        value={tag}
                                    >
                                        {tag}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={2}>
                        <Button 
                            variant="outlined"
                            color="info"
                            disableElevation
                            disabled={(searchString === "") && (selectedTag.length === 0)}
                            fullWidth
                            sx={{height: "100%"}}
                            onClick={() => {
                                setSearchString(""); 
                                setSelectedTag("");
                            }}
                        >
                            Clear
                        </Button>
                    </Grid>
                    <Grid size={2}>
                        <FormGroup>
                            <FormControlLabel 
                                control={<LayoutSwitch 
                                    onChange={event => setLayout((event.target.checked ? LIST_LAYOUT : TABLE_LAYOUT))}
                                />}
                                label="Layout"
                            />
                        </FormGroup>
                    </Grid>
            </Grid>
            {(layout === LIST_LAYOUT) ? (
                <ListLayout 
                    searchString={searchString} 
                    sourceTables={filteredTables}
                    loading={isLoading}
                    error={error}
                />
            ) : (
                <TableLayout 
                    searchString={searchString}
                    sourceTables={filteredTables}
                    loading={isLoading}
                    error={error}                    
                />
            )}        
        </div>
    );
}