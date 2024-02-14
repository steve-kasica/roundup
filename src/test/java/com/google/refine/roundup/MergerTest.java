//package com.google.refine.roundup;
//
//import com.google.refine.io.ProjectUtilities;
//import com.google.refine.model.Project;
//
//import java.io.File;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//
//public class MergerTest {
//
//    protected final long departmentTableID = 2069919630481L,
//            employeesATableID = 1875915949065L,
//            employeesBTableID = 1992307923742L;
//
//    protected Project employeeTable, departmentTable;
//
//    protected Project loadMockData(long id) {
//        String workingDirectory = getResourcesDir();
//        String projectDirectory = workingDirectory + id + ".project";
//        File dir = new File(projectDirectory);
//        return ProjectUtilities.load(dir, id);
//    }
//
//    private String getResourcesDir() {
//        Path resourcesDirectory = Paths.get("src", "test", "resources");
//        String absolutePath = resourcesDirectory.toFile().getAbsolutePath() + "/";
//        return absolutePath;
//    }
//
//}
