/* eslint-disable react/prop-types */
/**
 * SourceTables.jsx
 *
 * A component for displaying and interacting with the set of source tables.
 */

import { useState } from "react";
import TableLayout from "./TableLayout";

import DragDropFileUpload from "./DragDropFileUpload";
import withAllTablesData from "./withAllTablesData";
import { createTablesRequest } from "../../sagas/createTablesSaga";
import { registerFiles } from "../../lib/duckdb";

import "./SourceTables.scss";
import { useDispatch } from "react-redux";
import Toolbar from "./Toolbar";

import { deleteTablesRequest } from "../../sagas/deleteTablesSaga/actions";

function TableSelector({
  tables,
  selectedTables,
  rowMax,
  columnMax,
  bytesMax,
  unselectAllTables,
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableSelector");
  }
  const dispatch = useDispatch();
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [selectedTableType, setSelectedTableType] = useState("");
  const [searchString, setSearchString] = useState("");
  const [layout, setLayout] = useState(null);

  const filteredTables = tables
    .filter((table) => table.name.toLowerCase().includes(searchString))
    .filter(
      (table) =>
        selectedTableType.length === 0 ||
        table.mimeType.includes(selectedTableType)
    );

  async function handleFileUpload(files) {
    if (!files.length) return;
    registerFiles(files)
      .then(() => {
        dispatch(
          createTablesRequest({
            tablesInfo: files.map((f) => ({
              source: "file upload",
              name: f.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9_]/g, "_"),
              fileName: f.name,
              extension: f.name.split(".").pop().toLowerCase(),
              size: f.size,
              mimeType: f.type,
              dateLastModified: f.lastModified,
            })),
          })
        );
      })
      .catch((error) => {
        alert("Error uploading files: " + error.message);
      })
      .finally(() => {
        // setLoading(false);
      });
  }

  if (filteredTables.length === 0) {
    return (
      <DragDropFileUpload
        handleFileUpload={handleFileUpload}
        acceptedTypes="*"
      />
    );
  }
  return (
    <div className="SourceTables">
      <Toolbar
        searchString={searchString}
        selectedTables={selectedTables}
        layout={layout}
        onSearchChange={(event) =>
          setSearchString(event.target.value.trim().toLowerCase())
        }
        onFileUpload={(event) => {
          const files = event.target.files;
          if (files && files.length > 0 && handleFileUpload) {
            handleFileUpload(Array.from(files));
          }
        }}
        onDeleteAll={() => dispatch(deleteTablesRequest(selectedTables))}
        onClearSelection={() => unselectAllTables()}
        // TODO: does this need to be global?
        onSelectAll={() => null}
        onLayoutChange={(event, newValue) => setLayout(newValue)}
      />

      <TableLayout
        searchString={searchString}
        tables={filteredTables}
        rowMax={rowMax}
        columnMax={columnMax}
        bytesMax={bytesMax}
        selectedTableIds={selectedTableIds}
        setSelectedTableIds={setSelectedTableIds}
      />
    </div>
  );
}

const EnhancedTableSelector = withAllTablesData(TableSelector);
export default EnhancedTableSelector;
