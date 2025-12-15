import PackOperationIcon from "../icons/PackOperationIcon";
import TooltipIconButton from "./TooltipIconButton";

const AddPackOperationButton = ({
  tooltipText = "Add Pack Operation",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <PackOperationIcon />
    </TooltipIconButton>
  );
};

export default AddPackOperationButton;
