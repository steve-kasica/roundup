package com.google.refine.roundup;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.google.refine.ProjectManager;
import com.google.refine.ProjectManagerStub;
import com.google.refine.RefineServlet;
import com.google.refine.RefineServletStub;
import com.google.refine.importing.ImportingManager;
import com.google.refine.model.Cell;
import com.google.refine.model.Row;

public abstract class RoundupTest {

    private static boolean _setUpIsDone = false;
    private String _employeesA = "src/test/resources/data/employees-a.csv";
    private String _employeesB = "src/test/resources/data/employees-b.csv";

    protected List<Row> getEmployeesA() {
        return fetchRows(_employeesA);
    }

    protected List<Row> getEmployeesB() {
        return fetchRows(_employeesB);
    }

    protected RefineServlet servlet;

    protected void setup() {
        if (!_setUpIsDone) {
            // Initialize Project Manager
            servlet = new RefineServletStub();
            ProjectManager.singleton = new ProjectManagerStub();
            ImportingManager.initialize(servlet);
            _setUpIsDone = true;
        }
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
}
