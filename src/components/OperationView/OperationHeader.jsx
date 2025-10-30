/* eslint-disable react/prop-types */
import { Box } from "@mui/material";
import withOperationData from "../HOC/withOperationData";
import { EnhancedColumnName } from "../ColumnViews";

const OperationHeader = ({
  activeColumnIds,
  columnCount,
  // Props passed directly from parent component
  keyColumnId,
  onColumnClick,
}) => {
  const columnWidth = (1 / columnCount) * 100 + "%";

  return (
    <Box display="flex" width="100%" gap={"1px"}>
      {activeColumnIds.map((columnId) => (
        <Box
          key={columnId}
          backgroundColor="#ddd"
          width={columnWidth}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={"25px"}
          cursor="pointer"
          sx={{
            ...(columnId === keyColumnId && {
              // border: "2px solid",
              fontWeight: "bold",
              position: "relative",
              "&:before": {
                content: '"🔑"',
                position: "absolute",
                top: "-29px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "primary.main",
                borderRadius: "50%",
                fontSize: "10px",
                color: "white",
                width: "15px",
                height: "15px",
                textAlign: "center",
                lineHeight: "15px",
                padding: "5px",
                zIndex: 1,
              },
            }),
          }}
          onClick={(event) => onColumnClick(event, columnId)}
        >
          <EnhancedColumnName
            id={columnId}
            // isSelected={selectedOperationColumnIds.includes(columnId)}
            sx={{
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: "inherit",
              "&:hover": {
                backgroundColor: "#555",
              },
              //   ...(selectedOperationColumnIds.includes(columnId) && {
              //     backgroundColor: "secondary.light",
              //     border: "2px solid",
              //     borderColor: "secondary.main",
              //     fontWeight: "bold",
              //     "&:hover": {
              //       backgroundColor: "secondary.main",
              //       color: "secondary.contrastText",
              //     },
              //   }),
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

const EnhancedOperationHeader = withOperationData(OperationHeader);

export { EnhancedOperationHeader, OperationHeader };
