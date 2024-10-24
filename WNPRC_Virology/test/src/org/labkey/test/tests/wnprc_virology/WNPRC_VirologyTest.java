package org.labkey.test.tests.wnprc_virology;

import org.junit.Assert;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.CommandResponse;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.SimplePostCommand;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.components.dumbster.EmailRecordTable;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.pages.admin.CreateSubFolderPage;
import org.labkey.test.pages.admin.SetFolderPermissionsPage;
import org.labkey.test.tests.external.labModules.ViralLoadAssayTest;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.RemoteConnectionHelper;
import org.labkey.test.util.SchemaHelper;
import org.labkey.test.util.di.DataIntegrationHelper;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.labkey.test.WebTestHelper.buildRelativeUrl;

@Category({WNPRC_EHR.class})
public class WNPRC_VirologyTest extends ViralLoadAssayTest
{

    public static final String CUSTOM_PROJECT_NAME = "LaboratoryVerifyProject";
    public static final String PROJECT_NAME_EHR = "WNPRC_VirologyTestProject";
    public static final String MODULE_NAME = "WNPRC_Virology";

    //this will simulate where the study data lives on the RSEHR server
    public static final String PROJECT_NAME_RSEHR = "RSEHRServer";
    public static final String PROJECT_NAME_RSHER_PUBLIC = "RSEHRPublic";
    public static final String RSEHR_PUBLIC_FOLDER_PATH = PROJECT_NAME_RSEHR + "/" + PROJECT_NAME_RSHER_PUBLIC;
    public static final String RSEHR_PORTAL_PATH = WebTestHelper.getBaseUrlWithoutContextPath();
    public static final String RSEHR_JOB_INTERVAL = "5";

    public static final String EHR_REMOTE_CONNECTION = "ProductionEHRServerFinance";
    public static final String EHR_EMAILS_ETL_ID = "{" + MODULE_NAME + "}/WNPRC_ViralLoadsRSEHREmails";
    public static final String RSEHR_REMOTE_CONNECTION = "RSEHRServerVirology";
    public static final String RSEHR_ACCOUNTS_ETL_ID = "{" + MODULE_NAME + "}/WNPRC_GrantAccounts";
    public static final String RSEHR_VIRAL_LOAD_DATA_ETL_ID = "{" + MODULE_NAME + "}/WNPRC_ViralLoads";
    public static final String EHR_REMOTE_VIRAL_LOAD_CONNECTION_NAME = "ProductionEHRServerVirology";
    public static final String RSEHR_EMAIL_CONTACT_INFO = "virologyservices@primate.wisc.edu";
    public static final String TEST_USER = "test_wnprc_virology@test.com";
    public static final String TEST_USER_2 = "test_wnprc_virology_2@test.com";
    public static final String ADMIN_USER = "admin_user@test.com";
    private static final File LIST_ARCHIVE = TestFileUtils.getSampleData("vl_sample_queue_design_and_sampledata.zip");
    private static final File LIST_ARCHIVE_QC = TestFileUtils.getSampleData("VS_group_wiki_2023-04-26_14-36-16.lists.zip");
    private static final File ALIASES_EHR_TSV = TestFileUtils.getSampleData("aliases_ehr.tsv");
    private static final File LLOD_EHR_TSV = TestFileUtils.getSampleData("llod_ehr.tsv");

    private static final String ACCOUNT_LOOKUP = "1";
    private static final String ACCOUNT_STR = "acct105";
    private static final String ACCOUNT_STR_2 = "acct106";
    private static final String ACCOUNT_STR_3 = "acct107";
    private static final String ACCOUNT_STR_4 = "acct108";
    //note that these subject ids rely on WNPRC_TEMPLATE_DATA var in ViralLoadAssayTest.java
    private static final String ANIMAL_ID = "Subject2";
    private static final String ANIMAL_ID_2 = "Subject11"; //associated w linked folder 3 account 106
    private static final String ANIMAL_ID_3 = "Subject12"; //associated w linked folder 3 account 107
    private static final String ANIMAL_ID_4 = "Subject13"; //associated w linked folder 4 account 108
    private static final String ANIMAL_ID_4b = "Subject14"; //associated w linked folder 4 account 108

    private static final String LINKED_SCHEMA_FOLDER_NAME = "test_linked_schema";
    private static final String A_SECOND_LINKED_SCHEMA_FOLDER_NAME = "test_linked_schema_2";
    private static final String A_THIRD_LINKED_SCHEMA_FOLDER_NAME = "test_linked_schema_3";
    private static final String A_FOURTH_LINKED_SCHEMA_FOLDER_NAME = "test_linked_schema_4";
    private static final String RSEHR_QC_CODE = "09-complete-email-RSEHR";
    private static final String COMPLETE_QC_STRING = "05-complete";
    private static final Integer COMPLETE_QC_CODE = 5;

    protected final PortalHelper _portalHelper = new PortalHelper(this);
    protected final RemoteConnectionHelper _rconnHelper = new RemoteConnectionHelper(this);
    protected final ApiPermissionsHelper _apiPermissionsHelper = new ApiPermissionsHelper(this);
    private SchemaHelper _schemaHelper = new SchemaHelper(this);

    @Override
    protected String getProjectName()
    {
        return CUSTOM_PROJECT_NAME;
    }
    protected String getProjectNameRSEHR()
    {
        return PROJECT_NAME_RSEHR;
    }
    protected String getProjectNameRSEHRPublic()
    {
        return PROJECT_NAME_RSHER_PUBLIC;
    }

    @Override
    @Test
    public void testSteps() throws Exception
    {
        super.testSteps();
        doVirologySetup();
        testTheStuff();
    }

    public void doVirologySetup() throws Exception
    {
        ((WNPRC_VirologyTest) getCurrentTest()).initProject("Collaboration");
    }

    public void testTheStuff() throws Exception
    {
        testBasicBatchComplete();
        testViralLoadRSEHRJob();
        testUpdateAccountsPage();
        testBatchCompleteAndSendRSERHEmail();
        testFolderAccountMapping();
        testBatchCompleteAndSendRSERHEmailToDiffUser();
        testLinkedSchemaDataWebpart();

    }


    public void runEmailETL() throws CommandException, IOException
    {
        log("Populating rsehr_folders_accounts_and_vl_reader_emails before each test");
        DataIntegrationHelper _etlHelperEHR = new DataIntegrationHelper(PROJECT_NAME_EHR);
        navigateToFolder(PROJECT_NAME_EHR, PROJECT_NAME_EHR);
        _etlHelperEHR.runTransformAndWait(EHR_EMAILS_ETL_ID);
        _etlHelperEHR.assertInEtlLogFile(_etlHelperEHR.getJobIdByTransformId(EHR_EMAILS_ETL_ID).toString(), "Successfully completed task");
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
        //check to delete first, helpful if the test fails and has to be re-run
        if (_containerHelper.doesContainerExist(PROJECT_NAME_EHR))
        {
            _containerHelper.deleteProject(PROJECT_NAME_EHR);
        }
        _containerHelper.createProject(PROJECT_NAME_EHR, type);
        _containerHelper.enableModules(Arrays.asList(MODULE_NAME, "Dumbster", "EHR_Billing", "DataIntegration"));
        _userHelper.createUser(ADMIN_USER);
        _apiPermissionsHelper.setUserPermissions(ADMIN_USER, "Folder Administrator");
        // Set up the module properties
        List<ModulePropertyValue> properties = new ArrayList<>();
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "virologyEHRVLSampleQueueFolderPath", PROJECT_NAME_EHR));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "RSEHRQCStatus", RSEHR_QC_CODE));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "RSEHRPortalPath",RSEHR_PORTAL_PATH));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "RSEHRViralLoadDataFolder", getProjectNameRSEHR()));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "RSEHRPublicInfoPath", RSEHR_PUBLIC_FOLDER_PATH));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "RSEHRJobInterval", RSEHR_JOB_INTERVAL));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "RSEHRNotificationEmailReplyTo", RSEHR_EMAIL_CONTACT_INFO));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "EHRViralLoadAssayDataPath", getProjectName()));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "EHRViralLoadQCList", PROJECT_NAME_EHR));
        properties.add(new ModulePropertyValue(MODULE_NAME, "/", "virologyEHRVLSampleQueueFolderPath", PROJECT_NAME_EHR));
        setModuleProperties(properties);

        Connection connection = createDefaultConnection(true);
        //import example grant accnt data
        List<Map<String, Object>> tsv2 = loadTsv(ALIASES_EHR_TSV);

        //import llod data into viral load assay project
        List<Map<String, Object>> tsv3 = loadTsv(LLOD_EHR_TSV);
        navigateToFolder(getProjectName(), getProjectName());
        _containerHelper.enableModules(Arrays.asList(MODULE_NAME));
        insertTsvData(connection, "wnprc_virology", "assays_llod", tsv3, getProjectName());

        navigateToFolder(PROJECT_NAME_EHR, PROJECT_NAME_EHR);
        _listHelper.importListArchive(PROJECT_NAME_EHR, LIST_ARCHIVE);
        _listHelper.importListArchive(PROJECT_NAME_EHR, LIST_ARCHIVE_QC);
        //create RSEHR folder with study data
        if (_containerHelper.doesContainerExist(getProjectNameRSEHR()))
        {
            _containerHelper.deleteProject(getProjectNameRSEHR());
        }
        _containerHelper.createProject(getProjectNameRSEHR(),"Collaboration");
        _containerHelper.enableModules(Arrays.asList(MODULE_NAME, "Dumbster","Study", "EHR", "DataIntegration"));
        //create study folder
        //just import study to root and tie down perms later
        //_containerHelper.createSubfolder(getProjectNameRSEHR(), RSEHR_PRIVATE_FOLDER_NAME, "Collaboration");
        //_containerHelper.enableModules(Arrays.asList("Dumbster", "Study"));
        importFolderFromPath(1);
        setupNotificationService();

        SimplePostCommand command = new SimplePostCommand("wnprc_virology", "alterEHRBillingAliasesPKSequence");
        command.setTimeout(1200000);
        CommandResponse response = command.execute(connection, PROJECT_NAME_EHR);
        Assert.assertTrue(response.getStatusCode() < 400);

        insertTsvData(connection, "ehr_billing", "aliases", tsv2, PROJECT_NAME_EHR);
        _schemaHelper.createLinkedSchema(PROJECT_NAME_EHR, "ehr_billing_linked", PROJECT_NAME_EHR, null,"ehr_billing", "aliases", null);

        //runs grant account ETL
        navigateToFolder(getProjectNameRSEHR(), getProjectNameRSEHR());
        _rconnHelper.goToManageRemoteConnections();
        _rconnHelper.createConnection(EHR_REMOTE_CONNECTION, WebTestHelper.getBaseURL(),PROJECT_NAME_EHR);
        DataIntegrationHelper diHelperRSEHR = new DataIntegrationHelper(getProjectNameRSEHR());
        navigateToFolder(getProjectNameRSEHR(), getProjectNameRSEHR());
        diHelperRSEHR.runTransformAndWait(RSEHR_ACCOUNTS_ETL_ID);
        diHelperRSEHR.assertInEtlLogFile(diHelperRSEHR.getJobIdByTransformId(RSEHR_ACCOUNTS_ETL_ID).toString(), "Successfully completed task");

        // set up ETL connection for RSEHR to EHR
        navigateToFolder(PROJECT_NAME_RSEHR, PROJECT_NAME_RSEHR);
        _rconnHelper.goToManageRemoteConnections();
        _rconnHelper.createConnection(EHR_REMOTE_VIRAL_LOAD_CONNECTION_NAME, WebTestHelper.getBaseURL(),PROJECT_NAME_EHR);
        DataIntegrationHelper diHelperEHR = new DataIntegrationHelper(PROJECT_NAME_RSEHR);
        diHelperEHR.runTransformAndWait(RSEHR_VIRAL_LOAD_DATA_ETL_ID);
        diHelperEHR.assertInEtlLogFile(diHelperEHR.getJobIdByTransformId(RSEHR_VIRAL_LOAD_DATA_ETL_ID).toString(), "Successfully completed task");

        // set up ETL connection for EHR to RSEHR
        navigateToFolder(PROJECT_NAME_EHR, PROJECT_NAME_EHR);
        _rconnHelper.goToManageRemoteConnections();
        _rconnHelper.createConnection(RSEHR_REMOTE_CONNECTION, WebTestHelper.getBaseURL(), getProjectNameRSEHR());

        navigateToFolder(PROJECT_NAME_RSEHR, PROJECT_NAME_RSEHR);
        List<ModulePropertyValue> props = new ArrayList<>();
        props.add(new ModulePropertyValue("EHR", PROJECT_NAME_RSEHR, "EHRAdminUser", getCurrentUser()));
        setModuleProperties(props);

        //create the public folder and wiki
        _userHelper.createUser(TEST_USER);
        _userHelper.createUser(TEST_USER_2);
        _containerHelper.createSubfolder(getProjectNameRSEHR(), getProjectNameRSEHRPublic(), "Collaboration");
        _apiPermissionsHelper.setUserPermissions(TEST_USER, "Reader");
        _apiPermissionsHelper.setUserPermissions(TEST_USER_2, "Reader");
        createWiki("Information", "Information");


        setupSharedDataFolder(LINKED_SCHEMA_FOLDER_NAME);
        setupSharedDataFolder(A_SECOND_LINKED_SCHEMA_FOLDER_NAME);
        setupSharedDataFolder(A_THIRD_LINKED_SCHEMA_FOLDER_NAME);
        setupSharedDataFolder(A_FOURTH_LINKED_SCHEMA_FOLDER_NAME);


    }

    private void createWiki(String name, String title)
    {
        goToProjectHome();
        navigateToFolder(getProjectNameRSEHR(), getProjectNameRSEHR());
        clickFolder(getProjectNameRSEHRPublic());
        _portalHelper.addWebPart("Wiki");
        waitForElement(Locator.xpath("//a[text()='Create a new wiki page']"));
        click(Locator.xpath("//a[text()='Create a new wiki page']"));
        waitForElement(Locator.xpath("//input[@name='name']"));
        setFormElement(Locator.xpath("//input[@name='name']"), name);
        setFormElement(Locator.xpath("//input[@name='title']"), title);
        clickButton("Save & Close");
    }

    protected void importFolderFromPath(int jobCount)
    {
        File path = new File(TestFileUtils.getLabKeyRoot(), getModulePath() + "/resources/referenceStudy");
        setPipelineRoot(path.getPath());

        beginAt(WebTestHelper.getBaseURL() + "/" + getProjectNameRSEHR()  + "/pipeline-status-begin.view");
        clickButton("Process and Import Data", defaultWaitForPage);

        _fileBrowserHelper.expandFileBrowserRootNode();
        _fileBrowserHelper.checkFileBrowserFileCheckbox("folder.xml");
        _fileBrowserHelper.selectImportDataAction("Import Folder");

        Locator cb = Locator.checkboxByName("validateQueries");
        waitForElement(cb);
        uncheckCheckbox(cb);

        clickButton("Start Import"); // Validate queries page
        waitForPipelineJobsToComplete(jobCount, "Folder import", false, MAX_WAIT_SECONDS * 2500);

        goToManageStudy();
        clickAndWait(Locator.linkWithText("Manage Security"));

        setFormElement(Locator.name("fileUpload"), TestFileUtils.getSampleData("wnprcVirologyStudyPolicy.xml"));
        clickButton("Import");

    }
    protected String getModuleDirectory()
    {
        return MODULE_NAME;
    }

    public String getModulePath()
    {
        return "/server/modules/wnprc-modules/" + getModuleDirectory();
    }

    protected void setupSharedDataFolder(String name) throws IOException, CommandException
    {
        navigateToFolder(PROJECT_NAME_RSEHR, PROJECT_NAME_RSEHR);
        CreateSubFolderPage createSubFolderPage = projectMenu().navigateToCreateSubFolderPage().setFolderName(name);
        createSubFolderPage.selectFolderType(MODULE_NAME);
        SetFolderPermissionsPage setFolderPermissionsPage = createSubFolderPage.clickNext();
        setFolderPermissionsPage.setMyUserOnly();
        clickButton("Next");
        waitForText("Select...");
        WebElement el = Locator.id("app").findElement(getDriver());
        WebElement inp = el.findElement(By.tagName("input"));
        inp.sendKeys(ACCOUNT_STR);
        inp.sendKeys(Keys.ENTER);
        clickButton("Save and Configure Permissions");
        waitForText("Save and Finish");
        clickButton("Save and Finish");

        _apiPermissionsHelper.setUserPermissions(TEST_USER, "WNPRC Viral Load Reader");

        Connection connection = createDefaultConnection();
        SimplePostCommand command = new SimplePostCommand("wnprc_virology", "startRSEHRJob");
        command.setTimeout(1200000);
        CommandResponse response = command.execute(connection, getProjectNameRSEHR());
        Assert.assertTrue(response.getStatusCode() < 400);

        //run email etl
        navigateToFolder(PROJECT_NAME_EHR, PROJECT_NAME_EHR);
        DataIntegrationHelper diHelperEHR = new DataIntegrationHelper(PROJECT_NAME_EHR);
        diHelperEHR.runTransformAndWait(EHR_EMAILS_ETL_ID);
        diHelperEHR.assertInEtlLogFile(diHelperEHR.getJobIdByTransformId(EHR_EMAILS_ETL_ID).toString(), "Successfully completed task");

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
        beginAt(buildRelativeUrl("ldk", PROJECT_NAME_EHR, "notificationAdmin"));
        Ext4FieldRef.getForLabel(this, "Notification User").setValue(PasswordUtil.getUsername());
        Ext4FieldRef.getForLabel(this, "Reply Email").setValue(email);
        //Add subscribed users
        //better way to index in to the correct one rather than a #?
        Locator manageLink = Locator.tagContainingText("a", "Manage Subscribed Users/Groups").index(2);
        waitAndClick(manageLink);
        waitForElement(Ext4Helper.Locators.window("Manage Subscribed Users"));
        Ext4ComboRef.waitForComponent(this, "field[fieldLabel^='Add User Or Group']");
        Ext4ComboRef combo = Ext4ComboRef.getForLabel(this, "Add User Or Group");
        combo.waitForStoreLoad();
        _ext4Helper.selectComboBoxItem(Locator.id(combo.getId()), Ext4Helper.TextMatchTechnique.CONTAINS, ADMIN_USER);
        waitForElement(Ext4Helper.Locators.ext4Button("Close"));
        clickButton("Close", 0);

        Ext4CmpRef btn = _ext4Helper.queryOne("button[text='Save']", Ext4CmpRef.class);
        btn.waitForEnabled();
        clickButton("Save", 0);
        waitForElement(Ext4Helper.Locators.window().withDescendant(Window.Locators.title().withText("Success")));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));
        beginAt(buildRelativeUrl("ldk", getProjectNameRSEHR(), "notificationAdmin"));
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

    public void testFolderAccountMapping() throws Exception
    {
        //assert that the folders_accounts_mapping table was populated w folder name
        SelectRowsCommand sr = new SelectRowsCommand("wnprc_virology","folders_accounts_mappings");
        sr.addFilter("folder_name",LINKED_SCHEMA_FOLDER_NAME, Filter.Operator.EQUAL);
        SelectRowsResponse resp = sr.execute(createDefaultConnection(), getProjectNameRSEHR());
        Assert.assertTrue(resp.getRows().size() == 1);
    }


    public void testLinkedSchemaDataWebpart()
    {
        navigateToFolder(PROJECT_NAME_RSEHR, LINKED_SCHEMA_FOLDER_NAME);
        impersonate(TEST_USER);
        waitForText(ANIMAL_ID);
        assertTextPresent(ANIMAL_ID);
        stopImpersonating();
    }


    public void testUpdateAccountsPage()
    {
        navigateToFolder(PROJECT_NAME_RSEHR, A_SECOND_LINKED_SCHEMA_FOLDER_NAME);
        waitForText("Update Accounts");
        clickTab("Update Accounts");
        waitForText("Update Accounts Panel");
        WebElement el = Locator.id("app").findElement(getDriver());
        WebElement inp = el.findElement(By.tagName("input"));
        inp.sendKeys(Keys.DELETE);
        inp.sendKeys(ACCOUNT_STR_3);
        inp.sendKeys(Keys.ENTER);
        //note that this clickbutton expects a page reload
        clickButton("Update Accounts");
        waitForText("Accounts successfully updated!");
        navigateToFolder(PROJECT_NAME_RSEHR, A_SECOND_LINKED_SCHEMA_FOLDER_NAME);
        waitForText(ANIMAL_ID_3);
        assertTextPresent(ANIMAL_ID_3);
        assertTextNotPresent(ANIMAL_ID);
    }


    public void testViralLoadRSEHRJob() throws IOException, CommandException
    {
        SelectRowsCommand sr = new SelectRowsCommand("lists","rsehr_folders_accounts_and_vl_reader_emails_etl");
        sr.addFilter("emails", TEST_USER, Filter.Operator.EQUAL);
        sr.addFilter("folder_name",LINKED_SCHEMA_FOLDER_NAME, Filter.Operator.EQUAL);
        SelectRowsResponse resp = sr.execute(createDefaultConnection(), getProjectNameRSEHR());
        Assert.assertEquals(1, resp.getRows().size());
    }

    //
    public void testBatchCompleteAndSendRSEHRToSubscribers()
    {
        // should just throw this in an existing test
    }

    //test regular batch complete
    public void testBasicBatchComplete() throws Exception
    {
        log("Select first 2 samples and batch complete");
        navigateToFolder(PROJECT_NAME_EHR, PROJECT_NAME_EHR);
        waitAndClickAndWait(Locator.linkWithText("vl_sample_queue"));
        DataRegionTable table = new DataRegionTable("query", this);
        table.setFilter("Funding_string", "Equals", ACCOUNT_STR_3);
        waitAndClick(Locator.checkboxByNameAndValue(".select", "4")); //for some reason waitAndClickAndWait() didn't work here
        waitAndClick(Locator.checkboxByNameAndValue(".select", "5"));
        waitAndClick(Locator.lkButton("Batch Complete Samples"));
        //select the dropdown arrow to select qc state
        waitAndClick(Locator.xpath("//div[contains(@class, 'x4-trigger-index-0')]"));
        Locator.XPathLocator CompleteQCStateSelectItem = Locator.tagContainingText("li", COMPLETE_QC_STRING).notHidden().withClass("x4-boundlist-item");
        click(CompleteQCStateSelectItem);
        Locator.name("enter-experiment-number-inputEl").findElement(getDriver()).sendKeys("1000");
        Locator.name("enter-positive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-vlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-avgvlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        clickAndWait(Ext4Helper.Locators.ext4Button("Submit"));

        SelectRowsCommand sr = new SelectRowsCommand("lists","vl_sample_queue");
        sr.addFilter("status", COMPLETE_QC_CODE, Filter.Operator.EQUAL);
        SelectRowsResponse resp = sr.execute(createDefaultConnection(), PROJECT_NAME_EHR);
        Assert.assertTrue(resp.getRows().size() == 2);

    }

    public void testBatchCompleteAndSendRSERHEmail() throws Exception
    {
        //first add another account 107 to A_THIRD_LINKED_SCHEMA_FOLDER_NAME
        navigateToFolder(PROJECT_NAME_RSEHR, A_THIRD_LINKED_SCHEMA_FOLDER_NAME);
        waitForText("Update Accounts");
        clickTab("Update Accounts");
        waitForText("Update Accounts Panel");
        WebElement el = Locator.id("app").findElement(getDriver());
        WebElement inp = el.findElement(By.tagName("input"));
        inp.sendKeys(ACCOUNT_STR_3);
        inp.sendKeys(Keys.ENTER);
        clickButton("Update Accounts");

        //also add TEST_USER_2 to this, maybe remove TEST_USER from the list so we can assert an email is not sent to them

        runEmailETL();

        log("Select first 2 samples and batch complete");
        //this clears out email messages
        enableEmailRecorder();
        navigateToFolder(PROJECT_NAME_EHR, PROJECT_NAME_EHR);
        waitAndClickAndWait(Locator.linkWithText("vl_sample_queue"));
        //select all records and batch complete
        //TODO should really select an item by account number... or just sort
        //can we capture what rows are selected so that we can test the email later?
        DataRegionTable table = new DataRegionTable("query", this);
        table.setFilter("Funding_string", "Equals", ACCOUNT_STR_3);
        //get index where account is 107, then expect to see one email
        waitAndClick(Locator.checkboxByNameAndValue(".select", "4")); //for some reason waitAndClickAndWait() didn't work here
        waitAndClick(Locator.checkboxByNameAndValue(".select", "5"));
        waitAndClick(Locator.lkButton("Batch Complete Samples"));
        //select the dropdown arrow to select qc state
        waitAndClick(Locator.xpath("//div[contains(@class, 'x4-trigger-index-0')]"));
        Locator.XPathLocator RSEHRQCStateSelectItem = Locator.tagContainingText("li", RSEHR_QC_CODE).notHidden().withClass("x4-boundlist-item");
        click(RSEHRQCStateSelectItem);
        Locator.name("enter-experiment-number-inputEl").findElement(getDriver()).sendKeys("1000");
        Locator.name("enter-positive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-vlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-avgvlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("efficiency-inputEl").findElement(getDriver()).sendKeys("2");
        clickAndWait(Ext4Helper.Locators.ext4Button("Submit"));

        sleep(10000);
        log("Check that the RSEHR notification email was sent");
        goToModule("Dumbster");


        EmailRecordTable mailTable = new EmailRecordTable(this);
        Assert.assertEquals(ADMIN_USER, mailTable.getMessageWithSubjectContaining("[EHR Server] Summary information for viral load").getTo()[0]);
        Assert.assertEquals(TEST_USER, mailTable.getMessageWithSubjectContaining("Viral load results completed").getTo()[0]);

        //this will test at least that destination link works and should click one of the emails that went out
        waitAndClick(Locator.linkContainingText("[EHR Server] Viral load results completed on"));
        assertTextPresent("2 sample(s)");
        waitAndClick(Locator.linkWithText("link"));
        waitForText(ANIMAL_ID_3);
        assertTextPresent(ANIMAL_ID_3);
        assertTextPresent(ANIMAL_ID);

        //check for LLoD bolding
        assertElementPresent(Locator.tagWithText("strong", "Yes"));

    }


    public void testBatchCompleteAndSendRSERHEmailToDiffUser() throws Exception
    {
        navigateToFolder(PROJECT_NAME_RSEHR, A_FOURTH_LINKED_SCHEMA_FOLDER_NAME);
        waitForText("Update Accounts");
        clickTab("Update Accounts");
        waitForText("Update Accounts Panel");
        WebElement el = Locator.id("app").findElement(getDriver());
        WebElement inp = el.findElement(By.tagName("input"));
        inp.sendKeys(ACCOUNT_STR_4);
        inp.sendKeys(Keys.ENTER);
        clickButton("Update Accounts");

        //also add TEST_USER_2 to this, maybe remove TEST_USER from the list so we can assert an email is not sent to them
        _apiPermissionsHelper.removeUserRoleAssignment(TEST_USER, "WNPRC Viral Load Reader", getProjectNameRSEHR() + "/" + A_FOURTH_LINKED_SCHEMA_FOLDER_NAME);
        _apiPermissionsHelper.setUserPermissions(TEST_USER_2, "WNPRC Viral Load Reader");

        //run the job with the new permissions
        Connection connection = createDefaultConnection();
        SimplePostCommand command = new SimplePostCommand("wnprc_virology", "startRSEHRJob");
        command.setTimeout(1200000);
        CommandResponse response = command.execute(connection, getProjectNameRSEHR());
        Assert.assertTrue(response.getStatusCode() < 400);

        runEmailETL();

        log("Select first 2 samples and batch complete");
        //this clears out email messages
        enableEmailRecorder();
        navigateToFolder(PROJECT_NAME_EHR, PROJECT_NAME_EHR);
        waitAndClickAndWait(Locator.linkWithText("vl_sample_queue"));
        //select rows where accnt is 107
        DataRegionTable table = new DataRegionTable("query", this);
        table.setFilter("Funding_string", "Equals", ACCOUNT_STR_4);
        //get index where account is 108, then expect to see one email
        //index doesn't change so we have to rely on the consistency of the test data / grid index
        waitAndClick(Locator.checkboxByNameAndValue(".select", "6")); //for some reason waitAndClickAndWait() didn't work here
        waitAndClick(Locator.checkboxByNameAndValue(".select", "7"));
        waitAndClick(Locator.lkButton("Batch Complete Samples"));
        //select the dropdown arrow to select qc state
        waitAndClick(Locator.xpath("//div[contains(@class, 'x4-trigger-index-0')]"));
        Locator.XPathLocator RSEHRQCStateSelectItem = Locator.tagContainingText("li", RSEHR_QC_CODE).notHidden().withClass("x4-boundlist-item");
        click(RSEHRQCStateSelectItem);
        Locator.name("enter-experiment-number-inputEl").findElement(getDriver()).sendKeys("1000");
        Locator.name("enter-positive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-vlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("enter-avgvlpositive-control-inputEl").findElement(getDriver()).sendKeys("2");
        Locator.name("efficiency-inputEl").findElement(getDriver()).sendKeys("2");
        clickAndWait(Ext4Helper.Locators.ext4Button("Submit"));

        sleep(5000);
        log("Check that the RSEHR notification email was sent");
        goToModule("Dumbster");
        EmailRecordTable mailTable = new EmailRecordTable(this);
        Assert.assertEquals(TEST_USER_2, mailTable.getMessageWithSubjectContaining("Viral load results completed").getTo()[0]);

        waitAndClick(Locator.linkContainingText("[EHR Server] Viral load results completed on"));
        assertTextPresent("2 sample(s)");
        waitAndClick(Locator.linkWithText("link"));
        impersonate(TEST_USER_2);
        waitForText(ANIMAL_ID_4);
        assertTextPresent(ANIMAL_ID_4);
        assertTextPresent(ANIMAL_ID_4b);
        stopImpersonating();

    }

}
