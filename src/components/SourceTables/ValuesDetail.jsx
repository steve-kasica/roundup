import { extent, scaleBand, scaleLinear } from "d3";



export default function({
    values, 
    rectHeight=100,
    marginTop=10,
    marginRight=10,
    marginBottom=10,
    marginLeft=10,
    width=200,
    barColor="#ddd",
    height=300,
}) {

    const xScale = scaleLinear()
        .domain(extent([...Object.values(values)]))
        .rangeRound([0, 100]);

    return <div className="w-52">
        {[...Object.entries(values)].map(([value, count]) => {
            console.log(`linear-gradient(to right, blue ${xScale(count)}%, #fff ${xScale(count)}%)`);
            return (
            <div 
                key={value} 
                className="flex my-1" 
                style={{
                    "backgroundImage": `linear-gradient(
                        to right, 
                        ${barColor} ${xScale(count)}%, 
                        #fff ${xScale(count)}%
                    )`
                }}
            >
                <div className="w-5/6 truncate">{value}</div>
                <div className="w-1/6 text-right">{count}</div>
            </div>
        );
    })
    }
    </div>;
}