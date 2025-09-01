/**
 * SourceTables.jsx
 *
 * A component for displaying and interacting with the set of source tables.
 */

import { useState } from "react";
import PropTypes from "prop-types";
import TableLayout from "./TableLayout";
import ListLayout from "./ListLayout";

import DragDropFileUpload from "./DragDropFileUpload";
import withAllTablesData from "../HOC/withAllTablesData";
import { uploadTablesAction } from "../../sagas/uploadTablesSaga";
import { registerFiles } from "../../lib/duckdb";

import "./SourceTables.scss";
import { useDispatch } from "react-redux";
import Toolbar from "./Toolbar";

import { LAYOUT_ID as listLayout } from "./ListLayout";
import { LAYOUT_ID as tableLayout } from "./TableLayout";
import { setSelectedTables } from "../../slices/tablesSlice";
import { dropTablesAction } from "../../sagas/dropTablesSaga";

const DEFAULT_LAYOUT = tableLayout; // Default layout can be set to either 'table' or 'list'

function TableSelector({
  tables,
  selectedTables,
  rowMax,
  columnMax,
  bytesMax,
  unselectAllTables,
}) {
  const dispatch = useDispatch();
  const [selectedTableType, setSelectedTableType] = useState("");
  const [searchString, setSearchString] = useState("");
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

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
          uploadTablesAction({
            filesInfo: files.map((f) => ({
              name: f.name,
              size: f.size,
              type: f.type,
              lastModified: f.lastModified,
            })),
            source: "duckdb",
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
        onDeleteAll={() => dispatch(dropTablesAction(selectedTables))}
        onClearSelection={() => unselectAllTables()}
        onSelectAll={() =>
          dispatch(setSelectedTables(filteredTables.map(({ id }) => id)))
        }
        onLayoutChange={(event, newValue) => setLayout(newValue)}
      />
      {layout === listLayout ? (
        <ListLayout
          searchString={searchString}
          tables={filteredTables}
          rowMax={rowMax}
          columnMax={columnMax}
          bytesMax={bytesMax}
        />
      ) : (
        <TableLayout
          searchString={searchString}
          tables={filteredTables}
          rowMax={rowMax}
          columnMax={columnMax}
          bytesMax={bytesMax}
        />
      )}
    </div>
  );
}

TableSelector.propTypes = {
  tables: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      mimeType: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedTables: PropTypes.array.isRequired,
  rowMax: PropTypes.number.isRequired,
  unselectAllTables: PropTypes.func.isRequired,
};

const EnhancedTableSelector = withAllTablesData(TableSelector);
export default EnhancedTableSelector;
