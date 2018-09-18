package org.labkey.test.primateid;

import org.jetbrains.annotations.Nullable;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.categories.External;
import org.labkey.test.categories.PrimateId;
import org.labkey.test.tests.ehr.AbstractEHRTest;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Category({External.class, PrimateId.class})
public class PrimateIdTest extends AbstractEHRTest
{
    private static final String PROJECT_NAME = "PrimateId_Test_Project_" + UUID.randomUUID();

    //region --Function overrides from parent class--

    @Override
    public List<String> getAssociatedModules()
    {
        return Collections.singletonList("PrimateId");
    }

    @Override
    protected String getModuleDirectory()
    {
        return null;
    }

    @Override
    protected @Nullable String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    protected void importStudy()
    {
        goToManageStudy();
        importStudyFromZip(STUDY_ZIP);
    }

    //endregion

    /**
     * Test setup method. Creates a new project for the test and enables all associated modules.
     */
    @Before
    public void setup() throws Exception
    {
        // only execute the setup once. doing the check this way rather than in
        // a @BeforeClass method because many of the helper functions are instance
        // methods rather than static methods - clay, 20 Mar 2018
        if (_containerHelper.getCreatedProjects().contains(getProjectName()))
            return;

        // set up the project, module, and properties in the EHR folder
        initProject("EHR");
        goToEHRFolder();
        getAssociatedModules().forEach(m -> _containerHelper.enableModule(m));
        setModuleProperties(Collections.singletonList(new ModulePropertyValue("PrimateId",
                "/" + getContainerPath(), "PrimateIdPrefix", "XX")));
    }

    /**
     * Simple smoke test to make sure the module can be enabled and the default (admin) view
     * is visible to the test user.
     */
    @Test
    public void testSmoke()
    {
        beginAt("/primateid/" + getContainerPath() + "/begin.view");
        assertNoLabKeyErrors();
    }

    /**
     * Test to make sure clicking the "Generate" button results in the expected success message.
     */
    @Test
    public void testGeneratePrimateIds()
    {
        beginAt("/primateid/" + getContainerPath() + "/begin.view");
        assertNoLabKeyErrors();
        clickButton("Generate PrimateIDs", "Successfully generated PrimateIDs.");
    }
}