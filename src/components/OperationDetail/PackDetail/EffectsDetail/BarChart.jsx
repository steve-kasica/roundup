import PropTypes from "prop-types";

function BarChart({ data, total }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
      }}
    >
      {data.map((item) => (
        <div
          key={item.label}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <div
            style={{
              minWidth: "60px",
              fontSize: "12px",
              fontWeight: "bold",
              color: item.color,
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: "#f0f0f0",
              height: "20px",
              overflow: "hidden",
            }}
          >
            {item.value > 0 && (
              <div
                style={{
                  width: `${(item.value / total) * 100}%`,
                  height: "100%",
                  backgroundColor: item.color,
                }}
              />
            )}
          </div>
          <div
            style={{
              minWidth: "30px",
              fontSize: "12px",
              fontWeight: "bold",
              color: item.color,
              textAlign: "right",
            }}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  total: PropTypes.number.isRequired,
};

export default BarChart;
