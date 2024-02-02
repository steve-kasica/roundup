package com.google.refine.roundup.commands.row;

import com.google.refine.browsing.EngineConfig;
import com.google.refine.commands.EngineDependentCommand;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.roundup.operations.row.RowsInsertOperation;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class InsertRowsCommand extends EngineDependentCommand {

    // TODO: delete when done developing
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        respondJSON(response, "hey");
    }

    // Used for debugging post request
//    @Override
//    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//        respondJSON(response, 'hey');
//    }

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
    // TODO: write test for request that does not have a rows parameter, how does the server respond?
    @Override
    protected AbstractOperation createOperation(Project project,
                                                HttpServletRequest request,
                                                EngineConfig engineConfig) throws Exception {

        // Set rows parameter
        List<List<String>> newRows = parseRows(request);

        // Get index parameter
        int index = parseIndex(request);

        return new RowsInsertOperation(
                engineConfig,
                newRows,
                index
        );

    }

    private List<List<String>> parseRows(HttpServletRequest request) {
        if (!request.getParameterMap().containsKey("rows") || request.getParameter("rows") == null) {
            // If 'rows' parameter is missing or null, throw error
            throw new IllegalArgumentException("parameter 'rows' should not be null");
        }

        String [] rows = request.getParameterValues("rows");

        // TODO: If the length of rows is not equal to the number of columns, throw an error

        return Arrays.stream(rows)
                .map(r -> Arrays.asList(r.split(",")))
                .collect(Collectors.toList());

    }

    private int parseIndex(HttpServletRequest request) {
        String[] indexParam = {"0"};
        int index;
        if (request.getParameterMap().containsKey("index") || request.getParameter("index") != null) {
            indexParam = request.getParameterValues("index");

            // TODO: If indexParameter has more than one value, throw an error

        }

        // TODO: If indexParameter is not an integer, throw an error
        index = Integer.parseInt(indexParam[0]);

        // TODO: If index > the number of rows in the project, throw an error

        // Return valid row index
        return index;
    }
}
