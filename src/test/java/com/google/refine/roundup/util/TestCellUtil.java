package com.google.refine.roundup.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.google.refine.model.Cell;

public class TestCellUtil {

    private Cell og, cp;

    @BeforeEach
    public void setupTests() {
        og = new Cell(5,null);
        cp = CellUtil.copy(og);
    }

    @Test
    @DisplayName("Copy and original cells have equal values")
    public void testCellValueEquality() {
        Assertions.assertEquals(og.getValue(), cp.getValue());
    }

    @Test
    @DisplayName("Copy and original cell values have different identities")
    public void testCellValueIdentity() {
        Assertions.assertTrue(og.getValue() != cp.getValue());
    }

    @Test
    @DisplayName("Copy and original cells have different identities")
    public void testCellIdentity() {
        Assertions.assertNotSame(og, cp);
    }
}
