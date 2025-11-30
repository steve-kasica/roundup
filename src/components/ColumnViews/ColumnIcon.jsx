import SvgIcon from "@mui/material/SvgIcon";

const ColumnIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <rect x="8" y="0" width="8" height="5" fill="currentColor" />
      <rect x="8" y="6" width="8" height="18" fill="currentColor" />
    </SvgIcon>
  );
};

export default ColumnIcon;
