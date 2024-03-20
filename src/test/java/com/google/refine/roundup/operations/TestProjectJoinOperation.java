package com.google.refine.roundup.operations;

import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.RoundupTest;

public class TestProjectJoinOperation extends RoundupTest {

    private Project interviews;
    private Project employees;
    int interviewsCellIndex;
    int employeesCellIndex;
    int originalInterviewsCount;
    int originalEmployeesCount;

    @BeforeEach
    public void setup() {
        interviews = getProject(interviewsProject);
        employees = getProject(employeesAProject);

        originalEmployeesCount = employees.columnModel.columns.size();
        originalInterviewsCount = interviews.columnModel.columns.size();

        interviewsCellIndex = interviews.columnModel.getColumnByName("Candidate Name").getCellIndex();
        employeesCellIndex = employees.columnModel.getColumnByName("Name").getCellIndex();
    }

    @Nested
    public class TestRows {
        private List<Row> results;

        @BeforeEach
        public void setup() {
            results = ProjectJoinOperation.innerJoinRows(interviews.rows, employees.rows, interviewsCellIndex, employeesCellIndex);
        }

        @Test
        public void testRowCount() {
            int expected = 4;  // Only four names in Interview should match Employees
            int actual = results.size();
            Assertions.assertEquals(expected, actual);
        }

        @Test
        public void testCellSize() {
            assert results.size() > 0;

            // Expected results should equal the sum of the two projects, minus one for the duplicate joining column
            int expected = interviews.rows.get(0).cells.size() + employees.rows.get(0).cells.size();

            for (Row actual : results) {
                Assertions.assertEquals(expected, actual.cells.size());
            }
        }

        @Test
        public void testRowIdentity() {
            assert results.size() > 0;
            for (Row actual : results) {
                for (Row unexpected : interviews.rows) {
                    Assertions.assertNotSame(unexpected, actual);
                }
                for (Row unexpected : employees.rows) {
                    Assertions.assertNotSame(unexpected, actual);
                }
            }
        }
    }
}
