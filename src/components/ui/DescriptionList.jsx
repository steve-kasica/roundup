import { Stack, Typography } from "@mui/material";

// eslint-disable-next-line react/prop-types
const DescriptionList = ({ data }) => {
  return (
    <>
      {Object.entries(data).map(([key, value]) => (
        <Stack
          key={key}
          direction={"row"}
          spacing={2}
          sx={{ mb: 1, justifyContent: "space-between", mb: 0.5 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: "bold",
              width: "50%",
              textTransform: "capitalize", // Capitalizes first letter of each word
            }}
          >
            {key}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: "right",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "50%",
            }}
            title={value}
          >
            {value}
          </Typography>
        </Stack>
      ))}
    </>
  );
};

DescriptionList.displayName = "DescriptionList";

export default DescriptionList;
