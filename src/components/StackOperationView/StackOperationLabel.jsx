/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import withStackOperationData from "./withStackOperationData";

const StackOperationLabel = ({ operation, loading = false, error = false }) => {
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  if (!operation) return <span>No data</span>;

  return <Typography>STACK: {operation.name || operation.id}</Typography>;
};

const EnhancedStackOperationLabel = withStackOperationData(StackOperationLabel);

export { EnhancedStackOperationLabel, StackOperationLabel };
