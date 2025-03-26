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

//    @Nested public class JoinColumnsTests{
//
//        List<Column> results;
//
//        @BeforeEach
//        public void setup() {
//            results = ProjectCartesianProductOperation.joinColumns(students.columnModel.columns, courses.columnModel.columns);
//        }
//
//        @Test
//        public void testColumnCount() {
//            assert results.size() > 0;
//            int expected = students.columnModel.columns.size() + courses.columnModel.columns.size();
//            int actual = results.size();
//            Assertions.assertEquals(expected, actual);
//        }
//
//        @Test
//        @DisplayName("Column count of auxiliary input project is unchanged")
//        public void testInputsColumnCount() {
//            int expected = originalCoursesColumnCount;
//            int actual = courses.columnModel.columns.size();
//            Assertions.assertEquals(expected, actual);
//        }
//
//        @Test
//        public void testColumnIdentity() {
//            assert results.size() > 0;
//            List<Column> combined = Stream.concat(students.columnModel.columns.stream(), courses.columnModel.columns.stream())
//                    .collect(Collectors.toList());
//
//            for (Column actual : results) {
//                for (Column unexpected : combined) {
//                    Assertions.assertNotSame(unexpected, actual);
//                }
//            }
//        }
//
//        @Test
//        public void testColumnDuplicateNames() {
//            assert results.size() > 0;
//            for (int i = 0; i < results.size(); i++) {
//                Column a = results.get(i);
//                for (int j = i + 1; j < results.size(); j++) {
//                    Column b = results.get(j);
//                    Assertions.assertNotEquals(a.getName(), b.getName());
//                }
//            }
//        }
//
//        @Test
//        public void testCellIndex() {
//            for (int i = 0; i < results.size(); i++) {
//                int expected = i;
//                int actual = results.get(i).getCellIndex();
//                Assertions.assertEquals(expected, actual);
//            }
//        }
//
//        @Test
//        public void testOriginalNameEquality() {
//            for (Column column : results) {
//                Assertions.assertEquals(column.getName(), column.getOriginalHeaderLabel());
//            }
//        }
//    }
