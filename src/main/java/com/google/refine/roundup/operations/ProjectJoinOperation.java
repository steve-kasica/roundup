package com.google.refine.roundup.operations;

import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.ProjectManager;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Cell;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.model.changes.MassRowColumnChange;
import com.google.refine.roundup.util.CopyUtilities;

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
        List<Column> columns = joinColumns(project.columnModel.columns, auxProject.columnModel.columns);

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
                        .map(r2 -> mergeRows(r1, r2, cellIndex2))
                )
                .collect(Collectors.toList());
    }

    public static boolean rowsMatch(Row r1, Row r2, int cellIndex1, int cellIndex2) {
        return r1.getCellValue(cellIndex1).equals(r2.getCellValue(cellIndex2));
    }

    public static Row mergeRows(Row r1, Row r2, int cellIndex2) {
        int cellCount = r1.cells.size() + r2.cells.size() - 1;
        Row row = new Row(cellCount);
        // TODO: test out copy cells
        Serializable value;
        for (int i = 0; i < r1.cells.size(); i++) {
            value = (Serializable) r1.getCell(i).getValue();
            row.setCell(i, new Cell(value, null));
        }

        // TODO: would really love an addCell method to row that autoincrements the cell
        // index
        int j = row.cells.size();
        int i = 0;
        for (Cell cell : r2.cells) {
            if (i != cellIndex2) {
                value = (Serializable) cell.getValue();
                row.setCell(j, new Cell(value, null));
                j++;
            }
            i++;
        }

        return row;
    }

    // This operation does not automatically remove the redundant join colum; however,
    // users can remove that column in a later step.
    public static List<Column> joinColumns(List<Column> cols1, List<Column> cols2) {
        List<Column> cols1Copy = CopyUtilities.copy(cols1);
        List<Column> cols2Copy = CopyUtilities.copy(cols2);

        // De-duplicate column names (if any)
        for (Column c1 : cols1Copy) {
            for (Column c2: cols2Copy) {
                if (c1.getName().equals(c2.getName())) {
                    c2.setName(c2.getName() + "_2");
                }
            }
        }

        return Stream
                .concat(cols1Copy.stream(), cols2Copy.stream())
                .collect(Collectors.toList());
    }

}
