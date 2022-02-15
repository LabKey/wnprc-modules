package org.labkey.test.tests.wnprc_virology;

import org.jetbrains.annotations.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestFileUtils;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.Ext4Helper;

import static org.labkey.test.WebTestHelper.buildRelativeUrl;

@Category({WNPRC_EHR.class})
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
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_Virology", "Dumbster"));

        // Set up the module properties
        List<ModulePropertyValue> properties = new ArrayList<>();
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "virologyEHRVLSampleQueueFolderPath", initTest.getProjectName()));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRQCStatus", "09-complete-email-RSEHR"));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRPortalPath","https://rsehr.primate.wisc.edu/WNPRC/Research%20Services/Virology%20Services/Private/" ));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRViralLoadDataFolder", "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VL_DB/Private/"));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRJobInterval", "5"));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "ZikaPortalQCStatus", "08-complete-email-Zika_portal" ));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "ZikaPortalPath", "https://openresearch.labkey.com/study/ZEST/Private/dataset.view?datasetId=5080" ));
        initTest.setModuleProperties(properties);

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
        setupNotificationService();
    }

    public void setupNotificationService()
    {
        //go to ldk-notificationAdmin.view
        //set the notification user and reply to email
        log("Set up general settings for LDK notification service");
        String email = getCurrentUser();
        beginAt(buildRelativeUrl("ldk", getProjectName(), "notificationAdmin"));
        Ext4FieldRef.getForLabel(this, "Notification User").setValue(PasswordUtil.getUsername());
        Ext4FieldRef.getForLabel(this, "Reply Email").setValue(email);
        Ext4CmpRef btn = _ext4Helper.queryOne("button[text='Save']", Ext4CmpRef.class);
        btn.waitForEnabled();
        clickButton("Save", 0);
        waitForElement(Ext4Helper.Locators.window().withDescendant(Window.Locators.title().withText("Success")));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return null;
    }

    @Test
    public void testBatchCompleteAndSendZikaEmail() throws Exception
    {
        log("Select first 2 samples and batch complete");
        enableEmailRecorder();
        waitAndClickAndWait(Locator.linkWithText("vl_sample_queue"));
        //select all records and batch complete
        waitAndClick(Locator.checkboxByNameAndValue(".select", "1")); //for some reason waitAndClickAndWait() didn't work here
        waitAndClick(Locator.checkboxByNameAndValue(".select", "2"));
        waitAndClick(Locator.lkButton("Batch Complete Samples"));
        //select the dropdown arrow to select qc state
        waitAndClick(Locator.xpath("//div[contains(@class, 'x4-trigger-index-0')]"));
        Locator.XPathLocator ZikaQCStateSelectItem = Locator.tagContainingText("li", "08-complete-email-Zika_portal").notHidden().withClass("x4-boundlist-item");
        click(ZikaQCStateSelectItem);
        Locator.name("enter-experiment-number-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-positive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-vlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-avgvlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("efficiency-inputEl").findElement(getDriver()).sendKeys("2");
        click(Ext4Helper.Locators.ext4Button("Submit"));

        sleep(5000);
        log("Check that the Zika notification email was sent");
        goToModule("Dumbster");
        assertTextPresent("[EHR Server] Viral load results completed on ");
    }
}
