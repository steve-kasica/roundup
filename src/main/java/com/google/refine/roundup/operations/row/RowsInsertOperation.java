package com.google.refine.roundup.operations.row;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.refine.history.Change;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Cell;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.model.changes.RowAdditionChange;

import java.util.List;
import java.util.stream.Collectors;

public class RowsInsertOperation extends AbstractOperation {

    final protected List<List<String>> _rowData;
    final protected List<Integer> _indices;

    @JsonCreator
    public RowsInsertOperation(
            @JsonProperty("rows") List<List<String>> rowData,
            @JsonProperty("indices") List<Integer> indices) {
        _rowData = rowData;
        _indices = indices;
    }

//    // TODO: why is this getter method with the JsonProperty annotation is essential
//    //  when loading the project with this operation in OpenRefine
//    @JsonProperty("rows")
//    public List<Row> getRows() {
//        return _rowData;
//    }

    // TODO: internationalization and localization
    // TODO: make different from createDescription
    @Override
    protected String getBriefDescription(Project project) {
        int count = _rowData.size();
        return "Insert " + count + " new row" + ((count > 1) ? "s" : "");
    }

    // createHistoryEntry also populates the history field in `*.project/*.data/data.txt`
    // This operation will not throw an exception if a new row already exists in the project
    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryID) throws Exception {
        List<Row> rows = parseRows(_rowData);

        Change change = new RowAdditionChange(rows, _indices);

        return new HistoryEntry(
                historyEntryID,
                project,
                getBriefDescription(project),
                this,
                change);
    }

    @Override
    public String getOperationId() {
        return "roundup/RowsInsertOperation";
    }

    // TODO: Do I need to include column model to know what types each cell in the row is?
    //  I will need to handle types other than string.
    public static List<Row> parseRows(List<List<String>> rowsString) {
        return rowsString.stream()
                .map(l -> {
                    List<Cell> cells = l.stream()
                            .map(c -> new Cell(c, null))
                            .collect(Collectors.toList());
                    Row row = new Row(cells.size());
                    row.cells.addAll(cells);
                    return row;
                })
                .collect(Collectors.toList());
    }
}