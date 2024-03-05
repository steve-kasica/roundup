package com.google.refine.roundup.model.changes;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.RoundupTest;

public class TestRowAdditionChange extends RoundupTest {

    private RowAdditionChange _change;
    private Project _project;
    private List<List<Row>> _rowBlocks;
    private List<Row> _additionalRows;
    private List<Integer> _insertionIndices;
    private Integer _initialSize;
    private Random _random;

    private RowAdditionChange change;

    @Override
    @BeforeEach
    public void setup() {
        super.setup();

        _random = new Random(123456789L);

        // Reset insertion indices
        _insertionIndices = new ArrayList<>();

        // Setup project fresh
        _project = new Project();
        _project.rows.addAll(getEmployeesA());
        _initialSize = _project.rows.size();  // 10 rows

        // Reset row blocks
        _rowBlocks = new ArrayList<>();

        // Reset list of new rows
        _additionalRows = null;

        // Reset change
        change = null;
    }

    @Test
    @DisplayName("Apply (one-block): Row count correct")
    public void testOneBlockSize() {
        int rowCount = 2;
        setUpOneBlock(rowCount);

        _change.apply(_project);
        Assertions.assertEquals(_project.rows.size(), _initialSize + _additionalRows.size());
    }

    @Test
    @DisplayName("Apply (one-block): Project contains new rows")
    public void testOneBlockMembership() {
        int rowCount = 2;
        setUpOneBlock(rowCount);
        _change.apply(_project);
        _additionalRows.forEach(row -> Assertions.assertTrue(_project.rows.contains(row)));
    }

    @Test
    @DisplayName("Apply (one-block): New row indices are correct")
    public void testOneBlockIndices() {
        int rowCount = 2;
        setUpOneBlock(rowCount);
        int insertionIndex = _insertionIndices.get(0);
        _change.apply(_project);
        for (int i = 0; i < _additionalRows.size(); i++) {
            Row row = _additionalRows.get(i);
            Assertions.assertEquals(insertionIndex + i, _project.rows.indexOf(row));
        }
    }

    @Test
    @DisplayName("Revert (one-block): Row count equals initial size")
    public void testRevertOneBlockSize() {
        int rowCount = 2;
        setUpOneBlock(rowCount);

        RowAdditionChange change = new RowAdditionChange(_rowBlocks, _insertionIndices);
        change.apply(_project);
        change.revert(_project);

        // Assert that the row count is correct
        Assertions.assertEquals(_project.rows.size(), _initialSize);
    }

    @Test
    @DisplayName("Revert (one-block): New rows are absent")
    public void testRevertOneBlockMembership() {
        int rowCount = 2;
        setUpOneBlock(rowCount);

        RowAdditionChange change = new RowAdditionChange(_rowBlocks, _insertionIndices);
        change.apply(_project);
        change.revert(_project);

        // Assert that new rows are no longer in the project
        _additionalRows.forEach(row -> Assertions.assertFalse(_project.rows.contains(row)));

    }

    @Test
    @DisplayName("Apply (two-block): Row count correct")
    public void testMultiBlockSize() {
        int rowCount = 2;
        int blockCount = 2;
        setUpMultiBlocks(blockCount, rowCount);

        _change.apply(_project);
        Assertions.assertEquals(_project.rows.size(), _initialSize + _additionalRows.size());
    }

    @Test
    @DisplayName("Apply (two-block): Project contains new rows")
    public void testMultiBlockMembership() {
        int rowCount = 2;
        int blockCount = 2;
        setUpMultiBlocks(blockCount, rowCount);
        _change.apply(_project);

        // Assert that new rows are no longer in the project
        _additionalRows.forEach(row -> Assertions.assertTrue(_project.rows.contains(row)));
    }

    @Test
    @DisplayName("Apply (two-block): New row indices are correct")
    public void testMultiBlockIndices() {
        int rowCount = 2;
        int blockCount = 2;
        setUpMultiBlocks(blockCount, rowCount);
        _change.apply(_project);

        int insertionIndex;
        int expected;
        int actual;
        List<Row> block;
        Row addedRow;
        for (int i = 0; i < _rowBlocks.size(); i++) {
            insertionIndex = _insertionIndices.get(i);
            block = _rowBlocks.get(i);
            for (int j = 1; j < block.size(); j++) {
                addedRow = block.get(j);
                actual = _project.rows.indexOf(addedRow);
                expected = insertionIndex + j;
                Assertions.assertEquals(expected,actual);
            }
        }
    }

    @Test
    @DisplayName("Foo")
    public void testParse() {
//        String _changeFn = "resources/changes/row-addition-change.txt";
//        LineNumberReader reader = new LineNumberReader(new FileReader(_changeFn));
        String line = "rowBlock=0,2";
        int equal = line.indexOf('=');
        CharSequence field = line.subSequence(0, equal);
        CharSequence value = line.substring(equal + 1);
        Assertions.assertEquals(field,"rowBlock");
        Assertions.assertEquals(value,"0,2");
    }

    private void setUpOneBlock(int rowCount) {
        int index = _random.nextInt(_project.rows.size());
        _insertionIndices.add(index);

        List<Row> rows = getEmployeesB().subList(0, rowCount - 1);
        _rowBlocks.add(rows);

        _change = new RowAdditionChange(_rowBlocks, _insertionIndices);

        _additionalRows = _rowBlocks.get(0);
    }

    private void setUpMultiBlocks(int blockCount, int rowCount) {
        int index;
        List<Row> rows;
        for (int i = 0; i < blockCount; i++) {
            index = _random.nextInt(_project.rows.size());
            if (!_insertionIndices.contains(index)) {
                _insertionIndices.add(index);
                rows = getEmployeesB();
                Collections.shuffle(getEmployeesB());
                _rowBlocks.add(rows.subList(0, rowCount - 1));
            }
        }

        _change = new RowAdditionChange(_rowBlocks, _insertionIndices);

        _additionalRows = _rowBlocks.stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }
}
