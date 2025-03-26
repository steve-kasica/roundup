package com.google.refine.roundup.operations.row;

import static org.testng.Assert.assertEquals;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.LoggerFactory;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.google.refine.RefineTest;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.operations.OperationRegistry;

public class RowAggregateOperationTests extends RefineTest {

    RowAggregateOperation sumByCountyOp;
    Project project;

    @BeforeSuite
    public void registerOperation() {
        OperationRegistry.registerOperation(getCoreModule(), "row-aggregate", RowAggregateOperation.class);
    }

    @Override
    @BeforeTest
    public void init() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    private void assertEqualRows(List<Row> actual, List<Row> expected) {
        // Converting Rows to strings is the only way to compare equality
        assertEquals(
                actual.stream()
                        .map(Row::toString)
                        .collect(Collectors.toList()),
                expected.stream()
                        .map(Row::toString)
                        .collect(Collectors.toList())
        );
    }

    private void assertColumnsEquals(List<Column> actual, List<Column> expected) {
        // Substitutes an equality method for the Column class
        assertEquals(actual.size(), expected.size());
        for (int i = 0; i < actual.size(); i++) {
            assertEquals(actual.get(i).getCellIndex(), expected.get(i).getCellIndex());
            assertEquals(actual.get(i).getName(), expected.get(i).getName());
            assertEquals(actual.get(i).getOriginalHeaderLabel(), expected.get(i).getOriginalHeaderLabel());
        }
    }

    @BeforeMethod
    public void setup() {

        int countyIndex = 0;
        int totalIndex = 1;
        // Data comes from https://github.com/baltimore-sun-data/2018-voter-registration
        project = createProject(
                "Voter Registration",
                new String[] { "county", "total", "date"},
                new Serializable[][] {
                        {"CALVERT", 65125, "2018-06-30"},
                        {"ALLEGANY", 43082, "2018-07-31"},
                        {"ALLEGANY", 43150, "2018-08-30"},
                        {"BALTIMORE CITY", 383579, "2018-07-31"},
                        {"BALTIMORE CITY", 386040, "2018-08-30"},
                        {"BALTIMORE CITY", 387188, "2018-09-30"}
                });

        sumByCountyOp = new RowAggregateOperation(countyIndex, totalIndex, RowAggregateOperation.AccumulatorName.SUM);
    }

    @Test
    public void testSumByGroupResultEquality() throws NoSuchMethodException {
        List<Row> actual = sumByCountyOp.aggregateRows(project.rows);
        System.out.println(actual);
        Project expected = createProject(
                new String[] {"county", "total"},
                new Serializable[][] {
                        {"CALVERT", 65125},
                        {"ALLEGANY", 86232},
                        {"BALTIMORE CITY", 1156807}
                });

        assertEqualRows(actual, expected.rows);
    }

    @Test
    public void testCountByGroupEquality() throws NoSuchMethodException {
        RowAggregateOperation op = new RowAggregateOperation(0, 1, RowAggregateOperation.AccumulatorName.COUNT);
        List<Row> result = op.aggregateRows(project.rows);
        Project expected = createProject(
                new String[] {"county", "total"},
                new Serializable[][] {
                        {"CALVERT", 1},
                        {"ALLEGANY", 2},
                        {"BALTIMORE CITY", 3}
                });

        assertEqualRows(result, expected.rows);
    }

    @Test
    public void testAverageByGroupEquality() throws NoSuchMethodException {
        RowAggregateOperation op = new RowAggregateOperation(0, 1, RowAggregateOperation.AccumulatorName.AVERAGE);
        List<Row> result = op.aggregateRows(project.rows);
        Project expected = createProject(
                new String[] {"county", "total"},
                new Serializable[][] {
                        {"CALVERT", 65125.0},
                        {"ALLEGANY", 43116.0},
                        {"BALTIMORE CITY", 385602.3333333333}
                });

        assertEqualRows(result, expected.rows);
    }

    @Test
    public void testGetColumnsEquality() {
        List<Column> actual = sumByCountyOp.getColumns(project.columnModel);
        List<Column> expected = new ArrayList<>(2){
            {
                add(new Column(0, "county"));
                add(new Column(1, "total"));
            }
        };
        assertColumnsEquals(actual, expected);
    }

}
