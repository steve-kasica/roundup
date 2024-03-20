package com.google.refine.roundup.operations;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.google.refine.model.Cell;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.RoundupTest;

public class TestProjectCrossProductOperation extends RoundupTest {

    Project students;
    Project courses;
    int originalStudentsRowCount;
    int originalCoursesRowCount;
    int originalCoursesColumnCount;

    @BeforeEach
    public void setup() {
        long studentsProjectId = 2355678158369L;
        long coursesProjectId = 1734453768523L;
        students = getProject(studentsProjectId);
        courses = getProject(coursesProjectId);

        originalCoursesColumnCount = courses.columnModel.columns.size();

        originalStudentsRowCount = students.rows.size();
        originalCoursesRowCount = courses.rows.size();

    }

    @Nested
    public class CrossProductRowsTests {

        List<Row> results;

        @BeforeEach
        public void setup() {
            results = ProjectCrossOperation.crossProductRows(students.rows, courses.rows);
        }

        @Test
        public void testRowCount() {
            assert results.size() > 0;
            int expected = originalStudentsRowCount * originalCoursesRowCount;
            int actual = results.size();
            Assertions.assertEquals(expected, actual);
        }

        @Test
        public void testPrimaryInputRowSizes() {
            int expected = originalStudentsRowCount;
            int actual = students.rows.size();
            Assertions.assertEquals(expected, actual);
        }

        @Test
        public void testAuxiliaryInputRowSizes() {
            int expected = originalCoursesRowCount;
            int actual = courses.rows.size();
            Assertions.assertEquals(expected, actual);
        }

        @Test
        public void testOutputCellSize() {
            assert results.size() > 0;
            int expected = students.columnModel.columns.size() + courses.columnModel.columns.size();
            results.stream()
                    .forEach(row -> Assertions.assertEquals(expected, row.cells.size()));
        }

        // TODO: This would be a good test for JoinOperation as well
        @Test
        public void testOutputCellIdentity() {
            assert results.size() > 0;
            for (int i = 0; i < results.size(); i++) {
                Row row = results.get(i);
                for (int j = 0; j < row.cells.size(); j++) {
                    Cell actual = row.getCell(j);
                    Cell unexpected = (j < originalStudentsRowCount)
                            ? students.rows.get(i / originalStudentsRowCount).getCell(j)
                            : courses.rows.get(i % originalCoursesRowCount).getCell(j % courses.columnModel.columns.size());
                    Assertions.assertNotSame(unexpected, actual);
                }
            }
        }

        // TODO: This would be a good test for JoinOperation as well
        // Note: Cell does not have working equality method
        @Test
        public void testOutputCellEquality() {
            assert results.size() > 0;
            for (int i = 0; i < results.size(); i++) {
                Row row = results.get(i);
                for (int j = 0; j < row.cells.size(); j++) {
                    Object actual = row.getCellValue(j);
                    Object expected = (j < originalStudentsRowCount)
                            ? students.rows.get(i / originalStudentsRowCount).getCellValue(j)
                            : courses.rows.get(i % originalCoursesRowCount).getCellValue(j % courses.columnModel.columns.size());
                    Assertions.assertEquals(expected, actual);
                }
            }
        }

        // TODO: This would be a good test for JoinOperation as well
        @Test
        public void testOutputCellValueIdentity() {
            assert results.size() > 0;
            for (int i = 0; i < results.size(); i++) {
                Row row = results.get(i);
                for (int j = 0; j < row.cells.size(); j++) {
                    Object actual = row.getCellValue(j);
                    Object unexpected = (j < originalStudentsRowCount)
                            ? students.rows.get(i / originalStudentsRowCount).getCellValue(j)
                            : courses.rows.get(i % originalCoursesRowCount).getCellValue(j % courses.columnModel.columns.size());
                    Assertions.assertNotSame(unexpected, actual);
                }
            }
        }
    }

    @Nested public class JoinColumnsTests{

        List<Column> results;

        @BeforeEach
        public void setup() {
            results = ProjectCrossOperation.joinColumns(students.columnModel.columns, courses.columnModel.columns);
        }

        @Test
        public void testColumnCount() {
            assert results.size() > 0;
            int expected = students.columnModel.columns.size() + courses.columnModel.columns.size();
            int actual = results.size();
            Assertions.assertEquals(expected, actual);
        }

        @Test
        @DisplayName("Column count of auxiliary input project is unchanged")
        public void testInputsColumnCount() {
            int expected = originalCoursesColumnCount;
            int actual = courses.columnModel.columns.size();
            Assertions.assertEquals(expected, actual);
        }

        @Test
        public void testColumnIdentity() {
            assert results.size() > 0;
            List<Column> combined = Stream.concat(students.columnModel.columns.stream(), courses.columnModel.columns.stream())
                    .collect(Collectors.toList());

            for (Column actual : results) {
                for (Column unexpected : combined) {
                    Assertions.assertNotSame(unexpected, actual);
                }
            }
        }

        @Test
        public void testColumnDuplicateNames() {
            assert results.size() > 0;
            for (int i = 0; i < results.size(); i++) {
                Column a = results.get(i);
                for (int j = i + 1; j < results.size(); j++) {
                    Column b = results.get(j);
                    Assertions.assertNotEquals(a.getName(), b.getName());
                }
            }
        }

        @Test
        public void testCellIndex() {
            for (int i = 0; i < results.size(); i++) {
                int expected = i;
                int actual = results.get(i).getCellIndex();
                Assertions.assertEquals(expected, actual);
            }
        }

        @Test
        public void testOriginalNameEquality() {
            for (Column column : results) {
                Assertions.assertEquals(column.getName(), column.getOriginalHeaderLabel());
            }
        }
    }



}
