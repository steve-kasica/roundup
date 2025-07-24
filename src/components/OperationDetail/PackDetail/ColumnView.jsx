import { ListItemButton, ListItemText } from "@mui/material";
import { styled } from "@mui/material/styles";
import withColumnData from "../../HOC/withColumnData";

const StyledListItemText = styled(ListItemText)(({ uniquenessratio }) => ({
  position: "relative",
  "& .MuiListItemText-primary": {
    position: "relative",
    zIndex: 1,
    padding: "4px 8px",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${uniquenessratio * 100}%`,
    background: `linear-gradient(90deg, 
      ${
        uniquenessratio > 0.95
          ? "#4caf50"
          : uniquenessratio > 0.8
          ? "#ff9800"
          : "#f44336"
      }40 0%, 
      ${
        uniquenessratio > 0.95
          ? "#4caf50"
          : uniquenessratio > 0.8
          ? "#ff9800"
          : "#f44336"
      }20 100%
    )`,
    borderRadius: "4px",
    transition: "width 0.3s ease-in-out",
  },
}));

const ColumnView = ({ column, isKey, assignAsTableKey }) => {
  // Calculate uniqueness ratio (assuming column has keyness data)
  const uniquenessRatio =
    column.uniqueValues && column.totalRows
      ? column.uniqueValues / column.totalRows
      : 0;

  return (
    <ListItemButton 
      onClick={assignAsTableKey}
      selected={isKey}
      sx={{
        ...(isKey && {
          backgroundColor: 'action.selected',
          '&:hover': {
            backgroundColor: 'action.selected',
          },
        }),
      }}
    >
      <StyledListItemText
        primary={`${column.name} (${Math.round(uniquenessRatio * 100)}%)`}
        uniquenessratio={uniquenessRatio}
      />
    </ListItemButton>
  );
};

const EnhancedColumnView = withColumnData(ColumnView);

export default EnhancedColumnView;
