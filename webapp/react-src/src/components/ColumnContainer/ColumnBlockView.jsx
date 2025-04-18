/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * 
 * Notes:
 *  - A non-breaking space HTML entity (`&nbsp;`) need to be in this div in order for it to have 
 *    width when nesting operations and tables.
 */

export const COLUMN_LAYOUT_BLOCK = 'block';

export default function ColumnView({
    id,
    tableId,
    name,
    index,
    columnType,
    isLoading,
    isSelected,
    isHovered,
    isNull,
    isFocused,
}) {
    let nbsp = "\u00A0"
    return (<span>{nbsp}</span>)
};