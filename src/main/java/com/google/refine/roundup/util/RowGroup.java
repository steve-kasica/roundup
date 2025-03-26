package com.google.refine.roundup.util;

import com.google.refine.model.Row;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class RowGroup {

    private Map<Object, List<Row>> groups;

    public RowGroup(List<Row> rows, int cellIndex) {
        groups = rows.stream()
                     .collect(Collectors.groupingBy(row -> row.getCell(cellIndex).getValue()));
    }

    public Map<Object, List<Row>> getGroups() {
        return groups;
    }

}
