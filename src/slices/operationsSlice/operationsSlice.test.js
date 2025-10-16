import { describe, it, expect, beforeEach } from "vitest";
import reducer, {
  addOperation,
  addChildToOperation,
  removeChildFromOperation,
  setHoveredOperation,
  updateOperations,
} from "./operationsSlice";
import Operation from "./Operation";

// Helper to create a minimal operation
function makeOp(type = "TEST", children = []) {
  return Operation(type, children);
}

describe("operationsSlice reducers", () => {
  let initialState;
  beforeEach(() => {
    initialState = {
      data: {},
      ids: [],
      root: null,
      focused: null,
      hovered: null,
    };
  });

  it("addOperation adds a new operation and sets it as root", () => {
    const op = Operation("stack", ["child1"]);
    const action = addOperation(op);
    const state = reducer(initialState, action);
    expect(state.ids.length).toBe(1);
    expect(state.root).toBe(state.ids[0]);
    expect(state.data[state.root].operationType).toBe("stack");
    expect(state.data[state.root].children).toEqual(["child1"]);
  });

  it("addOperation with existing root nests previous root as child", () => {
    // Add first op
    const op1 = Operation("stack", ["c1"]);
    let state = reducer(initialState, addOperation(op1));
    const prevRoot = state.root;
    // Add second op
    const op2 = Operation("pack", ["c2"]);
    state = reducer(state, addOperation(op2));
    expect(state.ids.length).toBe(2);
    expect(state.data[state.root].children).toEqual(["c2", prevRoot]);
  });

  it("updateOperations updates the operation type", () => {
    const op = Operation("stack", ["c1"]);
    let state = reducer(initialState, addOperation(op));
    const opId = state.root;
    state = reducer(
      state,
      updateOperations({ id: opId, operationType: "pack" })
    );
    expect(state.data[opId].operationType).toBe("pack");
  });

  it("addChildToOperation adds a child to operation", () => {
    const op = Operation("stack", ["c1"]);
    let state = reducer(initialState, addOperation(op));
    const opId = state.root;
    state = reducer(
      state,
      addChildToOperation({ operationId: opId, childId: "c2" })
    );
    expect(state.data[opId].children).toContain("c2");
  });

  it("removeChildFromOperation removes child and operation if no children left", () => {
    const op = Operation("stack", ["c1"]);
    let state = reducer(initialState, addOperation(op));
    const opId = state.root;
    state = reducer(
      state,
      removeChildFromOperation({ operationId: opId, childId: "c1" })
    );
    expect(state.data[opId]).toBeUndefined();
    expect(state.ids).not.toContain(opId);
  });

  it("setHoveredOperation sets hovered", () => {
    const state = reducer(initialState, setHoveredOperation("op2"));
    expect(state.hovered).toBe("op2");
  });
});
