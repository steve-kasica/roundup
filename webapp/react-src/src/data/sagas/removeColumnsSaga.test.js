import { describe, it, expect, vi } from "vitest";
import { runSaga } from "redux-saga";
import * as columnsSlice from "../slices/columnsSlice";
import * as tablesSelectors from "../slices/tablesSlice/tableSelectors";
import * as tablesSlice from "../slices/tablesSlice/tablesSlice";
import OpenRefine from "../../services/open-refine";
import {
  removeColumnsSagaWorker,
  removeColumnsAction,
} from "./removeColumnsSaga";

const TABLE_SOURCE_OPEN_REFINE = "openrefine";

describe("removeColumnsSagaWorker", () => {
  const tableId = "table-1";
  const projectId = "remote-1";
  const columnIds = ["col-1", "col-2"];
  const allColumns = [
    { id: "col-1", tableId, name: "A" },
    { id: "col-2", tableId, name: "B" },
  ];
  const table = {
    id: tableId,
    source: TABLE_SOURCE_OPEN_REFINE,
    remoteId: projectId,
    columnIds: ["col-1", "col-2", "col-3"],
  };
  const allTableColumns = [
    { id: "col-1", tableId, name: "A" },
    { id: "col-2", tableId, name: "B" },
    { id: "col-3", tableId, name: "C" },
  ];

  it("removes columns from OpenRefine table (happy path)", async () => {
    vi.spyOn(columnsSlice, "addColumnsToLoading").mockReturnValue({
      type: "addColumnsToLoading",
    });
    vi.spyOn(columnsSlice, "removeColumns").mockReturnValue({
      type: "removeColumns",
    });
    vi.spyOn(columnsSlice, "setErrorForColumn").mockReturnValue({
      type: "setErrorForColumn",
    });
    vi.spyOn(columnsSlice, "selectColumnById").mockImplementation(
      (state, id) =>
        allColumns.find((c) => c.id === id) ||
        allTableColumns.find((c) => c.id === id)
    );
    vi.spyOn(tablesSelectors, "selectTablesById").mockReturnValue(table);
    vi.spyOn(tablesSlice, "removeTableColumnId").mockReturnValue({
      type: "removeTableColumnId",
    });
    vi.spyOn(OpenRefine, "reorderColumns").mockResolvedValue({});

    const dispatched = [];
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      removeColumnsSagaWorker,
      { payload: columnIds }
    ).toPromise();

    expect(OpenRefine.reorderColumns).toHaveBeenCalledWith(
      projectId,
      ["C"],
      "csrf_token"
    );
    expect(dispatched).toContainEqual({ type: "removeColumns" });
    expect(dispatched).toContainEqual({ type: "removeTableColumnId" });
  });

  it("handles OpenRefine API error", async () => {
    vi.spyOn(columnsSlice, "addColumnsToLoading").mockReturnValue({
      type: "addColumnsToLoading",
    });
    vi.spyOn(columnsSlice, "removeColumns").mockReturnValue({
      type: "removeColumns",
    });
    vi.spyOn(columnsSlice, "setErrorForColumn").mockReturnValue({
      type: "setErrorForColumn",
    });
    vi.spyOn(columnsSlice, "selectColumnById").mockImplementation(
      (state, id) =>
        allColumns.find((c) => c.id === id) ||
        allTableColumns.find((c) => c.id === id)
    );
    vi.spyOn(tablesSelectors, "selectTablesById").mockReturnValue(table);
    vi.spyOn(tablesSlice, "removeTableColumnId").mockReturnValue({
      type: "removeTableColumnId",
    });
    vi.spyOn(OpenRefine, "reorderColumns").mockRejectedValue(new Error("fail"));

    const dispatched = [];
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      removeColumnsSagaWorker,
      { payload: columnIds }
    ).toPromise();

    expect(dispatched).toContainEqual({ type: "setErrorForColumn" });
  });
});
