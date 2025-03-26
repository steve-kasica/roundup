package com.google.refine.roundup.operations;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertSame;

import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.slf4j.LoggerFactory;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.google.refine.RefineTest;
import com.google.refine.model.Cell;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.operations.OperationRegistry;

public class TestProjectCartesianProductOperation extends RefineTest {

    List<Row> results;
    Project humidity, temperature;

    private Serializable[][] rangeToGrid(int start, int stop) {
        return IntStream.range(start, stop)
                .mapToObj(i -> new Serializable[]{i})
                .collect(Collectors.toList())
                .stream()
                .toArray(Serializable[][]::new);
    }

    @BeforeSuite
    public void registerOperation() {
        OperationRegistry.registerOperation(getCoreModule(), "project-cartesian-product", ProjectCartesianProductOperation.class);
    }

    @Override
    @BeforeTest
    public void init() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @BeforeMethod
    public void setup() {
        temperature = createProject(new String[] { "Temperature" }, rangeToGrid(80, 121));
        humidity = createProject(new String[] { "Humidity" }, rangeToGrid(10, 101));

        results = ProjectCartesianProductOperation.run(temperature.rows, humidity.rows);
    }


    @Test
    public void testResultRowCount() {
        assert results.size() > 0;
        int expected = temperature.rows.size() * humidity.rows.size();
        int actual = results.size();
        assertEquals(expected, actual);
    }

    @Test
    public void testResultCellSize() {
        assert results.size() > 0;
        int expected = temperature.columnModel.columns.size() + humidity.columnModel.columns.size();
        results.stream()
                .forEach(row -> assertEquals(expected, row.cells.size()));
    }

    @Test
    public void testOutputCells() {
        // TODO: This would be a good test for JoinOperation as well
        assert results.size() > 0;

        for (int i = 0; i < results.size(); i++) {
            for (int j = 0; j < results.get(i).cells.size(); j++) {
                Cell actual = results.get(i).cells.get(j);
                Cell expected = (j < temperature.columnModel.columns.size())
                        ? temperature.rows.get(i / humidity.rows.size()).getCell(j)
                        : humidity.rows.get(i % humidity.rows.size()).getCell(j % humidity.columnModel.columns.size());
                assertEquals(actual.value, expected.value);
                assertEquals(actual, expected);
                assertSame(actual, expected);
            }
        }
    }

}
