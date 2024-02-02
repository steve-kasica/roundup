package com.google.refine.roundup.model;

import com.google.refine.model.Recon;

import java.io.Serializable;

public class Cell extends com.google.refine.model.Cell {
    public Cell(Serializable value, Recon recon) {
        super(value, recon);
    }

    public Cell(Serializable value) {
        super(value, (Recon) null);
    }

    @Override
    public boolean equals(Object o) {
        com.google.refine.model.Cell c;

        // If the object is compared with itself, return true
        if (o == this) {
            return true;
        }

        if (o instanceof com.google.refine.model.Cell) {
            c = (com.google.refine.model.Cell) o;
        } else {
            // If the object is not an instance of Cell, return false
            return false;
        }

        // Cells with null values are equal
        if (getValue() == null && c.getValue() == null) {
            return true;
        }

        return getValue().equals(c.getValue());

    }

    // TODO: will probably need to override hashCode and write tests in TestCell
}
