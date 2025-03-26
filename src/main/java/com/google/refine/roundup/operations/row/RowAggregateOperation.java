package com.google.refine.roundup.operations.row;

import java.io.Serializable;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Cell;
import com.google.refine.model.Column;
import com.google.refine.model.ColumnModel;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.model.changes.MassRowColumnChange;

public class RowAggregateOperation extends AbstractOperation {

    public enum AccumulatorName {
        SUM, COUNT, AVERAGE
    }
    private final int _groupIndex;
    private final int _valueIndex;
    private final AccumulatorName _accumulatorName;

    @JsonCreator
    public RowAggregateOperation(
            @JsonProperty("groupIndex") int groupIndex,
            @JsonProperty("valueIndex") int valueIndex,
            @JsonProperty("accumulatorName") AccumulatorName accumulatorName) {
        _groupIndex = groupIndex;
        _valueIndex = valueIndex;
        _accumulatorName = accumulatorName;
    }

    @Override
    protected String getBriefDescription(Project project) {
        // TODO aggregate data
        return "Aggregate rows";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryID) throws Exception {

        List<Column> newColumns = getColumns(project.columnModel);
        List<Row> newRows = aggregateRows(project.rows);

        String description = "Aggregate rows";

        return new HistoryEntry(
                historyEntryID,
                project,
                description,
                this,
                new MassRowColumnChange(newColumns, newRows));
    }

    public List<Column> getColumns(ColumnModel columnModel) {
        // Must create new column instances from old columns
        String groupColumnName = columnModel.getColumnByCellIndex(_groupIndex).getName();
        String valueColumnName = columnModel.getColumnByCellIndex(_valueIndex).getName();

        return new ArrayList<>(2) {
            {
                add(new Column(0, groupColumnName));
                add(new Column(1, valueColumnName));
            }
        };
    }

    public List<Row> aggregateRows(List<Row> rows) throws NoSuchMethodException {
        switch (_accumulatorName) {
            case SUM:
                return sum(rows);
            case COUNT:
                return count(rows);
            case AVERAGE:
                return average(rows);
            default:
                throw new NoSuchMethodException(_accumulatorName + " is not a valid method");
        }
    }

    private List<Row> sum(List<Row> rows) {
        // TODO needs to handle floats
        return rows.stream()
                .collect(Collectors.groupingBy(
                        row -> row.getCellValue(_groupIndex),
                        LinkedHashMap::new,  // Preserves ordering
                        Collectors.summingInt(row -> (int) row.getCellValue(_valueIndex))
                ))
                .entrySet().stream()
                .map(this::convertEntryToRow)
                .collect(Collectors.toList());
    }

    private List<Row> count(List<Row> rows) {
        return rows.stream()
                .collect(Collectors.groupingBy(
                        row -> row.getCellValue(_groupIndex),
                        LinkedHashMap::new,  // Preserves ordering
                        Collectors.counting()
                ))
                .entrySet().stream()
                .map(this::convertEntryToRow)
                .collect(Collectors.toList());
    }

    private List<Row> average(List<Row> rows) {
        return rows.stream()
                .collect(Collectors.groupingBy(
                        row -> row.getCellValue(_groupIndex),
                        LinkedHashMap::new,  // Preserves ordering
                        Collectors.averagingInt(row -> (int) row.getCellValue(_valueIndex))
                ))
                .entrySet().stream()
                .map(this::convertEntryToRow)
                .collect(Collectors.toList());
    }

    private <T> Row convertEntryToRow(Map.Entry<Object, T> entry) {
        Row row = new Row(2);
        row.setCell(0, new Cell((Serializable) entry.getKey(), null));
        row.setCell(1, new Cell((Serializable) entry.getValue(), null));
        return row;
    }

}
