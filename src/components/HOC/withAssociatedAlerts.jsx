/* eslint-disable react/prop-types */

import { useDispatch, useSelector } from "react-redux";
import {
  selectAlertErrorCount,
  selectAlertIdsBySourceId,
  selectAlertWarningCount,
} from "../../slices/alertsSlice/selectors";
import { deleteAlerts as deleteAlertsAction } from "../../slices/alertsSlice/alertsSlice";
import { useCallback } from "react";

export default function withAssociatedAlerts(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    const alertIds = useSelector((state) =>
      selectAlertIdsBySourceId(state, id)
    );

    const warningCount = useSelector((state) =>
      selectAlertWarningCount(state, id)
    );
    const errorCount = useSelector((state) => selectAlertErrorCount(state, id));

    // Removing an alert delete the object from state
    // But it can instantiated again when associated objects are updated.
    const deleteAlerts = useCallback(
      (alertId) => {
        dispatch(deleteAlertsAction([alertId]));
      },
      [dispatch]
    );

    // Silencing an alert essentially mutes it without deleting it
    const silenceAlerts = useCallback(() => {
      // TODO: Implement silence functionality
      console.warn("silenceAlerts not yet implemented");
    }, []);

    return (
      <WrappedComponent
        // Pass along props directly from the parent component
        {...props}
        id={id} // Need to pass id explicitly for composition
        alertIds={alertIds} // IDs of alerts associated with this id
        totalCount={alertIds.length}
        errorCount={errorCount}
        warningCount={warningCount}
        deleteAlerts={deleteAlerts} // Function to remove an alert by ID
        silenceAlerts={silenceAlerts} // Function to silence an alert by ID
      />
    );
  };
}
