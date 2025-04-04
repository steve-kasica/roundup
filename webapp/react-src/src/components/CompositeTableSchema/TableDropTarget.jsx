/**
 * TableDropTarget.jsx
 * 
 * Notes:
 *  - Table instance in the SourceTables component dispatch actions,
 *    only operationTypes are defined in this component
 */
import { useDrop } from "react-dnd";
import {type as tableInstances} from "../../lib/types/Table";

export default function TableDropTarget({operationType, children}) {
    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept: tableInstances,
        drop: (item, monitor) => ({
            ...item,
            operationType,
        }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });
    const isActive = isOver && canDrop;
    return (
        <div 
            ref={dropRef}
            // TODO: add styles to stylesheet, no-inline styles
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px dashed #ddd",
                background: isActive ? "tomato" : "inherit",
                color: "#999",
                height: "100%"
            }}
        >
            {children}
        </div>
    )
}