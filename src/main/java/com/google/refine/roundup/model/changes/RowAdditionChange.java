package com.google.refine.roundup.model.changes;

import java.io.IOException;
import java.io.LineNumberReader;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import com.google.refine.ProjectManager;
import com.google.refine.history.Change;
import com.google.refine.model.Project;
import com.google.refine.model.Row;
import com.google.refine.util.Pool;

/**
 * This class follows the basic design of the
 * <a href="https://github.com/OpenRefine/OpenRefine/blob/master/main/src/com/google/refine/model/changes/RowRemovalChange.java">RowRemovalChange</a>)
 * Since they're inverse operations.
 *
 */
public class RowAdditionChange implements Change {

    private final List<Row> _additionalRows;
    private final Integer _insertionIndex;
    private static String _indexField = "index";  // Field name for `_insertionIndex` in `change.txt`
    private static String _countField = "count";  // Field name for sizes of `_additionalRows` in `change.txt`
    private static String eoc = "/ec/";           // end of change marker, not end of file, in `change.txt`

    public RowAdditionChange(List<Row> rows, Integer insertionIndex) {
        _additionalRows = rows;
        _insertionIndex = insertionIndex;
    }

    @Override
    public void apply(Project project) {
        synchronized (project) {
            // TODO: If value in indices is greater the number of _rows in the project, throw an error
            // TODO: is ArrayList the best implementation for project._rows? Complexity is O(n/2)
            for (int i = 0; i < _additionalRows.size(); i++) {
                project.rows.add(_insertionIndex + i, _additionalRows.get(i));
            }
            project.update();
            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager().flushLookupsInvolvingProject(project.id);
        }
    }

    @Override
    public void revert(Project project) {
        synchronized (project) {
            int startIndex = _insertionIndex;
            int endIndex = _insertionIndex + _additionalRows.size();
            project.rows.subList(startIndex, endIndex).clear();
            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager().flushLookupsInvolvingProject(project.id);
            project.update();
        }
    }

    @Override
    public void save(Writer writer, Properties options) throws IOException {
        writer.write(_indexField + "=");
        writer.write(Integer.toString(_insertionIndex));
        writer.write('\n');
        writer.write(_countField + "=");
        writer.write(Integer.toString(_additionalRows.size()));
        writer.write('\n');
        for (Row row: _additionalRows) {
            row.save(writer, options);
            writer.write('\n');
        }
        writer.write(eoc + "\n");
    }

    /**
     * A special static constructor for instantiating the RowAdditionChange class from
     * data writer to a file.
     * @param reader
     * @param pool
     * @return
     * @throws Exception
     */
    static public Change load(LineNumberReader reader, Pool pool) throws Exception {
        Integer index = null;
        List<Row> rows = new ArrayList<>();

        String line;
        int count;
        while ((line = reader.readLine()) != null && !eoc.equals(line)) {
            int equal = line.indexOf('=');
            CharSequence field = line.subSequence(0, equal);

            if (_indexField.equals(field)) {
                index = Integer.parseInt(line.substring(equal + 1));
            } else if (_countField.equals(field)) {
                count = Integer.parseInt(line.substring(equal + 1));
                for (int i = 0; i < count; i++) {
                    if ((line = reader.readLine()) != null) {
                        rows.add(Row.load(line, pool));
                    }
                }
            }
        }
        
        return new RowAdditionChange(rows, index);
    }
}
