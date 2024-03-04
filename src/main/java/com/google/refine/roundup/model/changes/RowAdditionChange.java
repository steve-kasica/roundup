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

    private final List<RowBlock> _rowBlocks;

    private static String indicesField = "indices";
    private static final String rowBlockField = "rowBlock";
    private static String rowsField = "_rows";
    private static String eoc = "/ec/";  // end of change marker, not end of file

    public RowAdditionChange(List<List<Row>> rowBlocks, List<Integer> indices) {
        _rowBlocks = new ArrayList<>();
        for (int i = 0; i < rowBlocks.size(); i++) {
            _rowBlocks.add(new RowBlock(rowBlocks.get(i), indices.get(i)));
        }
    }

    @Override
    public void apply(Project project) {
        synchronized (project) {
            // TODO: If value in indices is greater the number of _rows in the project, throw an error
            _rowBlocks.stream()
                    .forEach(rowBlock -> rowBlock.insertToProject(project));

//            for (int i = 0; i < _count; i++) {
//                System.out.println(i);
//
//                // TODO: is ArrayList the best implementation for project._rows? Complexity is O(n/2)
//                //  on average with this implementation, but could be O(n/4) with a
//                //  linked-list implementation of project._rows
//
//                // TODO: I think it needs to be like this to line up, test first
////                project._rows.add(_insertionIndices[i] + i, _rows.get(i));
//                project._rows.add(_insertionIndices[i], _rows.get(i));
//            }
            project.update();

            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager().flushLookupsInvolvingProject(project.id);
        }
    }

    @Override
    public void revert(Project project) {
        synchronized (project) {

            // TODO: do we need the offset because _insertionIndices were pre-computed
            //  before
            // TODO: I have a feeling this isn't going to work since there is no row equality thingy
            _rowBlocks.stream().forEach(rowBlock -> rowBlock.removeFromProject(project));

            project.columnModel.clearPrecomputes();
            ProjectManager.singleton.getLookupCacheManager().flushLookupsInvolvingProject(project.id);

            project.update();
        }
    }
    @Override
    public void save(Writer writer, Properties options) throws IOException {
        _rowBlocks.stream().forEach(rowBlock -> {
            try {
                rowBlock.save(rowBlockField, writer, options);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
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
        List<Integer> blockIndices = new ArrayList<>();
        List<List<Row>> blocks = new ArrayList<>();

        String line;
        while ((line = reader.readLine()) != null && !eoc.equals(line)) {
            int equal = line.indexOf('=');
            CharSequence field = line.subSequence(0, equal);
            CharSequence value = line.substring(equal + 1);

            if (rowBlockField.contentEquals(field)) {
                int commaIndex = line.indexOf(',');

                int insertionIndex = Integer.parseInt(line.substring(equal + 1, commaIndex));
                blockIndices.add(insertionIndex);

                int rowCount = Integer.parseInt(line.substring(commaIndex + 1));
                List<Row> block = new ArrayList<>(rowCount);
                for (int i = 0; i < rowCount; i++) {
                    if ((line = reader.readLine()) != null) {
                        block.add(Row.load(line, pool));
                    }
                }
                blocks.add(block);
            }
        }

        return new RowAdditionChange(blocks, blockIndices);
    }

    class RowBlock {
        private final int _index;
        private final List<Row> _rows;
        private final Integer _count;
        private String _blockMetaFormat = "%s=%d,%d";

        public RowBlock(List<Row> rows, int insertionIndex) {
            this._index = insertionIndex;
            this._rows = rows;
            this._count = rows.size();
        }

        public boolean insertToProject(Project project) {
            return project.rows.addAll(_index, _rows);
        }

        public boolean removeFromProject(Project project) {
            return project.rows.removeAll(_rows);
        }

        /**
         * Write to file following this format:
         *  `marker`=`index_1`,`size_1`
         *  row
         *  row
         *  ...
         *  row
         *  `marker`=`index_2`,`size_2`
         *  ...
         *
         * @param writer
         * @param options
         * @throws IOException
         */
        public void save(String blockMarker, Writer writer, Properties options) throws IOException {
            writer.write(String.format(_blockMetaFormat, blockMarker, _index, _count));
            writer.write('\n');
            for (Row row : _rows) {
                row.save(writer, options);
                writer.write('\n');
            }
        }
    }
}
