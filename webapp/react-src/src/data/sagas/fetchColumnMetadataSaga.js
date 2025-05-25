import { createAction } from "@reduxjs/toolkit";
import { takeEvery, put, call, all } from "redux-saga/effects";
import OpenRefineAPI from "../../services/open-refine";
import { addColumnsFromOpenRefine } from "../slices/columnsSlice";

export const fetchColumnMetadataRequest = createAction(
  "sagas/fetchColumnMetadataRequest"
);
export const fetchColumnMetadataSuccess = createAction(
  "sagas/fetchColumnMetadataSuccess"
);
export const fetchColumnMetadataFailure = createAction(
  "sagas/fetchColumnMetadataFailure"
);

export default function* fetchColumnMetadataWatcher() {
  yield takeEvery(fetchColumnMetadataRequest.type, fetchColumnMetadataWorker);
}

function* fetchColumnMetadataWorker(action) {
  const { source, remoteTableIds } = action.payload;

  if (source === "openrefine") {
    const projectIds = remoteTableIds;
    // Fetch columns info for all projectIds in parallel
    const columnsInfoArray = yield all(
      projectIds.map((projectId) =>
        call(OpenRefineAPI.getColumnsInfo, projectId)
      )
    );
    // Dispatch actions in parallel for each projectId/columnsInfo pair
    yield all(
      projectIds.map((projectId, idx) =>
        put(
          addColumnsFromOpenRefine({
            projectId,
            columnsInfo: columnsInfoArray[idx],
          })
        )
      )
    );
    yield put(fetchColumnMetadataSuccess());
  }
}
