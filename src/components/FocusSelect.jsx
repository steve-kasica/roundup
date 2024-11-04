
export default ({tables, setFocusedIndex}) => {

    const selectID = "focus-index";

    const options = tables
        .map(t => t.columns)
        .flat()
        .filter(c => c.isSelected)
        .map(c => ({key: c.key, value: c.index, text: `Index ${c.index}`}))
        .filter((c, i, self) => i === self.findIndex(cc => cc.value === c.value));
    
    function handleChange(event) {
        const columnIndex = parseInt(event.target.value);
        setFocusedIndex(columnIndex);
    }

    return (
        <select 
            name={selectID} 
            id={selectID}
            onChange={handleChange}>
            {options.map(o => 
                <option 
                    key={o.key} 
                    value={o.value}>
                    {o.text}
                </option>
            )}
        </select>
    );
}