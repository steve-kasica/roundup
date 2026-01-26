const TitleCaseText = ({ text }) => {
  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return <>{toTitleCase(text)}</>;
};

export default TitleCaseText;
