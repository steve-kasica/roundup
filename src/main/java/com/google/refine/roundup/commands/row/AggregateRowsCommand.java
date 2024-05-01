package com.google.refine.roundup.commands.row;


import com.google.refine.commands.Command;
import com.google.refine.model.AbstractOperation;
import com.google.refine.model.Project;
import com.google.refine.process.Process;
import com.google.refine.roundup.operations.row.RowAggregateOperation;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Properties;

public class AggregateRowsCommand extends Command {

    public static String GROUP_INDEX_PARAMETER = "groupIndex";
    public static String VALUE_INDEX_PARAMETER = "valueIndex";
    public static String ACCUMULATOR_NAME_PARAMETER = "accumulatorName";

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!hasValidCSRFToken(request)) {
            respondCSRFError(response);
            return;
        }

        try {
            Project project = getProject(request);
            int maxIndex = project.columnModel.getMaxCellIndex();

            RowAggregateOperation.AccumulatorName accumulatorName = getAccumulatorParameter(request);
            int groupIndex = getIndexParameter(request, GROUP_INDEX_PARAMETER, maxIndex);
            int valueIndex = getIndexParameter(request, VALUE_INDEX_PARAMETER, maxIndex);


            AbstractOperation op = new RowAggregateOperation(groupIndex, valueIndex, accumulatorName);
            Process process = op.createProcess(project, new Properties());
            performProcessAndRespond(request, response, project, process);

        } catch(Exception e) {
            respondException(response, e);
        }
    }

    public RowAggregateOperation.AccumulatorName getAccumulatorParameter(HttpServletRequest request) {
        return RowAggregateOperation.AccumulatorName
                .valueOf(request.getParameter(ACCUMULATOR_NAME_PARAMETER));
    }

    public int getIndexParameter(HttpServletRequest request, String name, int maxIndex) {
        String paramStr = request.getParameter(name);
        int paramValue = Integer.parseInt(paramStr);
        if (paramValue < 0 || paramValue > maxIndex) {
            throw new IndexOutOfBoundsException("Cell index " + paramValue + " is out of bounds");
        }
        return paramValue;
    }
}
