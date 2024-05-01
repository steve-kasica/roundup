package com.google.refine.roundup.commands.row;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;
import static org.testng.AssertJUnit.assertEquals;

import java.io.IOException;
import java.io.Serializable;

import javax.servlet.ServletException;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.LoggerFactory;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.google.refine.commands.Command;
import com.google.refine.operations.OperationRegistry;
import com.google.refine.roundup.commands.CommandTestBase;
import com.google.refine.model.Project;
import com.google.refine.roundup.operations.row.RowAggregateOperation;
import com.google.refine.util.ParsingUtilities;

public class AggregateRowsCommandTests extends CommandTestBase {

    private Project project;
    private int maxIndex;

    @BeforeSuite
    public void registerOperation() {
        OperationRegistry.registerOperation(getCoreModule(),
                "row-aggregate",
                RowAggregateOperation.class);
    }

    @Override
    @BeforeTest
    public void init() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @BeforeMethod
    public void setUp() {
        command = new AggregateRowsCommand();
        project = createProject(
                new String[] { "Letter", "Number" },
                new Serializable[][] {
                        { "a", 1 },
                        { "a", 2 },
                        { "b", 0 },
                        { "b", 9 },
                        { "c", 3 },
                        { "c", 4 },
                        { "c", 7 },
                });
        maxIndex = project.columnModel.getMaxCellIndex();
        when(request.getParameter("project")).thenReturn(Long.toString(project.id));
    }

    @Test
    // If CSRF token is missing, respond with CSRF error
    public void testCSRFProtection() throws ServletException, IOException {
        when(request.getParameter("csrf_token")).thenReturn(null);
        command.doPost(request, response);
        assertCSRFCheckFailed();
    }

    @Test
    // If successful request, responses contains
    public void testSuccessResponseSchema() throws ServletException, IOException {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn("0");
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("SUM");

        command.doPost(request, response);

        JsonNode node = ParsingUtilities.mapper.readValue(writer.toString(), JsonNode.class);
        assertNotNull(node.get("code"));
        assertEquals(node.get("code").toString(), "\"ok\"");
        assertNotNull(node.get("historyEntry"));
        assertNotNull(node.get("historyEntry").get("id"));
        assertNotNull(node.get("historyEntry").get("description"));
        assertNotNull(node.get("historyEntry").get("time"));
    }


    @Test(expectedExceptions = NumberFormatException.class)
    // If an index parameter is missing/null, `getIndexParameter` throws NumberFormatException
    public void testMissingGroupIndexParameter() throws ServletException, IOException {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn(null);
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("SUM");

        assert !request.getParameterMap().containsKey(AggregateRowsCommand.GROUP_INDEX_PARAMETER);
        ((AggregateRowsCommand) command).getIndexParameter(
                request,
                AggregateRowsCommand.GROUP_INDEX_PARAMETER,
                maxIndex);
    }

    @Test(expectedExceptions = NumberFormatException.class)
    // If an index parameter is empty string, `getIndexParameter` throws NumberFormatException
    public void testEmptyIndexParameter() {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn("");
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("SUM");

        ((AggregateRowsCommand) command).getIndexParameter(
                request,
                AggregateRowsCommand.GROUP_INDEX_PARAMETER,
                maxIndex);
    }

    @Test(expectedExceptions = NumberFormatException.class)
    // If an index parameter is a letter, `getIndexParameter` throws NumberFormatException
    public void testNonIntegerIndexParameter() {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn("a");
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("SUM");

        ((AggregateRowsCommand) command).getIndexParameter(
                request,
                AggregateRowsCommand.GROUP_INDEX_PARAMETER,
                maxIndex);
    }

    @Test(expectedExceptions = IllegalArgumentException.class)
    // If an index parameter is a fraction, `getIndexParameter` throws NumberFormatException
    public void testFractionIndexParameter() {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn("1.5");
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("SUM");

        ((AggregateRowsCommand) command).getIndexParameter(
                request,
                AggregateRowsCommand.GROUP_INDEX_PARAMETER,
                maxIndex);
    }

    @Test(expectedExceptions = IndexOutOfBoundsException.class)
    // If an index parameter is negative, `getIndexParameter` throws IndexOutOfBoundsException
    public void testNegativeIndexParameter() throws ServletException, IOException {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn("-1");
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("SUM");

        ((AggregateRowsCommand) command).getIndexParameter(
                request,
                AggregateRowsCommand.GROUP_INDEX_PARAMETER,
                maxIndex);
    }

    @Test(expectedExceptions = IndexOutOfBoundsException.class)
    // If an index parameter larger than project's maximum index, `getIndexParameter` throws IllegalArgumentException
    public void testTooLargeIndexParameter() {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER))
                .thenReturn(String.valueOf(maxIndex + 1));
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("SUM");

        ((AggregateRowsCommand) command).getIndexParameter(
                request,
                AggregateRowsCommand.GROUP_INDEX_PARAMETER,
                maxIndex);
    }

    @Test(expectedExceptions = NullPointerException.class)
    // If accumulator parameter is missing/null, `getAccumulatorParameter` throws NullPointerException
    public void testMissingRowsParameter() throws Exception {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn(null);

        assert !request.getParameterMap().containsKey(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER);

        ((AggregateRowsCommand) command).getAccumulatorParameter(request);
    }

    @Test(expectedExceptions = IllegalArgumentException.class)
    // If accumulator parameter is missing/null, `getAccumulatorParameter` throws IllegalArgumentException
    public void testNotPresentAccumulatorParameter() throws Exception {
        when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
        when(request.getParameter(AggregateRowsCommand.GROUP_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.VALUE_INDEX_PARAMETER)).thenReturn("1");
        when(request.getParameter(AggregateRowsCommand.ACCUMULATOR_NAME_PARAMETER)).thenReturn("FOO");

        ((AggregateRowsCommand) command).getAccumulatorParameter(request);
    }

}
