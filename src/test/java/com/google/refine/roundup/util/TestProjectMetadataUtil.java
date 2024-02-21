package com.google.refine.roundup.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.refine.ProjectMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;

import static org.junit.jupiter.api.Assertions.*;

public class TestProjectMetadataUtil {

    private ProjectMetadata _expected, _actual;
    private long employeesA = 1717428226815L;

    @BeforeEach
    public void initTest() {
        String pathname = String.format("src/test/resources/%d.project", employeesA);
        File projectDir = new File(pathname);
        _expected = com.google.refine.io.ProjectMetadataUtilities.load(projectDir);
        _actual = ProjectMetadataUtil.copy(_expected);
    }

    private String toJSONString(ProjectMetadata metadata) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        String out = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(metadata);
        return out;
    }

    @Test
    @DisplayName("`_created` is unequal")
    public void testCopyCreated() {
        assertNotEquals(_expected.getCreated(), _actual.getCreated());
    }

    @Test
    @DisplayName("`_modified` is unequal")
    public void testCopyModified() {
        assertNotEquals(_expected.getModified(), _actual.getModified());
    }

    @Test
    @DisplayName("`_name` is unequal")
    public void testCopyNameEquality() {
        assertNotEquals(_expected.getName(), _actual.getName());
    }

    @Test
    @DisplayName("`_name` contains \"copy\"")
    public void testCopyInName() {
        assertTrue(_actual.getName().contains("Copy"));
    }

    @Test
    @DisplayName("`_password` passes deep check")
    public void testCopyPasswordDeep() {
        assertEquals(_expected.getPassword(), _actual.getPassword());
        assertNotSame(_expected.getPassword(), _actual.getPassword());
    }

    @Test
    @DisplayName("`_encoding` passes deep check")
    public void testCopyEncoding() {
        assertEquals(_expected.getEncoding(), _actual.getEncoding());
//        assertNotSame(_expected.getEncoding(), _actual.getEncoding());
//        assertTrue(_expected.getEncoding() == _actual.getEncoding());

//        _actual.setEncoding("foobar");
//        assertNotEquals(_expected.getEncoding(), _actual.getEncoding());
//        assertSame(_expected.getEncoding(), _actual.getEncoding());
    }

    @Test
    @DisplayName("`_encodingConfidence` passes deep check")
    public void testCopyEncodingConfidence() {
        assertEquals(_expected.getEncodingConfidence(), _actual.getEncodingConfidence());
        assertNotSame(_expected.getEncodingConfidence(), _actual.getEncodingConfidence());
    }

    @Test
    @DisplayName("`_tags` are equal")
    public void testCopyTags() {
        assertArrayEquals(_expected.getTags(), _actual.getTags());
    }

    @Test
    @DisplayName("`_creator passes deep check")
    public void testCopyCreator() {
        assertEquals(_expected.getCreator(), _actual.getCreator());
        assertNotSame(_expected.getCreator(), _actual.getCreator());
    }


    @Test
    @DisplayName("`_contributors` passes deep check")
    public void testCopyContributors() {
        assertEquals(_expected.getContributors(), _actual.getContributors());
        assertNotSame(_expected.getContributors(), _actual.getContributors());
    }

    @Test
    @DisplayName("`_subject` passes deep check")
    public void testCopySubject() {
        assertEquals(_expected.getSubject(), _actual.getSubject());
        assertNotSame(_expected.getSubject(), _actual.getSubject());
    }

    @Test
    @DisplayName("`_description` passes deep check")
    public void testCopyDescription() {
        assertEquals(_expected.getDescription(), _actual.getDescription());
        assertNotSame(_expected.getDescription(), _actual.getDescription());
    }

    @Test
    @DisplayName("`_rowCount` passes deep check")
    public void testCopyRowCount() {
        // TODO: not necessarily true if copy based on selection
        assertEquals(_expected.getRowCount(), _actual.getRowCount());
        assertNotSame(_expected.getRowCount(), _actual.getRowCount());
    }

//    @Test
//    @DisplayName("`_title` is equal")
//    public void testCopyTitle() {
//        // TODO
//    }

    //    @Test
//    @DisplayName("`_version` is equal")
//    public void testCopyVersion() {
//        // TODO
//    }

    //    @Test
//    @DisplayName("`_license` is equal")
//    public void testCopyLicense() {
//        // TODO
//    }

    //    @Test
//    @DisplayName("`_homepage` is equal")
//    public void testCopyHomepage() {
//        // TODO
//    }

//    @Test
//    @DisplayName("`_image` is equal")
//    public void testCopyImage() throws JsonProcessingException {
//        // TODO
//    }

//    @Test
//    @DisplayName("`_importOptionsMetadata` is equal")
//    public void testCopyImportOptions() {
//        assertEquals(_expected.getImportOptionMetadata(), _actual.getImportOptionMetadata());
//    }
//
//    @Test
//    @DisplayName("`_userMetadata` is equal")
//    public void testCopyUserMetadata() {
//        assertEquals(_expected.getUserMetadata(), _actual.getUserMetadata());
//    }

//    @Test
//    @DisplayName("`_customMetadata` is equal")
//    public void testCopyCustomMetadata() {
//
//        assertEquals(_expected.getCustomMetadata(), _actual.getCustomMetadata());
//    }

//    @Test
//    @DisplayName("`_preferenceStore` is equal")
//    public void testCopyPreferenceStore() {
//        // TODO: Test equality of PreferenceStore instance
//        assertEquals(_expected.getPreferenceStore(), _actual.getPreferenceStore());
//    }

}
