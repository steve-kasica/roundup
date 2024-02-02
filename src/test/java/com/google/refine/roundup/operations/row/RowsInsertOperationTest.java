package com.google.refine.roundup.operations.row;

import com.google.refine.model.Row;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class RowsInsertOperationTest {

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

        _op = new RowsInsertOperation(null, _m, 0);

    }

    @Test
    @DisplayName("Row counts are equal")
    public void testRowCount() {
        int expected = _m.size();
        int actual = _op.getRows().size();
        Assertions.assertEquals(expected, actual);
    }

    @Test
    @DisplayName("Column counts are equal in all rows")
    public void testColumnCount() {
        List<Integer> expected = _m.stream()
                .map(r -> r.size())
                .collect(Collectors.toList());

        List<Integer> actual = _op.getRows().stream()
                .map(r -> r.cells.size())
                .collect(Collectors.toList());

        Assertions.assertEquals(expected, actual);
    }

    @Test
    @DisplayName("All list items are Row instances")
    public void testListItemClass() {
        for (Object obj : _op.getRows()) {
            Assertions.assertTrue(obj instanceof Row);
        }
    }

    @Test
    @DisplayName("Test class stuff")
    public void testOperationID() {
        System.out.println(_op.getClass());
    }

//    @Test
//    @DisplayName("All cell types match input value types")
//    // TODO, not sure how to implement this test. Do I need to do Java Types and the column types specified in OpenRefine? I probably need to do both.
//    public void testCellValueTypes() {
//        List<Row> rows = _op.getRows();
//        for (int i = 0; i < rows.size(); i++) {
//            for (int j = 0; j < _m.size(); j++) {
////                String expected = _m.get(i).get(j);
////                Object actual = rows.get(i).getCellValue(j);
//                Assertions.assertTrue(false);
////                Assertions.assertEquals(expected, actual);
//            }
//        }
//    }

    @Test
    @DisplayName("All cell values match input values")
    public void testRowValues() {
        List<Row> rows = _op.getRows();
        for (int i = 0; i < rows.size(); i++) {
            for (int j = 0; j < _m.size(); j++) {
                String expected = _m.get(i).get(j);
                Object actual = rows.get(i).getCellValue(j);
                Assertions.assertEquals(expected, actual);
            }
        }
    }

}
