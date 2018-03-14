package org.labkey.test.primateid;

import org.jetbrains.annotations.Nullable;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.categories.External;
import org.labkey.test.categories.PrimateId;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Category({External.class, PrimateId.class})
public class PrimateIdTest extends BaseWebDriverTest
{
    private static final String PROJECT_NAME = "PrimateId_Test_Project_" + UUID.randomUUID();

    @Override
    protected @Nullable String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Collections.singletonList("PrimateId");
    }

    /**
     * Test setup method. Creates a new project for the test and enables all associated modules.
     */
    @Before
    public void setup()
    {
        if (!_containerHelper.getCreatedProjects().contains(getProjectName()))
        {
            _containerHelper.createProject(getProjectName(), "EHR");
            getAssociatedModules().forEach(m -> _containerHelper.enableModule(getProjectName(), m));
        }
    }

    /**
     * Simple smoke test to make sure the module can be enabled and the default (admin) view
     * is visible to the test user.
     */
    @Test
    public void smoke()
    {
        beginAt("/primateid/" + getProjectName() + "/begin.view");
        assertNoLabKeyErrors();
    }
}