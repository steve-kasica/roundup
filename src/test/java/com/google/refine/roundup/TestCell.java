package com.google.refine.roundup;

import com.google.refine.model.Recon;
import com.google.refine.roundup.model.Cell;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TestCell {

    @Test
    @DisplayName("The same cell is equal")
    public void testEqualsCell() {
        Cell c = new Cell(100);
        Assertions.assertTrue(c.equals(c));
        Assertions.assertTrue(c == c);
        Assertions.assertEquals(c, c);
    }

    @Test
    @DisplayName("Parent class instances are equal")
    public void testDifferentCellClasses() {
        Cell c1 = new Cell(100);
        com.google.refine.model.Cell c2 = new com.google.refine.model.Cell(100, (Recon) null);
        Assertions.assertTrue(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertEquals(c1, c2);
    }

    @Test
    @DisplayName("Null cells are equal")
    public void testEqualNullCells() {
        Cell c1 = new Cell(null);
        Cell c2 = new Cell(null);
        Assertions.assertTrue(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertEquals(c1, c2);
    }

    @Test
    @DisplayName("Equal integer cells are equal")
    public void testEqualIntCells() {
        Cell c1 = new Cell(1);
        Cell c2 = new Cell(1);
        Assertions.assertTrue(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertEquals(c1, c2);
    }

    @Test
    @DisplayName("Equal long cells are equal")
    public void testEqualLongCells() {
        Cell c1 = new Cell(123456789L);
        Cell c2 = new Cell(123456789L);
        Assertions.assertTrue(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertEquals(c1, c2);
    }

    @Test
    @DisplayName("Equal string cells are equal")
    public void testEqualStringCells() {
        Cell c1 = new Cell("Foo");
        Cell c2 = new Cell("Foo");
        Assertions.assertTrue(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
    }

    @Test
    @DisplayName("Different classes are unequal")
    public void testDifferentClasses() {
        Cell c = new Cell(100);
        Assertions.assertFalse(c.equals(100));
        Assertions.assertTrue(c == c);
        Assertions.assertEquals(c, c);
    }

    @Test
    @DisplayName("Unequal string cells are unequal")
    public void testUnequalStringCells() {
        Cell c1 = new Cell("Foo");
        Cell c2 = new Cell("Bar");
        Assertions.assertFalse(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Unequal integer cells are unequal")
    public void testUnequalIntCells() {
        Cell c1 = new Cell(1);
        Cell c2 = new Cell(0);
        Assertions.assertFalse(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Unequal long cells are unequal")
    public void testUnequalLongCells() {
        Cell c1 = new Cell(123456789L);
        Cell c2 = new Cell(987654321L);
        Assertions.assertFalse(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }

    @Test
    @DisplayName("Different type of the same value are unequal")
    public void testCellsDifferentTypesUnequal() {
        Cell c1 = new Cell("1");
        Cell c2 = new Cell(1);
        Assertions.assertFalse(c1.equals(c2));
        Assertions.assertFalse(c1 == c2);
        Assertions.assertNotEquals(c1, c2);
    }
}
