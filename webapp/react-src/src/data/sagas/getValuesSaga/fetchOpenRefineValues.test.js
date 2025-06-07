import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { call, put } from "redux-saga/effects";
import { fetchOpenRefineValues } from "./fetchOpenRefineValues";
import OpenRefineAPI from "../../../services/open-refine";
import { addValues } from "../../slices/valuesSlices";
import { setValueCounts } from "../../slices/columnsSlice";
import * as valuesModule from "../../slices/valuesSlices";

const projectId = "test-project";
const columns = [
  { id: "col1", name: "Column 1" },
  { id: "col2", name: "Column 2" },
];

const mockFacets = [
  {
    name: "Column 1",
    choices: [
      { v: { v: "A" }, c: 2 },
      { v: { v: "B" }, c: 3 },
    ],
  },
  {
    name: "Column 2",
    choices: [
      { v: { v: "X" }, c: 1 },
      { v: { v: "Y" }, c: 4 },
    ],
  },
];

const mockResponse = { facets: mockFacets };

describe("fetchOpenRefineValues saga", () => {
  beforeEach(() => {
    // Mock Value to return predictable objects
    let callCount = 0;
    vi.spyOn(valuesModule, "Value").mockImplementation((val) => ({
      id: `mock-id-${callCount++}`,
      value: val,
    }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call API and dispatch actions for each facet", () => {
    const saga = fetchOpenRefineValues(projectId, columns);
    // 1. Should call OpenRefineAPI.computeFacets
    expect(saga.next().value).toEqual(
      call(
        OpenRefineAPI.computeFacets,
        projectId,
        [
          expect.objectContaining({ name: "Column 1" }),
          expect.objectContaining({ name: "Column 2" }),
        ],
        "TODO"
      )
    );

    // 2. Provide mock API response
    const afterApi = saga.next(mockResponse);
    // 3. For each facet, should put addValues and setValueCounts
    // First facet
    expect(afterApi.value).toEqual(
      put(
        addValues(
          expect.arrayContaining([
            expect.objectContaining({ value: "A" }),
            expect.objectContaining({ value: "B" }),
          ])
        )
      )
    );
    // setValueCounts for first facet
    const afterAddValues1 = saga.next();
    expect(afterAddValues1.value).toEqual(
      put(
        setValueCounts({
          values: expect.any(Array),
          counts: [2, 3],
          columnId: "col1",
        })
      )
    );
    // Second facet
    const afterSetCounts1 = saga.next();
    expect(afterSetCounts1.value).toEqual(
      put(
        addValues(
          expect.arrayContaining([
            expect.objectContaining({ value: "X" }),
            expect.objectContaining({ value: "Y" }),
          ])
        )
      )
    );
    // setValueCounts for second facet
    const afterAddValues2 = saga.next();
    expect(afterAddValues2.value).toEqual(
      put(
        setValueCounts({
          values: expect.any(Array),
          counts: [1, 4],
          columnId: "col2",
        })
      )
    );
    // Saga should be done
    expect(saga.next().done).toBe(true);
  });

  it("should handle errors gracefully", () => {
    const saga = fetchOpenRefineValues(projectId, columns);
    saga.next(); // call API
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      saga.throw(new Error("API failed"));
    } catch (e) {
      // ignore error thrown
    }
    expect(spy).toHaveBeenCalledWith(
      "Error fetching values:",
      expect.any(Error)
    );
    spy.mockRestore();
  });
});
