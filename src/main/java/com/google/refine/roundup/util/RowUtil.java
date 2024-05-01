package com.google.refine.roundup.util;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

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

    public static Row concatRows(Row r1, Row r2) {
        int count = r1.cells.size() + r2.cells.size();
        Row row = new Row(count);

        // TODO: would really love an addCell method to Row that auto-increments the cell
        AtomicInteger index = new AtomicInteger(0);
        Stream.concat(r1.cells.stream(), r2.cells.stream())
                // TODO: do I need to copy cells?
//                .map(CopyUtilities::copy)
                .forEach(cellCopy -> row.setCell(index.getAndIncrement(), cellCopy));

        return row;
    }
}
