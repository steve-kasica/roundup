import { Box } from "@mui/material";
import PropTypes from "prop-types";
import withPackOperationData from "./withPackOperationData";
import HighLevelView from "./HighLevelView";
import LowLevelView from "./LowLevelView";

const PackOperationView = ({ resolution }) => {
  return (
    <Box>
      {resolution === "high" && <HighLevelView />}
      {resolution === "low" && <LowLevelView />}
    </Box>
  );
};

PackOperationView.propTypes = {
  operation: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    joinPredicate: PropTypes.string,
    joinKey1: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    joinKey2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setJoinPredicate: PropTypes.func.isRequired,
  setLeftTableJoinKey: PropTypes.func.isRequired,
  setRightTableJoinKey: PropTypes.func.isRequired,
  swapTablePositions: PropTypes.func.isRequired,
  renameOperation: PropTypes.func.isRequired,
  setJoinType: PropTypes.func.isRequired,
};

const EnhancedPackOperationView = withPackOperationData(PackOperationView);
export default EnhancedPackOperationView;
