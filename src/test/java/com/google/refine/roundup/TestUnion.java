//package com.google.refine.roundup;
//
//import com.google.refine.model.Project;
//import com.google.refine.model.Row;
//import org.junit.jupiter.api.Assertions;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//
//import java.util.List;
//
//public class TestUnion extends MergerTest {
//
//    private Project employeesA, employeesB;
//    private List<Row> result;
//
//    @BeforeEach
//    public void initTest() {
//        employeesA = loadMockData(employeesATableID);
//        employeesB = loadMockData(employeesBTableID);
//        result = Union.concatRows(employeesA, employeesB);
//    }
//
//    @Test
//    @DisplayName("Length equals sum of input lengths")
//    public void testIdenticalColumns() {
//        int expected = employeesA.rows.size() + employeesB.rows.size();
//        int actual = result.size();
//        Assertions.assertEquals(expected, actual);
//    }
//
//    @Test
//    @DisplayName("Column Model max index is correct")
//    public void testColumnMaxIndex() {
//        // TODO implement
////        int actual = result.columnModel.getMaxIndex();
////        int actual = ;
////        Assertions.assertEqual(expected, actual);
//    }
//
////    @Test
////    @DisplayName("Output column count equals input row count")
////    public void testColumnCount() {
////        int expected = employeesA.columnModel.columns.size();  // expected value is computed by hand
////        int actual = result.columnModel.columns.size();
////
////        Assertions.assertEquals(result.columnModel.getMaxCellIndex(), employeesA.columnModel.getMaxCellIndex());
////        Assertions.assertEquals(result.columnModel.columns.size(), employeesA.columnModel.columns.size());
////    }
//
//}
