/**
 * @fileoverview Schema view window component.
 * @module layouts/SupportingPane/SchemaWindow
 *
 * Main content area that displays the appropriate schema view based
 * on the currently focused object (table or operation type).
 *
 * Features:
 * - Empty state when no tables uploaded
 * - Table schema view for focused tables
 * - Stack schema view for STACK operations
 * - Pack schema view for PACK operations
 * - Drop target for adding source tables
 *
 * @example
 * <SchemaWindow />
 */
import { Alert, Box, Divider, Typography } from "@mui/material";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectOperationsById,
  selectAllOperationIds,
} from "../../slices/operationsSlice";
import { useSelector } from "react-redux";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedStackSchemaView } from "../../components/StackOperationView/StackSchemaView/StackSchemaView";
import PackSchemaView from "../../components/PackSchemaView";
import { EnhancedTableSchema } from "../../components/TableView";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import FocusedObjectSelect from "../../components/AppToolbar/FocusedObjectSelect";
import RenameFocusedObjectButton from "../../components/AppToolbar/RenameFocusedObjectButton";
import ChangeTableOrder from "../../components/AppToolbar/ChangeTableOrder";
import SelectAllColumnsButton from "../../components/AppToolbar/SelectAllColumnsButton";
import FocusColumnsButton from "../../components/AppToolbar/FocusColumnsButton/FocusColumnsButton";
import HideColumnsButton from "../../components/AppToolbar/HideColumnsButton";
import DeleteColumnsButton from "../../components/AppToolbar/DeleteColumnsButton";
import { ExportTableButton } from "../../components/AppToolbar/ExportTable";
import AlertsButton from "../../components/AppToolbar/AlertsButton";
import PackMatchToggleButtonGroup from "../../components/AppToolbar/PackMatchToggleButtonGroup";

export default function SchemaWindow() {
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const isFocusedTable = isTableId(focusedObjectId);
  const focusedOperation = useSelector((state) =>
    isFocusedTable ? null : selectOperationsById(state, focusedObjectId),
  );

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent={"space-between"}
        height={48}
        borderBottom={1}
        borderColor="divider"
        p={0.5}
      >
        <Typography
          variant="h6"
          sx={{
            userSelect: "none",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          Schema&nbsp;View
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center">
          <FocusedObjectSelect />
          <RenameFocusedObjectButton />
          <ChangeTableOrder />
          <Divider orientation="vertical" flexItem />
          <SelectAllColumnsButton />
          <FocusColumnsButton />
          <HideColumnsButton />
          <DeleteColumnsButton />
          <Divider orientation="vertical" flexItem />
          <PackMatchToggleButtonGroup />
          <Divider orientation="vertical" flexItem />
          <ExportTableButton />
          <AlertsButton />
        </Box>
      </Box>

      {isTableId(focusedObjectId) ? (
        <EnhancedTableSchema id={focusedObjectId} />
      ) : focusedOperation?.operationType === OPERATION_TYPE_STACK ? (
        <EnhancedStackSchemaView id={focusedObjectId} />
      ) : focusedOperation?.operationType === OPERATION_TYPE_PACK ? (
        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <PackSchemaView id={focusedObjectId} />
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box display={"flex"} flexDirection={"column"} mt={2}>
            <Alert severity="error">Focus on an object to see details</Alert>
          </Box>
        </Box>
      )}
    </>
  );
}
