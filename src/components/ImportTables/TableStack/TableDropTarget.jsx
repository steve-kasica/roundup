/**
 * TableDropTarget.jsx
 */
import { useDrop } from "react-dnd";
import {type as tableInstances} from "../../../lib/types/Table";

export default function TableDropTarget({drop, children}) {
    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept: tableInstances,
        drop,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });
    const isActive = isOver && canDrop;
    return (
        <div 
            ref={dropRef}
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