/* eslint-env node */
import { intersection } from "./intersection";
import union from "./union";
import { describe, test, expect } from "vitest";

describe("intersection", () => {
  test("returns empty set when no sets are provided", () => {
    expect(intersection()).toEqual(new Set());
  });

  test("returns the same set when only one set is provided", () => {
    const setA = new Set([1, 2, 3]);
    expect(intersection(setA)).toEqual(new Set([1, 2, 3]));
  });

  test("returns intersection of two sets", () => {
    const setA = new Set([1, 2, 3]);
    const setB = new Set([2, 3, 4]);
    expect(intersection(setA, setB)).toEqual(new Set([2, 3]));
  });

  test("returns intersection of multiple sets", () => {
    const setA = new Set([1, 2, 3, 4]);
    const setB = new Set([2, 3, 4, 5]);
    const setC = new Set([0, 2, 3, 4, 6]);
    expect(intersection(setA, setB, setC)).toEqual(new Set([2, 3, 4]));
  });

  test("returns empty set if there is no intersection", () => {
    const setA = new Set([1, 2]);
    const setB = new Set([3, 4]);
    expect(intersection(setA, setB)).toEqual(new Set());
  });

  test("handles sets with different types", () => {
    const setA = new Set(["a", 1, true]);
    const setB = new Set([1, false, "a"]);
    expect(intersection(setA, setB)).toEqual(new Set(["a", 1]));
  });
});

describe("union", () => {
  test("returns empty set when no sets are provided", () => {
    expect(union()).toEqual(new Set());
  });

  test("returns the same set when only one set is provided", () => {
    const setA = new Set([1, 2, 3]);
    expect(union(setA)).toEqual(new Set([1, 2, 3]));
  });

  test("returns union of two sets", () => {
    const setA = new Set([1, 2, 3]);
    const setB = new Set([3, 4, 5]);
    expect(union(setA, setB)).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  test("returns union of multiple sets", () => {
    const setA = new Set([1]);
    const setB = new Set([2, 3]);
    const setC = new Set([3, 4, 5]);
    expect(union(setA, setB, setC)).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  test("handles sets with different types", () => {
    const setA = new Set(["a", 1]);
    const setB = new Set([true, "a"]);
    expect(union(setA, setB)).toEqual(new Set(["a", 1, true]));
  });
});
