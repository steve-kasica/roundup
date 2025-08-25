import PropTypes from "prop-types";
import { Drawer, Box, IconButton, Typography, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import {
  default as ColumnIndexDetails,
  ID as COLUMN_INDEX_DETAILS_COMPONENT,
} from "../../components/ColumnIndexDetails";
import { setDrawerContents } from "../../slices/uiSlice";
import { selectSelectedColumns } from "../../slices/columnsSlice";

const SelectedColumnIndexDetails = () => {
  const selectedColumnIds = useSelector(selectSelectedColumns);
  return <ColumnIndexDetails columnIds={selectedColumnIds} />;
};

export default function AppDrawer({ anchor = "right", width = 280 }) {
  const dispatch = useDispatch();
  const contents = useSelector((state) => state.ui.drawerContents);
  const isOpen = contents !== null;
  let title;
  switch (contents) {
    case COLUMN_INDEX_DETAILS_COMPONENT:
      title = "Column Comparison";
      break;
    default:
      title = "Menu";
  }

  return (
    <Drawer anchor={anchor} open={isOpen}>
      <Box
        sx={{
          width,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "15px",
        }}
        role="presentation"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton
            onClick={() => dispatch(setDrawerContents(null))}
            size="small"
            aria-label="close drawer"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ overflow: "auto", flex: 1 }}>
          {contents === COLUMN_INDEX_DETAILS_COMPONENT && (
            <SelectedColumnIndexDetails />
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

AppDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  anchor: PropTypes.oneOf(["left", "right", "top", "bottom"]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      onClick: PropTypes.func,
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
};
