package com.google.refine.roundup.util;


import com.google.refine.model.Cell;

public class EqualityTesters {

    static public boolean equalCells(Object o1, Object o2) {
        com.google.refine.model.Cell c1, c2;

        // If the object is compared with itself, return true
        if (o1 == o2) {
            return true;
        }

        if (o1 instanceof com.google.refine.model.Cell && o2 instanceof com.google.refine.model.Cell) {
            c1 = (com.google.refine.model.Cell) o1;
            c2 = (com.google.refine.model.Cell) o2;
        } else {
            // If the object is not an instance of Cell, return false
            return false;
        }

        // Cells with null values are equal
        if (c1.getValue() == null && c2.getValue() == null) {
            return true;
        }

        return c1.getValue().equals(c2.getValue());

    }

    static public boolean equalRows(Object o1, Object o2) {
        com.google.refine.model.Row r1, r2;
        Cell c1, c2;

        // If the object is compared with itself, return true
        if (o1 == o2) {
            return true;
        }

        if (o1 instanceof com.google.refine.model.Row && o2 instanceof com.google.refine.model.Row) {
            r1 = (com.google.refine.model.Row) o1;
            r2 = (com.google.refine.model.Row) o2;
        } else {
            // If either object is not an instance of Row, return false
            return false;
        }

        if (r1.cells.size() != r2.cells.size()) {
            // Rows with unequal number of cells are not equal
            return false;
        } else {
            // Rows are parallel, compare every cell, in order
            for (int i = 0; i < r1.cells.size(); i++) {
                c1 = (Cell) r1.getCell(i);
                c2 = (Cell) r2.getCell(i);
                if (!(equalCells(c1, c2))) {
                    return false;
                }
            }
            return true;
        }
    }
}
