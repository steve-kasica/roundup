package com.google.refine.roundup.util;

import com.google.refine.model.Cell;
import com.google.refine.model.Row;

import java.io.Serializable;
import java.lang.reflect.Method;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class RowGroupAggregators {

    /**
     * Convert a map of Rows to a map of Lists containing cell values at `cellIndex`     *
     * @param groups
     * @param cellIndex
     * @return
     */
    private static Stream<AbstractMap.SimpleEntry<Object, List<Object>>> getValuesByCellIndex(RowGroup groups, int cellIndex) {
        return groups.getGroups().entrySet().stream()
                .map(entry -> new AbstractMap.SimpleEntry<>(
                        entry.getKey(),
                        entry.getValue().stream()
                                .map(row -> row.getCellValue(cellIndex))
                                .collect(Collectors.toList())
                ));
    }

    /**
     * Convert a map to a list of Row instances
     * @param rowMap
     * @return
     */
    private static List<Row> toRowList(Map<Object, Number> rowMap) {
        return rowMap.entrySet().stream()
                .map(entry -> {
                    Row row = new Row(2);
                    row.setCell(0, new Cell((Serializable) entry.getKey(), null));
                    row.setCell(1, new Cell(entry.getValue(), null));
                    return row;
                }).collect(Collectors.toList());
    }

    public static Set<String> getAggregationMethods() {
        Method[] methods = RowGroupAggregators.class.getDeclaredMethods();

        return Arrays.stream(methods)
                .map(Method::toString)
                .filter(method -> method.matches("^public static java\\.util\\.List.*"))
                .map(method -> {
                    Pattern pattern = Pattern.compile("RowGroupAggregators\\.([a-z]+)");
                    Matcher matcher = pattern.matcher(method);
                    if (matcher.find()) {
                        return matcher.group(1);
                    } else {
                        return "";
                    }
                })
                .collect(Collectors.toSet());
    }

    /**
     *
     * @param groups
     * @param cellIndex
     * @return
     */
    public static List<Row> min(RowGroup groups, int cellIndex) {
        Map<Object, Number> rowMap = getValuesByCellIndex(groups, cellIndex)
                // Reduce map of Lists
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream()
                                // Cast objects to double
                                .mapToDouble(obj -> Double.parseDouble(obj.toString()))
                                // Calculate minimum value
                                .min()
                                .orElse(Double.NaN)));
        return toRowList(rowMap);
    }

    /**
     *
     * @param groups
     * @param cellIndex
     * @return
     */
    public static List<Row> sum(RowGroup groups, int cellIndex) {
        Map<Object, Number> rowMap = getValuesByCellIndex(groups, cellIndex)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream()
                                .mapToDouble(obj -> Double.parseDouble(obj.toString()))
                                .sum()));
        return toRowList(rowMap);
    }

    /**
     *
     * @param groups
     * @param cellIndex
     * @return
     */
    public static List<Row> count(RowGroup groups, int cellIndex) {
        Map<Object, Number> rowMap = getValuesByCellIndex(groups, cellIndex)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().size()));
        return toRowList(rowMap);
    }

    /**
     *
     * @param groups
     * @param cellIndex
     * @return
     */
    public static List<Row> max(RowGroup groups, int cellIndex) {
        Map<Object, Number> rowMap = getValuesByCellIndex(groups, cellIndex)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream()
                                .mapToDouble(obj -> Double.parseDouble(obj.toString()))
                                .max()
                                .orElse(Double.NaN)));

        return toRowList(rowMap);
    }

    public static List<Row> mean(RowGroup groups, int cellIndex) {
        Map<Object, Number> rowMap = getValuesByCellIndex(groups, cellIndex)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream()
                                .mapToDouble(obj -> Double.parseDouble(obj.toString()))
                                .average()
                                .orElse(Double.NaN)));
        return toRowList(rowMap);
    }
}
