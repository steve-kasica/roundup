package com.google.refine.roundup.operations.row;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.browsing.Engine;
import com.google.refine.browsing.EngineConfig;
import com.google.refine.browsing.FilteredRows;
import com.google.refine.browsing.RowVisitor;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.Cell;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.operations.EngineDependentOperation;
import com.google.refine.roundup.model.changes.RowAdditionChange;

public class RowInterpolateOperation extends EngineDependentOperation {

    final private Integer _groupCellIndex;
    final private Integer _valueCellIndex;
    final private ChronoUnit _step;
    @JsonCreator
    public RowInterpolateOperation(
            @JsonProperty("engineConfig") EngineConfig engineConfig,
            @JsonProperty("groupColumn") Column groupColumn,
            @JsonProperty("valueColumn") Column valueColumn,
            @JsonProperty("step") ChronoUnit step) {
                super(engineConfig);
                _groupCellIndex = groupColumn.getCellIndex();
                _valueCellIndex = valueColumn.getCellIndex();
                _step = step;
    }

    // TODO: Can I get the count of new rows by the time this method is called?
    @Override
    protected String getBriefDescription(Project project) {
        return "Interpolate rows";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryID) throws Exception {
        Engine engine = createEngine(project);

        List<Row> additionalRows = new ArrayList();
        List<Integer> indices = new ArrayList<>();
        indices.add(0);

        FilteredRows filteredRows = engine.getFilteredRows(null);
        filteredRows.accept(project, createRowVisitor(additionalRows));

        List<List<Row>> rowBlocks = new ArrayList<>();
        rowBlocks.add(additionalRows);

        return new HistoryEntry(
                historyEntryID,
                project,
                "Interpolate a few rows",
                this,
                new RowAdditionChange(rowBlocks, indices));
    }

    private RowVisitor createRowVisitor(List<Row> additionalRows) {
        return new RowVisitor() {
            Map<Object, List<Map.Entry<Integer, Row>>> _groups;
            List<Row> additionalRows;

            public RowVisitor init(List<Row> additionalRows) {
                this._groups = new HashMap<>();
                this.additionalRows = additionalRows;
                return this;
            }

            @Override
            public void start(Project project) {
                // nothing to do
            }

            @Override
            public boolean visit(Project project, int rowIndex, Row row) {
                Object groupValue = row.getCell(_groupCellIndex).getValue();
                Map.Entry<Integer, Row> entry = new AbstractMap.SimpleEntry<>(rowIndex, row);

                if (!_groups.containsKey(groupValue)) {
                    List<Map.Entry<Integer, Row>> entryList = new ArrayList<>();
                    _groups.put(groupValue, entryList);
                }
                _groups.get(groupValue).add(entry);

                return false;
            }

            /**
             * After rows have been collected, convert them from a map
             * and interpolate them, setting rows and indices list
             * to pass to RowAdditionChange
             *
             * TODO: Test edge case when entryList.size() == 1?
             * TODO: Test edge case when there are no new rows to interpolate between `curr` and `next`
             */
            @Override
            public void end(Project project) {
                for (List<Map.Entry<Integer, Row>> entryList: _groups.values()) {
                    List<Row> interpolatedRows = null;

                    for (int i = 0; i < entryList.size() - 1; i++) {
                        Row curr = entryList.get(i).getValue();
                        Row next = entryList.get(i + 1).getValue();
                        interpolatedRows = interpolateRows(curr, next);
                        if (interpolatedRows != null) {
                            additionalRows.addAll(interpolatedRows);
                        }
                    }
                }
            }
        }.init(additionalRows);
    }

    private List<Row> interpolateRows(Row startRow, Row endRow) {
        // TODO: Verify that rows have the same number of cells
        Cell startCell = startRow.getCell(_valueCellIndex);
        Cell endCell = endRow.getCell(_valueCellIndex);
        int cellCount = startRow.getCells().size();

        if (startCell.value.getClass() == OffsetDateTime.class) {
            // Interpolate dates
            // TODO: what if start and end cells are not exactly ends between the
            //  step increment unit? For example, start = 2024-01-01, end = 2025-12-15, step = MONTHS
            return interpolate(
                    (OffsetDateTime) startCell.value,
                    (OffsetDateTime) endCell.value,
                    _step).stream()
                    .map(dt -> {
                        Row r = new Row(cellCount);
                        Serializable value;
                        for (int i = 0; i < cellCount; i++) {
                            if (i == _valueCellIndex) {
                                value = dt;
                            } else if (i == _groupCellIndex) {
                                value = startRow.getCell(_groupCellIndex).value;
                            } else {
                                value = null;
                            }
                            r.setCell(i, new Cell(value, null));
                        }
                        return r;
                    })
                    .collect(Collectors.toList());
        }

        // TODO: interpolate integers

        return null;
    }

    public static List<OffsetDateTime> interpolate(OffsetDateTime start, OffsetDateTime end, ChronoUnit step) {
        List<OffsetDateTime> out = new ArrayList<>();

        // TODO: test if end is earlier than start?
        long between = step.between(start, end);

        // TODO: Can this be refactored to just use the ChronoUnit argument?
        //  Assign a method for increasing a date based on ChronoUnit
        //  Must match InterpolateRowsCommand.validChronoStepUnits
        Function<Integer, OffsetDateTime> func;
        switch (step) {
            case YEARS: func = start::plusYears; break;
            case MONTHS: func = start::plusMonths; break;
            case WEEKS: func = start::plusWeeks; break;
            default: func = start::plusDays; break;  // DAYS is default
        }

        for (int i = 1; i < between; i++) {
            out.add(func.apply(i));
        }

        return out;
    }

}
