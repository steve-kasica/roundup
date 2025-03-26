package com.google.refine.roundup.operations;

import static com.google.refine.roundup.util.RowUtil.concatRows;

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

public class ProjectJoinOperation extends AbstractOperation {

    final protected long _auxProjectId;
    final protected String _auxJoinColumnName;
    final protected String _primaryJoinColumnName;

    @JsonCreator
    public ProjectJoinOperation(
            @JsonProperty("auxProjectId") long auxProjectId,
            @JsonProperty("primaryJoinColumName") String primaryJoinColumnName,
            @JsonProperty("auxJoinColumnName") String auxJoinColumnName) {
        _auxProjectId = auxProjectId;
        _primaryJoinColumnName = primaryJoinColumnName;
        _auxJoinColumnName = auxJoinColumnName;
    }

    @Override
    protected String getBriefDescription(Project project) {
        return "Join columns";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryId) throws Exception {
        Project auxProject = ProjectManager.singleton.getProject(_auxProjectId);

        int primaryJoinCellIndex = project.columnModel.getColumnIndexByName(_primaryJoinColumnName);
        int auxJoinCellIndex = auxProject.columnModel.getColumnIndexByName(_auxJoinColumnName);

        List<Row> rows = innerJoinRows(project.rows, auxProject.rows, primaryJoinCellIndex, auxJoinCellIndex);
        List<Column> columns = ProjectCartesianProductOperation.joinColumns(project.columnModel.columns, auxProject.columnModel.columns);

        String description = String.format("Inner join with project %d on %s == %s",
                auxProject.id,
                _primaryJoinColumnName,
                _auxJoinColumnName);

        return new HistoryEntry(
                historyEntryId,
                project,
                description,
                this,
                new MassRowColumnChange(columns, rows));
    }

    public static List<Row> innerJoinRows(List<Row> rows1, List<Row> rows2, int cellIndex1, int cellIndex2) {
        return rows1.stream()
                .flatMap(r1 -> rows2.stream()
                        .filter(r2 -> rowsMatch(r1, r2, cellIndex1, cellIndex2))
                        .map(r2 -> concatRows(r1, r2))
                )
                .collect(Collectors.toList());
    }

    public static boolean rowsMatch(Row r1, Row r2, int cellIndex1, int cellIndex2) {
        return r1.getCellValue(cellIndex1).equals(r2.getCellValue(cellIndex2));
    }

}
