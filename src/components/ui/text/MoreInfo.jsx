import { InfoIcon } from "../icons";

const MoreInfo = ({ text }) => {
  return (
    <sup>
      <InfoIcon tooltipText={text} />
    </sup>
  );
};

export default MoreInfo;
