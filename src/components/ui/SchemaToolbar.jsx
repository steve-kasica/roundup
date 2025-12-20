/* eslint-disable react/prop-types */
import {
  Toolbar,
  Box,
  Divider,
  Dialog,
  Popover,
  List,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { EnhancedExportDialog } from "../ExportCompositeTable/ExportDialog";
import { selectAlertsById } from "../../slices/alertsSlice/selectors";
import { EnhancedAlertDescription } from "../Alerts/AlertDescription";
import {
  DeleteColumnsButton,
  ExportTableButton,
  FocusIconButton,
  HideIconButton,
  RenameObjectButton,
  SchemaAlertsButton,
  SelectToggleIconButton,
} from "./buttons";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";
import { PackOperationIcon, StackOperationIcon, TableIcon } from "./icons";

const SchemaToolbar = ({
  // Props passed via `withAssociatedAlerts.jsx` HOC
  alertIds,
  totalCount,
  errorCount,
  warningCount,
  silencedWarningCount,

  // Props passed directly from the parent component
  id,
  title,
  rowCount,
  columnCount,
  objectType,
  customMenuItems = null,
  onFocusColumns,
  onHideColumns,
  onDeleteColumns,
  onSelectToggleColumns,
  onRenameConfirm,
  isFocusedDisabled,
  isHideDisabled,
  isDeleteDisabled,
  isSelectToggleSelected,
}) => {
  const alerts = useSelector((state) => selectAlertsById(state, alertIds));

  const displayCount = useMemo(() => {
    return totalCount - silencedWarningCount;
  }, [totalCount, silencedWarningCount]);

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [alertAnchorEl, setAlertAnchorEl] = useState(null);

  const handleExport = useCallback(() => {
    setIsExportDialogOpen(true);
  }, []);

  const handleCloseExportDialog = useCallback(() => {
    setIsExportDialogOpen(false);
  }, []);

  const handleOpenAlerts = useCallback((event) => {
    setAlertAnchorEl(event.currentTarget);
  }, []);

  const handleCloseAlerts = useCallback(() => {
    setAlertAnchorEl(null);
  }, []);

  const isAlertPopoverOpen = Boolean(alertAnchorEl);

  return (
    <Toolbar
      variant="dense"
      sx={{
        minHeight: 48,
        px: 1,
        borderBottom: 1,
        borderColor: "divider",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {objectType === "stack" ? (
          <StackOperationIcon />
        ) : objectType === "pack" ? (
          <PackOperationIcon />
        ) : (
          <TableIcon />
        )}
        <Typography
          variant="h6"
          component="div"
          sx={{
            userSelect: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 200,
          }}
        >
          {title}
        </Typography>
        <Chip
          label={`${columnCount.toLocaleString()} x ${rowCount.toLocaleString()}`}
          sx={{
            userSelect: "none",
          }}
        />
      </Stack>

      <Box display="flex" gap={1}>
        {customMenuItems}
        <Divider orientation="vertical" flexItem />
        <RenameObjectButton onConfirm={onRenameConfirm} currentName={title} />
        <Divider orientation="vertical" flexItem />
        <FocusIconButton
          onClick={onFocusColumns}
          disabled={isFocusedDisabled}
        />
        <HideIconButton onClick={onHideColumns} disabled={isHideDisabled} />
        <DeleteColumnsButton
          onConfirm={onDeleteColumns}
          disabled={isDeleteDisabled}
        />
        <SelectToggleIconButton
          onClick={onSelectToggleColumns}
          isSelected={isSelectToggleSelected}
        />

        <Divider orientation="vertical" flexItem />
        {/* Alerts */}
        <SchemaAlertsButton
          onClick={handleOpenAlerts}
          disabled={totalCount === 0}
          badgeContent={displayCount}
          color={
            errorCount > 0
              ? "error"
              : warningCount - silencedWarningCount > 0
              ? "warning"
              : "default"
          }
        />
        {/* Export */}
        <ExportTableButton onClick={handleExport} disabled={errorCount > 0} />

        {/* Export Dialog */}
        <Dialog
          open={isExportDialogOpen}
          onClose={handleCloseExportDialog}
          maxWidth="sm"
          fullWidth
        >
          <EnhancedExportDialog
            id={id}
            open={isExportDialogOpen}
            onClose={handleCloseExportDialog}
          />
        </Dialog>
      </Box>

      {/* Alerts Popover */}
      <Popover
        open={isAlertPopoverOpen}
        anchorEl={alertAnchorEl}
        onClose={handleCloseAlerts}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ maxWidth: 400, maxHeight: 400 }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Alerts ({totalCount})
            </Typography>
          </Box>
          <List sx={{ maxHeight: 320, overflow: "auto", p: 0 }}>
            {alerts.map(({ id }, i, arr) => (
              <>
                <EnhancedAlertDescription key={id} id={id} />
                {i < arr.length - 1 && <Divider component="li" />}
              </>
            ))}
          </List>
        </Box>
      </Popover>
    </Toolbar>
  );
};

const EnhancedSchemaToolbar = withAssociatedAlerts(SchemaToolbar);

export { SchemaToolbar, EnhancedSchemaToolbar };
