/** 
 * TableView/layouts/RowLayout.jsx
 * 
 * This component handles interaction events that modify global state,
 * independent of table item layout, in order to support different
 * layouts for source table items. It also handles some basic styles
 * linked with interaction that's consistent across layout modes.
 * 
 * See:
     *  - [`useDrag`](https://react-dnd.github.io/react-dnd/docs/api/use-drag)
 */
import { useState } from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import {type as tableInstance} from "../../../lib/types/Table";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import HighlightText from "../../ui/HighlightText";
import { Typography } from "@mui/material";
import tableIconImage from "../../../../public/images/table-icon.png";
import { useSelector } from "react-redux";

export default function RowLayout({
    className,
    name,
    id,
    type,
    rowCount,
    columnCount,
    date_created,
    last_modified,
    addTableEvent,
    hoverTableEvent,
    unhoverTableEvent,
    isSelected
}) {
    const {searchString} = useSelector(({ui}) => ui);
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

    const items = [name, type, columnCount, rowCount, date_created, last_modified ];
    const isDisabled = items.join("^").indexOf(searchString) < 0;
    className += " " + [
        isDragging ? "dragging" : undefined,
        isPressed ? "pressed" : undefined,
        isDisabled ? "disabled" : undefined,
    ].filter(state => state).join(" ");

    return (
        <>
            <DragPreviewImage connect={previewRef} src={tableIconImage} />
            <tr
                className={className}
                ref={dragRef}
                onMouseEnter={hoverTableEvent}
                onMouseLeave={unhoverTableEvent}
            >
                <td>
                    {(isSelected) ? (
                        <CheckBox />
                    ) : (
                        <CheckBoxOutlineBlank />
                    )}
                </td>
                {items.map((text, i) => (
                    <td key={i}>
                        <Typography color={isDisabled ? "textDisabled" : "normal"}>
                            <HighlightText pattern={searchString} text={String(text)} />
                        </Typography> 
                    </td>
                ))}
            </tr>
        </>
    );
}