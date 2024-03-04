package com.google.refine.roundup.operations.row;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Cell;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.model.changes.RowAdditionChange;

public class RowsInsertOperation extends AbstractOperation {

    final protected List<List<Row>> _rowBlocks;
    final protected List<Integer> _indices;

    @JsonCreator
    public RowsInsertOperation(
            @JsonProperty("rows") List<List<List<String>>> rowData,
            @JsonProperty("indices") List<Integer> indices) {
        _rowBlocks = rowData.stream()
                .map(RowsInsertOperation::parseRows)
                .collect(Collectors.toList());

        _indices = indices;
    }

    public RowsInsertOperation(
            @JsonProperty("rows") List<List<String>> rowData,
            @JsonProperty("index") Integer insertionIndex) {
        _rowBlocks = new ArrayList<>();
        _rowBlocks.add(parseRows(rowData));

        _indices = new ArrayList<>();
        _indices.add(insertionIndex);
    }


//    // TODO: why is this getter method with the JsonProperty annotation is essential
//    //  when loading the project with this operation in OpenRefine
//    @JsonProperty("rows")
//    public List<Row> getRows() {
//        return _rowBlocks;
//    }

    public Integer getRowCount() {
        return _rowBlocks.stream().mapToInt(List::size).sum();
    }

    // TODO: internationalization and localization
    // TODO: make different from createDescription
    @Override
    protected String getBriefDescription(Project project) {
        int count = getRowCount();
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
                new RowAdditionChange(_rowBlocks, _indices));
    }

    @Override
    public String getOperationId() {
        return "roundup/RowsInsertOperation";
    }

    // TODO: Do I need to include column model to know what types each cell in the row is?
    //  I will need to handle types other than string.
    public static List<Row> parseRows(List<List<String>> block) {
        return block.stream()
                .map(list -> {
                    List<Cell> cells = list.stream()
                            .map(c -> new Cell(c, null))
                            .collect(Collectors.toList());

                    Row row = new Row(cells.size());
                    // TODO: don't I need to do I need to setCell?
                    row.cells.addAll(cells);
                    return row;
                })
                .collect(Collectors.toList());
    }
}
