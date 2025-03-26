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
      this.position = [table.index, index]; // Default values

      // A unique ID based on it's original position
      // in the table when the app was loaded
      this.id = `${table.id}-${this.index}`;

      this.init = {
        index: this.index
      };

      return this;
  
    }

    setSelected(value) { 
      this.isSelected = value;
      return this.isSelected;
    }
  
    get isNull() { return this.columnType === "null" }

    contains(term) { return this.name.toLowerCase().includes(term.toLowerCase()); }
  
  }