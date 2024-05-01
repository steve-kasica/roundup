package com.google.refine.roundup.operations.row;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.ProjectManager;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.model.changes.MassRowChange;
import com.google.refine.roundup.util.CopyUtilities;

public class RowBindOperation extends AbstractOperation {

    final protected List<Long> _auxProjectIds;

    @JsonCreator
    public RowBindOperation(@JsonProperty("auxProjectIds") List<Long> auxProjectIds) {
        _auxProjectIds = auxProjectIds;
    }

    @Override
    protected String getBriefDescription(Project project) {
        return "Bind projects";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryId) throws Exception {
        List<Project> projects = new ArrayList<>(_auxProjectIds.size() + 1);
        projects.add(project);

        projects.addAll(_auxProjectIds.stream()
                .map(ProjectManager.singleton::getProject)
                .collect(Collectors.toList()));

        String description = String.format(
                "Bind %d projects: %s",
                _auxProjectIds.size(),
                String.join(", ", _auxProjectIds.stream()
                        .map(String::valueOf)
                        .collect(Collectors.toList())));

        List<Row> rows = run(projects);

        return new HistoryEntry(
                historyEntryId,
                project,
                description,
                this,
                new MassRowChange(rows));
    }

    /**
     * Combines a variable number of project rows
     * @param projects
     * @return
     */
    public static List<Row> run(List<Project> projects) {
        return projects.stream()
                .flatMap(project -> project.rows.stream())
                .map(CopyUtilities::copyRow)
                .collect(Collectors.toList());
    }

}
