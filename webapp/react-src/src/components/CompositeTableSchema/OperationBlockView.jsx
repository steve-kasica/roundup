/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the
 * **Table Tree**, by design.
 */

import { TableContainer, OperationContainer } from "../Containers";
import TableBlockView from "./TableBlockView";
import { selectOperationImmediateChildId } from "../../data/slices/operationsSlice";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";

import { ADD_TABLE_EVENT } from "../../data/sagas/AddTableToSchemaSaga";
import { useDrop } from "react-dnd";

export default function OperationBlockView({
  operation,
  columnCount,
  parentColumnCount,
}) {
  const childOperationId = useSelector((state) =>
    selectOperationImmediateChildId(state, operation.id)
  );

  // const width = `${(columnCount / parentColumnCount) * 100}%`;

  return (
    <div
      className="OperationBlockView"
      // style={{ width }}
      data-columnCount={columnCount}
      data-parentColumnCount={parentColumnCount}
    >
      {childOperationId && (
        <OperationContainer id={childOperationId}>
          <OperationBlockView parentColumnCount={columnCount} />
        </OperationContainer>
      )}
      {operation.tableIds.map((tableId) => (
        <TableContainer key={tableId} id={tableId} isDraggable={false}>
          <TableBlockView
            parentOperationType={operation.operationType}
            parentColumnCount={columnCount}
          />
        </TableContainer>
      ))}
    </div>
  );
}
