/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import withPackOperationData from "./withPackOperationData";

const PackOperationLabel = ({ operation, loading = false, error = false }) => {
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  if (!operation) return <span>No data</span>;

  return <Typography>{operation.name || operation.id}</Typography>;
};

const EnhancedPackOperationLabel = withPackOperationData(PackOperationLabel);

export { EnhancedPackOperationLabel, PackOperationLabel };
