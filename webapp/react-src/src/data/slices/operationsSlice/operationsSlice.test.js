import { describe, it, expect, beforeEach } from "vitest";
import reducer, {
  addOperation,
  removeOperation,
  changeOperationType,
  addChildToOperation,
  removeChildFromOperation,
  setFocusedOperation,
  setHoveredOperation,
} from "./operationsSlice";
import Operation, { OPERATION_TYPE_NO_OP } from "./Operation";

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
    const action = addOperation({ operationType: "stack", childId: "child1" });
    const state = reducer(initialState, action);
    expect(state.ids.length).toBe(1);
    expect(state.root).toBe(state.ids[0]);
    expect(state.data[state.root].operationType).toBe("stack");
    expect(state.data[state.root].children).toEqual(["child1"]);
  });

  it("addOperation with existing root nests previous root as child", () => {
    // Add first op
    let state = reducer(
      initialState,
      addOperation({ operationType: "stack", childId: "c1" })
    );
    const prevRoot = state.root;
    // Add second op
    state = reducer(
      state,
      addOperation({ operationType: "pack", childId: "c2" })
    );
    expect(state.ids.length).toBe(2);
    expect(state.data[state.root].children).toEqual(["c2", prevRoot]);
  });

  it("changeOperationType updates the operation type", () => {
    let state = reducer(
      initialState,
      addOperation({ operationType: "stack", childId: "c1" })
    );
    const opId = state.root;
    state = reducer(
      state,
      changeOperationType({ operationId: opId, operationType: "pack" })
    );
    expect(state.data[opId].operationType).toBe("pack");
  });

  it("addChildToOperation adds a child to operation", () => {
    let state = reducer(
      initialState,
      addOperation({ operationType: "stack", childId: "c1" })
    );
    const opId = state.root;
    state = reducer(
      state,
      addChildToOperation({ operationId: opId, childId: "c2" })
    );
    expect(state.data[opId].children).toContain("c2");
  });

  it("removeChildFromOperation removes child and operation if no children left", () => {
    let state = reducer(
      initialState,
      addOperation({ operationType: "stack", childId: "c1" })
    );
    const opId = state.root;
    state = reducer(
      state,
      removeChildFromOperation({ operationId: opId, childId: "c1" })
    );
    expect(state.data[opId]).toBeUndefined();
    expect(state.ids).not.toContain(opId);
  });

  it("setFocusedOperation sets focused", () => {
    const state = reducer(initialState, setFocusedOperation({ id: "op1" }));
    expect(state.focused).toBe("op1");
  });

  it("setHoveredOperation sets hovered", () => {
    const state = reducer(initialState, setHoveredOperation("op2"));
    expect(state.hovered).toBe("op2");
  });
});
