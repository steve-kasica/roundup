/**
 * @fileoverview Root saga combining all saga watchers.
 * @module sagas/rootSaga
 *
 * Aggregates all saga watchers for CRUD operations on tables, columns,
 * and operations, plus alert handling and materialization.
 *
 * Features:
 * - Combines all saga watchers using `all` effect
 * - Handles table CRUD operations
 * - Handles column CRUD operations
 * - Handles operation CRUD operations
 * - Manages alerts and materialization
 *
 * @example
 * import rootSaga from './rootSaga';
 * sagaMiddleware.run(rootSaga);
 */
import { all, call } from "redux-saga/effects";
import { watcher as createColumnsWatcher } from "./createColumnsSaga";
import { watcher as createTablesWatcher } from "./createTablesSaga";
import { watcher as createOperationsWatcher } from "./createOperationsSaga";
import { watcher as updateColumnsWatcher } from "./updateColumnsSaga";
import { watcher as updateTablesWatcher } from "./updateTablesSaga";
import { watcher as updateOperationsWatcher } from "./updateOperationsSaga";
import { watcher as deleteColumnsWatcher } from "./deleteColumnsSaga";
import { watcher as deleteTablesWatcher } from "./deleteTablesSaga";
import { watcher as deleteOperationsWatcher } from "./deleteOperationsSaga";
import { watcher as alertsSagaWatcher } from "./alertsSaga";

export default function* rootSaga() {
  yield all([
    call(createColumnsWatcher),
    call(createOperationsWatcher),
    call(createTablesWatcher),
    call(updateColumnsWatcher),
    call(updateTablesWatcher),
    call(updateOperationsWatcher),
    call(deleteColumnsWatcher),
    call(deleteTablesWatcher),
    call(deleteOperationsWatcher),
    call(alertsSagaWatcher),
  ]);
}
