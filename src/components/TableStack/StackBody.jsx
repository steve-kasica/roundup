import StackRow from "./StackRow";

// `data` == a matrix containing arrays of column instances
export default function StackBody({data, onCellSwap}) {

    return (
        <tbody>
            {data.map(columns => (
                <StackRow
                    key={columns[0].table.id}
                    tableId={columns[0].table.id}
                    columns={columns}
                    onCellSwap={onCellSwap}
                />
            ))}
        </tbody>
    )
}

