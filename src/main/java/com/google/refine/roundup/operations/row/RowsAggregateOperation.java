package com.google.refine.roundup.operations.row;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.model.changes.MassRowColumnChange;
import com.google.refine.roundup.util.RowGroup;
import com.google.refine.roundup.util.RowGroupAggregators;


public class RowsAggregateOperation extends AbstractOperation {

    final private String _keyColumnName, _valueColumnName, _accumulatorName;

    @JsonCreator
    public RowsAggregateOperation(
            @JsonProperty("keyParam") String keyParam,
            @JsonProperty("valueParam") String valueParam,
            @JsonProperty("accumulatorName") String accumulatorName
    ) {
        _keyColumnName = keyParam;
        _valueColumnName = valueParam;
        _accumulatorName = accumulatorName;
    }

    @Override
    protected String getBriefDescription(Project project) {
        return "Aggregate table based on a key column, a value column, and a aggregator function";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryID) throws Exception {
        int keyColumnIndex = project.columnModel.getColumnIndexByName(_keyColumnName);
        int valueColumnIndex = project.columnModel.getColumnIndexByName(_valueColumnName);

        // Create new rows by first transforming them into groups
        RowGroup groups = new RowGroup(project.rows, keyColumnIndex);

        Class<RowGroupAggregators> c = RowGroupAggregators.class;
        Method method = c.getMethod(_accumulatorName, RowGroup.class, int.class);
        List<Row> newRows = (List<Row>) method.invoke(null, groups, valueColumnIndex);

        System.out.println(newRows);

        // Must create new column instances from old columns
        Column oldKeyColumn = project.columnModel.getColumnByCellIndex(keyColumnIndex);
        Column oldValueColumn = project.columnModel.getColumnByCellIndex(valueColumnIndex);
        List<Column> newColumns = new ArrayList<>();
        newColumns.add(new Column(0, oldKeyColumn.getName()));
        newColumns.add(new Column(1, oldValueColumn.getName()));

        return new HistoryEntry(
                historyEntryID,
                project,
                createDescription(),
                this,
                // Use existing model change class for this operation
                new MassRowColumnChange(newColumns, newRows));
    }

    protected String createDescription() {
        return String.format("%s values in %s by groups in %s",
                _accumulatorName,
                _valueColumnName,
                _keyColumnName);
    }

}
