/**
 * @fileoverview Higher-Order Component for individual alert data access.
 * @module components/HOC/withAlertData
 *
 * Provides access to a single alert's data and actions from Redux state.
 * Wraps components to inject alert properties and handlers.
 *
 * Features:
 * - Alert data retrieval by ID from Redux store
 * - Delete alert action dispatch
 * - Toggle silence alert functionality
 * - Alert existence checking
 * - Full alert property injection (title, message, severity, etc.)
 *
 * @example
 * import withAlertData from './withAlertData';
 * const EnhancedAlert = withAlertData(AlertComponent);
 * <EnhancedAlert id="alert-123" />
 */
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAlertsById } from "../../slices/alertsSlice/selectors";
import {
  deleteAlerts as deleteAlertsFromSlice,
  updateAlerts as updateAlertsFromSlice,
} from "../../slices/alertsSlice/alertsSlice";

/**
 * Higher-Order Component that provides data and actions for a specific alert instance
 * from the Redux state.
 *
 * This HOC provides access to an individual alert's data and common operations
 * such as deleting or silencing the alert.
 *
 * @param {React.Component} WrappedComponent - The component to enhance with alert data
 * @returns {React.Component} Enhanced component with alert state and handlers
 */
export default function withAlertData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    // Retrieve the alert data by ID
    const alert = useSelector((state) => selectAlertsById(state, id));

    const alertExists = useMemo(() => alert !== undefined, [alert]);

    // Action to delete this alert
    const deleteAlert = useCallback(() => {
      dispatch(deleteAlertsFromSlice([id]));
    }, [dispatch, id]);

    // Action to silence this alert (placeholder for future implementation)
    const toggleSilenceAlert = useCallback(() => {
      // TODO: Implement silence functionality
      dispatch(
        updateAlertsFromSlice({
          id,
          isSilenced: !alert?.isSilenced,
        })
      );
    }, [alert?.isSilenced, dispatch, id]);

    return (
      <WrappedComponent
        // Pass along props directly from the parent component
        {...props}
        id={id}
        // Alert data
        alert={alert}
        title={alert.title}
        message={alert.message}
        description={alert.description}
        details={alert.details}
        severity={alert.severity}
        isSilenced={alert?.isSilenced}
        alertExists={alertExists}
        alertId={id}
        alertType={alert?.type}
        alertLevel={alert?.level}
        alertMessage={alert?.message}
        sourceId={alert?.sourceId}
        // Alert actions
        deleteAlert={deleteAlert}
        toggleSilenceAlert={toggleSilenceAlert}
      />
    );
  };
}
