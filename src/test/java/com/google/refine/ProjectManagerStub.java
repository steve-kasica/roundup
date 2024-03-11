/*
Copied directly from: https://github.com/OpenRefine/OpenRefine/blob/master/main/tests/server/src/com/google/refine/ProjectManagerStub.java
 */

package com.google.refine;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;

import com.google.refine.history.HistoryEntryManager;
import com.google.refine.model.Project;

/**
 * Stub used to avoid saves and stub HistoryEntryManager
 *
 */
public class ProjectManagerStub extends ProjectManager {

    @Override
    public void deleteProject(long projectID) {
        // empty

    }

    @Override
    public void exportProject(long projectId, TarArchiveOutputStream tos) throws IOException {
        // empty
    }

    @Override
    public HistoryEntryManager getHistoryEntryManager() {
        return new HistoryEntryManagerStub();
    }

    @Override
    public void importProject(long projectID, InputStream inputStream, boolean gziped) throws IOException {
        // empty
    }

    @Override
    protected Project loadProject(long id) {
        // empty
        return null;
    }

    @Override
    public boolean loadProjectMetadata(long projectID) {
        // empty
        return false;
    }

    @Override
    public void saveMetadata(ProjectMetadata metadata, long projectId) throws Exception {
        // empty

    }

    @Override
    public void saveProject(Project project) {
        // empty
    }

    // Overridden to make public for testing
    @Override
    public void saveProjects(boolean allModified) {
        super.saveProjects(allModified);
    }

    @Override
    protected void saveWorkspace() {
        // empty
    }

    static public File getProjectDir(long projectID) {
        File workspace = new File("src/test/resources");
        String PROJECT_DIR_SUFFIX = ".project";
        File dir = new File(workspace, projectID + PROJECT_DIR_SUFFIX);
        if (!dir.exists()) {
            dir.mkdir();
        }
        return dir;
    }



}
