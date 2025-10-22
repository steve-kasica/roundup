import { put } from "redux-saga/effects";
import { deleteColumns as deleteColumnsFromSlice } from "../../slices/columnsSlice";
import { deleteColumnsSuccess, deleteColumnsFailure } from "./actions";

/**
 * Worker saga for handling column removal.
 *
 * @param {Object} action - The action object containing the payload.
 *
 * @yields {void}
 */
export default function* removeColumnsWorker(action) {
  // const successfulDeletions = [];
  // const failedDeletions = [];
  let { columnIds } = action.payload;
  // Normalize input to ensure it's always an array
  if (!Array.isArray(columnIds)) {
    columnIds = [columnIds];
  }

  // TODO: remove columns from database if necessary

  yield put(deleteColumnsFromSlice(columnIds));

  // Signal to other sagas that columns have been successfully removed
  yield put(deleteColumnsSuccess(columnIds));
}
