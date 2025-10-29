/* eslint-disable react/prop-types */

import { useDispatch, useSelector } from "react-redux";
import { selectAlertIdsBySourceId } from "../../slices/alertsSlice/alertsSelectors";
import { removeAlerts as removeAlertsAction } from "../../slices/alertsSlice/alertsSlice";
import { useCallback } from "react";

export default function withAssociatedAlerts(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    const alertIds = useSelector((state) =>
      selectAlertIdsBySourceId(state, id)
    );

    // Removing an alert delete the object from state
    // But it can instantiated again when associated objects are updated.
    const removeAlerts = useCallback(
      (alertId) => {
        dispatch(removeAlertsAction([alertId]));
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
        hasAlerts={alertIds.length > 0}
        removeAlerts={removeAlerts} // Function to remove an alert by ID
        silenceAlerts={silenceAlerts} // Function to silence an alert by ID
      />
    );
  };
}
