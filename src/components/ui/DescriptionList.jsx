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
          sx={{ justifyContent: "space-between", mb: 0.5 }}
        >
          <Typography variant="label" color="text.secondary">
            {key}
          </Typography>
          <Typography
            variant="data-secondary"
            color="text.secondary"
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
