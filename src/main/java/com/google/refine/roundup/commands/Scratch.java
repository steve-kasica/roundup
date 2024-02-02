package com.google.refine.roundup.commands;

import com.google.refine.commands.Command;
import com.google.refine.io.ProjectUtilities;
import com.google.refine.model.Cell;
import com.google.refine.model.Project;
import com.google.refine.model.Row;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Scratch extends Command {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long id1 = 2428393651268L;  // State capitols
        Project proj1 = loadProjectById(id1);
        int keyIdx1 = proj1.columnModel.getColumnIndexByName("state");

        Long id2 = 1864271367606L;  // State population
        Project proj2 = loadProjectById(id2);
        int keyIdx2 = proj2.columnModel.getColumnIndexByName("State");

        List<Row> matchedRows = new ArrayList<>();
        int cellIndex = 0;  // Column index
        for (Row r1 : proj1.rows) {
            if (proj2.rows.stream().anyMatch(r2 -> r1.getCellValue(keyIdx1) == r2.getCellValue(keyIdx2))) {
                matchedRows.add(r1);
            }
        }

        respondJSON(response, matchedRows);
    }

    private Project loadProjectById(Long id) {
        String workingDirectory = "/users/steve/Library/Application Support/OpenRefine/";
        String projectDirectory = workingDirectory + id + ".project";
        File dir = new File(projectDirectory);
        return ProjectUtilities.load(dir, id);
    }

    private List<Cell> getCellsByColumnName(Project project, String columnName) {
        int index = project.columnModel.getColumnIndexByName(columnName);
        return  project.rows.stream()
                .map(row -> row.getCells().get(index))
                .collect(Collectors.toList());
    }
}
