package com.google.refine.roundup.util;

import com.google.refine.model.Cell;
import org.apache.commons.lang.SerializationUtils;

import java.io.Serializable;

public class CellUtil {

    /**
     * Create a deep copy of the Cell class. This utility function servers as a workaround
     * the a clone method that implements Cloneable in OpenRefine's Column model class.
     * TODO: Implement copy for recon
     * @param og
     * @return
     */
    public static Cell copy(Cell og) {
        Serializable value = (Serializable) SerializationUtils.clone(og.value);
        return new Cell(value, null);
    }
}