import { describe, it, expect } from "vitest";
import { put, takeLatest } from "redux-saga/effects";
import {
  renameColumns,
  addColumnsToLoading,
  removeColumnsFromLoading,
  clearSelectedColumns,
} from "../../slices/columnsSlice";
import { renameColumnsAction } from "./renameColumnsSaga";
import renameColumnSaga, { renameColumnsSagaWorker } from "./renameColumnsSaga";

describe("renameColumnSaga", () => {
  it("should listen for renameColumnsAction and call renameColumnsSagaWorker", () => {
    const gen = renameColumnSaga();
    const next = gen.next();
    expect(next.value).toEqual(
      takeLatest(renameColumnsAction.type, renameColumnsSagaWorker)
    );
  });

  it("should dispatch correct actions in renameColumnsSagaWorker", () => {
    const ids = ["col1", "col2"];
    const aliases = ["Column 1", "Column 2"];
    const action = renameColumnsAction({ ids, aliases });
    const gen = renameColumnsSagaWorker(action);
    expect(gen.next().value).toEqual(put(addColumnsToLoading(ids)));
    expect(gen.next().value).toEqual(put(renameColumns({ ids, aliases })));
    expect(gen.next().value).toEqual(put(removeColumnsFromLoading(ids)));
    expect(gen.next().value).toEqual(put(clearSelectedColumns()));
    expect(gen.next().done).toBe(true);
  });
});
