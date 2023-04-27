package com.google.refine.roundup.commands;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.refine.ProjectManager;
import com.google.refine.commands.Command;
import com.google.refine.commands.workspace.GetAllProjectTagsCommand;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

public class GetProjectSetNames extends Command {

    public static class AllProjectsTags {

        @JsonProperty("project-sets")
        protected Set<String> projectSets;

        protected AllProjectSetNames(Set<String> projectSets) {
            this.projectSets = projectSets;
        }
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        Map<String, Integer> tagMap = ProjectManager.singleton.getAllProjectTags();
        Set<String> tags = tagMap == null ? Collections.emptySet() : tagMap.keySet();
        respondJSON(response, new GetAllProjectTagsCommand.AllProjectsTags(tags));
    }

}
