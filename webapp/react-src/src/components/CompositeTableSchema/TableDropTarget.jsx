/**
 * TableDropTarget.jsx
 *
 * Notes:
 *  - Table instance in the SourceTables component dispatch actions,
 *    only operationTypes are defined in this component
 */
import { useDrop } from "react-dnd";
import { dataType as SourceTable } from "../../data/slices/tablesSlice";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../data/slices/operationsSlice";

export const DROP_TARGET_EVENT_INITIALIZE = "initialize";
export const DROP_TARGET_EVENT_STACK = OPERATION_TYPE_STACK;
export const DROP_TARGET_EVENT_PACK = OPERATION_TYPE_PACK;

export default function TableDropTarget({ operationType, children }) {
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: SourceTable,
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
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}
