import PropTypes from "prop-types";
import withPackOutputDetailsData from "./withPackOutputDetailsData";
import MatchDetail from "./MatchDetail";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Typography,
  styled,
} from "@mui/material";
import Bar from "./MatchDetail/Bar";
import TableView from "./TableView";
import { MATCH_TYPES } from "./MatchDetail/withMatchDetailData";

const marginLeft = 0.3; // as a percentage of the width for the AccordionSummary
const fontSize = "12px";

// Styled accordion summary component
const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  color: "gray",
  padding: 0,
  minHeight: "5px",
  "& .MuiAccordionSummary-content": {
    alignItems: "center",
    margin: 0,
  },
}));

// Styled accordion component
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
}));

// Styled accordion details component
const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  backgroundColor: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "4px",
  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
  padding: "16px",
  margin: "8px 0",
  maxHeight: "400px",
  display: "flex",
  flexDirection: "column",
}));

function PackOutputDetails({
  isLoadingStats,
  left_unjoined = 0,
  right_unjoined = 0,
  one_to_one_matches = 0,
  many_to_many_matches = 0,
  leftTableId,
  leftColumnId,
  rightTableId,
  rightColumnId,

  setJoinType,
  joinPredicate, // Passed along from withPackOperationData.jsx
}) {
  const [checkState, setCheckState] = useState([true, true, true]); // [left, match, right]

  const totalRows =
    left_unjoined + right_unjoined + one_to_one_matches + many_to_many_matches;

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
      <StyledAccordion disableGutters>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          disabled={left_unjoined === 0}
        >
          <Typography
            component="span"
            sx={{
              width: `${marginLeft * 100}%`,
              flexShrink: 0,
              textAlign: "right",
              paddingRight: "8px",
              fontSize,
            }}
          >
            Left unmatched
          </Typography>
          <Box
            sx={{
              width: `${(1 - marginLeft) * 100}%`,
            }}
          >
            <Bar
              value={left_unjoined}
              width={(left_unjoined / totalRows) * 100}
              barColor={"gray"}
              backgroundColor="#ddd"
              opacity={0.7}
            />
          </Box>
          <Checkbox
            size="small"
            defaultChecked
            sx={{ margin: 0, padding: 0 }}
            onClick={(e) => {
              // e.stopPropagation(); // Prevent accordion toggle when clicking checkbox
              setCheckState((state) => [e.target.checked, state[1], state[2]]);
            }}
          />
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <MatchDetail
            leftTableId={leftTableId}
            leftColumnId={leftColumnId}
            rightTableId={rightTableId}
            rightColumnId={rightColumnId}
            matchType={MATCH_TYPES.LEFT_UNJOINED}
            joinPredicate={joinPredicate}
          />
        </StyledAccordionDetails>
      </StyledAccordion>
      <StyledAccordion disableGutters>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          disabled={one_to_one_matches + many_to_many_matches === 0}
        >
          <Typography
            component="span"
            sx={{
              width: `${marginLeft * 100}%`,
              flexShrink: 0,
              textAlign: "right",
              paddingRight: "8px",
              fontSize,
            }}
          >
            Matches
          </Typography>
          <Box
            sx={{
              width: `${(1 - marginLeft) * 100}%`,
            }}
          >
            <Bar
              value={one_to_one_matches + many_to_many_matches}
              width={
                ((one_to_one_matches + many_to_many_matches) / totalRows) * 100
              }
              barColor={"gray"}
              backgroundColor="#ddd"
              opacity={0.7}
            />
          </Box>
          <Checkbox
            size="small"
            defaultChecked
            sx={{ margin: 0, padding: 0 }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent accordion toggle when clicking checkbox
              setCheckState((state) => [state[0], e.target.checked, state[2]]);
            }}
          />
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <MatchDetail
            leftTableId={leftTableId}
            leftColumnId={leftColumnId}
            rightTableId={rightTableId}
            rightColumnId={rightColumnId}
            matchType={MATCH_TYPES.MATCHES}
            joinPredicate={joinPredicate}
          />
        </StyledAccordionDetails>
      </StyledAccordion>
      <StyledAccordion disableGutters>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          disabled={right_unjoined === 0}
        >
          <Typography
            component="span"
            sx={{
              width: `${marginLeft * 100}%`,
              flexShrink: 0,
              textAlign: "right",
              paddingRight: "8px",
              fontSize,
            }}
          >
            Right unmatched
          </Typography>
          <Box
            sx={{
              width: `${(1 - marginLeft) * 100}%`,
            }}
          >
            <Bar
              value={right_unjoined}
              width={(right_unjoined / totalRows) * 100}
              barColor={"gray"}
              backgroundColor="#ddd"
              opacity={0.7}
            />
          </Box>
          <Checkbox
            size="small"
            defaultChecked
            sx={{ margin: 0, padding: 0 }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent accordion toggle when clicking checkbox
              setCheckState((state) => [state[0], state[1], e.target.checked]);
            }}
          />
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <MatchDetail
            leftTableId={leftTableId}
            leftColumnId={leftColumnId}
            rightTableId={rightTableId}
            rightColumnId={rightColumnId}
            matchType={MATCH_TYPES.RIGHT_UNJOINED}
            joinPredicate={joinPredicate}
          />
        </StyledAccordionDetails>
      </StyledAccordion>
    </div>
  );
}

PackOutputDetails.propTypes = {
  packStats: PropTypes.object,
  isLoadingStats: PropTypes.bool,
  leftTableId: PropTypes.string.isRequired,
  leftColumnId: PropTypes.string.isRequired,
  rightTableId: PropTypes.string.isRequired,
  rightColumnId: PropTypes.string.isRequired,
};

const EnhancedPackOutputDetails = withPackOutputDetailsData(PackOutputDetails);
export default EnhancedPackOutputDetails;
