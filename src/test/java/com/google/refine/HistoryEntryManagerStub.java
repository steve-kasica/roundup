/*

Copied from: https://github.com/OpenRefine/OpenRefine/blob/master/main/tests/server/src/com/google/refine/HistoryEntryManagerStub.java

*/

package com.google.refine;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Writer;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import com.google.refine.history.History;
import com.google.refine.history.HistoryEntry;
import com.google.refine.history.HistoryEntryManager;
import com.google.refine.io.FileProjectManager;
import com.google.refine.util.ParsingUtilities;
import com.google.refine.util.Pool;

public class HistoryEntryManagerStub implements HistoryEntryManager {

    @Override
    public void delete(HistoryEntry historyEntry) {
    }

    // https://github.com/OpenRefine/OpenRefine/blob/ebbcba11e35e99552ee49bbf12fca4e6ff0fd73a/main/src/com/google/refine/io/FileHistoryEntryManager.java#L64
    @Override
    public void save(HistoryEntry historyEntry, Writer writer, Properties options) {
        try {
            if ("save".equals(options.getProperty("mode"))) {
                ParsingUtilities.saveWriter.writeValue(writer, historyEntry);
            } else {
                ParsingUtilities.defaultWriter.writeValue(writer, historyEntry);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void loadChange(HistoryEntry historyEntry) {
        // https://github.com/OpenRefine/OpenRefine/tree/master/main/src/com/google/refine/io/FileHistoryEntryManager.java#L87
        File changeFile = getChangeFile(historyEntry);

        try {
            loadChange(historyEntry, changeFile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load change file " + changeFile.getAbsolutePath(), e);
        }
    }

    // https://github.com/OpenRefine/OpenRefine/tree/master/main/src/com/google/refine/io/FileHistoryEntryManager.java#L87
    protected void loadChange(HistoryEntry historyEntry, File file) throws Exception {
        ZipFile zipFile = new ZipFile(file);
        try {
            Pool pool = new Pool();
            ZipEntry poolEntry = zipFile.getEntry("pool.txt");
            if (poolEntry != null) {
                pool.load(new InputStreamReader(
                        zipFile.getInputStream(poolEntry)));
            } // else, it's a legacy project file

            historyEntry.setChange(History.readOneChange(
                    zipFile.getInputStream(zipFile.getEntry("change.txt")), pool));
        } finally {
            zipFile.close();
        }
    }

    @Override
    public void saveChange(HistoryEntry historyEntry) throws Exception {
    }

    protected void saveChange(HistoryEntry historyEntry, File file) throws Exception {
    }

    protected File getChangeFile(HistoryEntry historyEntry) {
        String testResourcesPath = "src/tests/resources";
        String path = String.format("%s/%d.project/history/%d.change.zip",
                testResourcesPath,
                historyEntry.projectID,
                historyEntry.id);
        return new File(path);
    }

    protected File getHistoryDir(HistoryEntry historyEntry) {
        File dir = new File(((FileProjectManager) ProjectManager.singleton)
                .getProjectDir(historyEntry.projectID),
                "history");
        dir.mkdirs();

        return dir;
    }
}
