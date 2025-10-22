/* eslint-disable react/prop-types */
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
} from "../../slices/operationsSlice";
// import withOperationData from "../HOC/withOperationData";
// import { PackOperationLabel } from "../PackOperationView";
// import { StackOperationLabel } from "../StackOperationView";

/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import StackOperationIcon from "../StackOperationView/StackOperationIcon";
import PackOperationIcon from "../PackOperationView/PackOperationIcon";
import { useSelector } from "react-redux";
import {
  selectActiveColumnIdsByTableId,
  selectColumnIdsByTableId,
} from "../../slices/columnsSlice";

const OperationLabel = ({
  id,
  name,
  operationType,
  columnCount = 0,
  rowCount = 0,
  loading = false,
  error = false,
  includeIcon = true,
  includeDimensions = true,
}) => {
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  if (!id) return <span>No data</span>;

  return (
    <Stack direction={"row"} spacing={1} alignItems="center">
      {includeIcon && operationType === OPERATION_TYPE_STACK && (
        <StackOperationIcon />
      )}
      {includeIcon && operationType === OPERATION_TYPE_PACK && (
        <PackOperationIcon />
      )}
      <Typography variant="h6" component="div" sx={{ userSelect: "none" }}>
        {name || id}{" "}
        {includeDimensions && (
          <small>
            ({columnCount.toLocaleString()} x {rowCount.toLocaleString()})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

OperationLabel.displayName = "OperationLabel";

const EnhancedOperationLabel = (props) => {
  const operation = useSelector((state) => selectOperation(state, props.id));
  const activeColumnIds = useSelector((state) =>
    selectActiveColumnIdsByTableId(state, props.id)
  );
  console.log("EnhancedOperationLabel operation:", operation, activeColumnIds);
  return (
    <OperationLabel
      {...props}
      operationType={operation ? operation.operationType : null}
      name={operation ? operation.name : null}
      rowCount={operation.rowCount}
      columnCount={activeColumnIds.length}
    />
  );
};

EnhancedOperationLabel.displayName = "EnhancedOperationLabel";

export { OperationLabel, EnhancedOperationLabel };
