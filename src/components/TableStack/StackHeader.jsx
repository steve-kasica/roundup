
import { Input } from "@/components/ui/input";
import { transpose } from "d3";

/**
 * 
 * @param {Array} data: An array of set where each index corresponds
 *  to a column index in the composite table and each member of 
 *  the set is a different column name at that index in a separate table.
 * @returns Table header
 */

const multipleValuesPlaceholder = "...";
const focusClass = "bg-sky-500/50";

export default function StackHeader({ data, focusIndex }) {

    const headers = transpose(data).reduce((acc, columns, i) => {
        if (columns !== null) {
            const names = columns.reduce((acc, column) => {
                if (column !== null && !acc.includes(column.name)) {
                    acc.push(column.name)
                }
                return acc;
            }, []);

            acc.push(({
                id: `stack-header-index-${i}`,
                placeholder: names.length > 1 ? multipleValuesPlaceholder : names.pop(),
                required: names.length !== 1,
                options: names.length > 1 ? names : [],
                className: `text-center ${(focusIndex === i) ? focusClass : ""}`                
            }));
        }
        return acc;
    }, []);

    return (
        <tr>
            {headers.map(({id, placeholder, required, options, className}) => (
                <th key={id}>
                    <Input 
                        id={id}
                        type="text"
                        required={required}
                        placeholder={placeholder}
                        className={className}
                    />
                    <datalist id={id}>
                        {options.map(name => (
                            <option 
                                key={name}
                                value={name}
                            />
                        ))}
                    </datalist>
                </th>
            ))}
        </tr>
    )
}