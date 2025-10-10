import { select, takeEvery } from "redux-saga/effects";
import { deleteTablesRequest } from "./actions";
import deleteTablesWorker from "./worker";
import { deleteOperationsSuccess } from "../deleteOperationsSaga";
import { selectOperation } from "../../slices/operationsSlice";
import { isTableId } from "../../slices/tablesSlice";

export default function* deleteTablesSagaWatcher() {
  yield takeEvery(deleteTablesRequest.type, deleteTablesWorker);

  // Whenever operations are deleted, also delete their child tables
  yield takeEvery(deleteOperationsSuccess, function* (action) {
    const { operationIds } = action.payload;
    const operations = yield select((state) =>
      operationIds.map((operationId) => selectOperation(state, operationId))
    );
    const tableIds = operations.flatMap((op) => op.children).filter(isTableId);
    yield deleteTablesWorker({ payload: { tableIds } });
  });
}
