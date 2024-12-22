
import ColumnItem from "./ColumnItem"
import { useSelector } from "react-redux"

export default function ColumnGroup({ label, columns }) {
    const selectedColumns = useSelector(({schema}) => schema.data
            .flat()
            .filter(column => column)  // filter out null cells
            .map(column => column.id));

    return (
        <div className="py-1">
            <div className="flex">
                <div className="w-5/6">
                    {label}
                </div>
                <div className="w-1/6">
                </div>
            </div>
            <div>
                {columns.map(column => (
                    <ColumnItem 
                        key={column.id}
                        column={column} 
                        isSelected={selectedColumns.includes(column.id)} 
                    />)
                )}
            </div>
        </div>
    ) 
}