package com.google.refine.roundup.commands.project;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.refine.ProjectManager;
import com.google.refine.ProjectMetadata;
import com.google.refine.commands.Command;
import com.google.refine.history.HistoryEntryManager;
import com.google.refine.model.Project;
import com.google.refine.roundup.util.CopyUtilities;

public class CopyProjectCommand extends Command {
    // TODO: Should the user be able to copy only rows that match the selection, as an engine dependent operation?

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        if (!hasValidCSRFToken(request)) {
            respondCSRFError(response);
            return;
        }

        try {
            Project originalProject = getProject(request);
            Project copyProject = CopyUtilities.copyProject(originalProject);
            ProjectMetadata copyProjectMetadata = CopyUtilities.copyProjectMetadata(originalProject);
            copyProjectMetadata.setName(copyProjectMetadata.getName() + " (Copy)");

            ProjectManager.singleton.registerProject(copyProject, copyProjectMetadata);

            // Save project data and metadata
            ProjectManager.singleton.ensureProjectSaved(copyProject.id);

            // Save history entries in copy Project
            HistoryEntryManager manager = ProjectManager.singleton.getHistoryEntryManager();
            copyProject.history.getLastPastEntries(-1).forEach(historyEntry -> {
                try {
                    manager.saveChange(historyEntry);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });

            respond(response, String.format("{\"code\":\"ok\", \"projectId\": %d}", copyProject.id));
        } catch (Exception e) {
            respondException(response, e);
        }
    }
}
