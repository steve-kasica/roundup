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

/**
 * This class follows the basic design of the
 * <a href="https://github.com/OpenRefine/OpenRefine/blob/master/main/src/com/google/refine/model/changes/RowRemovalChange.java">RowRemovalChange</a>)
 * Since they're inverse operations.
 *
 */
public class RowAdditionChange implements Change {

    final protected List<Row> _rows;
    final protected List<Integer> _indices;

    private static String indicesField = "indices";
    private static String rowsField = "rows";

    private static String eof = "/ec/";

    public RowAdditionChange(List<Row> rows, List<Integer> indices) {
        _rows = rows;
        _indices = indices;
    }

    @Override
    public void apply(Project project) {
        Integer index;
        Row row;
        synchronized (project) {
            int count = _rows.size();

            // TODO: If value in indices is greater the number of rows in the project, throw an error
            for (int i = 0; i < count; i++) {
                index = _indices.get(i);
                row = _rows.get(i);

                // TODO: is ArrayList the best implementation for project.rows? Complexity is O(n/2)
                //  on average with this implementation, but could be O(n/4) with a
                //  linked-list implementation of project.rows
                project.rows.add(index, row);
            }
            project.update();

            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager().flushLookupsInvolvingProject(project.id);
        }

    }

    @Override
    public void revert(Project project) {
        synchronized (project) {

            // TODO: do we need the offset because _indices were pre-computed
            //  before
            int offset = 0;
            for (int i = 0; i < _rows.size(); i++) {
                int index = _indices.get(i);

                project.rows.remove(index + offset);
                offset--;
            }

            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager().flushLookupsInvolvingProject(project.id);

            project.update();
        }
    }

    @Override
    public void save(Writer writer, Properties options) throws IOException {

        // Save the list of indices to file
        writer.write(indicesField + "=");
        writer.write(_indices.size());
        writer.write('\n');
        for (Integer index : _indices) {
            writer.write(index.toString());
            writer.write('\n');
        }

        // Save the list of rows to file
        writer.write(rowsField + "=");
        writer.write(_rows.size());
        writer.write('\n');
        for (Row row : _rows) {
            row.save(writer, options);
            writer.write('\n');
        }
        writer.write(eof + "\n");
    }

    /**
     * A special static constructor for instantiating the RowAdditionChange class from
     * data writter to a file.
     * @param reader
     * @param pool
     * @return
     * @throws Exception
     */
    static public Change load(LineNumberReader reader, Pool pool) throws Exception {
        List<Integer> rowIndices = null;
        List<Row> rows = null;

        String line;
        while ((line = reader.readLine()) != null && !eof.equals(line)) {
            int equal = line.indexOf('=');
            CharSequence field = line.subSequence(0, equal);

            if (indicesField.contentEquals(field)) {
                int count = Integer.parseInt(line.substring(equal + 1));

                rowIndices = new ArrayList<>(count);
                for (int i = 0; i < count; i++) {
                    line = reader.readLine();
                    if (line != null) {
                        rowIndices.add(Integer.parseInt(line));
                    }
                }
            } else if (rowsField.contentEquals(field)) {
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
        assert rowIndices != null;

        return new RowAdditionChange(rows, rowIndices);
    }
}
