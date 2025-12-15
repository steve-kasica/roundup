import StackOperationIcon from "../icons/StackOperationIcon";
import TooltipIconButton from "./TooltipIconButton";

const AddStackOperationButton = ({
  tooltipText = "Add Stack Operation",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <StackOperationIcon />
    </TooltipIconButton>
  );
};

export default AddStackOperationButton;
