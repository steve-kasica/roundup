import { Typography, Box, Skeleton } from "@mui/material";

const ParentValueSpread = ({
  categories,
  valueCount,
  scrollToDegree,
  loading = true,
}) => {
  return (
    <Box>
      <Box
        sx={{
          minWidth: "90px",
          marginRight: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
        }}
      >
        {Object.entries(categories).map(
          ([key, { label, count, firstIndex }]) => (
            <Box
              key={key}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                color: count > 0 ? "#333" : "#aaa",
                padding: "2px 8px",
                fontSize: "0.75em",
                height: "15px",
                lineHeight: "15px",
              }}
              title={`Click to scroll to values in ${label}`}
            >
              <Box
                className="label"
                onClick={() => {
                  // Scroll to the first index of this category
                  scrollToDegree(firstIndex);
                }}
                sx={{
                  width: "100px",
                  textAlign: "right",
                  cursor: "pointer",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "1em",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                    paddingRight: "15px",
                  }}
                >
                  {label}
                </Typography>
              </Box>
              <style>
                {`
                        .bar-container::before {
                        content: "—";
                        position: absolute;
                        margin-left: -10px;
                        margin-top: 3px;
                        ;}
                        `}
              </style>
              <Box
                className="bar-container"
                sx={{
                  flex: 1,
                }}
              >
                {loading ? (
                  <Skeleton
                    component="div"
                    width="100%"
                    minWidth="1px"
                    animation="wave"
                    sx={{
                      borderRadius: 0,
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        position: "relative",
                        fontSize: "1em",
                        zIndex: 1,
                        paddingLeft: "4px",
                        whiteSpace: "nowrap",
                        lineHeight: "20px",
                        paddingRight: "5px",
                      }}
                    >
                      <small>??</small>
                    </Typography>
                  </Skeleton>
                ) : (
                  <Box
                    className="bar"
                    sx={{
                      background: "#e0e0e0",
                      width: `${(count / valueCount) * 100}%`,
                      minWidth: "1px",
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        position: "relative",
                        fontSize: "1em",
                        zIndex: 1,
                        paddingLeft: "4px",
                        whiteSpace: "nowrap",
                        lineHeight: "20px",
                        paddingRight: "5px",
                      }}
                    >
                      <small>{count.toLocaleString()}</small>
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* <span sx={{ color: "#888" }}>({count})</span> */}
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};
export default ParentValueSpread;
