package com.google.refine.roundup.commands.project;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.refine.commands.Command;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.process.Process;
import com.google.refine.roundup.operations.row.RowBindOperation;

public class BindProjectsCommand extends Command {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!hasValidCSRFToken(request)) {
            respondCSRFError(response);
            return;
        }

        try {
            Project project = getProject(request);

            String [] auxIdValues = request.getParameterValues("auxProject");
            List<Long> auxProjectIds = Arrays.stream(auxIdValues)
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            AbstractOperation op = new RowBindOperation(auxProjectIds);
            Process process = op.createProcess(project, new Properties());

            performProcessAndRespond(request, response, project, process);
        } catch (Exception e) {
            respondException(response, e);
        }
    };

}
