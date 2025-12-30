/**
 * @fileoverview Main entry point for Redux Saga configuration.
 * @module sagas
 *
 * Re-exports the root saga that combines all saga watchers.
 *
 * @example
 * import rootSaga from './sagas';
 * sagaMiddleware.run(rootSaga);
 */
import rootSaga from "./rootSaga";
export default rootSaga;
