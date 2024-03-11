package com.google.refine.roundup.commands.row;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.google.refine.browsing.Engine;
import com.google.refine.browsing.Engine.Mode;
import com.google.refine.commands.Command;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.util.RowGroup;
import com.google.refine.util.ParsingUtilities;

public class GetRowsPartitionedCommand extends Command {

    protected static class JsonResult {
        @JsonProperty("mode")
        protected final Mode mode;
        @JsonProperty("rows")
        protected final Map<Object, List<Row>> rows;

        protected JsonResult(Mode mode, Map<Object, List<Row>> rows) {
            this.mode = mode;
            this.rows = rows;
        }
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Project project = getProject(request);
        Engine engine = null;
        try {
            engine = getEngine(request, project);
            String columnName = getColumnParam(request, "column");
            Column column = project.columnModel.getColumnByName(columnName);
            int start = 0;
            int end = 10;

            response.setCharacterEncoding("UTF-8");
            response.setHeader("Content-Type", "application/json");

            PrintWriter writer = response.getWriter();

            RowGroup groups = new RowGroup(project.rows, column.getCellIndex());
            JsonResult result = new JsonResult(engine.getMode(), groups.getGroups());

            ParsingUtilities.defaultWriter.writeValue(writer, result);

        } catch (Exception e) {
            respondException(response, e);
        }
    }

    // TODO: abstract into a RoundupCommand class method getColumnFromRequestParam
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
