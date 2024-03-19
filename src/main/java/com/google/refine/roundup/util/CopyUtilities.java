package com.google.refine.roundup.util;

import java.io.File;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.ZipFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.InjectableValues;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.google.refine.ProjectManager;
import com.google.refine.ProjectMetadata;
import com.google.refine.history.History;
import com.google.refine.io.FileProjectManager;
import com.google.refine.io.ProjectMetadataUtilities;
import com.google.refine.io.ProjectUtilities;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.util.Pool;

public class CopyUtilities {

    public static Project copyProject(Project project) {
        // TODO: is there a performance benefit to copying a project by serializing a Project
        //  class instance if it is obtainable by ProjectManager (in memory already)?
        ProjectManager.singleton.ensureProjectSaved(project.id);
        File projectDir = ((FileProjectManager) ProjectManager.singleton).getProjectDir(project.id);
        Project copyProject = ProjectUtilities.load(projectDir, Project.generateID());

        // For each past entry in copyProject, set the change from the file written in the original project's directory
        copyProject.history.getLastPastEntries(-1).stream()
                .forEach(historyEntry -> {
                    try {
                        ZipFile zipFile = new ZipFile(projectDir.toString() + "/history/" + historyEntry.id + ".change.zip");
                        InputStream inputStream = zipFile.getInputStream(zipFile.getEntry("change.txt"));
                        historyEntry.setChange(History.readOneChange(inputStream, new Pool()));
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                });

        // Can't assume that _change is not null in original
//        List<HistoryEntry> copyPastEntries = copyProject.history.getLastPastEntries(0);
//        List<HistoryEntry> originalPastEntries = project.history.getLastPastEntries(0);
//        for (int i = 0; i < copyPastEntries.size(); i++) {
//            HistoryEntry copyHistoryEntry = copyPastEntries.get(i);
//            HistoryEntry originalHistoryEntry = originalPastEntries.get(i);
//            copyHistoryEntry.setChange(originalHistoryEntry.getChange());
//        }

        return copyProject;
    }

    public static ProjectMetadata copyProjectMetadata(Project project) {
        File projectDir = ((FileProjectManager) ProjectManager.singleton).getProjectDir(project.id);
        return ProjectMetadataUtilities.load(projectDir);
    }

    public static Row copyRow(Row row) {
        Pool pool = new Pool();
        ObjectMapper mapper = new ObjectMapper();
        InjectableValues injections = new InjectableValues.Std().addValue("pool", pool);
        mapper.setInjectableValues(injections);
        
        try {
            return mapper.readValue(mapper.writeValueAsString(row), Row.class);
        } catch(JsonProcessingException e) {
            throw new IllegalArgumentException(e);
        }
    }

    public static List<Row> copyRows(List<Row> rows) {
        return rows.stream().map(CopyUtilities::copyRow).collect(Collectors.toList());
    }

    public static Column copyColumn(Column column) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(mapper.writeValueAsString(column), Column.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(e);
        }
    }

    public static List<Column> copy(List<Column> columns) {
        return columns.stream().map(CopyUtilities::copyColumn).collect(Collectors.toList());
    }
}
