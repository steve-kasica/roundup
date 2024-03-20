package com.google.refine.roundup.operations;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.ProjectManager;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.model.changes.MassRowColumnChange;
import com.google.refine.roundup.util.CopyUtilities;

public class ProjectCrossOperation extends AbstractOperation {

    final protected long _auxProjectId;

    @JsonCreator
    public ProjectCrossOperation(
            @JsonProperty("auxProjectId") long auxProjectId) {
        _auxProjectId = auxProjectId;
    }

    @Override
    protected String getBriefDescription(Project project) {
        return "Cross product";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryId) throws Exception {
        Project auxProject = ProjectManager.singleton.getProject(_auxProjectId);

        List<Row> rows = crossProductRows(project.rows, auxProject.rows);
        List<Column> columns = joinColumns(project.columnModel.columns, auxProject.columnModel.columns);
        for (Row row : rows) {
            System.out.println(row.toString());
        }


        String description = String.format("Cross product with project %d", auxProject.id);

        return new HistoryEntry(
                historyEntryId,
                project,
                description,
                this,
                new MassRowColumnChange(columns, rows));
    }

    public static List<Row> crossProductRows(List<Row> rows1, List<Row> rows2) {
        return rows1.stream()
                .flatMap(r1 -> rows2.stream().map(r2 -> mergeRows(r1, r2)))
                .collect(Collectors.toList());
    }

    public static Row mergeRows(Row r1, Row r2) {
        int count = r1.cells.size() + r2.cells.size();
        System.out.println(r1.cells.toString());
        System.out.println(r2.cells.toString());
        Row row = new Row(count);

        // TODO: would really love an addCell method to Row that auto-increments the cell
        AtomicInteger index = new AtomicInteger(0);
        Stream.concat(r1.cells.stream(), r2.cells.stream())
                .map(CopyUtilities::copy)
                .forEach(cellCopy -> row.setCell(index.getAndIncrement(), cellCopy));

        return row;
    }

    public static List<Column> joinColumns(List<Column> cols1, List<Column> cols2) {
        List<Column> columns = new ArrayList<>(cols1.size() + cols2.size());

        cols1.stream()
                .map(CopyUtilities::copyColumn)
                .forEach(columns::add);

        List<String> cols1Names = cols1.stream()
                .map(Column::getName)
                .collect(Collectors.toList());

        for (int i = 0; i < cols2.size(); i++) {
            Column copy = CopyUtilities.copy(cols2.get(i), cols1.size() + i);

            // De-duplicate column names (if any)
            if (cols1Names.contains(copy.getName())) {
                copy.setName(copy.getName() + "_2");
            }

            columns.add(copy);
        }

        return columns;
    }

}
