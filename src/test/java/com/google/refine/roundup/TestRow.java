package com.google.refine.roundup;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import com.google.refine.roundup.model.Cell;
import com.google.refine.roundup.model.Row;

import java.io.Serializable;

public class TestRow {

    private Row r1, r2;

    // Because Row has a setCell method that can add new values to the row
    // A row instance should be instantiated as a mutable list
    // TODO: PR for OpenRefine to require lists passed via the constructor
    // to be mutable (or is this why that constructor is protected)?
    private Row createRow(Serializable... args) {
        Row row = new Row(args.length);

        for (int i = 0; i < args.length; i++) {
            row.setCell(i, new Cell(args[i]));
        }
        return row;
    }

    @BeforeEach
    public void initTests() {
        r1 = createRow("Vancouver", "BC", "Canada", 265700L);
        r2 = createRow("Rochester", "MN", "USA", 121456L);
    }

    @Test
    @DisplayName("A row is equal to itself")
    public void testRowSelfEquality() {
        Assertions.assertTrue(r1.equals(r1));
        Assertions.assertTrue( r1 == r1);
        Assertions.assertEquals(r1, r1);
    }

    @Test
    @DisplayName("Parent class instances are equal")
    public void testParentClassEquality() {
        com.google.refine.model.Row r3 = new com.google.refine.model.Row(r1.cells.size());
        for (int i = 0; i < r1.cells.size(); i++) {
            r3.setCell(i, new Cell((Serializable) r1.getCellValue(i)));
        }

        Assertions.assertTrue(r1.equals(r3));
        Assertions.assertFalse(r1 == r3);
        Assertions.assertEquals(r1, r3);
    }

    @Test
    @DisplayName("Rows of different lengths are unequal")
    public void testRowsUnequalSize() {
        r2.setCell(r2.cells.size(), new Cell(1817));  // Add Rochester founding year
        Assertions.assertFalse(r1.equals(r2));
        Assertions.assertFalse(r1 == r2);
        Assertions.assertNotEquals(r1, r2);
    }

    @Test
    @DisplayName("Permuted rows unequal")
    public void testRowsDifferentOrderUnequals() {
        int size = r1.cells.size();
        Row r3 = new Row(size);
        for (int i = 0; i < size; i++) {
            r3.setCell(i, new Cell((Serializable) r1.getCellValue(size - i - 1)));
        }

        Assertions.assertFalse(r1 == r3);
        Assertions.assertFalse(r1.equals(r3));
        Assertions.assertNotEquals(r1, r3);
    }
}
