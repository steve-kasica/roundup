/**
 * SourceTableItem.jsx
 * 
 * This component handles interaction events that modify global state,
 * independent of table item layout, in order to support different
 * layouts for source table items. It also handles some basic styles
 * linked with interaction that's consistent across layout modes.
 * 
 * See:
     *  - [`useDrag`](https://react-dnd.github.io/react-dnd/docs/api/use-drag)
 */
import { useDispatch } from "react-redux";
import {type as tableInstance} from "../../lib/types/Table";
import tableIconImage from "../../../public/images/table-icon.png";
import { DragPreviewImage, useDrag } from "react-dnd";
import { addTable } from "../../data/tableTreeSlice";
import { useState } from "react";

export default function SourceTableItem({
    table, 
    ContainerElement='div',
    children
}) {
    const dispatch = useDispatch();
    const [isPressed, setIsPressed] = useState(false);
    const [{isDragging}, dragRef, previewRef] = useDrag(() => ({
            type: tableInstance,
            item: {id: table.id},
            end: (item, monitor) => {
                const result = monitor.getDropResult();
                if (monitor.didDrop() && item.id === result.id) {
                    onTableDrop(result.operationType);
                }
                setIsPressed(false);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        []
    );
    const isHovered = false;
    const classNames = [
        "source-table-item",
        isDragging ? "dragging" : "",
        isPressed ? "pressed" : "",
        isHovered ? "false" : ""
    ]

    return (
        <>
            <DragPreviewImage connect={previewRef} src={tableIconImage} />
            <ContainerElement 
                ref={dragRef}
                className={classNames.join(" ")}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
            >
                {children}
            </ContainerElement>
        </>
    );

    function onTableDrop(operationType) {
        dispatch(addTable({ table, operationType }))
    }
}