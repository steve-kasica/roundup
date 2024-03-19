package com.google.refine.roundup.commands.project;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.refine.commands.Command;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.process.Process;
import com.google.refine.roundup.operations.ProjectJoinOperation;

public class JoinProjectsCommand extends Command {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!hasValidCSRFToken(request)) {
            respondCSRFError(response);
            return;
        }

        try {
            Project project = getProject(request);

            long auxProjectId = Long.parseLong(request.getParameter("auxProject"));
            String auxJoinColumnName = request.getParameter("auxJoinColumnName");
            String primaryJoinColumnName = request.getParameter("primaryJoinColumnName");

            AbstractOperation op = new ProjectJoinOperation(
                    auxProjectId,
                    primaryJoinColumnName,
                    auxJoinColumnName);
            Process process = op.createProcess(project, new Properties());

            performProcessAndRespond(request, response, project, process);
        } catch (Exception e) {
            respondException(response, e);
        }
    };

}
