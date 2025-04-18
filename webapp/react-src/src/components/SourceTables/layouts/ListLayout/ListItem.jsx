import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Chip, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import TableDetailsIcon from "@mui/icons-material/Info";
import HighlightText from "../../../ui/HighlightText";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, DragPreviewImage } from "react-dnd";
import tableIconImage from "../../../../../public/images/table-icon.png";
import { useState } from "react";
import {dataType as SourceTable} from "../../../../data/slices/sourceTablesSlice";
import { createOperation } from "../../../../data/slices/compositeSchemaSlice";
import { isTableHover } from "../../../../data/selectors.js";
import { hoverTable, unhoverTable } from "../../../../data/uiSlice";

// TODO: parsing dates should be something that's done at the data layer
// Formatting can be done at the UI layer, but these transformations 
// should happen heigher up on the food chain.
import { formatDate, formatNumber, parseOpenRefineDate } from "../../../../lib/utilities";

export default function({
    sourceTable,
    searchString,
}) {
    const dispatch = useDispatch();

    const [{isDragging}, dragRef, previewRef] = useDrag(() => ({
            type: SourceTable,
            item: sourceTable.id,
            end: (item, monitor) => {
                const result = monitor.getDropResult();
                if (monitor.didDrop() && item.id === result.id) {
                    // Table has dropped   
                    dispatch(createOperation({
                        table: sourceTable,
                        operationType: result.operationType
                    }))
                }
                setIsPressed(false);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        []
    );

    // TODO: can't this data state stuff be combined between both layouts
    // for a good, clean refactor?
    const isSelected = sourceTable.isSelected;
    const isDisabled = sourceTable.name.indexOf(searchString) < 0;
    const [isPressed, setIsPressed] = useState(false);
    const isHover = useSelector(state => isTableHover(state, sourceTable.id));
    const className = [
        "list-item",
        isHover    ? "hover"    : undefined,
        isSelected ? "selected" : undefined,
        isDisabled ? "disabled" : undefined,
        isPressed   ? "pressed" : undefined,        
        isDragging ? "dragging" : undefined
    ].filter(state => state).join(" ");

    return (
        <div className={className}>
            <DragPreviewImage connect={previewRef} src={tableIconImage} />
            <ListItem
                ref={dragRef}
                // TODO: add context menu
                // secondaryAction={ <TableDetailsIcon /> }
                onMouseEnter={() => dispatch(hoverTable(sourceTable.id))}
                onMouseLeave={() => dispatch(unhoverTable())}
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
                                text={sourceTable.name} 
                            />
                            <small style={{paddingLeft: "10px"}}>
                                {formatNumber(sourceTable.rowCount)} x {formatNumber(sourceTable.columnCount)}
                            </small>
                        </Typography> 
                    }
                    secondary={
                        <Typography 
                            color={isDisabled ? "textDisabled" : "normal"}
                        >
                        {sourceTable.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" />
                        ))}
                        </Typography>
                    }
                />
            </ListItem>        
        </div>
    );
}