package com.google.refine.roundup.util;

import com.google.refine.model.Cell;
import com.google.refine.model.Row;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.Serializable;
import java.util.*;

public class TestRowGroupAggregators {

        private String employeesAFileName = "src/test/resources/data/employees-a.csv";
        private List<Row> _rows;

    private void assertRowsEqual(List<Row> expected, List<Row> actual) {
        boolean isEqualSize = expected.size() == actual.size();
        boolean areEqualRows;
        Row actualRow, expectedRow;
        Assertions.assertTrue(isEqualSize);
        if (isEqualSize) {
            for (int i = 0; i < expected.size(); i++) {
                actualRow = actual.get(i);
                expectedRow = expected.get(i);
                areEqualRows = EqualityTesters.equalRows(actualRow, expectedRow);
                Assertions.assertTrue(areEqualRows);
                if (!areEqualRows) {
                    System.out.println(actualRow);
                    System.out.println(expectedRow);
                }
            }
        } else {
            System.out.println("Unequal sizes");
        }
    }


    private List<Row> dataToRows(List<List<Object>> data) {
        List<Row> rows = new ArrayList<>();
        Row r;
        for (List<Object> d : data) {
            r = new Row(2);
            r.setCell(0, new Cell((Serializable) d.get(0), null));
            r.setCell(1, new Cell((Serializable) d.get(1), null));
            rows.add(r);
        }
        return rows;
    }

    /**
     * Load data in a CSV file as a list of OpenRefine Row model instances
     * @param fn: filenname
     * @return: a list of Row instances
     */
    private List<Row> fetchRows(String fn) {
        BufferedReader reader;
        String line;
        String delimiter = ",";
        Row row;
        Cell cell;
        List<Row> rows = new ArrayList<>();

        try {

            reader = new BufferedReader(new FileReader(fn));
            while ((line = reader.readLine()) != null) {
                String[] values = line.split(delimiter);
                row = new Row(values.length);
                for (int i = 0; i < values.length; i++) {
                    cell = new Cell(values[i], null);
                    row.setCell(i, cell);
                }
                rows.add(row);
            }

            rows.remove(0);  // Remove column headers

        } catch(IOException e) {
            e.printStackTrace();
        }

        return rows;
    }

    @BeforeEach
    public void initTest() {
        _rows = fetchRows(employeesAFileName);
    }

    @Test
    @DisplayName("Calculate minimums by one group")
    public void testMinOneGroup() {
        // Calculate minimum age by department
        List<List<Object>> data = new ArrayList<>();
        data.add(new ArrayList<>(Arrays.asList("Sales", 27.0)));
        data.add(new ArrayList<>(Arrays.asList("Finance", 32.0)));
        data.add(new ArrayList<>(Arrays.asList("HR", 35.0)));
        data.add(new ArrayList<>(Arrays.asList("IT", 25.0)));
        data.add(new ArrayList<>(Arrays.asList("Marketing", 29.0)));
        List<Row> expected = dataToRows(data);

        int valueIndex = 2;
        int groupIndex = 3;
        RowGroup groups = new RowGroup(_rows, groupIndex);
        List<Row> actual = RowGroupAggregators.min(groups, valueIndex);

        assertRowsEqual(expected,actual);
    }

    @Test
    @DisplayName("Calculate counts by one group")
    public void testCountOneGroup() {
        // Test count of employees by department
        List<List<Object>> data = new ArrayList<>();
        data.add(new ArrayList<>(Arrays.asList("Sales", 2)));
        data.add(new ArrayList<>(Arrays.asList("Finance", 2)));
        data.add(new ArrayList<>(Arrays.asList("HR", 2)));
        data.add(new ArrayList<>(Arrays.asList("IT", 2)));
        data.add(new ArrayList<>(Arrays.asList("Marketing", 2)));
        List<Row> expected = dataToRows(data);

        int valueIndex = 0; // Index of Employee ID column
        int groupIndex = 3; // Index of Department column
        RowGroup groups = new RowGroup(_rows, groupIndex);
        List<Row> actual = RowGroupAggregators.count(groups, valueIndex);

        assertRowsEqual(expected,actual);
    }

    @Test
    @DisplayName("Calculate sums by one group")
    public void testSumOneGroup() {
        // Calculate sum of salary by department
        List<List<Object>> data = new ArrayList<>();
        data.add(new ArrayList<>(Arrays.asList("Sales", 147000.0)));
        data.add(new ArrayList<>(Arrays.asList("Finance", 138000.0)));
        data.add(new ArrayList<>(Arrays.asList("HR", 133000.0)));
        data.add(new ArrayList<>(Arrays.asList("IT", 118000.0)));
        data.add(new ArrayList<>(Arrays.asList("Marketing", 127000.0)));
        List<Row> expected = dataToRows(data);

        int valueIndex = 4; // Index of Salary column
        int groupIndex = 3; // Index of Department column
        RowGroup groups = new RowGroup(_rows, groupIndex);
        List<Row> actual = RowGroupAggregators.sum(groups, valueIndex);

        assertRowsEqual(expected,actual);
    }

    @Test
    @DisplayName("Calculate maximums by one group")
    public void testMaxOneGroup() {
        // Calculate max age by department
        List<List<Object>> data = new ArrayList<>();
        data.add(new ArrayList<>(Arrays.asList("Sales", 38.0)));
        data.add(new ArrayList<>(Arrays.asList("Finance", 42.0)));
        data.add(new ArrayList<>(Arrays.asList("HR", 45.0)));
        data.add(new ArrayList<>(Arrays.asList("IT", 28.0)));
        data.add(new ArrayList<>(Arrays.asList("Marketing", 30.0)));
        List<Row> expected = dataToRows(data);

        int valueIndex = 2; // Index of Age column
        int groupIndex = 3; // Index of Department column
        RowGroup groups = new RowGroup(_rows, groupIndex);
        List<Row> actual = RowGroupAggregators.max(groups, valueIndex);

        assertRowsEqual(actual, expected);

    }

    @Test
    @DisplayName("Calculate means by one group")
    public void testMeanOneGroup() {
        // Calculate mean age by department
        List<List<Object>> data = new ArrayList<>();
        data.add(new ArrayList<>(Arrays.asList("Sales", 32.5)));
        data.add(new ArrayList<>(Arrays.asList("Finance", 37.0)));
        data.add(new ArrayList<>(Arrays.asList("HR", 40.0)));
        data.add(new ArrayList<>(Arrays.asList("IT", 26.5)));
        data.add(new ArrayList<>(Arrays.asList("Marketing", 29.5)));
        List<Row> expected = dataToRows(data);

        int valueIndex = 2; // Index of Age column
        int groupIndex = 3; // Index of Department column
        RowGroup groups = new RowGroup(_rows, groupIndex);
        List<Row> actual = RowGroupAggregators.mean(groups, valueIndex);

        assertRowsEqual(actual, expected);
    }

    @Test
    @DisplayName("Gets all aggregator functions")
    public void testGetAggregatorFunctions() {
        Set<String> expected = new HashSet<>();
        expected.add("sum");
        expected.add("count");
        expected.add("min");
        expected.add("max");
        expected.add("mean");

        Set<String> actual = RowGroupAggregators.getAggregationMethods();
        Assertions.assertEquals(expected,actual);
    }

}
