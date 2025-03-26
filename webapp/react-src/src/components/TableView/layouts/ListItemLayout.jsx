/**
 * TableView/layouts/ListItemLayout.jsx
 * 
 * 
 */

import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import TableDetailsIcon from "@mui/icons-material/Info";    
import HighlightText from "../../ui/HighlightText";
import { useSelector } from "react-redux";
import { useDrag, DragPreviewImage } from "react-dnd";
import tableIconImage from "../../../../public/images/table-icon.png";
import { useState } from "react";
import {type as tableInstance} from "../../../lib/types/Table";

export default function ListItemLayout({
    className,
    name,
    id,
    rowCount,
    columnCount,
    addTableEvent,
    isSelected,
}) {
    const {searchString} = useSelector(({ui}) => ui);
    const isDisabled = name.indexOf(searchString) < 0;

    const [isPressed, setIsPressed] = useState(false);
    const [{isDragging}, dragRef, previewRef] = useDrag(() => ({
            type: tableInstance,
            item: {id},
            end: (item, monitor) => {
                const result = monitor.getDropResult();
                if (monitor.didDrop() && item.id === result.id) {
                    // Table has dropped
                    addTableEvent(result.operationType);
                }
                setIsPressed(false);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        []
    );

    className += " " + [
        isDisabled ? "disabled" : undefined
    ].filter(state => state).join(" ");

    return (
        <>
            <DragPreviewImage connect={previewRef} src={tableIconImage} />
            <ListItem
                ref={dragRef}
                className={className}
                secondaryAction={ <TableDetailsIcon /> }
                disablePadding
            >
                <ListItemIcon>
                    {(isSelected) ? (
                        <CheckBox />
                    ) : (
                        <CheckBoxOutlineBlank />
                    )}
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
                            {columnCount} x {rowCount}
                        </Typography>
                    }
                />
            </ListItem>        
        </>
    );
}