/**
 * TableDetail.jsx
 * ===============
 * 
 *
 *  handlePrimaryClick
 * 
 * | isSelected | isStackEmpty | focusedNode | on click description                                    |
 * | ---------- | ------------ | ---------------- | ------------------------------------------------------- | 
 * | True       | False        | False            | remove table from tree                                  |
 * | True       | False        | True             | NA: can't click selected table in focusedNode mode |
 * | True       | True         | False            | NA: stack can't be empty if table is selected           |
 * | True       | True         | True             | NA: stack can't be empty if table is selected           |
 * | False      | False        | False            | Let system suggest where to put the table               |
 * | False      | False        | True             | Add table to focused table group                        |
 * | False      | True         | False            | Initialize stack                                        |
 * | False      | True         | True             | NA: can't be focused operation and empty stack          |
 */
import { Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";


import TableDetailsIcon from "@mui/icons-material/Info";    
import HighlightText from "../ui/HighlightText";
import { useDispatch, useSelector } from "react-redux";
import { insertTableInGroup, removeTableFromTree, addTableToTree } from "../../data/tableTreeSlice";
import { ADD_TO_GROUP, SYSTEM_DECIDES, setInsertionMode, setFocusedNode } from "../../data/uiSlice";

export default function TableDetail({
    table,
    searchString,
    isSelected
}) {
    const { name, row_count, columns } = table;
    const dispatch = useDispatch();

    const {insertionMode, isDisabled, focusedNode} = useSelector(({tableTree, ui}) => ({
        insertionMode: ui.insertionMode,
        isDisabled: (ui.insertionMode === ADD_TO_GROUP && isSelected) || name.indexOf(searchString) < 0,
        focusedNode: ui.focusedNode
    }));

    return (
        <>
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
                    onClick={handlePrimaryClick}                    
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
                            <Typography color={isDisabled ? "textDisabled" : "normal"}>
                                <HighlightText pattern={searchString} text={name} />
                            </Typography> 
                        }
                        secondary={
                            <Typography color={isDisabled ? "textDisabled" : "normal"}>
                                {row_count} x {columns.length}
                            </Typography>
                        }
                    />
                </ListItemButton>
            </ListItem>
        </>
    );

    function handlePrimaryClick() {
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
                dispatch(addTableToTree(table));
            } else {
                dispatch(removeTableFromTree(table));
            }
        } else {
            throw Error("Unknown app state!");
        }
    }
}