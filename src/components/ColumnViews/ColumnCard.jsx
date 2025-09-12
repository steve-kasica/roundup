import withColumnData from "./withColumnData";
import StyledPaper from "./StyledPaper";

const ColumnCard = withColumnData(
  ({
    isHovered,
    isSelected,
    hoverColumn,
    unhoverColumn,
    selectSingleColumn,
    unselectColumn,
    children,
  }) => {
    return (
      <>
        <StyledPaper
          elevation={1}
          isHovered={isHovered}
          isSelected={isSelected}
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 1,
            cursor: "pointer",
            width: 200,
            userSelect: "none",
          }}
          onClick={() => {
            if (!isSelected) selectSingleColumn();
            else unselectColumn();
          }}
          onMouseEnter={hoverColumn}
          onMouseLeave={unhoverColumn}
        >
          {children}
        </StyledPaper>
      </>
    );
  }
);

export default ColumnCard;
