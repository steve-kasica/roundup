import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Checkbox,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MatchDetails from "./MatchDetails";
import Bar from "./Bar";

function MatchSection({
  title = "Matches",
  leftTitle = "Column 1",
  rightTitle = "Column 2",
  matches,
  barColor = "gray",
  fontSize = "12px",
  totalMatches,
}) {
  const marginLeft = 0.3; // as a percentage of the width for the AccordionSummary
  const percentage = matches.length / totalMatches; // [0,1]
  const isDisabled = matches.length === 0;

  return (
    <Accordion
      sx={{
        boxShadow: "none",
        "&:before": {
          display: "none", // Removes the divider line
        },
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        color={barColor}
        disabled={isDisabled}
        sx={{
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            margin: 0,
          },
          padding: 0,
          minHeight: "5px",
        }}
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
          {title}
        </Typography>
        <Box
          sx={{
            background: "#ddd",
            width: `${(1 - marginLeft) * 100}%`,
          }}
        >
          <Bar
            value={matches.length}
            width={percentage * 100}
            barColor={barColor}
            backgroundColor="#ddd"
            opacity={0.7}
          />
        </Box>
        <Checkbox
          size="small"
          defaultChecked={!isDisabled}
          sx={{ margin: 0, padding: 0 }}
          onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking checkbox
        />
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "16px",
          margin: "8px 0",
          maxHeight: "400px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MatchDetails
          matches={matches}
          leftTitle={leftTitle}
          rightTitle={rightTitle}
          barColor={barColor}
          fontSize={fontSize}
          totalMatches={totalMatches}
        />
      </AccordionDetails>
    </Accordion>
  );
}

MatchSection.propTypes = {
  title: PropTypes.string,
  leftTitle: PropTypes.string,
  rightTitle: PropTypes.string,
  barColor: PropTypes.string,
  fontSize: PropTypes.string,
  matches: PropTypes.array.isRequired,
  totalMatches: PropTypes.number.isRequired,
};

export default MatchSection;
