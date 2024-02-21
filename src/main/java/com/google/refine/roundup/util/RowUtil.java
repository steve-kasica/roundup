package com.google.refine.roundup.util;

import com.google.refine.model.Cell;
import com.google.refine.model.Row;

public class RowUtil {

    /**
     * Create a deep copy of the Row class. This utility function servers as a workaround
     * the a clone method that implements Cloneable in OpenRefine's Column model class.
     *
     * @param og
     * @return
     */
    public static Row copy(Row og) {
        int total = og.cells.size();
        Row row = new Row(total);
        for (int i = 0; i < total; i++) {
            Cell cell = CellUtil.copy(og.getCell(i));
            row.setCell(i, cell);
        }
        return row;
    }
}
