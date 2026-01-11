import { renderHook, waitFor } from "@testing-library/react";
import { it, describe, expect, vi, beforeEach } from "vitest";
import { usePaginatedValueCounts } from "./useValueCounts";
import * as reactRedux from "react-redux";
import * as getValueCounts from "../../lib/duckdb/getValueCounts";

// Mock Redux selectors
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

// Mock getPaginatedValueCounts
vi.mock("../../lib/duckdb/getValueCounts", () => ({
  getPaginatedValueCounts: vi.fn(),
}));

describe("usePaginatedValueCounts Hook", () => {
  const exampleData = {
    "Value A": 10,
    "Value B": 5,
    "Value C": 2,
    "Value D": 8,
    "Value E": 15,
    "Value F": 3,
    "Value G": 7,
    "Value H": 1,
    "Value I": 4,
    "Value J": 6,
  };

  const mockDataPage1 = Object.entries(exampleData)
    .slice(0, 5)
    .map(([value, count]) => ({ value, count }));
  const mockDataPage2 = Object.entries(exampleData)
    .slice(5)
    .map(([value, count]) => ({ value, count }));

  beforeEach(() => {
    // Setup default mocks for Redux selectors
    vi.mocked(reactRedux.useSelector).mockImplementation((selector) => {
      // Mock selectColumnsById
      if (
        selector.toString().includes("selectColumnsById") ||
        selector.name === "selectColumnsById"
      ) {
        return {
          id: "c1",
          databaseName: "test_column",
          parentId: "t1",
        };
      }
      // Mock selectTablesById
      if (
        selector.toString().includes("selectTablesById") ||
        selector.name === "selectTablesById"
      ) {
        return {
          id: "t1",
          databaseName: "test_table",
        };
      }
      // Mock selectOperationsById
      if (
        selector.toString().includes("selectOperationsById") ||
        selector.name === "selectOperationsById"
      ) {
        return {
          id: "o1",
          databaseName: "test_operation",
        };
      }
      return null;
    });

    // Setup mock for getPaginatedValueCounts to return exampleData
    vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValue({
      data: mockDataPage1,
      hasMore: true,
      total: 10,
      offset: 0,
      limit: 5,
      currentCount: mockDataPage1.length,
    });
  });

  describe("Initial fetch", () => {
    it("should load the same number of results as `pageSize` property", async () => {
      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      // Wait for the initial fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(5);
      expect(result.current.data).toEqual(mockDataPage1);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.total).toBe(10);
    });
  });

  describe("Fetching additional pages", () => {
    it("should fetch next page when loadMore is called", async () => {
      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock call history after initial fetch
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockClear();

      // Mock the second page response
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValueOnce({
        data: mockDataPage2,
        hasMore: false,
        total: 10,
        offset: 5,
        limit: 5,
        currentCount: mockDataPage2.length,
      });

      // Call loadMore
      result.current.loadMore();

      // Wait for second page to load
      await waitFor(() => {
        expect(result.current.currentPage).toBe(1);
      });

      expect(getValueCounts.getPaginatedValueCounts).toHaveBeenCalledTimes(1);
      expect(getValueCounts.getPaginatedValueCounts).toHaveBeenLastCalledWith(
        "test_table",
        "test_column",
        5,
        5
      );
    });

    it("should append new results to existing data", async () => {
      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialDataLength = result.current.data.length;

      // Mock the second page response
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValueOnce({
        data: mockDataPage2,
        hasMore: false,
        total: 10,
        offset: 5,
        limit: 5,
        currentCount: mockDataPage2.length,
      });

      // Call loadMore
      result.current.loadMore();

      // Wait for data to be appended
      await waitFor(() => {
        expect(result.current.data.length).toBeGreaterThan(initialDataLength);
      });

      // Data should now contain both pages
      expect(result.current.data.length).toBe(10);
      expect(result.current.hasMore).toBe(false);
    });

    it("should include all data after multiple loadMore calls", async () => {
      // Create 3 pages of data
      const page1 = mockDataPage1.slice(0, 3);
      const page2 = mockDataPage1.slice(3, 5);
      const page3 = mockDataPage2.slice(0, 2);

      vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValueOnce({
        data: page1,
        hasMore: true,
        total: 8,
        offset: 0,
        limit: 3,
        currentCount: 3,
      });

      const { result } = renderHook(() => usePaginatedValueCounts("c1", 3));

      // Wait for page 1
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.data).toHaveLength(3);

      // Mock page 2
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValueOnce({
        data: page2,
        hasMore: true,
        total: 8,
        offset: 3,
        limit: 3,
        currentCount: 2,
      });

      result.current.loadMore();
      await waitFor(() => {
        expect(result.current.data.length).toBe(5);
      });

      // Mock page 3
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValueOnce({
        data: page3,
        hasMore: false,
        total: 8,
        offset: 6,
        limit: 3,
        currentCount: 2,
      });

      result.current.loadMore();
      await waitFor(() => {
        expect(result.current.data.length).toBe(7);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("End of data handling", () => {
    it("should set hasMore to false when no more data is available", async () => {
      // Mock single page with no more data
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValue({
        data: mockDataPage1,
        hasMore: false,
        total: 5,
        offset: 0,
        limit: 5,
        currentCount: 5,
      });

      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it("should not fetch more data when hasMore is false", async () => {
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockResolvedValue({
        data: mockDataPage1,
        hasMore: false,
        total: 5,
        offset: 0,
        limit: 5,
        currentCount: 5,
      });

      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCount =
        getValueCounts.getPaginatedValueCounts.mock.calls.length;

      // Try to load more when hasMore is false
      result.current.loadMore();

      // Should not make additional calls
      expect(getValueCounts.getPaginatedValueCounts).toHaveBeenCalledTimes(
        callCount
      );
    });
  });

  describe("Error handling", () => {
    it("should set error state when fetch fails", async () => {
      const mockError = new Error("Failed to fetch data");
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockRejectedValue(
        mockError
      );

      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.loading).toBe(false);
    });

    it("should not update data when an error occurs", async () => {
      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      // Wait for initial successful fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialData = result.current.data;
      const mockError = new Error("Failed to fetch page 2");

      // Mock error on second page
      vi.mocked(getValueCounts.getPaginatedValueCounts).mockRejectedValueOnce(
        mockError
      );

      result.current.loadMore();

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Data should remain unchanged
      expect(result.current.data).toEqual(initialData);
    });
  });

  describe("Loading state", () => {
    it("should set loading state during data fetch", async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(getValueCounts.getPaginatedValueCounts).mockReturnValue(
        promise
      );

      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      // Should be loading initially
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve the promise
      resolvePromise({
        data: mockDataPage1,
        hasMore: false,
        total: 5,
        offset: 0,
        limit: 5,
        currentCount: 5,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should reset loading state after fetch completes", async () => {
      const { result } = renderHook(() => usePaginatedValueCounts("c1", 5));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toHaveLength(5);
    });
  });
});
