/**
 * createOperationsSaga.js
 *
 */

import { put } from "redux-saga/effects";
import {
  addOperations as addOperationsToSlice,
  Operation,
} from "../../slices/operationsSlice";
import { createOperationsSuccess } from "./actions";
import generateUUID from "../../lib/utilities/generateUUID";

/**
 * Worker saga that creates or replaces database views based on operation type.
 *
 * @generator
 * @param {Object} action - Redux action containing the operation ID
 * @param {string} action.payload - The operation ID to create a view for
 * @yields {Effect} Various saga effects for database operations and state updates
 */
export default function* createOperationsWorker(operationsData) {
  let isFailure = false;
  const createdOperations = [];

  for (const { operationType, childIds } of operationsData) {
    try {
      const operation = Operation({
        operationType,
        childIds,
        databaseName: `${generateUUID("o_")}`,
      });
      createdOperations.push(operation);
    } catch (error) {
      isFailure = true;
      alert("Error creating operation:", error);
      console.error("Error creating operation:", error);
    }
  }

  if (!isFailure) {
    yield put(addOperationsToSlice(createdOperations));
    yield put(createOperationsSuccess(createdOperations));
  }
}
