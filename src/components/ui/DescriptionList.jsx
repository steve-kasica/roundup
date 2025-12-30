/**
 * @fileoverview DescriptionList Component
 *
 * A key-value pair list component that displays data in a structured description list
 * format. Uses Material-UI Stack and Typography for consistent styling and layout.
 *
 * Features:
 * - Automatic key-value rendering from object
 * - Consistent spacing and alignment
 * - Caption typography for labels
 * - Body2 typography for values
 * - Flexible layout with Stack
 *
 * @module components/ui/DescriptionList
 *
 * @example
 * <DescriptionList data={{ Name: 'Table1', Rows: 100, Columns: 5 }} />
 */

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
