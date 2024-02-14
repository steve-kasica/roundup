package com.google.refine.roundup.util;

import com.google.refine.model.Cell;
import com.google.refine.model.Recon;
import com.google.refine.model.Row;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.Serializable;

public class TestEqualityTesters {

    private Row r1, r2;

    @Test
    @DisplayName("The same cell is equal")
    public void testEqualsCell() {
        Cell c = new Cell(100, null);
        Assertions.assertTrue(EqualityTesters.equalCells(c, c));
        Assertions.assertTrue(c == c);
        Assertions.assertEquals(c, c);
    }

    @Test
    @DisplayName("Parent class instances are equal")
    public void testDifferentCellClasses() {
        Cell c1 = new Cell(100, null);
        com.google.refine.model.Cell c2 = new com.google.refine.model.Cell(100, (Recon) null);
        Assertions.assertTrue(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Null cells are equal")
    public void testEqualNullCells() {
        Cell c1 = new Cell(null, null);
        Cell c2 = new Cell(null, null);
        Assertions.assertTrue(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Equal integer cells are equal")
    public void testEqualIntCells() {
        Cell c1 = new Cell(1, null);
        Cell c2 = new Cell(1, null);
        Assertions.assertTrue(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Equal long cells are equal")
    public void testEqualLongCells() {
        Cell c1 = new Cell(123456789L, null);
        Cell c2 = new Cell(123456789L, null);
        Assertions.assertTrue(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Equal string cells are equal")
    public void testEqualStringCells() {
        Cell c1 = new Cell("Foo", null);
        Cell c2 = new Cell("Foo", null);
        Assertions.assertTrue(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
    }

    @Test
    @DisplayName("Different classes are unequal")
    public void testDifferentClasses() {
        Cell c = new Cell(100, null);
        Assertions.assertFalse(EqualityTesters.equalCells(c,100));
        Assertions.assertTrue(c == c);
        Assertions.assertEquals(c, c);
    }

    @Test
    @DisplayName("Unequal string cells are unequal")
    public void testUnequalStringCells() {
        Cell c1 = new Cell("Foo", null);
        Cell c2 = new Cell("Bar", null);
        Assertions.assertFalse(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Unequal integer cells are unequal")
    public void testUnequalIntCells() {
        Cell c1 = new Cell(1, null);
        Cell c2 = new Cell(0, null);
        Assertions.assertFalse(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Unequal long cells are unequal")
    public void testUnequalLongCells() {
        Cell c1 = new Cell(123456789L, null);
        Cell c2 = new Cell(987654321L, null);
        Assertions.assertFalse(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Different type of the same value are unequal")
    public void testCellsDifferentTypesUnequal() {
        Cell c1 = new Cell("1", null);
        Cell c2 = new Cell(1, null);
        Assertions.assertFalse(EqualityTesters.equalCells(c1,c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    // Because Row has a setCell method that can add new values to the row
    // A row instance should be instantiated as a mutable list
    // TODO: PR for OpenRefine to require lists passed via the constructor
    // to be mutable (or is this why that constructor is protected)?
    private Row createRow(Serializable... args) {
        Row row = new Row(args.length);

        for (int i = 0; i < args.length; i++) {
            row.setCell(i, new Cell(args[i], null));
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
        Assertions.assertTrue(EqualityTesters.equalRows(r1,r1));
        Assertions.assertTrue( r1 == r1);
        Assertions.assertEquals(r1, r1);
    }

    @Test
    @DisplayName("Parent class instances are equal")
    public void testParentClassEquality() {
        com.google.refine.model.Row r3 = new com.google.refine.model.Row(r1.cells.size());
        for (int i = 0; i < r1.cells.size(); i++) {
            r3.setCell(i, new Cell((Serializable) r1.getCellValue(i), null));
        }

        Assertions.assertTrue(EqualityTesters.equalRows(r1,r3));
        Assertions.assertFalse(r1 == r3);
        Assertions.assertNotEquals(r1, r3);
    }

    @Test
    @DisplayName("Rows of different lengths are unequal")
    public void testRowsUnequalSize() {
        r2.setCell(r2.cells.size(), new Cell(1817, null));  // Add Rochester founding year
        Assertions.assertFalse(EqualityTesters.equalRows(r1, r2));
        Assertions.assertFalse(r1 == r2);
        Assertions.assertNotEquals(r1, r2);
    }

    @Test
    @DisplayName("Permuted rows unequal")
    public void testRowsDifferentOrderUnequals() {
        int size = r1.cells.size();
        Row r3 = new Row(size);
        for (int i = 0; i < size; i++) {
            r3.setCell(i, new Cell((Serializable) r1.getCellValue(size - i - 1), null));
        }

        Assertions.assertFalse(r1 == r3);
        Assertions.assertFalse(EqualityTesters.equalRows(r1,r3));
        Assertions.assertNotEquals(r1, r3);
    }
}
