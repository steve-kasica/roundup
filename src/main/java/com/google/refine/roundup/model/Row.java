package com.google.refine.roundup.model;

public class Row extends com.google.refine.model.Row {
    public Row(int cellCount) {
        super(cellCount);
    }

    @Override
    public boolean equals(Object o) {
        com.google.refine.model.Row r;
        Cell c1, c2;

        // If the object is compared with itself, return true
        if (o == this) {
            return true;
        }

        if (o instanceof com.google.refine.model.Row) {
            r = (com.google.refine.model.Row) o;
        } else {
            // If the object is not an instance of Cell, return false
            return false;
        }

        int rowLength = cells.size();
        if (rowLength != r.cells.size()) {
            return false;
        } else {
            for (int i = 0; i < rowLength; i++) {
                c1 = (Cell) getCell(i);
                c2 = (Cell) r.getCell(i);
                if (!(c1.equals(c2))) {
                    return false;
                }
            }
            return true;
        }
    }
}
