package com.google.refine.roundup.model.changes;

import com.google.refine.ProjectManager;
import com.google.refine.history.Change;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.util.Pool;

import java.io.IOException;
import java.io.LineNumberReader;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class RowsInsertChange implements Change {

    // Indices of new rows after being added to the project
    // TODO: Can we assume these indices will be sequential
    //  or should should this be an ArrayList of indices?
    // Does sorting/faceting change row index?
    protected int _offset;  // The number of rows in the project prior to adding new rows
    protected List<Row> _rows;
    final int _size;  // Size of _rows;

    public RowsInsertChange(List<Row> rows, int offset) {
        _rows = rows;
        _size = rows.size();
        _offset = offset;
    }

    @Override
    public void apply(Project project) {
        synchronized (project) {
            project.rows.addAll(_rows);  // Add new columns to project

            // TODO: what does these do? removeRowOperation includes them
            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager()
                                    .flushLookupsInvolvingProject(project.id);

            project.update(); // TODO: what is this?
        }
    }

    @Override
    public void revert(Project project) {
        synchronized (project) {
            // TODO: this needs to be tested for off-by-one errors
            // TODO: does _offset need to be set from a persistent data store?
            if (project.rows.size() > _offset) {
                project.rows.subList(_offset, project.rows.size()).clear();
            }

            // TODO: what does these do? removeRowOperation includes them
            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager()
                                    .flushLookupsInvolvingProject(project.id);

            project.update(); // TODO: what is this?
        }
    }

    // Use this method to save essential data to re-instantiate a previous instantiation
    // of this class. It writes data to `*.project/history/*.changes/change.txt` in
    // the OpenRefine workspace directory. This data will be read by the load method.
    @Override
    public void save(Writer writer, Properties options) throws IOException {
        writer.write("offset=");
        writer.write(Integer.toString(_offset));
        writer.write('\n');

        writer.write("rowCount=");
        writer.write(Integer.toString(_rows.size()));
        writer.write('\n');
        for (Row row : _rows) {
            row.save(writer, options); // TODO, what's the difference between this and Row::toString?
            writer.write('\n');
        }
        writer.write("/ec/\n");  // end of change marker
    }

    // Use this method to re-instantiate a previous instantiation of this class.
    // By loading data written by the save method to `*.project/history/*.changes/change.txt`
    // in the OpenRefine workspace directory. The load method is kind of like a constructor for
    // re-instantiating this class from persistent data.
    static public Change load(LineNumberReader reader, Pool pool) throws Exception {
        List<Row> rows = null;
        int offset = 0;

        String line;
        while ((line = reader.readLine()) != null && !"/ec/".equals(line)) {
            int equal = line.indexOf("=");
            CharSequence field = line.subSequence(0, equal);

            if ("offset".equals(field)) {
                offset = Integer.parseInt(line.substring(equal + 1));
            } else if ("rowCount".equals(field)) {
                int count = Integer.parseInt(line.substring(equal + 1));

                rows = new ArrayList<Row>(count);
                for (int i = 0; i < count; i++) {
                    line = reader.readLine();
                    if (line != null) {
                        rows.add(Row.load(line, pool));
                    }
                }
            }
        }

        assert rows != null;
        return new RowsInsertChange(rows, offset);
    }
}