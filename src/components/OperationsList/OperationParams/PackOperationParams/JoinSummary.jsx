import { Typography } from "@mui/material";

const JoinSummary = ({
  leftTableId = "left table",
  rightTableId = "right table",
  leftColumnId = "left column",
  rightColumnId = "right column",
  joinPredicate,
}) => {
  return (
    <Typography variant="body2" sx={{ mb: 2 }}>
      Combining {leftTableId} with {rightTableId} where values in {leftColumnId}{" "}
      {joinPredicate.toLowerCase().replace(/_/g, " ")} {rightColumnId}.
    </Typography>
  );
};

export default JoinSummary;
