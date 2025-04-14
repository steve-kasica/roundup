/**
 * SourceTables.jsx
 * 
 * A component for displaying and interacting with the set of source tables.
 */


import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {TableLayout, ListLayout} from "./layouts";
import { fetchTablesRequest } from "../../data/slices/sourceTablesSlice";
import { Button, Chip, FormControl, Grid2 as Grid, InputLabel, MenuItem, OutlinedInput, Select, TextField } from "@mui/material";
import "./SourceTables.scss"

const TABLE_LAYOUT = "table";
const LIST_LAYOUT = "list";
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

export default function SourceTables() {
    const dispatch = useDispatch();
    const [selectedTag, setSelectedTag] = useState("");
    const [searchString, setSearchString] = useState("");
    const {firstPaneWidth} = useSelector(({ui}) => ui);

    // TODO (optimization)
    // memoize selector here for sourceTables, sourceTable and isAscending and sortAttribute
    const {sourceTables, loading, error} = useSelector(({ui, sourceTables, compositeSchema}) => ({
        sourceTables: Object.values(sourceTables.data)
            .map(table => ({
                ...table, 
                isSelected: compositeSchema.selectedTables.includes(table.id),
                isHovered: (ui.hover.dataType === "table" && ui.hover.id === table.id)
                })),
        loading: sourceTables.loading,
        error: sourceTables.error
        })
    );

    useEffect(() => {
        dispatch(fetchTablesRequest());
    }, [dispatch]);

    const filteredTables = sourceTables
        .filter(table => table.isSelected || table.name.includes(searchString))
        .filter(table => table.isSelected || selectedTag.length === 0 || table.tags.includes(selectedTag));    

    const tags = Array.from(new Set((!(loading && error)) 
        ? sourceTables.map(table => table.tags).flat()
        : []));        

    const layout = (firstPaneWidth < FIRST_PANE_THRESHOLD) ? LIST_LAYOUT : TABLE_LAYOUT;

    return (
        <div className="SourceTables">
            <Grid container spacing={1} sx={{marginBottom: "10px"}}>
                <Grid size={6}>
                    <TextField
                        label="Search tables"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchString}
                        onChange={(event) => dispatch(setSearchString(event.target.value))}
                    />
                </Grid>
                <Grid size={4}>
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
                                <MenuItem value={null}>
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
                                setSelectedTag(null);
                            }}
                        >
                            Clear
                        </Button>
                    </Grid>
            </Grid>
            {(layout === LIST_LAYOUT && false) ? (
                <ListLayout 
                    searchString={searchString} 
                    sourceTables={filteredTables}
                    loading={loading}
                    error={error}
                />
            ) : (
                <TableLayout 
                    searchString={searchString}
                    sourceTables={filteredTables}
                    loading={loading}
                    error={error}                    
                />
            )}        
        </div>
    );
}