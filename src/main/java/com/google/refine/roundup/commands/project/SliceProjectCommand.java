package com.google.refine.roundup.commands.project;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.google.refine.ProjectManager;
import com.google.refine.ProjectMetadata;
import com.google.refine.commands.Command;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.util.CopyUtilities;
import com.google.refine.roundup.util.RowGroup;

public class SliceProjectCommand extends Command {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (!hasValidCSRFToken(request)) {
            respondCSRFError(response);
            return;
        }

        Project originalProject = getProject(request);

        // TODO: if column doesn't exist
        // TODO: handle if column isn't categorical variable
        String columnName = request.getParameter("column");
        int columnIndex = originalProject.columnModel.getColumnByName(columnName).getCellIndex();

        RowGroup group = new RowGroup(originalProject.rows, columnIndex);
        List<Long> projectIds = new ArrayList();

        // TODO: Reconciliation didn't work, might be an issue with copying rows and columns
        for (List<Row> rows : group.getGroups().values()) {
            Project subsetProject = new Project();

            // Copy columns
            List<Column> copyColumns = originalProject.columnModel.columns.stream()
                    .map(CopyUtilities::copyColumn)
                    .collect(Collectors.toList());
            subsetProject.columnModel.columns.addAll(copyColumns);

            // Copy rows
            List<Row> copyRows = rows.stream()
                    .map(CopyUtilities::copyRow)
                    .collect(Collectors.toList());
            subsetProject.rows.addAll(copyRows);

            // Copy and modify project metadata
            String value = (String) rows.get(0).getCellValue(columnIndex);
            ProjectMetadata subsetProjectMetadata = CopyUtilities.copyProjectMetadata(originalProject);
            subsetProjectMetadata.setName(String.format("%s (%s subset)", subsetProjectMetadata.getName(), value));

            ProjectManager.singleton.registerProject(subsetProject, subsetProjectMetadata);
            projectIds.add(subsetProject.id);
        }

        // TODO: is this valid JSON? Also see CopyProjectCommand
        ObjectMapper mapper = new ObjectMapper();
        respond(response, "{ \"projects\":" + mapper.writeValueAsString(projectIds) + "}");
    }
}
