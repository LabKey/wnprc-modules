package org.labkey.test.tests.wnprc_virology;

import org.jetbrains.annotations.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.TestFileUtils;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.WNPRC_Virology;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PostgresOnlyTest;

@Category({CustomModules.class, WNPRC_Virology.class})
public class WNPRC_VirologyTest extends BaseWebDriverTest implements PostgresOnlyTest
{

    public static final String PROJECT_NAME = "WNPRC_VirologyTestProject";
    private static final File LIST_ARCHIVE = TestFileUtils.getSampleData("vl_sample_queue_design_and_sampledata.zip");

    @Nullable
    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        WNPRC_VirologyTest initTest = (WNPRC_VirologyTest)getCurrentTest();
        initTest.initProject("Collaboration");
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_EHR", "WNPRC_Virology"));
        initTest.clickFolder(PROJECT_NAME);
        initTest._listHelper.importListArchive(initTest.getProjectName(), LIST_ARCHIVE);

    }

    protected void createProjectAndFolders(String type)
    {
        _containerHelper.createProject(getProjectName(), type);
    }

    protected void initProject(String type) throws Exception
    {
        createProjectAndFolders(type);
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return null;
    }

    @Test
    public void testEmailSending() throws Exception
    {
        //test some things here
        //TODO get ext4 client dependency to load up and test the batch complete / email function
    }
}
