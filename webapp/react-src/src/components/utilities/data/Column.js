/**
 * Column.js
 */
export default class {
    constructor({name, index, values}, table) {
      this.init = new Object();  // Dictionary to hold initial values of mutable properties
      this.init.name = name || "";
      this.init.index = index;

      this.name = this.init.name;
      this.index = this.init.index;

      this.values = values;
      this.table = table;
      
      this.isSelected = false;
      this.isFocused = false;

      return this;
  
    }

    setFocus(value) {
      this.isFocused = value;
      return this.isFocused;
    }

    setSelected(value) { 
      this.isSelected = value;
      return this.isSelected;
    }
  
    isNull() { return this.name === ""; }
  
    get key() { return `${this.table.index}-${this.init.index}`; }

    isIndexModified() { return (this.init.index === this.index); }

    contains(term) { return this.name.toLowerCase().includes(term.toLowerCase()); }

    get dataType() {
      return "chr";
    }
  
  }