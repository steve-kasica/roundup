import { put, select, takeEvery } from "redux-saga/effects";
import {
  createPackColumnsWorker,
  createStackColumnsWorker,
  initializeTableColumnsWorker,
  insertColumnsWorker,
} from "./worker";
import { createColumnsRequest } from "./actions";
import { createTablesSuccess } from "../createTablesSaga";
import {
  createOperationsFailure,
  createOperationsSuccess,
} from "../createOperationsSaga/actions";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
} from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";

export default function* createColumnsWatcher() {
  yield takeEvery(createColumnsRequest.type, function* (action) {
    const { mode } = action.payload;
    if (mode === "initializeTable") {
      yield* initializeTableColumnsWorker(action);
    } else if (mode === "initializeStack") {
      yield* createStackColumnsWorker(action);
    } else if (mode === "initializePack") {
      yield* createPackColumnsWorker(action);
    } else {
      yield* insertColumnsWorker(action);
    }
  });

  yield takeEvery(createTablesSuccess.type, function* (action) {
    const { tableIds } = action.payload;
    for (const tableId of tableIds) {
      yield put(
        createColumnsRequest({
          mode: "initializeTable",
          tableId,
        })
      );
    }
  });

  // // If an operation is created but fails, we still want to create
  // // columns for it so the user can see the error in the UI
  // yield takeEvery(createOperationsFailure.type, function* (action) {
  //   const { operationIds } = action.payload;
  //   const operations = yield select((state) =>
  //     operationIds.map((id) => selectOperation(state, id))
  //   );
  //   for (const { id, operationType } of operations) {
  //     if (operationType === OPERATION_TYPE_PACK) {
  //       yield put(
  //         createColumnsRequest({
  //           mode: "initializePack",
  //           queryDB: true,
  //           operationId: id,
  //         })
  //       );
  //     } else if (operationType === OPERATION_TYPE_STACK) {
  //       yield put(
  //         createColumnsRequest({
  //           mode: "initializeStack",
  //           queryDB: true,
  //           operationId: id,
  //         })
  //       );
  //     }
  //   }
  // });

  // If an operation is successfully created, we can just treat it
  // like a table since there's a DB view to pull columns from
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const { operationIds } = action.payload;
    const operations = yield select((state) =>
      operationIds.map((id) => selectOperation(state, id))
    );
    for (const operation of operations) {
      if (operation.operationType === OPERATION_TYPE_NO_OP) {
        continue;
      }
      yield put(
        createColumnsRequest({
          mode: "initializeTable",
          tableId: operation.id,
        })
      );
    }
  });
}
