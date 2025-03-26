package com.google.refine.roundup.commands.project;

import com.google.refine.ProjectManager;
import com.google.refine.ProjectMetadata;
import com.google.refine.commands.Command;
import com.google.refine.model.Project;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * A command for setting arbitrary project metadata fields used by Roundup.
 *
 *
 */
public class SetProjectMetadataCommand extends Command {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
//            if (!hasValidCSRFToken(request)) {
//                respondCSRFError(response);
//                return;
//            }

        Project project = request.getParameter("project") != null ? getProject(request) : null;
        if (project == null) {
            respond(response, "{ \"code\" : \"error\", \"message\" : \"Project cannot be found\" }");
            return;
        }
        ProjectMetadata meta = project.getMetadata();

        String name = request.getParameter("name");
        String value = request.getParameter("value");

        try {
            response.setCharacterEncoding("UTF-8");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Content-Type", "application/json");

            meta.setCustomMetadata(name, value);
            ProjectManager.singleton.saveMetadata(meta, project.id);

            respond(response, "{ \"code\" : \"ok\" }");
        } catch (Exception e) {
            respondException(response, e);
        }
    }
}