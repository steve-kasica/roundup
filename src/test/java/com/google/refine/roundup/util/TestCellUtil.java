package com.google.refine.roundup.util;

import com.google.refine.model.Cell;
import org.junit.jupiter.api.*;

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
