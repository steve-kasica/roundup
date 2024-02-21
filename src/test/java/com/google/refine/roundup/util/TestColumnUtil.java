package com.google.refine.roundup.util;

import com.google.refine.model.Column;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TestColumnUtil {

    private Column og, cp;

    @BeforeEach
    public void setupTests() {
        og = new Column(0,"foo");
        cp = ColumnUtil.copy(og);
    }

    @Test
    @DisplayName("Copy and original column names are equal")
    public void testColumnNameEquality() {
        Assertions.assertEquals(og.getName(), cp.getName());
    }

    @Test
    @DisplayName("Copy and original column cell indices are equal")
    public void testColumnCellIndexEquality() {
        Assertions.assertEquals(og.getCellIndex(), cp.getCellIndex());
    }

    @Test
    @DisplayName("Copy and original columns have different identities")
    public void testColumnIdentity() {
        Assertions.assertTrue(og != cp);
    }

}
