/**
 * Column.js
 */
export default class {
    constructor({name, index, columnType, values}, table) {
      this.name = name || null;
      this.index = (index === null) ? null : index;
      this.columnType = columnType || null;

      this.values = values || {};
      this.uniqValues =  Object.keys(this.values).length;
      this.table = table;
      
      this.isSelected = false;

      // A unique ID based on it's original position
      // in the table when the app was loaded
      this.key = `${table.id}-${index}`;

      return this;
  
    }

    setSelected(value) { 
      this.isSelected = value;
      return this.isSelected;
    }
  
    get isNull() { return this.columnType === "null" }

    get index1() { return this.index + 1; }

    contains(term) { return this.name.toLowerCase().includes(term.toLowerCase()); }
  
  }