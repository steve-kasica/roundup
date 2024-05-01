package com.google.refine.roundup.operations;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
import static com.google.refine.roundup.util.RowUtil.concatRows;

public class ProjectCartesianProductOperation extends AbstractOperation {

    final protected long _auxProjectId;

    @JsonCreator
    public ProjectCartesianProductOperation(
            @JsonProperty("auxProjectId") long auxProjectId) {
        _auxProjectId = auxProjectId;
    }

    @Override
    protected String getBriefDescription(Project project) {
        return "Cartesian product";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryId) throws Exception {
        Project auxProject = ProjectManager.singleton.getProject(_auxProjectId);

        List<Row> rows = run(project.rows, auxProject.rows);
        List<Column> columns = joinColumns(project.columnModel.columns, auxProject.columnModel.columns);

        String description = String.format("Cross product with project %d", auxProject.id);

        return new HistoryEntry(
                historyEntryId,
                project,
                description,
                this,
                new MassRowColumnChange(columns, rows));
    }

    public static List<Row> run(List<Row> rows1, List<Row> rows2) {
        return rows1.stream()
                .flatMap(r1 -> rows2.stream().map(r2 -> concatRows(r1, r2)))
                .collect(Collectors.toList());
    }

    // This operation does not automatically remove the redundant join colum; however,
    // users can remove that column in a later step.
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
