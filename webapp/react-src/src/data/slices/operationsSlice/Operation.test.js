import { describe, it, expect } from "vitest";
import Operation, {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_NO_OP,
  isOperation,
  isOperationId,
} from "./Operation";

describe("Operation factory", () => {
  it("creates an operation with a valid type and children", () => {
    const children = [{ foo: "bar" }];
    const op = Operation(OPERATION_TYPE_STACK, children);
    expect(op).toHaveProperty("id");
    expect(op.id).toMatch(/^o-\d+$/);
    expect(op.operationType).toBe(OPERATION_TYPE_STACK);
    expect(op.children).toBe(children);
  });

  it("throws an error for invalid operation type", () => {
    expect(() => Operation("invalid-type", [])).toThrow(
      "Invalid operation type"
    );
  });

  it("generates unique ids for each operation", () => {
    const op1 = Operation(OPERATION_TYPE_PACK, []);
    const op2 = Operation(OPERATION_TYPE_NO_OP, []);
    expect(op1.id).not.toBe(op2.id);
    expect(op1.id).toMatch(/^o-\d+$/);
    expect(op2.id).toMatch(/^o-\d+$/);
  });
});

describe("isOperation", () => {
  it("returns true for valid operation objects", () => {
    const op = Operation(OPERATION_TYPE_STACK, []);
    expect(isOperation(op)).toBe(true);
  });

  it("returns false for non-operation objects", () => {
    expect(isOperation(null)).toBe(false);
    expect(isOperation({})).toBe(false);
    expect(isOperation({ id: 123, operationType: 456 })).toBe(false);
  });
});

describe("isOperationId", () => {
  it("returns true for valid operation ids", () => {
    const op = Operation(OPERATION_TYPE_PACK, []);
    expect(isOperationId(op.id)).toBe(true);
  });

  it("returns false for invalid ids", () => {
    expect(isOperationId("t-1")).toBe(false);
    expect(isOperationId("o-abc")).toBe(false);
    expect(isOperationId(123)).toBe(false);
    expect(isOperationId("")).toBe(false);
  });
});
