package com.google.refine.roundup.commands.row;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

import com.google.refine.browsing.EngineConfig;
import com.google.refine.commands.EngineDependentCommand;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.roundup.operations.row.RowsInsertOperation;

public class InsertRowsCommand extends EngineDependentCommand {

    private String indexParam = "index";
    private String rowDataParam = "rows";

    /**
     *
     * @param project: an OpenRefine project
     * @param request: A valid request will contain a parameter called "rows" that contains an
     *               array of comma-delimited strings. a valid request argument will also contain
     *               two additional parameters handled by the `doPost` method: "csrf_token"
     *               and "project."
     * @param engineConfig: TK
     * @return AbstractOperation
     * @throws Exception: TK
     */
    @Override
    protected AbstractOperation createOperation(Project project,
                                                HttpServletRequest request,
                                                EngineConfig engineConfig) throws ServletException {

        // Get rows parameter
        List<List<String>> rowData = getRowData(request);

        // TODO: verify that row size (# of columns) is not out of bounds

        // Get indices parameter
        int index = getIndex(request);

        // TODO: verify that index is not out of bounds

        return new RowsInsertOperation(rowData, index);

    }

    /**
     *
     * @param request
     * @return
     */
    private List<List<String>> getRowData(HttpServletRequest request) throws ServletException {
        assertParamExists(request, rowDataParam);
        String [] rows = request.getParameterValues(rowDataParam);

        String delim = ",";
        return Arrays.stream(rows)
                .map(r -> Arrays.asList(r.split(delim)))
                .collect(Collectors.toList());

    }

    /**
     *
     * @param request
     * @return
     * @throws ServletException
     */
    private Integer getIndex(HttpServletRequest request) throws ServletException {
        assertParamExists(request, indexParam);
        return Integer.parseInt(request.getParameter(indexParam));
    }

    /**
     *
     * @param request
     * @param param
     * @throws ServletException
     */
    private void assertParamExists(HttpServletRequest request, String param) throws ServletException {
        if (!request.getParameterMap().containsKey(param) || request.getParameter(param) == null) {
            throw new ServletException(String.format("Parameter \"%s\" is required", param));
        }
    }
}
