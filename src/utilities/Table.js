/**
 * Table.js
 */
import Column from "./Column";

export default class {
    constructor({path, columns, name}, index) {
        this.columns = columns.map(c => new Column(c, this));
        this.path = path;

        this.init = {
            index: index,
            name: name || this.basename(index)
        };
        this.index = this.init.index;
        this.name = this.init.name
    }

    get key() {
        return `${this.index}-${this.path}`;
    }

    basename = (path) => path.split("/").slice(-1)[0];

    // Set the selected status of all columns to a single boolean value
    setSelected = (isSelected) => this.columns.map(c => c.setSelected(isSelected));

    // Set the focus status of all columns given if index matches `focusIndex` argument
    setFocus = (focusIndex) => this.columns.forEach(c => c.setFocus(c.index === focusIndex));

    getFocusedColumn = () => this.columns.filter(c => c.isFocused);

    // A table is selected if at least one column is selected
    get isSelected() { return this.columns.filter(c => c.isSelected).length > 0 };

    get selectedColumns() { return this.columns.filter(c => c.isSelected); }
}