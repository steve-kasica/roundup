package com.google.refine.roundup.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.google.refine.ProjectMetadata;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.Cell;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.RoundupTest;

public class TestCopyUtilities extends RoundupTest {

    private Project originalProject;
    private ProjectMetadata originalProjectMetadata;

    @Override
    @BeforeEach
    public void setup() {
        super.setup();
        originalProject = getProject(wranglerCrimeProject);
        originalProjectMetadata = new ProjectMetadata(); // TODO: get Project Metadata from disk
    }

    @Nested
    @DisplayName("Copying Column")
    public class CopyColumnTests {
        private Column originalColumn;
        private Column copyColumn;

        @BeforeEach
        public void setup() {
            originalColumn = originalProject.columnModel.getColumnByCellIndex(0);
            copyColumn = CopyUtilities.copyColumn(originalColumn);
        }

        @Test
        @DisplayName("Copy is not identical to original")
        public void testColumnIdentity() {
            Assertions.assertNotSame(originalColumn, copyColumn);

            // Just a sanity check
            copyColumn.setName("foo");
            Assertions.assertNotEquals(originalColumn.getName(), copyColumn.getName());
        }

        @Test
        @DisplayName("Cell index is equal to original")
        public void testCellIndex() {
            Assertions.assertEquals(originalColumn.getCellIndex(), copyColumn.getCellIndex());
        }

        @Test
        @DisplayName("Original name is equal to original")
        public void testOriginalName() {
            // `getOriginalHeaderLabel` is a getter method for `_originalName` in Column class
            Assertions.assertEquals(originalColumn.getOriginalHeaderLabel(), copyColumn.getOriginalHeaderLabel());
        }

        @Test
        @DisplayName("Name is equal to original")
        public void testName() {
            Assertions.assertEquals(originalColumn.getName(), copyColumn.getName());
        }


    }

    @Nested
    @DisplayName("Copy Row")
    public class CopyRowTests {

        private Row originalRow;
        private Row copyRow;

        @BeforeEach
        public void setup() {
            originalRow = originalProject.rows.get(0);
            copyRow = CopyUtilities.copyRow(originalRow);
        }

        @Test
        @DisplayName("Copy length is equal to original")
        public void testCopyRowLength() {
            Assertions.assertEquals(originalRow.cells.size(), copyRow.cells.size());
        }

        @Test
        @DisplayName("Copy is not identical to original")
        public void testCopyRowIdentity() {
            Assertions.assertNotSame(originalRow, copyRow);
        }

        @Test
        @DisplayName("Copy's cells are not identical to original")
        public void testCopyRowCellIdentity() {
            for (int i = 0; i < originalRow.cells.size(); i++) {
                Cell originalCell = originalRow.getCell(i);
                Cell copyCell = copyRow.getCell(i);
                if (originalCell != null && copyCell != null) {
                    Assertions.assertNotSame(originalCell, copyCell);
                }
            }
        }

        @Test
        @DisplayName("Copy's cells are equal to original")
        public void testCopyRowCellEquality() {
            for (int i = 0; i < originalRow.cells.size(); i++) {
                Cell originalCell = originalRow.getCell(i);
                Cell copyCell = copyRow.getCell(i);
                if (originalCell == null) {
                    Assertions.assertNull(copyCell);
                } else if (copyCell == null) {
                    Assertions.assertNull(originalCell);
                } else {
                    Assertions.assertEquals(originalCell.getValue(), copyCell.getValue());
                }
            }
        }

    }

    @Nested
    @DisplayName("Copy Project")
    public class CopyProjectTests {
        private Project cloneProject;

        @BeforeEach
        public void setup() {
            cloneProject = CopyUtilities.copyProject(originalProject);
        }

        @Test
        @DisplayName("Copy is not identical to original")
        public void testProjectIdentity() {
            Assertions.assertNotSame(originalProject,cloneProject);
        }

        @Test
        @DisplayName("Project in copy does not equal original")
        public void testProjectIDs() {
            Assertions.assertNotEquals(originalProject.id, cloneProject.id);
        }

        @Nested
        @DisplayName("Copied rows (and cells)")
        public class CopyProjectRowTests {
            @Test
            @DisplayName("Rows list size in copy is equal to original")
            public void testRowSize() {
                Assertions.assertEquals(originalProject.rows.size(), cloneProject.rows.size());
            }

            @Test
            @DisplayName("Row list in copy is not identical to original")
            public void testRowsListIdentity() {
                // List of Rows are not the same object in memory
                Assertions.assertNotSame(originalProject.rows, cloneProject.rows);

                // (Sanity check) Each row in these lists is a different object
                // Probably redundant with assertion above
                for (int i = 0; i < originalProject.rows.size(); i++) {
                    Row originalRow = originalProject.rows.get(i);
                    Row cloneRow = cloneProject.rows.get(i);
                    Assertions.assertNotSame(originalRow, cloneRow);
                }
            }

            @Test
            @DisplayName("Cell lists sizes in copy are equal to original")
            public void testCellListSize() {
                for (int i = 0; i < originalProject.rows.size(); i++) {
                    Row originalRow = originalProject.rows.get(i);
                    Row cloneRow = cloneProject.rows.get(i);
                    Assertions.assertEquals(originalRow.cells.size(), cloneRow.cells.size());
                }
            }

            @Test
            @DisplayName("Cells in copied project equal to original")
            public void testCellEquality() {
                assert originalProject.rows.size() == cloneProject.rows.size();

                for (int i = 0; i < originalProject.rows.size(); i++) {
                    Row originalRow = originalProject.rows.get(i);
                    Row copiedRow = cloneProject.rows.get(i);

                    assert originalRow.cells.size() == copiedRow.cells.size();

                    for (int j = 0; j < originalRow.cells.size(); j++) {
                        Cell originalCell = originalProject.rows.get(i).getCell(j);
                        Cell copiedCell = cloneProject.rows.get(i).getCell(j);
                        if (originalCell == null || copiedCell == null) {
                            // if one Cell is null, then the other one is too
                            // nulls are valid, and common, in these cells lists in the Row class
                            Assertions.assertEquals(originalCell, copiedCell);
                        } else {
                            Assertions.assertEquals(originalCell.getValue(), copiedCell.getValue());
                        }
                    }
                }
            }

            @Test
            @DisplayName("Cells in copied project are not identical to original")
            public void testCellIdentity() {
                assert originalProject.rows.size() == cloneProject.rows.size();

                for (int i = 0; i < originalProject.rows.size(); i++) {
                    Row originalRow = originalProject.rows.get(i);
                    Row copiedRow = cloneProject.rows.get(i);

                    assert originalRow.cells.size() == copiedRow.cells.size();

                    for (int j = 0; j < originalRow.cells.size(); j++) {
                        Cell originalCell = originalProject.rows.get(i).getCell(j);
                        Cell copiedCell = cloneProject.rows.get(i).getCell(j);
                        if (originalCell == null) {
                            Assertions.assertNull(copiedCell);
                        } else if (copiedCell == null) {
                            Assertions.assertNull(originalCell);
                        } else {
                            Assertions.assertNotSame(originalCell, copiedCell);
                        }

                    }
                }
            }
        }

        @Nested
        @DisplayName("Copied history")
        public class CopyProjectHistoryTests {

            private List<Map<String, HistoryEntry>> historyEntries;
            private List<HistoryEntry> originalHistory;
            private List<HistoryEntry> copyHistory;
            private String origKey = "original";
            private String copyKey = "copy";

            // TODO: should this be BeforeAll?
            @BeforeEach
            public void setupHistoryTests() {
                int count = -1;
                originalHistory = originalProject.history.getLastPastEntries(count);
                copyHistory = cloneProject.history.getLastPastEntries(count);

                historyEntries = new ArrayList<>();

                for (int i = 0; i < originalHistory.size(); i++) {
                    Map<String, HistoryEntry> map = new HashMap<>(2);
                    map.put(origKey, originalHistory.get(i));
                    map.put(copyKey, copyHistory.get(i));
                    historyEntries.add(map);
                }
            }

            @Test
            @DisplayName("History Entry Change is not null")
            public void testHistoryEntryChangeNotNull() {
                cloneProject.history.getLastPastEntries(-1).stream()
                        .map(HistoryEntry::getChange)
                        .forEach(Assertions::assertNotNull);
            }

            @Test
            @DisplayName("Not identical to original")
            public void testHistoryIdentity() {
                Assertions.assertNotSame(originalProject.history, cloneProject.history);
            }

            @Test
            @DisplayName("Is same length as original")
            public void testHistorySize() {
                Assertions.assertEquals(originalHistory.size(), copyHistory.size());
            }

            @Test
            @DisplayName("HistoryEntry instances are not identical to original")
            public void testHistoryEntryIdentity() {
                historyEntries.stream()
                        .forEach(map -> Assertions.assertNotSame(map.get(origKey), map.get(copyKey)));
            }

            @Test
            @DisplayName("HistoryEntry instances are equal to original")
            public void testHistoryEntryEquality() {
                // Since there's no equals method for HistoryEntry, based equality on fields: id, description, time
                historyEntries.stream()
                        .forEach(map -> {
                            Assertions.assertEquals(map.get(origKey).id, map.get(copyKey).id);
                            Assertions.assertEquals(map.get(origKey).description, map.get(copyKey).description);
                            Assertions.assertEquals(map.get(origKey).time, map.get(copyKey).time);
                        });
            }

            @Test
            @DisplayName("HistoryEntry instances share project ID with copy project")
            public void testHistoryEntryProject() {
                copyHistory.stream()
                        .forEach(historyEntry -> Assertions.assertEquals(historyEntry.projectID, cloneProject.id));
            }
        }

        @Nested
        @DisplayName("Copied columns")
        public class CopyProjectColumnModelTests {

            @Test
            @DisplayName("Column models are not identical")
            public void testColumnModelIdentity() {
                Assertions.assertNotSame(originalProject.columnModel, cloneProject.columnModel);
            }

            @Test
            @DisplayName("Column counts are equal")
            public void testColumnSize() {
                Assertions.assertEquals(originalProject.columnModel.columns.size(), cloneProject.columnModel.columns.size());
            }

            @Test
            @DisplayName("Max cell index is equal")
            public void testMaxCellIndex() {
                Assertions.assertEquals(originalProject.columnModel.getMaxCellIndex(), cloneProject.columnModel.getMaxCellIndex());
            }

            @Test
            @DisplayName("Key column index is equal")
            public void testKeyColumnIndex() {
                Assertions.assertEquals(originalProject.columnModel.getKeyColumnIndex(), cloneProject.columnModel.getKeyColumnIndex());
            }

            @Test
            @DisplayName("Columns are not identical")
            public void testColumnIdentity() {
                // Row does not have an equals method, so test against cell index and name
                for (int i = 0; i < originalProject.columnModel.columns.size(); i++) {
                    Column originalColumn = originalProject.columnModel.columns.get(i);
                    Column copyColumn = originalProject.columnModel.columns.get(i);
                    Assertions.assertEquals(originalColumn.getCellIndex(), copyColumn.getCellIndex());
                    Assertions.assertEquals(originalColumn.getName(), copyColumn.getName());
                }
            }

        }

    }

}
