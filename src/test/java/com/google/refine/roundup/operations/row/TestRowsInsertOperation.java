package com.google.refine.roundup.operations.row;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.google.refine.model.Row;
import com.google.refine.roundup.RoundupTest;

public class TestRowsInsertOperation extends RoundupTest {

    private RowsInsertOperation _op;
    private List<List<String>> _m;

    @BeforeEach
    public void initTest() {
        // TODO: what if row data include data types other than string? See Cell::getValue for more
        _m = new ArrayList<>();
        ArrayList<String> r1 = new ArrayList<>();
        r1.add("1");
        r1.add("Foo");
        r1.add("5792927929");
        _m.add(r1);

        ArrayList<String> r2 = new ArrayList<>();
        r2.add("2");
        r2.add("Bar");
        r2.add("7592761939");
        _m.add(r2);

        ArrayList<String> r3 = new ArrayList<>();
        r3.add("3");
        r3.add("Baz");
        r3.add("5647392740");
        _m.add(r3);

        int i = 0;

        _op = new RowsInsertOperation(_m, i);

    }

    @Nested
    @DisplayName("parseRow tests")
    class testParseRowClass {
        @Test
        @DisplayName("Cell count is correct")
        public void testColumnCount() {
            Row output;
            for (List<String> input : _m) {
                output = RowsInsertOperation.parseRow(input);
                Assertions.assertEquals(input.size(), output.cells.size());
            }
        }

        @Test
        @DisplayName("Input and output values are equal")
        public void testRowValues() {
            Row output;
            String expected;
            Object actual;
            for (List<String> input : _m) {
                output = RowsInsertOperation.parseRow(input);
                for (int i = 0; i < input.size(); i++) {
                    expected = input.get(i);
                    actual = output.getCell(i).getValue();
                    Assertions.assertEquals(expected, actual);
                }
            }
        }
    }
}
