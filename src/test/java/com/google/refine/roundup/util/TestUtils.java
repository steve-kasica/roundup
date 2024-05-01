package com.google.refine.roundup.util;

import org.testng.Assert;

import com.google.refine.model.Row;

public class TestUtils {

    // Workaround for lack of equality testing in Row class
    public static void assertEquals(Row actual, Row expected) {
        Assert.assertEquals(actual.toString(), expected.toString());
    }
}
