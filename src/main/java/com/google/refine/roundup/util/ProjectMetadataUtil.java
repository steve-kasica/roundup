package com.google.refine.roundup.util;

import com.google.refine.ProjectMetadata;

public class ProjectMetadataUtil {

    /**
     * Create a deep copy of the column class. This utility function servers as a workaround
     * the a clone method that implements Cloneable in OpenRefine's Column model class.
     *
     * - title (TODO: no accessor method)
     * - version (TODO: no accessor method)
     * - license (TODO: no accessor method)
     * - homepage (TODO: no accessor method)
     * - image (TODO: no accessor method)
     * - customMetadata (TODO: no accessor method)
     * - user metadata (TODO)
     * @param og
     * @return
     */
    public static ProjectMetadata copy(ProjectMetadata og) {

        ProjectMetadata cp = new ProjectMetadata();

        // _name is a String
        cp.setName(String.format("%s Copy", og.getName()));

        // _tags is a String array
        cp.setTags(og.getTags());

        // _creator is a String
        cp.setCreator(og.getCreator());

        // _contributors is a String
        cp.setContributors(og.getContributors());

        // _subject is a String
        cp.setSubject(og.getSubject());

        // _description is a String
        cp.setDescription(og.getDescription());

        // _importOptionMetadata is an ArrayNode
        cp.setImportOptionMetadata(og.getImportOptionMetadata());

        // _password is a string
        cp.setPassword(og.getPassword());

        // _rowCount is an int
        cp.setRowCount(og.getRowCount());  // Updates last modified time of copy

        // _encoding is a String
        String encoding = String.valueOf(og.getEncoding());
        cp.setEncoding(encoding);

        // _encodingConfidence is an int
        cp.setEncodingConfidence(og.getEncodingConfidence());

        return cp;

    }
}
