package com.google.refine.roundup.model.changes;

import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.RoundupTest;

public class TestRowAdditionChange extends RoundupTest {

    private RowAdditionChange _change;
    private Project _project;
    private List<List<Row>> _rowBlocks;
    private List<Row> _additionalRows;
    private Integer _insertionIndex;
    private Integer _initialSize;

    private RowAdditionChange change;

    @Override
    @BeforeEach
    public void setup() {
        super.setup();

        // Setup project
        _project = new Project();
        _project.rows.addAll(getEmployeesA());
        _initialSize = _project.rows.size();  // 10 rows

        // Reset insertion indices
        Random random = new Random(123456789L);
        _insertionIndex = random.nextInt(_project.rows.size());

        // Reset list of new rows
        _additionalRows = null;

        int rowCount = 2;
        _additionalRows = getEmployeesB().subList(0, rowCount - 1);

        // Reset change
        _change = new RowAdditionChange(_additionalRows, _insertionIndex);
    }

    @Nested
    @DisplayName("Apply method")
    public class testApply {
        @Test
        @DisplayName("Row count correct")
        public void testSize() {
            _change.apply(_project);
            Assertions.assertEquals(_project.rows.size(), _initialSize + _additionalRows.size());
        }

        @Test
        @DisplayName("Project contains new rows")
        public void testMembership() {
            _change.apply(_project);
            _additionalRows.forEach(row -> Assertions.assertTrue(_project.rows.contains(row)));
        }

        @Test
        @DisplayName("New row indices are correct")
        public void testIndices() {
            _change.apply(_project);
            for (int i = 0; i < _additionalRows.size(); i++) {
                Row row = _additionalRows.get(i);
                Assertions.assertEquals(_insertionIndex + i, _project.rows.indexOf(row));
            }
        }
    }

    @Nested
    @DisplayName("Revert method")
    public class testRevert {
        @Test
        @DisplayName("Row count equals initial size")
        public void testSize() {
            _change.apply(_project);
            _change.revert(_project);

            // Assert that the row count is correct
            Assertions.assertEquals(_project.rows.size(), _initialSize);
        }

        @Test
        @DisplayName("Revert: New rows are absent")
        public void testMembership() {
            _change.apply(_project);
            _change.revert(_project);

            // Assert that new rows are no longer in the project
            _additionalRows.forEach(row -> Assertions.assertFalse(_project.rows.contains(row)));

        }
    }
}
