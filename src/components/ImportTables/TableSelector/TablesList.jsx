/**
 * TablesList.jsx
 * ----------------------------------
 */
import { Checkbox, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import TableDetailsIcon from "@mui/icons-material/Info";    
import HighlightText from "../../ui/HighlightText";
import { useSelector } from "react-redux";
import { ADD_TO_GROUP } from "../../../data/uiSlice";
import { useDrag } from "react-dnd";

export default function TablesList({
    searchString, 
    handleTablePrimaryClick,
    sourceTables,
    selectedTables
}) {

    return (
        <>
            <List dense sx={{height: "inherit", overflowY: "auto"}}>
                {
                sourceTables
                    .toSorted((tableA, tableB) => {
                        const [a, b] = [tableA.name.includes(searchString), tableB.name.includes(searchString)];
                        return (a === b) ? 0 : (a < b) ? 1 : -1;
                    })
                    .map(table => (
                        <TableDetail 
                            key={table.id}
                            table={table}
                            searchString={searchString}
                            isSelected={selectedTables.has(table.id)}
                            isDisabled={false}
                        />
                    ))
                }
            </List>
        </>
    );

    function TableDetail({
        isDragging,
        table,
        searchString,
        isSelected
    }) {
        const [{opacity}, dragRef] = useDrag(
            () => ({
                type: "table",
                item: {table, searchString, isSelected},
                collect: (monitor) => ({
                    opacity: monitor.isDragging() ? 0.5 : 1
                })
            }),
            []
        );

        const { name, row_count, column_count } = table;
        const isDisabled = useSelector(({ui}) => 
            (ui.insertionMode === ADD_TO_GROUP && isSelected) || name.indexOf(searchString) < 0
        );
        return (
            <div ref={dragRef}>
                <ListItem
                    secondaryAction={
                        <IconButton
                            disabled={isDisabled}
                        >
                            <TableDetailsIcon />
                        </IconButton>
                    }
                    disablePadding
                >
                    <ListItemButton
                        color=""
                        disabled={isDisabled}
                        onClick={() => handleTablePrimaryClick(table, isSelected)}                    
                    >
                        <ListItemIcon>
                            <Checkbox 
                                edge="start"
                                checked={isSelected}
                                disabled={isDisabled}
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText 
                            primary={
                                <Typography 
                                    color={isDisabled ? "textDisabled" : "normal"}
                                >
                                    <HighlightText 
                                        pattern={searchString} 
                                        text={name} 
                                    />
                                </Typography> 
                            }
                            secondary={
                                <Typography 
                                    color={isDisabled ? "textDisabled" : "normal"}
                                >
                                    {row_count} x {column_count}
                                </Typography>
                            }
                        />
                    </ListItemButton>
                </ListItem>
            </div>
        );
    } // end TableDetail()

}  // end TablesList()