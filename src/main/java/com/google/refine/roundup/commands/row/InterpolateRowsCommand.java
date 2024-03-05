package com.google.refine.roundup.commands.row;

import java.time.temporal.ChronoUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

import com.google.common.collect.ImmutableMap;

import com.google.refine.browsing.EngineConfig;
import com.google.refine.commands.EngineDependentCommand;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Column;
import com.google.refine.model.Project;
import com.google.refine.roundup.operations.row.RowInterpolateOperation;

public class InterpolateRowsCommand extends EngineDependentCommand {

    // Must match switch statement in RowInterpolateOperation.interpolate
    private final ImmutableMap<String, ChronoUnit> validChronoStepUnits = ImmutableMap.of(
            "years", ChronoUnit.YEARS,
            "month", ChronoUnit.MONTHS,
            "weeks", ChronoUnit.WEEKS,
            "days",  ChronoUnit.DAYS
    );

    @Override
    protected AbstractOperation createOperation(Project project, HttpServletRequest request, EngineConfig engineConfig) throws Exception {
        String groupParam = getParam("group", request);
        // TODO: catch if not valid column
        // TODO: make group optional
        Column groupColumn = project.columnModel.getColumnByName(groupParam);

        String valueParam = getParam("value", request);
        // TODO: catch if not valid column
        Column valueColumn = project.columnModel.getColumnByName(valueParam);

        String stepParam = getParam("step", request);
        if (validChronoStepUnits.keySet().contains(stepParam)) {
            // TODO: throw error if value column type is not datetime
            ChronoUnit step = validChronoStepUnits.get(stepParam);
            return new RowInterpolateOperation(
                    engineConfig,
                    groupColumn.getCellIndex(),
                    valueColumn.getCellIndex(),
                    step);
        }

        // TODO: handle exceptions and other step increments
        return null;

    }

    private String getParam(String name, HttpServletRequest request) throws ServletException {
        String out;
        out = request.getParameter(name);
        if (out == null) throw new ServletException(name + " is a required parameter");
        return out;
    }


}
