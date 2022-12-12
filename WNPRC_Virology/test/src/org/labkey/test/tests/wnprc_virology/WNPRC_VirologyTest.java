package org.labkey.test.tests.wnprc_virology;

import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.labkey.api.data.Container;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.CommandResponse;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.PostCommand;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
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
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import static org.labkey.test.WebTestHelper.buildRelativeUrl;

@Category({WNPRC_EHR.class})
public class WNPRC_VirologyTest extends BaseWebDriverTest implements PostgresOnlyTest
{

    public static final String PROJECT_NAME_EHR = "WNPRC_VirologyTestProject";

    //this will simulate where the study data lives on the RSEHR server
    public static final String PROJECT_NAME_RSEHR = "RSHERPrivate";

    public static final String RSHER_PRIVATE_FOLDER_PATH = PROJECT_NAME_EHR + "/" + PROJECT_NAME_RSEHR;
    public static final String TEST_USER = "test@test.com";
    private static final File LIST_ARCHIVE = TestFileUtils.getSampleData("vl_sample_queue_design_and_sampledata.zip");
    private static final File ALIASES_TSV = TestFileUtils.getSampleData("aliases.tsv");

    private static WNPRC_VirologyTest _test;

    private static final String ACCOUNT_LOOKUP = "1";
    private static final String ACCOUNT_STR = "acct100";

    private static final String LINKED_SCHEMA_FOLDER_NAME = "test_linked_schema";
    private static final String RSEHR_QC_CODE = "09-complete-email-RSEHR";

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

    }

    private List<Map<String, Object>> insertTsvData(Connection connection, String schemaName, String queryName, List<Map<String, Object>> tsv, String destinationContainer) throws IOException, CommandException
    {
        log("Loading tsv data: " + schemaName + "." + queryName);
        InsertRowsCommand command = new InsertRowsCommand(schemaName,queryName);
        command.setRows(tsv);
        SaveRowsResponse response = command.execute(connection, destinationContainer);
        return response.getRows();
    }

    protected void createProjectAndFolders(String type) throws IOException, CommandException
    {
        //create EHR folder with sample queue, etc
        _containerHelper.createProject(getProjectName(), type);
        _test._containerHelper.enableModules(Arrays.asList("WNPRC_Virology", "Dumbster", "EHR_Billing"));
        // Set up the module properties
        List<ModulePropertyValue> properties = new ArrayList<>();
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "virologyEHRVLSampleQueueFolderPath", _test.getProjectName()));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRQCStatus", RSEHR_QC_CODE));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRPortalPath","https://rsehr.primate.wisc.edu/WNPRC/Research%20Services/Virology%20Services/Private/" ));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRViralLoadDataFolder", RSHER_PRIVATE_FOLDER_PATH));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "RSEHRJobInterval", "5"));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "ZikaPortalQCStatus", "08-complete-email-Zika_portal" ));
        properties.add(new ModulePropertyValue("WNPRC_Virology", "/", "ZikaPortalPath", "https://openresearch.labkey.com/study/ZEST/Private/dataset.view?datasetId=5080" ));
        _test.setModuleProperties(properties);

        Connection connection = createDefaultConnection(true);
        //import example grant accnt data
        List<Map<String, Object>> tsv = loadTsv(ALIASES_TSV);
        // we need the grant accounts in both locations, for the sample queue list and the rsher study dataset that gets ETLd
        //insertTsvData(connection, "ehr_billing", "aliases", tsv, PROJECT_NAME_EHR);
        _test.clickFolder(PROJECT_NAME_EHR);
        _test._listHelper.importListArchive(_test.getProjectName(), LIST_ARCHIVE);
        //create RSHER folder with study data
        _containerHelper.createSubfolder(getProjectName(), getProjectNameRSEHR(), "Collaboration");
        _test._containerHelper.enableModules(Arrays.asList("WNPRC_Virology", "Dumbster","Study"));
        importStudyFromPath(1);
        //also upload grant accounts to the RSEHR folder (simulates the ETL)
        insertTsvData(connection, "wnprc_virology", "grant_accounts", tsv, RSHER_PRIVATE_FOLDER_PATH);
        //does this point to the new container?
        //set up a child folder under RSHER
        List<ModulePropertyValue> props = new ArrayList<>();
        props.add(new ModulePropertyValue("EHR", RSHER_PRIVATE_FOLDER_PATH, "EHRAdminUser", getCurrentUser()));
        _test.setModuleProperties(props);
        setupSharedDataFolder(LINKED_SCHEMA_FOLDER_NAME);

    }

    protected void importStudyFromPath(int jobCount)
    {
        File path = new File(TestFileUtils.getLabKeyRoot(), getModulePath() + "/resources/referenceStudy");
        setPipelineRoot(path.getPath());

        beginAt(WebTestHelper.getBaseURL() + "/pipeline-status/" + RSHER_PRIVATE_FOLDER_PATH + "/begin.view");
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

    protected void setupSharedDataFolder(String name) throws IOException, CommandException
    {
        _test.clickFolder("RSHERPrivate");
        setupNotificationService();
        _test.clickFolder("RSHERPrivate");
        CreateSubFolderPage createSubFolderPage = _test.projectMenu().navigateToCreateSubFolderPage().setFolderName(name);
        createSubFolderPage.selectFolderType("WNPRC_Virology");
        SetFolderPermissionsPage setFolderPermissionsPage = createSubFolderPage.clickNext();
        setFolderPermissionsPage.setMyUserOnly();
        _test.clickButton("Next");
        _test.waitForText("Select...");
        WebElement el = Locator.id("dropdown-section").findElement(getDriver());
        WebElement inp = el.findElement(By.tagName("input"));
        inp.sendKeys(ACCOUNT_STR);
        inp.sendKeys(Keys.ENTER);
        _test.clickButton("Save and Configure Permissions");
        _test.waitForText("Save and Finish");
        _test.clickButton("Save and Finish");

        //add readers and then run the pipeline job
        //TODO create fake user
        //_users = createUsers(ALL_EMAILS);
        _userHelper.createUser(TEST_USER);
        _permissionsHelper.setUserPermissions(TEST_USER, "WNPRC Viral Load Reader");
        _test.clickButton("Save and Finish");

        Connection connection = createDefaultConnection();
        PostCommand command = new PostCommand("wnprc_virology", "startRSEHRJob");
        command.setTimeout(1200000);
        CommandResponse response = command.execute(connection, RSHER_PRIVATE_FOLDER_PATH);
        Assert.assertTrue(response.getStatusCode() < 400);

    }

    protected void initProject(String type) throws Exception
    {
        createProjectAndFolders(type);
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
        beginAt(buildRelativeUrl("ldk", RSHER_PRIVATE_FOLDER_PATH, "notificationAdmin"));
        Ext4FieldRef.getForLabel(this, "Notification User").setValue(PasswordUtil.getUsername());
        Ext4FieldRef.getForLabel(this, "Reply Email").setValue(email);
        Ext4CmpRef btn2 = _ext4Helper.queryOne("button[text='Save']", Ext4CmpRef.class);
        btn2.waitForEnabled();
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
        _test.clickFolder(PROJECT_NAME_EHR);
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
        SelectRowsResponse resp = sr.execute(createDefaultConnection(),RSHER_PRIVATE_FOLDER_PATH);
        Assert.assertEquals(1, resp.getRows().size());
    }

    @Test
    public void testLinkedSchemaDataWebpart()
    {
        _test.clickFolder(LINKED_SCHEMA_FOLDER_NAME);
        //not the best check but better than nothing
        //should really check the number of expected results
        assertTextPresent(ACCOUNT_STR);
    }

    @Test
    public void testViralLoadRSEHRJob() throws IOException, CommandException
    {
        SelectRowsCommand sr = new SelectRowsCommand("lists","rsehr_folders_accounts_and_vl_reader_emails_etl");
        sr.addFilter("emails", TEST_USER, Filter.Operator.EQUAL);
        sr.addFilter("folder_name",LINKED_SCHEMA_FOLDER_NAME, Filter.Operator.EQUAL);
        SelectRowsResponse resp = sr.execute(createDefaultConnection(), RSHER_PRIVATE_FOLDER_PATH);
        Assert.assertEquals(1, resp.getRows().size());
    }

    //@Test
    public void testBatchCompleteAndSendRSERHEmail() throws Exception
    {
        //TODO either add test data to rsehr_folders_accounts_and_vl_reader_emails or run the ETL
        log("Select first 2 samples and batch complete");
        enableEmailRecorder();
        _test.clickFolder(PROJECT_NAME_EHR);
        waitAndClickAndWait(Locator.linkWithText("vl_sample_queue"));
        //select all records and batch complete
        waitAndClick(Locator.checkboxByNameAndValue(".select", "1")); //for some reason waitAndClickAndWait() didn't work here
        waitAndClick(Locator.checkboxByNameAndValue(".select", "2"));
        waitAndClick(Locator.lkButton("Batch Complete Samples"));
        //select the dropdown arrow to select qc state
        waitAndClick(Locator.xpath("//div[contains(@class, 'x4-trigger-index-0')]"));
        Locator.XPathLocator ZikaQCStateSelectItem = Locator.tagContainingText("li", RSEHR_QC_CODE).notHidden().withClass("x4-boundlist-item");
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
