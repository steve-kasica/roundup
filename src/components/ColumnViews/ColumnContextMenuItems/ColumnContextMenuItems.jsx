/**
 * @fileoverview ColumnContextMenuItems Component
 *
 * Provides a comprehensive context menu for column operations, allowing users to
 * perform various actions on table columns including renaming, type conversion,
 * column insertion, hiding, deletion, and focusing.
 *
 * The component manages multiple dialog states for different operations and integrates
 * with Redux state through the withColumnData HOC to access column properties and
 * dispatch actions.
 *
 * Available operations:
 * - Rename column
 * - Convert column type (categorical/numerical)
 * - Insert new column (left/right)
 * - Hide column from view
 * - Delete column
 * - Focus on column
 *
 * @module components/ColumnViews/ColumnContextMenuItems
 *
 * @example
 * <EnhancedColumnContextMenuItems
 *   includeInsert={true}
 *   isError={false}
 *   onHideColumn={handleHide}
 *   onInsertColumnLeftClick={handleInsertLeft}
 *   onInsertColumnRightClick={handleInsertRight}
 *   handleCloseMenu={handleClose}
 * />
 */

import { Divider } from "@mui/material";
import { useCallback } from "react";
import { withColumnData } from "../../HOC";
import RenameColumnItem from "./RenameColumnItem";
import DeleteColumnItem from "./DeleteColumnItem";
import FocusColumnItem from "./FocusColumnItem";
import TypeColumnItem from "./TypeColumnItem";
import InsertColumnItem from "./InsertColumnItem";

/**
 * ColumnContextMenu Component
 *
 * Renders a context menu with various column operations, including dialogs
 * for complex interactions like renaming and type conversion.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.columnType - Current column type from withColumnData HOC
 * @param {Function} props.setColumnType - Function to update column type from HOC
 * @param {Function} props.focusColumn - Function to focus on this column from HOC
 * @param {Function} props.deleteColumn - Function to delete this column from HOC
 * @param {Function} props.renameColumn - Function to rename this column from HOC
 * @param {boolean} [props.includeInsert=true] - Whether to show insert column options
 * @param {boolean} [props.isError=false] - Whether the column has errors
 * @param {Function} props.onHideColumn - Callback to hide the column
 * @param {Function} props.onInsertColumnLeftClick - Callback for inserting column to the left
 * @param {Function} props.onInsertColumnRightClick - Callback for inserting column to the right
 * @param {Function} props.handleCloseMenu - Callback to close the context menu
 *
 * @returns {React.ReactElement} Menu items with associated dialogs
 */
const ColumnContextMenu = ({
  // Props passed via `withColumnData` HOC
  id,
  index,
  focusColumn,

  deleteColumn,
  renameColumn,
  insertColumn,
  // Props passed directly from parent component
  // eslint-disable-next-line no-unused-vars
  includeInsert = true,
  isError = false,
  onHideColumn,
  handleCloseMenu,
}) => {
  const handleInsertCancel = useCallback(
    (event) => {
      handleCloseMenu(event);
    },
    [handleCloseMenu],
  );

  const handleInsertLeftSubmit = useCallback(
    (e, formValues) => {
      insertColumn(
        index,
        formValues.name,
        formValues.fillValue.length === 0 ? null : formValues.fillValue,
      );
      handleCloseMenu(e);
    },
    [handleCloseMenu, index, insertColumn],
  );

  const handleInsertRightSubmit = useCallback(
    (e, formValues) => {
      insertColumn(
        index + 1,
        formValues.name,
        formValues.fillValue.length === 0 ? null : formValues.fillValue,
      );
      handleCloseMenu(e);
    },
    [handleCloseMenu, index, insertColumn],
  );

  return (
    <>
      <RenameColumnItem id={id} handleCloseMenu={handleCloseMenu} />
      <DeleteColumnItem id={id} handleCloseMenu={handleCloseMenu} />
      <FocusColumnItem id={id} handleCloseMenu={handleCloseMenu} />
      <TypeColumnItem id={id} handleCloseMenu={handleCloseMenu} />
      <Divider orientation="horizontal" />
      <InsertColumnItem
        direction="left"
        onCancel={handleInsertCancel}
        onSubmit={handleInsertLeftSubmit}
      />
      <InsertColumnItem
        direction="right"
        onCancel={handleInsertCancel}
        onSubmit={handleInsertRightSubmit}
      />
    </>
  );
};

ColumnContextMenu.displayName = "ColumnContextMenu";

const EnhancedColumnContextMenuItems = withColumnData(ColumnContextMenu);

EnhancedColumnContextMenuItems.displayName = "EnhancedColumnContextMenuItems";

export { EnhancedColumnContextMenuItems, ColumnContextMenu };
