import { Box } from "@mui/material";
import { extent, scaleLinear } from "d3";
import { useMemo } from "react";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedTableName } from "../TableView/TableName";

const ValueCountUpset = ({
  signatures,
  data = [],
  uniqueValues = [],
  valueDegrees = [],
  parentIds = [],
  rowHeight = 32,
  yAxisWidth = 100,
  valueRowRefs,
  bodyRef,
}) => {
  const colWidth = useMemo(
    () => (1 / parentIds.length) * 100 + "%",
    [parentIds.length]
  );
  const signatureExtent = useMemo(
    () =>
      signatures.map((sig) =>
        extent(
          sig
            .split("")
            .map((v, i) => [Number(v), i])
            .filter(([b]) => b)
            .map(([, i]) => i)
        )
      ),
    [signatures]
  );
  const colorScale = (value) => {
    if (value === 0) return "#aaa";
    return "#000";
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ mt: 2 }}>
      {/* x-axis labels, columns or tables */}
      <Box
        display="flex"
        justifyContent={"space-around"}
        sx={{ flex: 1, height: "30px" }}
      >
        <Box
          sx={{
            width: `${yAxisWidth}px`,
            padding: "4px",
            textAlign: "right",
            boxSizing: "border-box",
          }}
        ></Box>
        <Box
          display="flex"
          flex="1"
          sx={{
            borderBottom: "1px solid #ccc",
          }}
        >
          {parentIds.map((parentId) =>
            isTableId(parentId) ? (
              <EnhancedTableName
                key={parentId}
                id={parentId}
                sx={{
                  width: `${colWidth}`,
                  textAlign: "center",
                }}
              />
            ) : (
              "TODO"
              // <EnhancedOperationOutputTableName
              //   key={parentId}
              //   operationId={parentId}
              // />
            )
          )}
        </Box>
      </Box>
      <Box
        ref={bodyRef}
        sx={{
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        {data.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "row",
              borderBottom: "1px solid #eee",
              height: `${rowHeight}px`,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              title={uniqueValues[i]}
              ref={(el) => (valueRowRefs.current[i] = el)}
              sx={{
                width: `${yAxisWidth}px`,
                padding: "4px",
                textAlign: "right",
                boxSizing: "border-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                userSelect: "none",
              }}
            >
              {uniqueValues[i]}
            </Box>
            <Box display="flex" flex="1">
              {row.map((count, j) => (
                <Box
                  key={j}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: colWidth,
                    padding: "4px",
                    textAlign: "center",
                    borderLeft: "none",
                    boxSizing: "border-box",
                    position: "relative",
                    "&::after":
                      valueDegrees[i] > 1
                        ? {
                            content: '""',
                            position: "absolute",
                            top: "45%",
                            left:
                              j > signatureExtent[i][0] &&
                              j <= signatureExtent[i][1]
                                ? "0"
                                : "50%",
                            right:
                              j >= signatureExtent[i][0] &&
                              j < signatureExtent[i][1]
                                ? "0"
                                : "50%",
                            height: "2px",
                            backgroundColor: "black",
                            // transform: "translateY(-50%)",
                            zIndex: 1,
                          }
                        : {},
                  }}
                >
                  <CircleMark
                    backgroundColor={colorScale(count)}
                    strokeColor={colorScale(count)}
                    value={count}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

function CircleMark({
  backgroundColor = "#000",
  size = 13,
  strokeColor = "#000",
  value,
}) {
  return (
    <Box
      title={value}
      sx={{
        borderRadius: "50%",
        border: `1px solid ${strokeColor}`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        display: "inline-block",
        margin: "0 auto",
      }}
    ></Box>
  );
}
export default ValueCountUpset;
