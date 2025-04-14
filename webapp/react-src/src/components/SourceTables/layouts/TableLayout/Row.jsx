/** 
 * TableView/layouts/RowLayout.jsx
 * 
 * This component handles interaction events that modify global state,
 * independent of table item layout, in order to support different
 * layouts for source table attributes. It also handles some basic styles
 * linked with interaction that's consistent across layout modes.
 * 
 * See:
     *  - [`useDrag`](https://react-dnd.github.io/react-dnd/docs/api/use-drag)
 */
import { useState } from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import {type as sourceTable} from "../../../../data/slices/sourceTablesSlice";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import HighlightText from "../../../ui/HighlightText";
import { Chip, Typography } from "@mui/material";
import tableIconImage from "../../../../../public/images/table-icon.png";
import { useDispatch, useSelector } from "react-redux";
import { createOperation } from "../../../../data/slices/compositeSchemaSlice";
import AnimatedEllipsis from "../../../ui/AnimatedElipse";
import { unhoverTable, hoverTable } from "../../../../data/uiSlice";
import { isTableHover } from "../../../../data/selectors.js";
import { formatDate, formatNumber, parseOpenRefineDate } from "../../../../lib/utilities";

export default function Row({searchString, table}) {
    const dispatch = useDispatch();
    const {isSelected} = table;
    const isDisabled = [table.name].join("^").indexOf(searchString) < 0;

    const [isPressed, setIsPressed] = useState(false);
    
    const [{isDragging}, dragRef, previewRef] = useDrag(() => ({
            type: sourceTable,
            item: table.id,
            end: (item, monitor) => {
                const result = monitor.getDropResult();
                if (monitor.didDrop() && item.id === result.id) {
                    // Table has dropped
                    dispatch(createOperation(({
                        table,
                        operationType: result.operationType
                    })));
                }
                setIsPressed(false);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        []
    );
    const isHover = useSelector((state) => isTableHover(state, table.id));
    const state = [
        isHover     ? "hover"       : undefined,
        isSelected  ? "selected"    : undefined,
        isDisabled  ? "disabled"    : undefined,
        isPressed   ? "pressed"     : undefined,        
        isDragging  ? "dragging"    : undefined,        
    ].filter(Boolean).join(" ");

    return (
        <>
            <DragPreviewImage connect={previewRef} src={tableIconImage} />
            <tr className={`TableView ${state}`}
                ref={dragRef}
                onMouseEnter={() => (isSelected) ? dispatch(hoverTable(table.id)) : null}
                onMouseLeave={() => (isSelected) ? dispatch(unhoverTable()) : null}
            >
                <td>
                    {(isSelected) ? <CheckBox /> : <CheckBoxOutlineBlank />}
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        <HighlightText pattern={searchString} text={table.name} />
                    </Typography>                     
                </td>
                <td>
                    {table.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" />
                    ))}
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        {formatNumber(table.rowCount)}
                    </Typography>                     
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        {formatNumber(table.columnCount)}
                    </Typography>
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        {formatDate(parseOpenRefineDate(table.dateCreated))}
                    </Typography>
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        {formatDate(parseOpenRefineDate(table.dateLastModified))}
                    </Typography>
                </td>
            </tr>
        </>
    );
}

function ColumnCount({tableId}) {
    const {loading, error, columns} = useSelector(({sourceColumns}) => sourceColumns.data[tableId]);

    if (loading) {
        return <>Loading<AnimatedEllipsis /></>
    } else if (error) {
        return <>Error</>;
    } else if (columns.length >= 0) {
        return <>{columns.length}</>;
    } else {
        throw new Error("Unknown state for ColumnCount component");
    }
}