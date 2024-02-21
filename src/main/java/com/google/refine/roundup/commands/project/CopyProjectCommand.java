package com.google.refine.roundup.commands.project;

import com.google.refine.ProjectManager;
import com.google.refine.ProjectMetadata;
import com.google.refine.commands.Command;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.util.ColumnUtil;
import com.google.refine.roundup.util.ProjectMetadataUtil;
import com.google.refine.roundup.util.RowUtil;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CopyProjectCommand extends Command {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        if (!hasValidCSRFToken(request)) {
            respondCSRFError(response);
            return;
        }

        try {
            Project origProject = getProject(request);
            Project copyProject = new Project();

            // TODO copy only rows that match the selection
            // TODO: workout shallow copy functionality
            for (Row row : origProject.rows) {
                copyProject.rows.add(RowUtil.copy(row));
            }

            ProjectMetadata copyProjectMetadata = ProjectMetadataUtil.copy(origProject.getMetadata());

            Column column;
            boolean avoidNameCollision = false;
            for (int i=0; i < origProject.columnModel.getMaxCellIndex(); i++) {
                column = origProject.columnModel.getColumnByCellIndex(i);
                copyProject.columnModel.addColumn(i, ColumnUtil.copy(column), avoidNameCollision);
            }

            ProjectManager.singleton.registerProject(copyProject, copyProjectMetadata);

//            ProjectUtilities.save(copyProject);
//            FileProjectManager.singleton.saveMetadata(copyProjectMetadata, copyProject.id);

            respond(response, "{\"code\":\"ok\"}");
        } catch (Exception e) {
            respondException(response, e);
        }
    }
}