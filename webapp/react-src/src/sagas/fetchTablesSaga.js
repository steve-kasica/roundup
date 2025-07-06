import { put, takeLatest, call, take, all } from "redux-saga/effects";
import OpenRefineAPI from "../services/open-refine";
import {
  addTables,
  Table,
  TABLE_SOURCE_OPEN_REFINE,
} from "../data/slices/tablesSlice";
import { createAction } from "@reduxjs/toolkit";
import { fetchColumnMetadataRequest } from "./fetchColumnMetadataSaga";
import { fetchColumnMetadataSuccess } from "./fetchColumnMetadataSaga";
// import { fetchColumnMetadata } from "./fetchColumnMetadata";

export const fetchTablesRequest = createAction("saga/fetchTablesRequest");
export const fetchTablesSuccess = createAction("saga/fetchTablesSuccess");
export const fetchTablesFailure = createAction("saga/fetchTablesSuccess");

export default function* fetchTablesSagaWatcher() {
  // Watch for the getTablesActions and trigger saga worker
  yield takeLatest(fetchTablesRequest.type, fetchTablesSagaWorker);
}

function* fetchTablesSagaWorker(action) {
  const { source } = action.payload;
  let response;

  try {
    if (source === TABLE_SOURCE_OPEN_REFINE) {
      // Call the OpenRefine API
      response = yield call(OpenRefineAPI.getAllProjectMetadata);
      // Fetch columns info for each project ID in parallel
      const projectIds = Object.keys(response.projects);
      const columnsInfo = yield all(
        projectIds.map((id) => call(OpenRefineAPI.getColumnsInfo, id))
      );

      // Process project requests from OpenRefine as Open Roundup tables
      const tables = Object.entries(response.projects).map(([id, project], i) =>
        Table(
          id,
          TABLE_SOURCE_OPEN_REFINE,
          project.name,
          columnsInfo[i].length,
          Number(project.rowCount),
          project.created,
          project.modified,
          project.tags
        )
      );

      yield put(addTables(tables));
    }
    // if source contains openrefine, wait for fetchColumnMetadata to finish
    // TODO: SIGNAL FETCH TABLES SUCCESS
  } catch (error) {
    // Dispatch failure action
    yield put(
      fetchTablesFailure(
        error instanceof Error ? error.message : "An error occured"
      )
    );
  }
}
