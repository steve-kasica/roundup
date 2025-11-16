/* eslint-disable react/prop-types */
import {
  FileDownload as ExportIcon,
  ErrorOutline as AlertIcon,
} from "@mui/icons-material";
import {
  IconButton,
  Toolbar,
  Box,
  Divider,
  Dialog,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedColumnIds } from "../../slices/uiSlice";
import { useCallback, useState } from "react";
import { EnhancedExportDialog } from "../ExportCompositeTable/ExportDialog";
import { selectAlertsById } from "../../slices/alertsSlice/selectors";

const SchemaToolbar = ({
  // columnIds,
  objectId,
  alertIds,
  hasAlerts,
  children,
  customMenuItems = null,
  handleExcludeSelected = () => {},
}) => {
  const dispatch = useDispatch();
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const alerts = useSelector((state) => selectAlertsById(state, alertIds));
  // const areAllColumnsSelected =
  //   columnIds.length > 0 && selectedColumnIds.length === columnIds.length;

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {children}
      </Box>

      {/* Action Buttons Section - Bulk operations for selected columns */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Custom Menu Items */}
        {customMenuItems}

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1, height: 28, alignSelf: "center" }}
        />

        {/* Alerts */}
        <IconButton
          size="small"
          onClick={handleOpenAlerts}
          disabled={alerts.length === 0}
          title={`View alerts (${alerts.length})`}
          color={alerts.length > 0 ? "warning" : "default"}
        >
          <Badge badgeContent={alerts.length} color="warning">
            <AlertIcon fontSize="small" />
          </Badge>
        </IconButton>

        {/* Export */}
        <IconButton
          size="small"
          disabled={hasAlerts}
          onClick={handleExport}
          title="Export"
        >
          <ExportIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Export Dialog */}
      <Dialog
        open={isExportDialogOpen}
        onClose={handleCloseExportDialog}
        maxWidth="sm"
        fullWidth
      >
        <EnhancedExportDialog
          id={objectId}
          open={isExportDialogOpen}
          onClose={handleCloseExportDialog}
        />
      </Dialog>

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
              bgcolor: "warning.light",
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Alerts ({alerts.length})
            </Typography>
          </Box>
          <List sx={{ maxHeight: 320, overflow: "auto", p: 0 }}>
            {alerts.map((alert, index) => (
              <ListItem
                key={alert?.id || index}
                divider={index < alerts.length - 1}
                sx={{ py: 1.5, px: 2 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {alert?.title || alert?.message || "Alert"}
                    </Typography>
                  }
                  secondary={
                    alert?.description || alert?.details ? (
                      <Typography variant="caption" color="text.secondary">
                        {alert?.description || alert?.details}
                      </Typography>
                    ) : null
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </Toolbar>
  );
};

export default SchemaToolbar;
