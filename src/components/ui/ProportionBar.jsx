const ProportionBar = ({ data, height = 20 }) => {
  const values = Object.values(data);
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total === 0) {
    return (
      <div
        style={{
          height,
          width: "100%",
          backgroundColor: "#eee",
          borderRadius: 4,
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: "flex",
        height,
        width: "100%",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {Object.entries(data).map(([label, value], index) => {
        const widthPercent = (value / total) * 100;
        console.log({ label, value, widthPercent });
        return (
          <div
            key={index}
            style={{
              width: `${widthPercent}%`,
              display: "flex",
              alignItems: "center",
              backgroundColor: index % 2 === 0 ? "#4caf50" : "#81c784",
              height: "100%",
              fontFamily: "sans-serif",
              fontSize: "0.75rem",
            }}
            title={`${label}: ${value} (${widthPercent.toFixed(1)}%)`}
          >
            <span style={{ padding: "0 4px" }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};
export default ProportionBar;
