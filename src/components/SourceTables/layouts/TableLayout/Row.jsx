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
import {isTable, type as tableInstance} from "../../../../lib/types/Table";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import HighlightText from "../../../ui/HighlightText";
import { Typography } from "@mui/material";
import tableIconImage from "../../../../../public/images/table-icon.png";
import { useDispatch, useSelector } from "react-redux";
import { setHoverTable } from "../../../../data/uiSlice";
import { addTable } from "../../../../data/tableTreeSlice";

export default function Row({table}) {
    const {name, id, rowCount, type, columnCount, date_created, last_modified } = table;

    const dispatch = useDispatch();
    const {hoverTable, selectedTables} = useSelector(({ui, tableTree}) => ({
        hoverTable: ui.hoverTable,
        selectedTables: new Set(tableTree.tree
            .filter(node => isTable(node))
            .map(table => table.id))
    }));

    const isSelected = selectedTables.has(table.id);

    const {searchString} = useSelector(({ui}) => ui);
    const [isPressed, setIsPressed] = useState(false);
    const [{isDragging}, dragRef, previewRef] = useDrag(() => ({
            type: tableInstance,
            item: {id},
            end: (item, monitor) => {
                const result = monitor.getDropResult();
                if (monitor.didDrop() && item.id === result.id) {
                    // Table has dropped
                    dispatch(addTable(({
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

    const items = [name, type, columnCount, rowCount, date_created, last_modified ];
    const isDisabled = items.join("^").indexOf(searchString) < 0;

    const state = [
        hoverTable === id ? "hover" : undefined,
        isSelected ? "selected" : undefined,
        isDisabled ? "disabled" : undefined,
        isPressed ? "pressed" : undefined,        
        isDragging ? "dragging" : undefined,        
    ].filter(name => name).join(" ");

    return (
        <>
            <DragPreviewImage connect={previewRef} src={tableIconImage} />
            <tr className={`TableView ${state}`}
                ref={dragRef}
                onMouseEnter={() => dispatch(setHoverTable(id))}
                onMouseLeave={() => dispatch(setHoverTable(null))}
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