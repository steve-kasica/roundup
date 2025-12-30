/**
 * @fileoverview OperationView Component (List Item)
 *
 * Renders a single operation as an expandable accordion item in the operations list.
 * Shows operation metadata (name, type, dimensions) and provides an interface for
 * editing operation parameters.
 *
 * This component displays operations in a compact list format and is different from
 * the schema visualization OperationBlock components.
 *
 * Features:
 * - Expandable accordion for parameter editing
 * - Focus indicator when operation is selected
 * - Error message display
 * - Type-specific parameter forms (PACK/STACK)
 * - Dimension display (columns x rows)
 *
 * @module components/OperationsList/OperationView
 *
 * @example
 * <OperationView id="operation-123" index={0} />
 */

/* eslint-disable react/prop-types */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import withOperationData from "../HOC/withOperationData";
import { ExpandMore } from "@mui/icons-material";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import StackParametersForm from "../StackOperationView/StackParametersForm";
import { EnhancedPackParametersForm } from "../PackOperationView/PackParametersForm";

export const LAYOUT_ID = "operationListItem";

/**
 * OperationView Component
 *
 * An accordion list item displaying operation details with expandable parameters form.
 *
 * @component
 * @param {Object} props - Component props (provided via withOperationData HOC)
 * @param {string} props.id - Operation identifier
 * @param {string} props.name - Operation name
 * @param {string[]} props.childIds - IDs of child tables/operations
 * @param {string} props.operationType - Type of operation (PACK/STACK/NO_OP)
 * @param {number} props.columnCount - Number of columns in result
 * @param {boolean} props.isFocused - Whether this operation is currently focused
 * @param {number} props.index - Position in the list
 * @param {Function} props.focusOperation - Callback to focus this operation
 * @param {string|Object} [props.error] - Error message or object if operation failed
 *
 * @returns {React.ReactElement} An expandable accordion with operation details
 *
 * @description
 * Visual features:
 * - Left border highlight when focused
 * - Hover effect for better interactivity
 * - Error message parsing from JSON strings
 * - Type-specific parameter forms in expanded state
 */
function OperationView({
  id,
  name,
  childIds,
  operationType,
  columnCount,
  isFocused,
  index,
  focusOperation,
  error,
}) {
  const childrenIds = childIds;
  const label = operationType.charAt(0).toUpperCase() + operationType.slice(1);
  const position = index + 1;

  const renderOperationParams = () => {
    switch (operationType) {
      case OPERATION_TYPE_PACK:
        return <EnhancedPackParametersForm id={id} />;
      case OPERATION_TYPE_STACK:
        return <StackParametersForm id={id} />;
      default:
        return <Typography component="pre">Unknown operation type</Typography>;
    }
  };

  // Parse error message if it's a JSON string
  const getErrorMessage = () => {
    if (!error) return "";

    if (typeof error === "string") {
      try {
        const parsedError = JSON.parse(error);
        return parsedError.message || error;
      } catch {
        return error;
      }
    }

    return error.message || "An error occurred";
  };

  const listItemContent = (
    <>
      <Accordion
        onClick={() => {
          focusOperation();
          // TODO: remove
          // setDetailsOpen(!detailsOpen);
        }}
        sx={{
          borderLeft: isFocused ? "4px solid" : "none", // Add a left border when focused
          borderColor: isFocused ? "primary.main" : "transparent", // Border color for focus
          "&:hover": {
            backgroundColor: "action.hover", // Add hover effect
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{
            "& .MuiListItemText-primary": {
              fontWeight: isFocused ? "bold" : "normal", // Bold text when focused
            },
          }}
        >
          <ListItemText
            primary={`${position}. ${name} (${columnCount})`}
            secondary={`${label}: ${childrenIds.join(", ")}`}
          />
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "grey.50",
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
            margin: 0.5,
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
            },
          }}
        >
          <Box sx={{ padding: 0 }}>{renderOperationParams()}</Box>
        </AccordionDetails>
      </Accordion>
    </>
  );

  return error ? (
    <Tooltip title={getErrorMessage()} arrow placement="right">
      {listItemContent}
    </Tooltip>
  ) : (
    listItemContent
  );
}

OperationView.displayName = "Operation View";

const EnhancedOperationView = withOperationData(OperationView);

EnhancedOperationView.displayName = "Enhanced Operation View";
export default EnhancedOperationView;
