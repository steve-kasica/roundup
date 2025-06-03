/* global describe, it, expect, beforeAll, afterAll */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SourceTables from "./SourceTables";
import makeServer from "../../../mock-data/server";
import "@testing-library/jest-dom";

const mockStore = configureStore([]);

// Minimal mock state for SourceTables
const initialState = {
  ui: { firstPaneWidth: 300 },
  sourceTables: {
    data: {
      1: {
        id: "1",
        name: "Table One",
        tags: ["tag1"],
        rowCount: 10,
        columnCount: 2,
        dateCreated: "2025-01-01",
        dateLastModified: "2025-01-02",
      },
      2: {
        id: "2",
        name: "Table Two",
        tags: ["tag2"],
        rowCount: 20,
        columnCount: 3,
        dateCreated: "2025-01-03",
        dateLastModified: "2025-01-04",
      },
    },
    loading: false,
    error: null,
    ids: ["1", "2"],
  },
  columns: {
    idsByTable: {
      1: ["1_col_0", "1_col_1"],
      2: ["2_col_0", "2_col_1", "2_col_2"],
    },
    data: {
      "1_col_0": { id: "1_col_0", tableId: "1", name: "A", index: 0, status: {}, values: {} },
      "1_col_1": { id: "1_col_1", tableId: "1", name: "B", index: 1, status: {}, values: {} },
      "2_col_0": { id: "2_col_0", tableId: "2", name: "X", index: 0, status: {}, values: {} },
      "2_col_1": { id: "2_col_1", tableId: "2", name: "Y", index: 1, status: {}, values: {} },
      "2_col_2": { id: "2_col_2", tableId: "2", name: "Z", index: 2, status: {}, values: {} },
    },
    selected: [],
  },
  // Add other slices as needed
};

describe("SourceTables UI", () => {
  let server;
  beforeAll(() => {
    server = makeServer();
  });
  afterAll(() => {
    server.shutdown();
  });

  it("renders search input and layout switch", () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SourceTables />
      </Provider>
    );
    expect(screen.getByLabelText(/search tables/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/layout/i)).toBeInTheDocument();
  });

  it("renders table rows from mock data", async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SourceTables />
      </Provider>
    );
    expect(await screen.findByText(/Table One/)).toBeInTheDocument();
    expect(screen.getByText(/Table Two/)).toBeInTheDocument();
  });

  it("filters tables by search", async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SourceTables />
      </Provider>
    );
    const searchInput = screen.getByLabelText(/search tables/i);
    fireEvent.change(searchInput, { target: { value: "One" } });
    await waitFor(() => {
      expect(screen.getByText(/Table One/)).toBeInTheDocument();
      expect(screen.queryByText(/Table Two/)).not.toBeInTheDocument();
    });
  });

  it("switches layouts when layout switch is toggled", () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SourceTables />
      </Provider>
    );
    const layoutSwitch = screen.getByLabelText(/layout/i);
    fireEvent.click(layoutSwitch);
    // Should render list layout (look for list role or class)
    expect(document.querySelector(".list-layout")).toBeInTheDocument();
  });
});
