package com.google.refine.roundup.util;

import com.google.refine.model.Column;

public class ColumnUtil {

    /**
     * Create a deep copy of the Column class. This utility function servers as a workaround
     * the a clone method that implements Cloneable in OpenRefine's Column model class.
     *
     * @param og
     * @return
     */
    public static Column copy(Column og) {
        Column column = new Column(og.getCellIndex(), og.getName());
        return column;
    }
}
