package com.google.refine.roundup.operations.row;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TestRowInterpolateOperation {

    @Test
    @DisplayName("Interpolated days is correct size")
    public void testInterpolateDaysSize() {
        OffsetDateTime start = OffsetDateTime.of(2024, 1, 01,0,0,0,0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2024, 1, 31,0,0,0,0,ZoneOffset.UTC);
        long expected = 29;

        List<OffsetDateTime> dts = RowInterpolateOperation.interpolate(start, end, ChronoUnit.DAYS);
        long actual = dts.size();

        Assertions.assertEquals(expected, actual);
    }

    @Test
    @DisplayName("Interpolated days are exclusive")
    public void testInterpolateDaysExclusive() {
        OffsetDateTime start = OffsetDateTime.of(2024, 1, 01,0,0,0,0,ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2024, 1, 10,0,0,0,0,ZoneOffset.UTC);

        List<OffsetDateTime> dts = RowInterpolateOperation.interpolate(start, end, ChronoUnit.DAYS);
        testExclusivity(start, end, dts);
    }

    @Test
    @DisplayName("Interpolated months is correct size")
    public void testInterpolateMonthsSize() {
        OffsetDateTime start = OffsetDateTime.of(2024, 1, 1,0,0,0,0,ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2024, 12, 1,0,0,0,0,ZoneOffset.UTC);
        long expected = 10;

        List<OffsetDateTime> dts = RowInterpolateOperation.interpolate(start, end, ChronoUnit.MONTHS);
        long actual = dts.size();

        Assertions.assertEquals(expected, actual);
    }

    @Test
    @DisplayName("Interpolated months are exclusive")
    public void testInterpolateMonthsExclusive() {
        OffsetDateTime start = OffsetDateTime.of(2024, 1, 1,0,0,0,0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2024, 11, 1,0,0,0,0, ZoneOffset.UTC);
        List<OffsetDateTime> dts = RowInterpolateOperation.interpolate(start, end, ChronoUnit.MONTHS);
        testExclusivity(start, end, dts);
    }

    @Test
    @DisplayName("Date list is unique")
    public void testDuplicateDates() {
        OffsetDateTime start = OffsetDateTime.of(2024, 1, 1,0,0,0,0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2024, 11, 1,0,0,0,0, ZoneOffset.UTC);
        List<OffsetDateTime> dts = RowInterpolateOperation.interpolate(start, end, ChronoUnit.MONTHS);

        List<OffsetDateTime> sub;
        for (int i = 0; i < dts.size(); i++) {
            sub = dts.subList(i + 1, dts.size());
            Assertions.assertFalse(sub.contains(dts.get(i)));
        }
    }

    @Test
    @DisplayName("Interpolated years are exclusive")
    public void testInterpolateYearsExclusive() {
        OffsetDateTime start = OffsetDateTime.of(2020, 1, 1,0,0,0,0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2024, 1, 1,0,0,0,0, ZoneOffset.UTC);
        List<OffsetDateTime> dts = RowInterpolateOperation.interpolate(start, end, ChronoUnit.YEARS);
        testExclusivity(start, end, dts);
    }

    private <T> void testExclusivity(Object start, Object end, List<T> list) {
        Assertions.assertNotEquals(start, list.get(0));
        Assertions.assertNotEquals(end, list.get(list.size() - 1));
    }
}
