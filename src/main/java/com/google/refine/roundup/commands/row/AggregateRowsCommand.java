package com.google.refine.roundup.commands.row;


import com.google.refine.commands.Command;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.process.Process;
import com.google.refine.roundup.operations.row.RowsAggregateOperation;
import com.google.refine.roundup.util.RowGroupAggregators;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Properties;
import java.util.Set;

public class AggregateRowsCommand extends Command {
    // This command follows the basic pattern of the TransposeRowsIntoColumnCommand

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!hasValidCSRFToken(request)) {
            respondCSRFError(response);
            return;
        }

        try {
            Project project = getProject(request);

            // TODO throw an error if we're in records mode, Maybe this should be in doPost?

            String groupParam = getColumnParam(request, "group");

            String valueParam = getColumnParam(request,"value");

            // TODO Handle missing parameter
            String functionParam = request.getParameter("function");

            // If the passed function name is not defined, throw an error
            Set<String> functionList = RowGroupAggregators.getAggregationMethods();
            if (!functionList.contains(functionParam)) {
                throw new ServletException(functionParam + " is not a valid aggregator function. Choices are: " + functionList);
            }

            AbstractOperation op = new RowsAggregateOperation(groupParam, valueParam, functionParam);

            Process process = op.createProcess(project, new Properties());

            performProcessAndRespond(request, response, project, process);

        } catch(Exception e) {
            respondException(response, e);
        }
    }

    private String getColumnParam(HttpServletRequest request, String name) throws ServletException {
        // TODO Handle missing parameter
        String param = request.getParameter(name);

        Project project = getProject(request);
        long id = project.id;

        if (!project.columnModel.getColumnNames().contains(param)) {
            throw new ServletException(param + " is not a valid column name in project #" + id);
        }
        return param;
    }
}