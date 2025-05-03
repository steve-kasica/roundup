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

export default function OperationBlockView({ operation, columnCount }) {
  const { tableIds, operationType } = operation;
  const childOperationId = useSelector((state) =>
    selectOperationImmediateChildId(state, operation.id)
  );

  return (
    <div className="OperationBlockView">
      {childOperationId && (
        <OperationContainer id={childOperationId}>
          <OperationBlockView />
        </OperationContainer>
      )}
      {tableIds.map((tableId) => (
        <TableContainer key={tableId} id={tableId} isDraggable={false}>
          <TableBlockView
            parentOperationType={operationType}
            parentColumnCount={columnCount}
          />
        </TableContainer>
      ))}
    </div>
  );
}
