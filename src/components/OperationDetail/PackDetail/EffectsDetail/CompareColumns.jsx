import PropTypes from "prop-types";
import withColumnComparisonData from "./withColumnComparisonData";
import MatchSection from "./MatchSection";
import { useEffect, useState, useCallback } from "react";

function CompareColumns({
  column1,
  column2,
  leftTableName,
  rightTableName,
  noMatchesLeft,
  oneMatch,
  manyMatches,
  noMatchesRight,
  setJoinType,
}) {
  const [checkState, setCheckState] = useState([true, true, true]); // [left, match, right]
  const totalMatches =
    !column1 || !column2
      ? -1
      : oneMatch.length +
        noMatchesLeft.length +
        manyMatches.length +
        noMatchesRight.length;

  const totalRows =
    noMatchesLeft.length +
    noMatchesRight.length +
    oneMatch.reduce(
      (acc, { left, right }) => acc + left.count * right.count,
      0
    );

  const calculateJoinType = useCallback((checkState) => {
    const checkSignature = checkState
      .map((checked) => (checked ? "1" : "0"))
      .join("");

    switch (checkSignature) {
      case "111":
        return "FULL";
      case "110":
        return "LEFT";
      case "101":
        return "FULL ANTI";
      case "100":
        return "LEFT ANTI";
      case "011":
        return "RIGHT";
      case "010":
        return "INNER";
      case "001":
        return "RIGHT ANTI";
      case "000":
        return "";
      default:
        return "";
    }
  }, []);

  useEffect(() => {
    const joinType = calculateJoinType(checkState);
    setJoinType(joinType);
  }, [checkState, calculateJoinType, setJoinType]);

  return (
    <div>
      <MatchSection
        title={`${leftTableName} unmatched`}
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={noMatchesLeft}
        totalMatches={totalMatches}
        totalRows={totalRows}
        matchType="none"
        handleOnCheckboxClick={(checked) =>
          setCheckState((state) => [checked, state[1], state[2]])
        }
      />
      <MatchSection
        title="Matches"
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={oneMatch}
        totalMatches={totalMatches}
        totalRows={totalRows}
        matchType="single"
        handleOnCheckboxClick={(checked) =>
          setCheckState((state) => [state[0], checked, state[2]])
        }
      />
      <MatchSection
        title={`${rightTableName} unmatched`}
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={noMatchesRight}
        totalMatches={totalMatches}
        totalRows={totalRows}
        matchType="unmatched"
        handleOnCheckboxClick={(checked) =>
          setCheckState((state) => [state[0], state[1], checked])
        }
      />
    </div>
  );
}

CompareColumns.propTypes = {
  column1: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    values: PropTypes.object,
  }),
  column2: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    values: PropTypes.object,
  }),
  leftTableName: PropTypes.string.isRequired,
  rightTableName: PropTypes.string.isRequired,
  noMatchesLeft: PropTypes.array.isRequired,
  oneMatch: PropTypes.array.isRequired,
  manyMatches: PropTypes.array.isRequired,
  noMatchesRight: PropTypes.array.isRequired,
  setJoinType: PropTypes.func.isRequired,
};

const EnhancedCompareColumns = withColumnComparisonData(CompareColumns);
export default EnhancedCompareColumns;
