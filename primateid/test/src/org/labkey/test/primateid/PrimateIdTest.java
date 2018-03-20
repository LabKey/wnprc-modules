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

    @Override
    protected @Nullable String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    protected String getModuleDirectory()
    {
        return null;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Collections.singletonList("PrimateId");
    }

    @Override
    protected void importStudy()
    {
        goToManageStudy();
        importStudyFromZip(STUDY_ZIP);
    }

    /**
     * Test setup method. Creates a new project for the test and enables all associated modules.
     */
    @Before
    public void setup() throws Exception
    {
        if (_containerHelper.getCreatedProjects().contains(getProjectName()))
            return;

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
    public void smoke()
    {
        beginAt("/primateid/" + getContainerPath() + "/begin.view");
        assertNoLabKeyErrors();
    }

    @Test
    public void testGeneratePrimateIds()
    {
        // navigate to the admin page
        beginAt("/primateid/" + getContainerPath() + "/begin.view");
        assertNoLabKeyErrors();

        // click the "Generate PrimateIDs" button
        clickButton("Generate PrimateIDs", "Successfully generated PrimateIDs.");
    }
}