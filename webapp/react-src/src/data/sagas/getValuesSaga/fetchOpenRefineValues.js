// This file contains the fetchOpenRefineValues saga only.
import { call, put } from "redux-saga/effects";
import OpenRefineAPI from "../../../services/open-refine";
import { Value, addValues } from "../../slices/valuesSlices";
import { setValueCounts } from "../../slices/columnsSlice";

/**
 * Saga to fetch facet values for a given column from OpenRefine and update the Redux store.
 *
 * @generator
 * @param {string} projectId - The ID of the OpenRefine project.
 * @param {string} columnName - The name of the column to compute facets for.
 * @param {string} columnId - The unique identifier of the column in the application state.
 * @yields {Object} Redux-Saga effects for API call and Redux actions.
 * @throws Will log an error if the API call fails.
 */
export function* fetchOpenRefineValues(projectId, columns) {
  try {
    const csrf_token = "TODO";
    const columnIds = columns.map(({ id }) => id);
    const columnNames = columns.map(({ name }) => name);

    const facets = columnNames.map((name) => ({
      type: "list",
      name: name,
      expression: "value",
      columnName: name,
      omitBlank: false,
      omitError: false,
      selection: [],
      selectBlank: false,
      selectError: false,
      invert: false,
      mode: "row-based",
    }));

    const response = yield call(
      OpenRefineAPI.computeFacets,
      projectId,
      facets,
      csrf_token
    );

    for (let i = 0; i < response.facets.length; i++) {
      const facet = response.facets[i];
      // Update the values slice with new values
      const values = facet.choices.map(({ v }) => Value(v.v));
      yield put(addValues(values));

      // Update the columns slice with new value counts
      const counts = facet.choices.map(({ c }) => c);
      yield put(
        setValueCounts({
          values: values.map((v) => v.id),
          counts,
          columnId: columnIds[i],
        })
      );
    }
  } catch (error) {
    console.error("Error fetching values:", error);
    // Handle error appropriately, e.g., dispatch an error action
  }
}
