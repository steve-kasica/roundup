import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTableRowData, usePaginatedTableRows } from "./useTableRowData.js";
import { getTableRows } from "../lib/duckdb/getTableRows.js";

// Mock the DuckDB function
vi.mock("../../lib/duckdb/getTableRows.js", () => ({
  getTableRows: vi.fn(),
}));

describe("useTableRowData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for error tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic functionality", () => {
    it("should return initial state correctly", () => {
      getTableRows.mockResolvedValue([
        ["row1", "data1"],
        ["row2", "data2"],
      ]);

      const { result } = renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", false)
      );

      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });

    it("should auto-fetch data when autoFetch is true", async () => {
      const mockData = [
        ["row1", "data1"],
        ["row2", "data2"],
      ];
      getTableRows.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getTableRows).toHaveBeenCalledWith(
        "table1",
        null,
        50,
        0,
        null,
        "asc"
      );
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });

    it("should not auto-fetch data when autoFetch is false", () => {
      getTableRows.mockResolvedValue([["row1", "data1"]]);

      renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", false)
      );

      expect(getTableRows).not.toHaveBeenCalled();
    });
  });

  describe("Parameter handling", () => {
    it("should not fetch when tableId is missing", async () => {
      const { result } = renderHook(() =>
        useTableRowData(null, null, 50, 0, null, "asc", true)
      );

      // Should not call getTableRows
      expect(getTableRows).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    it("should pass correct parameters to getTableRows with columns list", async () => {
      getTableRows.mockResolvedValue([["value1"], ["value2"]]);

      const { result } = renderHook(() =>
        useTableRowData(
          "table1",
          ["col1", "col2"],
          25,
          10,
          "col1",
          "desc",
          true
        )
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([["value1"], ["value2"]]);
      });

      expect(getTableRows).toHaveBeenCalledWith(
        "table1",
        ["col1", "col2"],
        25,
        10,
        "col1",
        "desc"
      );
    });

    it("should handle default parameters correctly", async () => {
      getTableRows.mockResolvedValue([["row1"]]);

      const { result } = renderHook(() => useTableRowData("table1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getTableRows).toHaveBeenCalledWith(
        "table1",
        null,
        50,
        0,
        null,
        "asc"
      );
    });
  });

  describe("Loading states", () => {
    it("should set loading to true while fetching", async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      getTableRows.mockReturnValue(promise);

      const { result } = renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      resolvePromise([["row1", "data1"]]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle fetch errors correctly", async () => {
      const error = new Error("Database connection failed");
      getTableRows.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.data).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch table rows:",
        error
      );
    });

    it("should clear error on successful refetch", async () => {
      const error = new Error("Initial error");
      getTableRows.mockRejectedValueOnce(error);
      getTableRows.mockResolvedValueOnce([["row1", "data1"]]);

      const { result } = renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", true)
      );

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.data).toEqual([["row1", "data1"]]);
    });
  });

  describe("Manual operations", () => {
    it("should refetch data when refetch is called", async () => {
      getTableRows.mockResolvedValueOnce([["initial", "data"]]);
      getTableRows.mockResolvedValueOnce([["refetched", "data"]]);

      const { result } = renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", true)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([["initial", "data"]]);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual([["refetched", "data"]]);
      expect(getTableRows).toHaveBeenCalledTimes(2);
    });

    it("should reset state when reset is called", async () => {
      getTableRows.mockResolvedValue([["row1", "data1"]]);

      const { result } = renderHook(() =>
        useTableRowData("table1", null, 50, 0, null, "asc", true)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([["row1", "data1"]]);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Dependency changes", () => {
    it("should refetch when dependencies change", async () => {
      getTableRows.mockResolvedValueOnce([["table1-data"]]);
      getTableRows.mockResolvedValueOnce([["table2-data"]]);

      const { result, rerender } = renderHook(
        ({ tableId }) =>
          useTableRowData(tableId, null, 50, 0, null, "asc", true),
        { initialProps: { tableId: "table1" } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([["table1-data"]]);
      });

      rerender({ tableId: "table2" });

      await waitFor(() => {
        expect(result.current.data).toEqual([["table2-data"]]);
      });

      expect(getTableRows).toHaveBeenCalledTimes(2);
      expect(getTableRows).toHaveBeenNthCalledWith(
        1,
        "table1",
        null,
        50,
        0,
        null,
        "asc"
      );
      expect(getTableRows).toHaveBeenNthCalledWith(
        2,
        "table2",
        null,
        50,
        0,
        null,
        "asc"
      );
    });

    it("should refetch when sort parameters change", async () => {
      getTableRows.mockResolvedValueOnce([["sorted-asc"]]);
      getTableRows.mockResolvedValueOnce([["sorted-desc"]]);

      const { result, rerender } = renderHook(
        ({ sortDirection }) =>
          useTableRowData("table1", null, 50, 0, "col1", sortDirection, true),
        { initialProps: { sortDirection: "asc" } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([["sorted-asc"]]);
      });

      rerender({ sortDirection: "desc" });

      await waitFor(() => {
        expect(result.current.data).toEqual([["sorted-desc"]]);
      });

      expect(getTableRows).toHaveBeenCalledTimes(2);
      expect(getTableRows).toHaveBeenNthCalledWith(
        1,
        "table1",
        null,
        50,
        0,
        "col1",
        "asc"
      );
      expect(getTableRows).toHaveBeenNthCalledWith(
        2,
        "table1",
        null,
        50,
        0,
        "col1",
        "desc"
      );
    });
  });
});

describe("usePaginatedTableRows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic functionality", () => {
    it("should return initial state correctly", async () => {
      getTableRows.mockResolvedValue([
        ["row1", "data1"],
        ["row2", "data2"],
      ]);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 10, null, "asc")
      );

      // Initially, the hook should have these states before effects run
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.currentPage).toBe(0);
      expect(typeof result.current.loadMore).toBe("function");
      expect(typeof result.current.refresh).toBe("function");
      expect(typeof result.current.reset).toBe("function");

      // Wait for the effect to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should auto-fetch first page on mount", async () => {
      const mockData = Array.from({ length: 10 }, (_, i) => [
        `row${i + 1}`,
        `data${i + 1}`,
      ]);
      getTableRows.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 10, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getTableRows).toHaveBeenCalledWith(
        "table1",
        null,
        10,
        0,
        null,
        "asc"
      );
      expect(result.current.data).toEqual(mockData);
      expect(result.current.currentPage).toBe(0);
      expect(result.current.hasMore).toBe(true);
    });

    it("should set hasMore to false when returned data is less than pageSize", async () => {
      const mockData = [
        ["row1", "data1"],
        ["row2", "data2"],
      ]; // Less than pageSize of 10
      getTableRows.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 10, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("Pagination functionality", () => {
    it("should load more data when loadMore is called", async () => {
      const firstPageData = Array.from({ length: 5 }, (_, i) => [
        `page1-row${i + 1}`,
        `data${i + 1}`,
      ]);
      const secondPageData = Array.from({ length: 5 }, (_, i) => [
        `page2-row${i + 1}`,
        `data${i + 1}`,
      ]);

      getTableRows.mockResolvedValueOnce(firstPageData);
      getTableRows.mockResolvedValueOnce(secondPageData);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 5, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(firstPageData);
        expect(result.current.hasMore).toBe(true);
      });

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([
          ...firstPageData,
          ...secondPageData,
        ]);
      });

      expect(result.current.currentPage).toBe(1);
      expect(getTableRows).toHaveBeenCalledTimes(2);
      expect(getTableRows).toHaveBeenNthCalledWith(
        1,
        "table1",
        null,
        5,
        0,
        null,
        "asc"
      );
      expect(getTableRows).toHaveBeenNthCalledWith(
        2,
        "table1",
        null,
        5,
        5,
        null,
        "asc"
      );
    });

    it("should not load more when hasMore is false", async () => {
      const mockData = [
        ["row1", "data1"],
        ["row2", "data2"],
      ]; // Less than pageSize
      getTableRows.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 5, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      // Should not make additional calls
      expect(getTableRows).toHaveBeenCalledTimes(1);
    });
  });

  describe("Refresh and reset functionality", () => {
    it("should refresh data and reset to first page", async () => {
      const initialData = [
        ["initial1", "data1"],
        ["initial2", "data2"],
      ];
      const refreshedData = [
        ["refreshed1", "data1"],
        ["refreshed2", "data2"],
      ];

      getTableRows.mockResolvedValueOnce(initialData);
      getTableRows.mockResolvedValueOnce(refreshedData);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 5, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      await act(async () => {
        result.current.refresh();
      });

      expect(result.current.data).toEqual(refreshedData);
      expect(result.current.currentPage).toBe(0);
    });

    it("should reset state completely", async () => {
      getTableRows.mockResolvedValue([["row1", "data1"]]);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 5, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([["row1", "data1"]]);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.currentPage).toBe(0);
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle errors during loadMore", async () => {
      const error = new Error("Pagination error");
      // Mock full page size data so hasMore stays true
      const fullPageData = Array.from({ length: 5 }, (_, i) => [
        `row${i + 1}`,
        `data${i + 1}`,
      ]);
      getTableRows.mockResolvedValueOnce(fullPageData);
      getTableRows.mockRejectedValueOnce(error);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 5, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(fullPageData);
        expect(result.current.error).toBe(null);
        expect(result.current.hasMore).toBe(true);
      });

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.data).toEqual(fullPageData); // Original data should remain
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch paginated table rows:",
        error
      );
    });

    it("should handle errors during initial fetch", async () => {
      const error = new Error("Initial fetch error");
      getTableRows.mockRejectedValue(error);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 5, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.data).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch paginated table rows:",
        error
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle missing tableId gracefully", async () => {
      const { result } = renderHook(() =>
        usePaginatedTableRows(null, null, 5, null, "asc")
      );

      // Should not call getTableRows
      expect(getTableRows).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    it("should handle dependency changes by refreshing", async () => {
      getTableRows.mockResolvedValueOnce([["table1-data"]]);
      getTableRows.mockResolvedValueOnce([["table2-data"]]);

      const { result, rerender } = renderHook(
        ({ tableId }) => usePaginatedTableRows(tableId, null, 5, null, "asc"),
        { initialProps: { tableId: "table1" } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([["table1-data"]]);
      });

      rerender({ tableId: "table2" });

      await waitFor(() => {
        expect(result.current.data).toEqual([["table2-data"]]);
      });

      expect(getTableRows).toHaveBeenCalledTimes(2);
    });

    it("should handle empty response arrays", async () => {
      getTableRows.mockResolvedValue([]);

      const { result } = renderHook(() =>
        usePaginatedTableRows("table1", null, 5, null, "asc")
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.hasMore).toBe(false);
    });
  });
});
