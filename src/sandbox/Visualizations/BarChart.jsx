import { extent, scaleBand, scaleLinear } from "d3";

export default function({
    data,
    rectHeight=100,
    marginTop="0px",
    marginRight="0px",
    marginBottom="0px",
    marginLeft="0px",
    width="100%",
    barColor="#ddd",
}) {

    const xScale = scaleLinear()
        .domain(extent(data, d => d.x))
        .rangeRound([0, 100]);

    return (
    <div style={{
        width: width,
        marginTop: marginTop,
        marginRight: marginRight,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
    }}>
        {data.map(({x, y}, i) => (
            <div 
                key={i} 
                style={{
                    "display": "flex",
                    "marginTop": "1px",
                    "marginBottom": "1px",
                    "padding": "0 2px 0 2px",
                    "backgroundImage": `linear-gradient(
                        to right, 
                        ${barColor} ${xScale(x)}%, 
                        #fff ${xScale(x)}%
                    )`
                }}
            >
                <div style={{ 
                    width: "83.333333%", 
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>
                    {y}
                </div>
                <div style={{ marginLeft: "auto" }}>
                    {x}
                </div>
            </div>
        ))}
    </div>
    );
}