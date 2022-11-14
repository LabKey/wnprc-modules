package org.labkey.test.tests.wnprc_virology;

import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.pages.admin.CreateSubFolderPage;
import org.labkey.test.pages.admin.SetFolderPermissionsPage;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.WebElement;

import static org.labkey.test.WebTestHelper.buildRelativeUrl;

@Category({WNPRC_EHR.class})
public class WNPRC_VirologyTest extends BaseWebDriverTest implements PostgresOnlyTest
{

    public static final String PROJECT_NAME_EHR = "WNPRC_VirologyTestProject";

    //this will simulate where the study data lives on the RSEHR server
    public static final String PROJECT_NAME_RSEHR = "RSHERPrivate";
    private static final File LIST_ARCHIVE = TestFileUtils.getSampleData("vl_sample_queue_design_and_sampledata.zip");

    private static WNPRC_VirologyTest _test;

    private static final String ACCOUNT_STR = "testaccount123";

    private static final String LINKED_SCHEMA_FOLDER_NAME = "test_linked_schema";

    @Nullable
    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME_EHR;
    }

    protected String getProjectNameRSEHR()
    {
        return PROJECT_NAME_RSEHR;
    }

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        _test = (WNPRC_VirologyTest)getCurrentTest();
        _test.initProject("Collaboration");

        // Set up the module properties
        List<ModulePropertyValue> properties = new ArrayList<>();
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "virologyEHRVLSampleQueueFolderPath", _test.getProjectName()));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRQCStatus", "09-complete-email-RSEHR"));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRPortalPath","https://rsehr.primate.wisc.edu/WNPRC/Research%20Services/Virology%20Services/Private/" ));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRViralLoadDataFolder", _test.getProjectName() + "/" + _test.getProjectNameRSEHR()));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRJobInterval", "5"));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "ZikaPortalQCStatus", "08-complete-email-Zika_portal" ));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "ZikaPortalPath", "https://openresearch.labkey.com/study/ZEST/Private/dataset.view?datasetId=5080" ));
        _test.setModuleProperties(properties);

        _test.clickFolder(PROJECT_NAME_EHR);
        _test._listHelper.importListArchive(_test.getProjectName(), LIST_ARCHIVE);

    }

    protected void createProjectAndFolders(String type)
    {
        //create EHR folder with sample queue, etc
        _containerHelper.createProject(getProjectName(), type);
        _test._containerHelper.enableModules(Arrays.asList("WNPRC_Virology", "Dumbster"));
        //create RSHER folder with study data
        _containerHelper.createSubfolder(getProjectName(), getProjectNameRSEHR(), "Collaboration");
        _test._containerHelper.enableModules(Arrays.asList("WNPRC_Virology", "Dumbster","Study"));
        importStudyFromPath(1);
        //does this point to the new container?
        //set up a child folder under RSHER
        setupSharedDataFolder(LINKED_SCHEMA_FOLDER_NAME);
    }

    protected void importStudyFromPath(int jobCount)
    {
        File path = new File(TestFileUtils.getLabKeyRoot(), getModulePath() + "/resources/referenceStudy");
        setPipelineRoot(path.getPath());

        beginAt(WebTestHelper.getBaseURL() + "/pipeline-status/" + getProjectName() + "/" + getProjectNameRSEHR() + "/begin.view");
        clickButton("Process and Import Data", defaultWaitForPage);

        _fileBrowserHelper.expandFileBrowserRootNode();
        _fileBrowserHelper.checkFileBrowserFileCheckbox("study.xml");

        if (isTextPresent("Reload Study"))
            _fileBrowserHelper.selectImportDataAction("Reload Study");
        else
            _fileBrowserHelper.selectImportDataAction("Import Study");

        Locator cb = Locator.checkboxByName("validateQueries");
        waitForElement(cb);
        uncheckCheckbox(cb);

        clickButton("Start Import"); // Validate queries page
        waitForPipelineJobsToComplete(jobCount, "Study import", false, MAX_WAIT_SECONDS * 2500);
    }

    protected String getModuleDirectory()
    {
        return "WNPRC_Virology";
    }

    public String getModulePath()
    {
        return "/server/modules/wnprc-modules/" + getModuleDirectory();
    }

    protected void setupSharedDataFolder(String name)
    {
        _test.clickFolder("RSHERPrivate");
        CreateSubFolderPage createSubFolderPage = _test.projectMenu().navigateToCreateSubFolderPage().setFolderName(name);
        createSubFolderPage.selectFolderType("WNPRC_Virology");
        SetFolderPermissionsPage setFolderPermissionsPage = createSubFolderPage.clickNext();
        setFolderPermissionsPage.setMyUserOnly();
        _test.clickButton("Next");
        _test.waitForText("Save and Configure Permissions");
        WebElement el = Locator.id("accountNumbers").findElement(getDriver());
        el.sendKeys(ACCOUNT_STR);
        _test.clickButton("Save and Configure Permissions");
        _test.waitForText("Save and Finish");
        _test.clickButton("Save and Finish");

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

    @Test
    public void testFolderAccountMapping() throws Exception
    {
        //assert that the folders_accounts_mapping table was populated w folder name
        SelectRowsCommand sr = new SelectRowsCommand("wnprc_virology","folders_accounts_mappings");
        sr.addFilter("folder_name",LINKED_SCHEMA_FOLDER_NAME, Filter.Operator.EQUAL);
        SelectRowsResponse resp = sr.execute(createDefaultConnection(),_test.getProjectName() + "/" + _test.getProjectNameRSEHR());
        Assert.assertEquals(1, resp.getRows().size());
    }

    @Test
    public void testLinkedSchemaDataWebpart()
    {
        _test.clickFolder(LINKED_SCHEMA_FOLDER_NAME);
        //not the best check but better than nothing
        assertTextPresent(ACCOUNT_STR);
    }
}
