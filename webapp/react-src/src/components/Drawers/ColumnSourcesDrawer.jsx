/**
 * ColumnSourcesDrawer.jsx
 * ----------------------------------------------------------
 */
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox';

import Column2ndActionIcon from "@mui/icons-material/MoreVert"  // custom alias

import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux"
import { toggleColumnSelection } from "../../data/schemaSlice.js"
import { useGetWorkflowSchemasQuery } from "@/services/workflows";

import { sourceColumnGroups } from "@/lib/sourceColumnGroups";

import { group } from "d3"

export default function ColumnSourcesDrawer() {
    const {sourceColumnGroup, sourceColumnGroupSearchString, workflow, selectedColumns} = useSelector(({ui, schema}) => {
        return {
            ...ui,
            sourceColumnGroup: sourceColumnGroups.get(ui.sourceColumnGroup),
            selectedColumns: schema.data.flat().filter(column => column).map(column => column.id)
        };
    });
    const { data: tables, error, isLoading } = useGetWorkflowSchemasQuery(workflow);
    const isDisabled = error || isLoading;
    const dispatch = useDispatch();

    let columns, columnGroups;
    if (tables) {
        columns = !tables ? [] : tables
            .map(table => table.columns.map(column => ({...column, tableName: table.name})))
            .flat();

        columnGroups = Array.from(group(columns, sourceColumnGroup.func));   
        columnGroups.sort(columnGroupSorter);
    }

    return (
        <Drawer open={tables !== undefined}>
            {
                error ? (
                    null
                ) : isLoading ? (
                    null
                ) : tables ? (
                    <List dense={true}>
                    {columnGroups.map(([groupKey, columns]) => (
                        <li key={`section-${groupKey}`}>
                            <ul>
                            <ListSubheader>{groupKey}</ListSubheader>
                            {columns.map((column) => (
                                <ListItem 
                                    key={`item-${groupKey}-${column.id}`}
                                    divider={true}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="more actions">
                                            <Column2ndActionIcon />
                                        </IconButton>
                                    }
                                    disablePadding
                                >
                                    <ListItemButton 
                                        role={undefined} 
                                        onClick={(event) => dispatch(toggleColumnSelection({column}))} 
                                        dense
                                    >
                                        <ListItemIcon>
                                            <Checkbox 
                                                edge="start"
                                                checked={selectedColumns.includes(column.id)}
                                                tabIndex={-1}
                                                disableRipple
                                                inputProps={{ 'aria-labelledby': "foo" }} 
                                            />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={
                                                <Typography noWrap={true}>
                                                    {column.index + 1}.&nbsp;{column.name}
                                                </Typography>
                                            } 
                                            secondary={
                                                <Typography noWrap={true}>
                                                    {column.tableName}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                            </ul>
                      </li>
                    ))}
                    </List>
                ): null
            }
        </Drawer>
    );
    /**
     * @name: columnGroupSorter
     * @description: A callback function to Array.prototype.sort for sorting
     * groups of columns. Note that `a` and `b` must be cast to String in order to 
     * sort by column index. 
     * @param {Array} param1: [columnGroupKey, <columns>] 
     * @param {Array} param2: [columnGroupKey, <columns>]
     * @returns None (sorts inplace)
     */
function columnGroupSorter([key1], [key2]) {
    const a = String(key1).includes(sourceColumnGroupSearchString);
    const b = String(key2).includes(sourceColumnGroupSearchString);
    if (a && b || !a && !b) {
        return 0;
    } else if (a && !b) {
        return -1;
    } else if (!a && b) {
        return 1;
    }
}
}