/**
 * Table.js
 */
import Column from "./Column";
import * as d3 from "d3";

export default class {
    constructor({name, id, row_count, path, columns}, index, maxColumns) {
        this.name = name;
        this.id = id;
        this.row_count = row_count;
        this.column_count = columns.length;
        this.path = path || null;
        this.index = index;

        this.columns = Array.from(
            {length: maxColumns}, 
            (_, i) => i < columns.length ? 
                new Column(columns[i], this) : 
                new Column({index: i, columnType: "null"}, this));
    }

    // A table is selected if at least one column is selected
    get isSelected() { return this.columns.filter(c => c.isSelected).length > 0 };

    get selectedColumns() { return this.columns.filter(c => c.isSelected); }

    get nonNullColumns() { return this.columns.filter(c => !c.isNull); }

    /**
     * Returns header of selected columns
     */
    get header() { 
        return this.selectedColumns
            .sort((a,b) => d3.ascending(a.index, b.index))
            .map(column => column.name); 
    }

    selectColumns(columnIds) {
        // Select columns
        this.columns
            .filter(column => columnIds.has(column.id))
            .forEach(column => column.setSelected(true));
        
        // Update column indices
        this.selectedColumns
            .sort((columnA, columnB) => d3.ascending(columnA.index, columnB.index))
            .forEach((column, i) => column.index = i);
    }

    /**
     * 
     * @param {Set} columnIds 
     * @returns 
     */
    deselectColumns(columnIds) {
        // Deselect columns
        this.columns
            .filter(column => columnIds.has(column.id))
            .forEach(column => column.setSelected(false));

        // Address "index shift" by updating indices of remaining selected columns
        // TODO: if any?
        this.selectedColumns
            .sort((a,b) => d3.ascending(a.index, b.index))
            .forEach((column, i) => column.index = i);

        return this;  // for chaining
    }

    swapColumns = (colA, colB) => {
        const i = this.columns.indexOf(colA);
        const j = this.columns.indexOf(colB);
        [this.columns[i], this.columns[j]] = [this.columns[j], this.columns[i]];

        return this;
    }

    basename = (path) => path.split("/").slice(-1)[0];

    // Set the selected status of all columns to a single boolean value
    setSelected = (isSelected) => this.columns.map(c => c.setSelected(isSelected));

    // Set the focus status of all columns given if index matches `focusIndex` argument
    setFocus = (focusIndex) => this.columns.forEach(c => c.setFocus(c.index === focusIndex));

    getFocusedColumn = () => this.columns.filter(c => c.isFocused);

}