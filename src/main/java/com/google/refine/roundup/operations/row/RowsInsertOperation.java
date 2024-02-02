package com.google.refine.roundup.operations.row;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.refine.browsing.EngineConfig;
import com.google.refine.history.Change;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.Cell;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.operations.EngineDependentOperation;
import com.google.refine.roundup.model.changes.RowsInsertChange;

import java.util.List;
import java.util.stream.Collectors;

public class RowsInsertOperation extends EngineDependentOperation {

    final protected List<Row> _rows;
    final protected int _size, _index;

    @JsonCreator
    public RowsInsertOperation(
            @JsonProperty("engineConfig") EngineConfig engineConfig,
            @JsonProperty("rows") List<List<String>> rows,
            @JsonProperty("index") int index) {
        super(engineConfig);

        _rows = parseRows(rows);
        _size = _rows.size();
        _index = index;
    }

    // TODO: why is this getter method with the JsonProperty annotation is essential
    //  when loading the project with this operation in OpenRefine
    @JsonProperty("rows")
    public List<Row> getRows() {
        return _rows;
    }

    // TODO: internationalization and localization
    // TODO: make different from createDescription
    @Override
    protected String getBriefDescription(Project project) {
        return "Add " + _size + " row" + ((_size > 1) ? "s" : "");
    }


    // createHistoryEntry also populates the history field in `*.project/*.data/data.txt`
    // TODO: where does createHistoryEntry get called in the process?
    // TODO: Should the operation throw an exception if a new row already exists in the project, like ColumnAdditionOperation?
    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryID) throws Exception {
        int offset = project.rows.size();

        String description = "Add " + _size + " row" + ((_size > 1) ? "s" : "");
        Change change = new RowsInsertChange(_rows, offset);

        return new HistoryEntry(
                historyEntryID, project, description, this, change);
    }

    @Override
    public String getOperationId() {
        return "roundup/RowInsertionOperation";
    }

    // TODO: Do I need to include column model to know what types each cell in the row is?
    //  I will need to handle types other than string.
    private List<Row> parseRows(List<List<String>> rowsParam) {
        return rowsParam.stream()
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