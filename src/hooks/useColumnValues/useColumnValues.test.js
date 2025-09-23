import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useColumnValues, {
  usePaginatedColumnValues,
} from "./useColumnValues.js";
import { getColumnValues } from "../../lib/duckdb/getColumnValues.js";

// Mock the DuckDB function
vi.mock("../../lib/duckdb/getColumnValues.js", () => ({
  getColumnValues: vi.fn(),
}));

describe("useColumnValues", () => {
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
      getColumnValues.mockResolvedValue(["value1", "value2", "value3"]);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", null, 0, false)
      );

      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });

    it("should auto-fetch data when autoFetch is true", async () => {
      const mockData = ["value1", "value2", "value3"];
      getColumnValues.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", null, 0, true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getColumnValues).toHaveBeenCalledWith(
        "table1",
        "column1",
        null,
        0
      );
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });

    it("should not auto-fetch data when autoFetch is false", () => {
      getColumnValues.mockResolvedValue(["value1", "value2", "value3"]);

      renderHook(() => useColumnValues("table1", "column1", null, 0, false));

      expect(getColumnValues).not.toHaveBeenCalled();
    });
  });

  describe("Parameter handling", () => {
    it("should handle missing tableId by returning null array", async () => {
      const { result } = renderHook(() =>
        useColumnValues(null, "column1", 5, 0, true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([
        "null",
        "null",
        "null",
        "null",
        "null",
      ]);
      expect(getColumnValues).not.toHaveBeenCalled();
    });

    it("should handle missing columnId by returning null array", async () => {
      const { result } = renderHook(() =>
        useColumnValues("table1", null, 3, 0, true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(["null", "null", "null"]);
      expect(getColumnValues).not.toHaveBeenCalled();
    });

    it("should pass correct parameters to getColumnValues", async () => {
      getColumnValues.mockResolvedValue(["value1", "value2"]);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", 10, 5, true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getColumnValues).toHaveBeenCalledWith("table1", "column1", 10, 5);
    });
  });

  describe("Loading states", () => {
    it("should set loading to true while fetching", async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      getColumnValues.mockReturnValue(promise);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", null, 0, true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      resolvePromise(["value1", "value2"]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle fetch errors correctly", async () => {
      const error = new Error("Database connection failed");
      getColumnValues.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", null, 0, true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.data).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch column values:",
        error
      );
    });

    it("should clear error on successful refetch", async () => {
      const error = new Error("Initial error");
      getColumnValues.mockRejectedValueOnce(error);
      getColumnValues.mockResolvedValueOnce(["value1"]);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", null, 0, true)
      );

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.data).toEqual(["value1"]);
    });
  });

  describe("Manual operations", () => {
    it("should refetch data when refetch is called", async () => {
      getColumnValues.mockResolvedValueOnce(["initial"]);
      getColumnValues.mockResolvedValueOnce(["refetched"]);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", null, 0, true)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(["initial"]);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual(["refetched"]);
      expect(getColumnValues).toHaveBeenCalledTimes(2);
    });

    it("should reset state when reset is called", async () => {
      getColumnValues.mockResolvedValue(["value1", "value2"]);

      const { result } = renderHook(() =>
        useColumnValues("table1", "column1", null, 0, true)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(["value1", "value2"]);
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
      getColumnValues.mockResolvedValueOnce(["table1-data"]);
      getColumnValues.mockResolvedValueOnce(["table2-data"]);

      const { result, rerender } = renderHook(
        ({ tableId }) => useColumnValues(tableId, "column1", null, 0, true),
        { initialProps: { tableId: "table1" } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(["table1-data"]);
      });

      rerender({ tableId: "table2" });

      await waitFor(() => {
        expect(result.current.data).toEqual(["table2-data"]);
      });

      expect(getColumnValues).toHaveBeenCalledTimes(2);
      expect(getColumnValues).toHaveBeenNthCalledWith(
        1,
        "table1",
        "column1",
        null,
        0
      );
      expect(getColumnValues).toHaveBeenNthCalledWith(
        2,
        "table2",
        "column1",
        null,
        0
      );
    });
  });
});

describe("usePaginatedColumnValues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic functionality", () => {
    it("should return initial state correctly", async () => {
      getColumnValues.mockResolvedValue(["value1", "value2"]);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 10)
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
      const mockData = Array.from({ length: 10 }, (_, i) => `value${i + 1}`);
      getColumnValues.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 10)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getColumnValues).toHaveBeenCalledWith("table1", "column1", 10, 0);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.currentPage).toBe(0);
      expect(result.current.hasMore).toBe(true);
    });

    it("should set hasMore to false when returned data is less than pageSize", async () => {
      const mockData = ["value1", "value2"]; // Less than pageSize of 10
      getColumnValues.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 10)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("Pagination functionality", () => {
    it("should load more data when loadMore is called", async () => {
      const firstPageData = Array.from(
        { length: 5 },
        (_, i) => `page1-value${i + 1}`
      );
      const secondPageData = Array.from(
        { length: 5 },
        (_, i) => `page2-value${i + 1}`
      );

      getColumnValues.mockResolvedValueOnce(firstPageData);
      getColumnValues.mockResolvedValueOnce(secondPageData);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 5)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(firstPageData);
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
      expect(getColumnValues).toHaveBeenCalledTimes(2);
      expect(getColumnValues).toHaveBeenNthCalledWith(
        1,
        "table1",
        "column1",
        5,
        0
      );
      expect(getColumnValues).toHaveBeenNthCalledWith(
        2,
        "table1",
        "column1",
        5,
        5
      );
    });

    it("should load more data correctly", async () => {
      // Mock data with full page size so hasMore stays true
      const firstPageData = Array.from(
        { length: 5 },
        (_, i) => `value${i + 1}`
      );
      const secondPageData = Array.from(
        { length: 5 },
        (_, i) => `value${i + 6}`
      );

      getColumnValues.mockResolvedValueOnce(firstPageData);
      getColumnValues.mockResolvedValueOnce(secondPageData);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 5)
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
      expect(getColumnValues).toHaveBeenCalledTimes(2);
      expect(getColumnValues).toHaveBeenNthCalledWith(
        1,
        "table1",
        "column1",
        5,
        0
      );
      expect(getColumnValues).toHaveBeenNthCalledWith(
        2,
        "table1",
        "column1",
        5,
        5
      );
    });

    it("should not load more when hasMore is false", async () => {
      const mockData = ["value1", "value2"]; // Less than pageSize
      getColumnValues.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 5)
      );

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      // Should not make additional calls
      expect(getColumnValues).toHaveBeenCalledTimes(1);
    });
  });

  describe("Refresh and reset functionality", () => {
    it("should refresh data and reset to first page", async () => {
      const initialData = ["initial1", "initial2"];
      const refreshedData = ["refreshed1", "refreshed2"];

      getColumnValues.mockResolvedValueOnce(initialData);
      getColumnValues.mockResolvedValueOnce(refreshedData);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 5)
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
      getColumnValues.mockResolvedValue(["value1", "value2"]);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 5)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(["value1", "value2"]);
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
      const firstPageData = Array.from(
        { length: 5 },
        (_, i) => `value${i + 1}`
      );

      getColumnValues.mockResolvedValueOnce(firstPageData);
      getColumnValues.mockRejectedValueOnce(error);

      const { result } = renderHook(() =>
        usePaginatedColumnValues("table1", "column1", 5)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(firstPageData);
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
      expect(result.current.data).toEqual(firstPageData); // Original data should remain
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch paginated column values:",
        error
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle missing tableId or columnId", async () => {
      const { result } = renderHook(() =>
        usePaginatedColumnValues(null, "column1", 5)
      );

      // Should not make any API calls
      expect(getColumnValues).not.toHaveBeenCalled();

      // Loading should still be false since no fetch is attempted
      expect(result.current.loading).toBe(false);
    });

    it("should handle dependency changes by refreshing", async () => {
      getColumnValues.mockResolvedValueOnce(["table1-data"]);
      getColumnValues.mockResolvedValueOnce(["table2-data"]);

      const { result, rerender } = renderHook(
        ({ tableId }) => usePaginatedColumnValues(tableId, "column1", 5),
        { initialProps: { tableId: "table1" } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(["table1-data"]);
      });

      rerender({ tableId: "table2" });

      await waitFor(() => {
        expect(result.current.data).toEqual(["table2-data"]);
      });

      expect(getColumnValues).toHaveBeenCalledTimes(2);
    });
  });
});
