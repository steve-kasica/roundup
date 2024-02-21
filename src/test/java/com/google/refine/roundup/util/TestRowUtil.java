package com.google.refine.roundup.util;

import com.google.refine.model.Cell;
import com.google.refine.model.Row;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TestRowUtil {

    private Row og, cp;

    @BeforeEach
    public void setupTests() {
        int size = 3;
        og = new Row(size);
        og.setCell(0, new Cell(5, null));
        og.setCell(1, new Cell("foo", null));
        og.setCell(2, new Cell(123456789L, null));

        cp = RowUtil.copy(og);
    }

    @Test
    @DisplayName("ProjectMetadataUtil and original rows have equal values")
    public void testRowsValuesEquality() {
        for (int i = 0; i < og.cells.size(); i++) {
            Assertions.assertEquals(og.getCellValue(i), cp.getCellValue(i));
        }
    }

    @Test
    @DisplayName("ProjectMetadataUtil and original row values have different identities")
    public void testRowsValuesIdentity() {
        for (int i = 0; i < og.cells.size(); i++) {
            Assertions.assertTrue(og.getCellValue(i) != cp.getCellValue(i));
        }
    }

    @Test
    @DisplayName("ProjectMetadataUtil and original rows have different identities")
    public void testRowIdentity() {
        Assertions.assertNotSame(og, cp);
        Assertions.assertTrue(og != cp);
    }
}
