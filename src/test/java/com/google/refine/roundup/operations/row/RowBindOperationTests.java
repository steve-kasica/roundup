package com.google.refine.roundup.operations.row;

import static org.testng.Assert.assertEquals;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import com.google.refine.RefineTest;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.roundup.util.TestUtils;

public class RowBindOperationTests extends RefineTest {

    Project project2008, project2009, project2010, project2011, project2012;
    List<Project> projects;

    @BeforeMethod
    public void SetUp() {
        projects = new ArrayList<>();

        // Data taken via: https://github.com/datadesk/california-h2a-visas-analysis/master/input/2008.xlsx
        project2008 = createProject(new String[] { "CASE_NO", "APPLICATION_TYPE", "EMPLOYER_NAME", "DECISION_DATE", "BASIC_RATE_OF_PAY" },
                new Serializable[][] {
                        {"C-08233-14572", "H-2A", "2008-09-19", "L.G. HERNDON JR. FARMS, INC.", 8.53},
                        {"C-08241-14646", "H-2A", "2008-09-19", "KELLER FARMS, INC.", 9.9},
                        {"C-08196-14249", "H-2A", "2008-09-19", "DARRELL ENTZMINGER & SONS", 9.9}
                });
        projects.add(project2008);

        // https://github.com/datadesk/california-h2a-visas-analysis/blob/master/input/2009.xlsx
        // APPLICATION_TYPE is missing in original data
        project2009 = createProject(new String[] { "CASE_NO", "APPLICATION_TYPE", "DECISION_DATE", "EMPLOYER_NAME", "BASIC_RATE_OF_PAY" },
                new Serializable[][] {
                        {"C-08246-14659", null, "2008-10-23", "KELLER FARMS, INC.", 10.44 },
                        {"C-08290-15127", null, "2008-10-24", "ELKHORN PACKING CO, LLC", 9.72 },
                        {"C-08283-14998", null, "2008-10-24", "FOOTHILL PACKING, INC.", 8.7 },
                });
        projects.add(project2009);

        // https://github.com/datadesk/california-h2a-visas-analysis/blob/master/input/2010.xlsx
        // APPLICATION_TYPE is missing in original data
        project2010 = createProject(new String[] { "CASE_NO", "DECISION_DATE", "APPLICATION_TYPE", "EMPLOYER_NAME", "BASIC_RATE_OF_PAY" },
                new Serializable[][] {
                        { "C-09163-19902", null, "2009-10-01", "KELLER FARMS, INC.", 8.02},
                        { "C-09258-20486", null, "2009-10-01", "MATTHEW PHILIP STOCKMAN DBA STOCKMAN FARM", 9.3 },
                        { "C-09254-20471", null, "2009-10-01", "DOUG ATCHLEY", 9.27 }
                });
        projects.add(project2010);

        // https://github.com/datadesk/california-h2a-visas-analysis/blob/master/input/2011.xlsx
        project2011 = createProject(new String[] { "CASE_NO", "DECISION_DATE", "APPLICATION_TYPE", "EMPLOYER_NAME", "BASIC_RATE_OF_PAY" },
                new Serializable[][] {
                        { "C-10364-26164", "19-Jan-11", "H-2A", "KELLER EV, LP", 10.66},
                        { "C-10364-26165", "28-Jan-11",	"H-2A",	"BUEBER FARM'S INC", 9.78},
                        { "C-10364-26166", "21-Jan-11",	"H-2A",	"MORRILL HAY COMPANY, INC.", 10.66},
                });
        projects.add(project2011);

        // https://github.com/datadesk/california-h2a-visas-analysis/blob/master/input/2012.xlsx
        project2012 = createProject(new String[] { "CASE_NO", "DECISION_DATE", "APPLICATION_TYPE", "EMPLOYER_NAME", "BASIC_RATE_OF_PAY" },
                new Serializable[][] {
                        {"C-11346-30802", "2012-01-11",	"H-2A",	"FORREST CITY FARMS", 8.97},
                        {"C-11346-30803", "2012-01-17",	"H-2A",	"A. KELLER FARM", 9.48},
                        {"C-11346-30804", "2012-01-12",	"H-2A",	"MAPLE LANE NURSERY", 10.25}
                });
        projects.add(project2012);

    }

    @AfterMethod
    public void TearDown() {
        project2008 = null;
        project2009 = null;
        project2010 = null;
        project2011 = null;
        project2012 = null;
        projects.clear();
    }

    @Test
    public void testResultLength() {
        List<Row> result = RowBindOperation.run(projects);
        long actualSize = result.size();
        long expectedSize = projects.stream()
                .map(project -> project.rows.size())
                .reduce(0, Integer::sum);
        assertEquals(actualSize, expectedSize);
    }

    @Test
    public void testResultIdentity() {
        List<Row> result = RowBindOperation.run(projects);
        int i = 0;
        for (Project project : projects) {
            for (Row expectedRow : project.rows) {
                Row actualRow = result.get(i++);
                TestUtils.assertEquals(actualRow, expectedRow);
            }
        }
    }

    @Test
    public void testResultEquality() {
        List<Row> result = RowBindOperation.run(projects);
        int i = 0;
        for (Project project : projects) {
            for (Row expectedRow : project.rows) {
                Row actualRow = result.get(i++);
                TestUtils.assertEquals(actualRow, expectedRow);
            }
        }
    }

    @Test
    // Removing a row from a project does not remove it from the output
    public void testBindRemoveInputRow() {
        List<Row> output = RowBindOperation.run(projects);
        int expected = output.size();
        projects.get(0).rows.remove(0);
        assertEquals(output.size(), expected);
    }

}
