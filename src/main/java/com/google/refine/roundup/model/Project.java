package com.google.refine.roundup.model;

import java.util.List;

public class Project extends com.google.refine.model.Project {

    public Project() {
        super();
    }

    // for testing only
    protected Project(long id) {
        super(id);
    }

    // Adds new rows to existing project
    public void addRows(List<Row> moreRows) {
        for (Row r : moreRows) {
            rows.add(r);
        }
    }

}
