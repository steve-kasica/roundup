
import { Input } from "@/components/ui/input";

export default function StackHeader({data}) {
    // const [values, setValues] = useState();
    const genId = (i) => `stack-header-index-${i}`;
    return (
        <tr>
            {data.map((values, i) => (
                <th key={genId(i)} id={genId(i)}>
                    <Input 
                        type="text" 
                        placeholder={values.length > 1 ? "..." : values[0]} 
                        className="text-center"/>
                    <datalist id={genId(i)}>
                        {values.map((text, i) => (
                            <option key={i} value={text}></option>
                        ))}
                    </datalist>
                </th>
            ))}
        </tr>
    )
}