package com.google.refine.roundup.commands.row;

import com.google.refine.browsing.EngineConfig;
import com.google.refine.commands.EngineDependentCommand;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.roundup.operations.row.RowsInsertOperation;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class InsertRowsCommand extends EngineDependentCommand {

    private String indicesParam = "indices";
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
        assertParamExists(request, rowDataParam);
        List<List<String>> rowData = getRowData(request);

        // Get indices parameter
        assertParamExists(request, indicesParam);
        List<Integer> indices = getIndices(request);

        if (indices.size() != rowData.size()) {
            String msg = String.format("Parameter sizes are unequal %s = %d and %s = %d",
                    indicesParam, indices.size(), rowDataParam, rowData.size());
            throw new ServletException(msg);
        }

        return new RowsInsertOperation(rowData, indices);

    }

    /**
     *
     * @param request
     * @return
     */
    private List<List<String>> getRowData(HttpServletRequest request) {
        String [] rows = request.getParameterValues("rows");
        return Arrays.stream(rows)
                .map(r -> Arrays.asList(r.split(",")))
                .collect(Collectors.toList());

    }

    /**
     *
     * @param request
     * @return
     * @throws ServletException
     */
    private List<Integer> getIndices(HttpServletRequest request) {
        // TODO: If indexParameter is not an integer, throw an error
        return Arrays.stream(request.getParameterValues(indicesParam))
                .map(Integer::parseInt)
                .collect(Collectors.toList());
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