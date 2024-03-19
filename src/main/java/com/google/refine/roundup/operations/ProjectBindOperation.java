package com.google.refine.roundup.operations;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.ProjectManager;
import com.google.refine.history.HistoryEntry;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.model.changes.MassRowChange;

public class ProjectBindOperation extends AbstractOperation {

    final protected long _auxProjectId;

    @JsonCreator
    public ProjectBindOperation(@JsonProperty("auxProjectId") long auxProjectId) {
        _auxProjectId = auxProjectId;
    }

    @Override
    protected String getBriefDescription(Project project) {
        return "Bind projects";
    }

    @Override
    protected HistoryEntry createHistoryEntry(Project project, long historyEntryId) throws Exception {
        Project auxProject = ProjectManager.singleton.getProject(_auxProjectId);

        // TODO: perform some kind of check to ensure that rows are aligned
        List<Row> rows = Stream.concat(project.rows.stream(), auxProject.rows.stream()).collect(Collectors.toList());

        String description = String.format("Bind project %d", auxProject.id);

        return new HistoryEntry(
                historyEntryId,
                project,
                description,
                this,
                new MassRowChange(rows));
    }

}
