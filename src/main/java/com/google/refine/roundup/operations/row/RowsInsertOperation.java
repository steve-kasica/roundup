package com.google.refine.roundup.operations.row;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Cell;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.model.changes.RowAdditionChange;

public class RowsInsertOperation extends AbstractOperation {

    final private List<Row> _rows;
    final private int _index;

    @JsonCreator
    public RowsInsertOperation(
            @JsonProperty("rows") List<List<String>> rows,
            @JsonProperty("index") int index) {
        _rows = rows.stream()
                // Map each String list to a Cell list
                .map(RowsInsertOperation::parseRow)
                // Collect results as a list of Rows
                .collect(Collectors.toList());

        _index = index;
    }

    // TODO: internationalization and localization
    // TODO: make different from createDescription
    @Override
    protected String getBriefDescription(Project project) {
        int count = _rows.size();
        return "Insert " + count + " row" + ((count > 1) ? "s" : "");
    }

    // createHistoryEntry also populates the history field in `*.project/*.data/data.txt`
    // This operation will not throw an exception if a new row already exists in the project
    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryID) throws Exception {
        return new HistoryEntry(
                historyEntryID,
                project,
                getBriefDescription(project),
                this,
                new RowAdditionChange(_rows, _index));
    }

    // TODO: Do I need to include column model to know what types each cell in the row is?
    //  I will need to handle types other than string.
    public static Row parseRow(List<String> values) {
        int count = values.size();
        Row row = new Row(count);
        IntStream.range(0, count)
                 .forEach(index -> row.setCell(index, new Cell(values.get(index), null)));
        return row;
    }
}
