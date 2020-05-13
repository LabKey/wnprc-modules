/*
 * Copyright (c) 2012-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.test.tests.wnprc_ehr;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.SortDirection;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.components.html.SiteNavBar;
import org.labkey.test.pages.ehr.AnimalHistoryPage;
import org.labkey.test.pages.ehr.EHRAdminPage;
import org.labkey.test.pages.ehr.NotificationAdminPage;
import org.labkey.test.tests.ehr.AbstractGenericEHRTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.ExtHelper;
import org.labkey.test.util.FileBrowserHelper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.SchemaHelper;
import org.labkey.test.util.TextSearcher;
import org.labkey.test.util.ehr.EHRTestHelper;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.ext4cmp.Ext4FileFieldRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.labkey.test.util.external.labModules.LabModuleHelper;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.WebTestHelper.buildURL;
import static org.labkey.test.components.ext4.RadioButton.RadioButton;
import static org.labkey.test.util.Ext4Helper.TextMatchTechnique.CONTAINS;

/**
 * This should contain tests designed to validate EHR data entry or associated business logic.
 * NOTE: EHRApiTest may be a better location for tests designed to test server-side trigger scripts
 * or similar business logic.
 */
@Category({CustomModules.class, EHR.class})
public class WNPRC_EHRTest extends AbstractGenericEHRTest implements PostgresOnlyTest
{
    public static final String PROJECT_NAME = "WNPRC_TestProject";
    public static final String EHR_FOLDER_PATH = "WNPRC_TestProject/EHR";
    private static final String PRIVATE_FOLDER = "Private";
    private static final String EHR_FOLDER = "EHR";
    private static final String PI_PORTAL = "PI Portal";
    public static final String PI_FOLDER_FOLDER_PATH = "/WNPRC_Units/Operation_Services/Financial_Management/PI Portal";
    public static final String PRIVATE_FOLDER_PATH = "/WNPRC_TestProject/WNPRC_Units/Operation_Services/Financial_Management/Private";
    public static final String PRIVATE_TARGET_FOLDER_PATH = "WNPRC_Units/Operation_Services/Financial_Management/Private";

    private final String ANIMAL_HISTORY_URL = "/ehr/" + PROJECT_NAME + "/EHR/animalHistory.view?";
    protected static final String PROJECT_MEMBER_ID = "test2312318"; // PROJECT_ID's single participant

    private final File ALIASES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/aliases.tsv");
    private static final int ALIASES_NUM_ROWS = 2;

    private final File CHARGEABLE_ITEMS_RATES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRates.tsv");
    private final File CHARGEABLE_ITEMS_RATES_ERROR_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRatesError.tsv");
    private final File CHARGEABLE_ITEMS_RATES_GROUP_CATEGORY_ERROR_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRatesGroupCategoryError.tsv");
    private static final int CHARGE_RATES_NUM_ROWS = 9;
    private static final int CHARGEABLE_ITEMS_NUM_ROWS = 8;

    private final File CHARGEABLE_ITEMS_RATES_UPDATE_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRatesUpdate.tsv");
    private static final int CHARGE_RATES_NUM_UPDATE_ROWS = 12;
    private static final int CHARGEABLE_ITEMS_NUM_UPDATE_ROWS = 11;

    private final File CHARGEABLE_ITEM_CATEGORIES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemCategories.tsv");
    private static final int CHARGEABLE_ITEM_CATEGORIES_NUM_ROWS = 11;

    private final File GROUP_CATEGORY_ASSOCIATIONS_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/groupCategoryAssociations.tsv");
    private static final int GROUP_CATEGORY_ASSOCIATIONS_NUM_ROWS = 11;

    private final File TIER_RATES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/tierRates.tsv");
    private static final int TIER_RATES_NUM_ROWS = 4;

    private final File CHARGE_UNITS_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeUnits.tsv");
    private static final int CHARGE_UNITS_NUM_ROWS = 6;
    private static int BILLING_RUN_COUNT = 0;

    protected EHRTestHelper _helper = new EHRTestHelper(this);
    private SchemaHelper _schemaHelper = new SchemaHelper(this);

    public FileBrowserHelper _fileBrowserHelper = new FileBrowserHelper(this);

    protected DateTimeFormatter _dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Nullable
    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @BeforeClass @LogMethod
    public static void doSetup() throws Exception
    {
        WNPRC_EHRTest initTest = (WNPRC_EHRTest)getCurrentTest();

        initTest.initProject("EHR");
        initTest.createTestSubjects();
        initTest.clickFolder("EHR");
        initTest._containerHelper.enableModules(Arrays.asList("EHR_Billing", "WNPRC_Billing", "WNPRC_BillingPublic"));
        initTest.setModuleProperties(Arrays.asList(new ModulePropertyValue("EHR_Billing", "/" +
                initTest.getProjectName(), "BillingContainer", PRIVATE_FOLDER_PATH)));

        initTest.createFinanceManagementFolders();
        initTest.clickFolder("Private");
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_EHR", "EHR_Billing", "WNPRC_Billing", "WNPRC_BillingPublic"));
        initTest.loadBloodBilledByLookup();
        initTest.addFinanceRelatedWebParts();
        initTest.clickFolder("Private");
        initTest.loadEHRBillingTableDefinitions();

        initTest.clickFolder("Private");
        initTest.createStudyLinkedSchema();
        initTest.createCoreLinkedSchema();
        initTest.createEHRLinkedSchema();

        initTest.clickFolder("EHR");
        initTest.createEHRBillingPublicLinkedSchema();
        initTest.createWNPRCBillingLinkedSchema();
        initTest.goToProjectHome();
        initTest.clickFolder(PI_PORTAL);
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_BillingPublic"));

        initTest.createWNPRCBillingPublicLinkedSchema();

        initTest.clickFolder("PI Portal");
        initTest.addBillingPublicWebParts();

        initTest.uploadBillingDataAndVerify();
    }

    private void uploadBillingDataAndVerify() throws Exception
    {
        log("Check Extensible table columns.");
        checkExtensibleTablesCols();

        log("Upload sample data.");
        uploadData();

        log("Add investigators.");
        addInvestigators();

        log("Provide Billing Data Access.");
        provideBillingDataAccess();

        log("Update new charge rates.");
        updateChargeRates();
    }

    public void goToProjectHome()
    {
        goToProjectHome(PROJECT_NAME);
    }

    private void createFinanceManagementFolders()
    {
        _containerHelper.createSubfolder(getProjectName(), getProjectName(), "WNPRC_Units", "Collaboration", null);
        _containerHelper.createSubfolder(getProjectName(), "WNPRC_Units", "Operation_Services", "Collaboration", null);
        _containerHelper.createSubfolder(getProjectName(), "Operation_Services", "Financial_Management", "Collaboration", null);
        _containerHelper.createSubfolder(getProjectName(), "Financial_Management", "Private", "Collaboration", null);
        _containerHelper.createSubfolder(getProjectName(), "Financial_Management", "PI Portal", "Collaboration", null);
    }

    private void loadBloodBilledByLookup() throws IOException, CommandException
    {
        goToEHRFolder();
        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr_lookups", "lookups");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("set_name", "blood_billed_by");
        rowMap.put("value", "a");
        rowMap.put("description", "Animal Care");
        insertCmd.addRow(rowMap);

        rowMap = new HashMap<>();
        rowMap.put("set_name", "blood_billed_by");
        rowMap.put("value", "n");
        rowMap.put("description", "Neither");
        insertCmd.addRow(rowMap);

        rowMap = new HashMap<>();
        rowMap.put("set_name", "blood_billed_by");
        rowMap.put("value", "c");
        rowMap.put("description", "SPI");
        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, EHR_FOLDER_PATH);
    }

    private void addFinanceRelatedWebParts()
    {
        log("Add Finance Related Web Parts.");
        beginAt(buildURL("project", getBillingContainerPath(), "begin"));

        //enable Page Admin Mode
        new SiteNavBar(getDriver()).enterPageAdminMode();

        //add WNPRC Finance webpart
        (new PortalHelper(this)).addWebPart("WNPRC Finance");

        //add WNPRC Finance Admin webpart
        (new PortalHelper(this)).addWebPart("WNPRC Finance Admin");
    }

    private void addBillingPublicWebParts()
    {
        log("Add WNPRC Billing PI Portal Section to PI Portal page.");

        //enable Page Admin Mode
        new SiteNavBar(getDriver()).enterPageAdminMode();

        //add WNPRC Billing PI Portal webpart
        (new PortalHelper(this)).addWebPart("WNPRC Billing PI Portal");
    }

    private void createStudyLinkedSchema()
    {
        log("Creating studyLinked Schema");
        _schemaHelper.setQueryLoadTimeout(60000);
        _schemaHelper.createLinkedSchema(getProjectName(), PRIVATE_TARGET_FOLDER_PATH,
                "studyLinked", "/"+EHR_FOLDER_PATH, "studyLinked", null,
                null, null);
    }

    private void createCoreLinkedSchema()
    {
        log("Creating coreLinked Schema");
        _schemaHelper.setQueryLoadTimeout(30000);
        _schemaHelper.createLinkedSchema(getProjectName(), PRIVATE_TARGET_FOLDER_PATH,
                "coreLinked", "/"+EHR_FOLDER_PATH, "coreLinked", null,
                null, null);
    }

    private void createEHRLinkedSchema()
    {
        log("Creating ehrLinked Schema");
        _schemaHelper.setQueryLoadTimeout(30000);
        _schemaHelper.createLinkedSchema(getProjectName(), PRIVATE_TARGET_FOLDER_PATH,
                "ehrLinked", "/"+EHR_FOLDER_PATH, "ehrLinked", null,
                null, null);
    }

    private void createEHRBillingPublicLinkedSchema()
    {
        log("Creating ehr_billing_public Linked Schema");
        _schemaHelper.setQueryLoadTimeout(20000);
        _schemaHelper.createLinkedSchema(getProjectName(), "EHR",
                "ehr_billing_public", PRIVATE_FOLDER_PATH, "ehr_billing_public", null,
                null, null);
    }

    private void createWNPRCBillingLinkedSchema()
    {
        log("Creating wnprc_billingLinked Linked Schema");
        _schemaHelper.setQueryLoadTimeout(20000);
        _schemaHelper.createLinkedSchema(getProjectName(), "EHR",
                "wnprc_billingLinked", PRIVATE_FOLDER_PATH, "wnprc_billingLinked", null,
                null, null);
    }

    private void createWNPRCBillingPublicLinkedSchema()
    {
        log("Creating wnprc_billing_public Linked Schema");
        _schemaHelper.setQueryLoadTimeout(20000);
        _schemaHelper.createLinkedSchema(getProjectName(), PI_FOLDER_FOLDER_PATH,
                "wnprc_billing_public", PRIVATE_FOLDER_PATH, "wnprc_billing_public", null,
                null, null);
    }

    private void loadEHRBillingTableDefinitions()
    {
        log("Load EHR_Billing Table Definitions");
        clickButton("Load EHR Billing table definitions", 0);
        checkMessageWindow("Success", "EHR Billing tables updated successfully.", "OK");
    }

    private void checkMessageWindow(String title, @Nullable String bodyText, String buttonText)
    {
        Window msgWindow = new Window.WindowFinder(this.getDriver()).withTitle(title).waitFor();
        assertEquals("Message window Title mismatch", title, msgWindow.getTitle());

        if(null != bodyText)
            assertEquals("Message window Body Text mismatch", bodyText, msgWindow.getBody());

        msgWindow.clickButton(buttonText, 0);
    }

    public void importStudy()
    {
        goToManageStudy();

        importStudyFromZip(STUDY_ZIP);
    }

    @Override
    protected boolean doSetUserPasswords()
    {
        return true;
    }

    @Test
    public void testBilling() throws IOException, CommandException
    {
        log("Enter misc charges via data entry form.");
        enterCharges();

        log("Perform Billing Run.");
        performBillingPeriodRun();

        log("View and download JET");
        viewJET();

        log("View and download invoice PDF.");
        viewPDF("downloadPDF");

        log("View Billing Queries");
        viewBillingQueries();

        log("Verify notification link");
        testBillingNotification();

        log("Download Summary Invoice PDF");
        viewPDF("summarizedPDF");

        log("Verify payments received for invoice runs");
        testPaymentsReceived();

        log("Testing investigator facing links");
        testInvestigatorFacingLinks();

        log("View Charges and adjustments Not Yet Billed");
        List<String> expectedRowData = Arrays.asList("test2312318", "2011-09-15", "640991", " ", "vaccine supplies", "Misc. Fees", "Clinical Pathology", " ", "acct101", "10.0", "$15.00", "charge 2 with animal id");
        viewChargesAdjustmentsNotYetBilled(1, "comment", "charge 2 with animal id", expectedRowData);

        log("Download Multiple Invoices");
        testDownloadMultipleInvoices();

        log("Delete invoice runs");
        testDeleteInvoiceRuns();
    }

    @Test
    public void testBulkEditChargesWithAnimalIds() throws IOException, CommandException
    {
        String comment = "Charges with Animal Ids added via bulk edit.";
        String msg = "You are about to set values for 2 fields on 5 records. Do you want to do this?";

        log ("Animals with Charge Ids - Bulk Edit via Add Batch");
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges with Animal Ids"));
        Ext4GridRef miscChargesGrid = _helper.getExt4GridForFormSection("Misc. Charges");
        miscChargesGrid.clickTbarButton("Add Batch");
        waitForElement(Ext4Helper.Locators.window("Choose Animals"));
        Ext4FieldRef.getForLabel(this, "Id(s)").setValue(StringUtils.join(MORE_ANIMAL_IDS, ";"));
        Ext4FieldRef.getForLabel(this, "Bulk Edit Before Applying").setChecked(true);
        waitAndClick(Ext4Helper.Locators.window("Choose Animals").append(Ext4Helper.Locators.ext4Button("Submit")));
        Locator.XPathLocator bulkEditWindow = Ext4Helper.Locators.window("Bulk Edit");
        fillBulkEditForm(bulkEditWindow, miscChargesGrid, true);

        assertEquals("Debit account derived in Bulk Edit does not match the Data Entry Grid:", "acct100", miscChargesGrid.getFieldValue(1, "debitedAccount"));
        assertEquals("Total Cost calculated in Bulk Edit does not match the Data Entry Grid:", "50", miscChargesGrid.getFieldValue(1, "totalCost").toString());

        assertEquals("Animals added via Add Batch and rows in Data Entry grid do not match:", miscChargesGrid.getRowCount(), MORE_ANIMAL_IDS.length);

        log ("Add comment via More Options --> Bulk Edit");
        addCommentViaBulkEdit(bulkEditWindow, miscChargesGrid, comment, MORE_ANIMAL_IDS.length, msg);

        log ("Submit " + comment);
        submitForm();

        log ("Verify entered charges in Misc Charges table");
        List<String> expectedRowData = Arrays.asList("test1020148", LocalDateTime.now().format(_dateTimeFormatter), "795644", "Snow, Jon", "Blood draws", "Blood Draws", "Business Office", " ", "acct100", "5.0", "$10.00", comment);
        viewChargesAdjustmentsNotYetBilled(MORE_ANIMAL_IDS.length, "comment", comment, expectedRowData);
    }

    private void addCommentViaBulkEdit(Locator.XPathLocator bulkEditWindow, Ext4GridRef grid, String comment, int numRows, String msg)
    {
        grid.clickTbarButton("Select All");
        openBulkEditWindowViaMoreActions(bulkEditWindow, grid);
        _helper.toggleBulkEditField("Comment");
        _ext4Helper.queryOne("window field[fieldLabel=Comment]", Ext4ComboRef.class).setValue(comment);
        waitAndClick(bulkEditWindow.append(Ext4Helper.Locators.ext4Button("Submit")));
        checkMessageWindow("Set Values", msg, "Yes");
        grid.waitForRowCount(numRows);
    }

    private void openBulkEditWindowViaMoreActions(Locator.XPathLocator bulkEditWindow, Ext4GridRef grid)
    {
        grid.clickTbarButton("More Actions");
        click(Ext4Helper.Locators.menuItem("Bulk Edit"));
        waitForElement(bulkEditWindow);
    }

    private void fillBulkEditForm(Locator.XPathLocator bulkEditWindow, Ext4GridRef grid, boolean hasAnimalId)
    {
        waitForElement(bulkEditWindow);

        log ("Toggle fields");
        if (hasAnimalId)
        {
            _helper.toggleBulkEditField("Project");
        }
        else
        {
            _helper.toggleBulkEditField("Debit Account");
        }
        _helper.toggleBulkEditField("Date of Charge");

        if (Ext4FieldRef.getForLabel(this, "Date of Charge").getValue() == null)
        {
            Ext4FieldRef.getForLabel(this, "Date of Charge").setValue(LocalDateTime.now().format(_dateTimeFormatter));
        }

        _helper.toggleBulkEditField("Investigator");
        _helper.toggleBulkEditField("Group");
        _helper.toggleBulkEditField("Charge Item");
        _helper.toggleBulkEditField("Quantity");
        _helper.toggleBulkEditField("Unit Cost");

        log("Set and Reset fields");

        if (hasAnimalId)
        {
            log("Set Project");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Project:"), Ext4Helper.TextMatchTechnique.CONTAINS, "640991");

            log ("Set Investigator");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Investigator:"), "Stark, Sansa");

        }
        else
        {
            log ("Set Debit Account");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Debit Account:"), Ext4Helper.TextMatchTechnique.CONTAINS, "101");

            log ("Set Investigator");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Investigator:"), Ext4Helper.TextMatchTechnique.CONTAINS, "Snow, Jon");

        }

        if (hasAnimalId)
        {
            log ("Reset Project");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Project:"), Ext4Helper.TextMatchTechnique.CONTAINS, "795644");

            log ("Reset Investigator");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Investigator:"), Ext4Helper.TextMatchTechnique.CONTAINS, "Snow, Jon");
        }
        else
        {
            log ("Set Debit Account");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Debit Account:"), Ext4Helper.TextMatchTechnique.CONTAINS, "100");

            log ("Set Investigator");
            _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Investigator:"), Ext4Helper.TextMatchTechnique.CONTAINS, "Stark, Sansa");

        }

        log ("Set Group");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Group:"), Ext4Helper.TextMatchTechnique.CONTAINS, "Clinical Pathology");

        log ("Set Charge Item");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Charge Item:"), Ext4Helper.TextMatchTechnique.CONTAINS, "vaccine supplies");

        log ("Reset Group");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Group:"), Ext4Helper.TextMatchTechnique.CONTAINS, "Business Office");

        log ("Reset Charge Item");
        _ext4Helper.selectComboBoxItem( Ext4Helper.Locators.formItemWithLabelContaining("Charge Item:"), Ext4Helper.TextMatchTechnique.CONTAINS, "Blood draws");
        sleep(1000);

        String unitCost = Ext4FieldRef.getForLabel(this, "Unit Cost").getValue().toString();
        assertEquals("Unit cost mismatch:", unitCost, "10");

        Ext4FieldRef.getForLabel(this, "Quantity").setValue(5);

        waitAndClick(bulkEditWindow.append(Ext4Helper.Locators.ext4Button("Submit")));
    }

    @Test
    public void testBulkEditChargesWithoutAnimalIds() throws IOException, CommandException
    {
        String msg = "You are about to set values for 2 fields on 2 records. Do you want to do this?";
        String comment = "Charges without Animal Ids added via bulk edit.";

        log ("Animals without Charge Ids - Bulk Edit via More Options --> Bulk Edit");
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges without Animal Ids"));
        Ext4GridRef miscChargesGrid = _helper.getExt4GridForFormSection("Misc. Charges");
        _helper.addRecordToGrid(miscChargesGrid);
        _helper.addRecordToGrid(miscChargesGrid);
        miscChargesGrid.clickTbarButton("Select All");
        Locator.XPathLocator bulkEditWindow = Ext4Helper.Locators.window("Bulk Edit");
        openBulkEditWindowViaMoreActions(bulkEditWindow, miscChargesGrid);
        fillBulkEditForm(bulkEditWindow, miscChargesGrid, false);

        Window msgWindow = new Window.WindowFinder(this.getDriver()).withTitle("Set Values").waitFor();
        msgWindow.clickButton("Yes", 0);

        assertEquals("Total Cost calculated in Bulk Edit does not match the Data Entry Grid:", "50", miscChargesGrid.getFieldValue(1, "totalCost").toString());
        assertEquals("Animals added via More Actions --> Add Batch and rows in Data Entry grid do not match:", miscChargesGrid.getRowCount(), 2);

        log ("Add comment via More Options --> Bulk Edit");
        addCommentViaBulkEdit(bulkEditWindow, miscChargesGrid, comment, 2, msg);

        log ("Submit " + comment);
        submitForm();

        log ("Verify non-animal charges entered via Bulk Edit in Misc Charges table");
        List<String> expectedRowData = Arrays.asList(" ", LocalDateTime.now().format(_dateTimeFormatter), " ", "Stark, Sansa", "Blood draws", "Blood Draws", "Business Office", " ", "acct100", "5.0", "$10.00", comment);
        viewChargesAdjustmentsNotYetBilled(2, "comment", comment, expectedRowData);

    }

    private void testBillingNotification()
    {
        log("Setup the LDK notification service for this container");
        goToEHRFolder();
        EHRAdminPage ehrAdminPage = EHRAdminPage.beginAt(this, getContainerPath());
        NotificationAdminPage notificationAdminPage = ehrAdminPage.clickNotificationService(this);
        notificationAdminPage.setNotificationUserAndReplyEmail(DATA_ADMIN_USER);
        notificationAdminPage.enableBillingNotification("status_org.labkey.ehr_billing.notification.BillingNotification");
        notificationAdminPage.addManageUsers("org.labkey.ehr_billing.notification.BillingNotification", "EHR Administrators");

        log("Running report in the browser");
        notificationAdminPage.clickRunReportInBrowser("Billing Notification");
        verifyChargeSummary("Blood Draws", 2);
        verifyChargeSummary("Misc. Charges", 1);
        verifyChargeSummary("Per Diems", 1);

        goBack(WAIT_FOR_PAGE);
    }

    private void verifyChargeSummary(String category, int rowCount)
    {
        log("Verifying the " + category);
        pushLocation();
        clickAndWait(Locator.linkWithText(category));
        DataRegionTable table = new DataRegionTable("query", getDriver());
        assertEquals("Wrong number of rows in " + category, rowCount, table.getDataRowCount());
        popLocation();
    }

    private void testInvestigatorFacingLinks() throws IOException, CommandException
    {
        navigateToFolder(PROJECT_NAME, PI_PORTAL);
        log("Give EHR Lab Read access to PI Portal folder.");
        _permissionsHelper.setPermissions("EHR Lab", "ReaderRole");

        navigateToFolder(PROJECT_NAME, PI_PORTAL);
        log("Impersonate as investigator@ehrstudy.test");
        impersonate(INVESTIGATOR.getEmail());
        waitForElement(Locator.linkWithText("00640991"));

        log("Validate num of rows for investigator");
        DataRegionTable projects = new DataRegionTable("PIPortalProjects", getDriver());
        List<String> expectedRowData = Arrays.asList("00640991", "dummyprotocol");
        List<String> actualRowData = projects.getRowDataAsText(0, "project", "protocol");
        assertEquals("Wrong row data for Projects ", expectedRowData, actualRowData);

        log("Validating project link");
        click(Locator.linkContainingText("00640991"));//takes user to a new window
        switchToWindow(1);

        DataRegionTable invoicedItemsByProject = new DataRegionTable("query", getDriver());
        expectedRowData = Arrays.asList("2010-10-01", "2010-10-31", "00640991", "46.00",	"$1,028.95");
        actualRowData = invoicedItemsByProject.getRowDataAsText(0, "invoiceId/billingPeriodStart", "invoiceId/billingPeriodEnd", "project", "numItems", "total");
        assertEquals("Wrong row data for invoicedItemsByProject ", expectedRowData, actualRowData);

        log("Validating Summary By Item's total sum value");
        clickAndWait(Locator.linkContainingText("Summary By Item"));
        assertTextPresent("Sum", "$1,028.95");

        goBack();

        clickAndWait(Locator.linkContainingText("All Items"));
        DataRegionTable invoicedItems = new DataRegionTable("query", getDriver());
        assertEquals("Wrong row count", 5, invoicedItems.getDataRowCount());
        log("Validating Totals");
        assertTextPresent("$806.00", "$13.00", "$1.95", "$195.00");

        stopImpersonating();
    }

    public int getUserId(String email) throws IOException, CommandException
    {
        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        SelectRowsCommand sr = new SelectRowsCommand("core", "Users");
        sr.addFilter(new Filter("Email", email));
        SelectRowsResponse resp = sr.execute(cn, getProjectName());

        int userid = -1;
        List<Map<String, Object>> rows = resp.getRows();
        if(rows.size() == 1)
        {
            for (Map<String, Object> row : rows)
            {
                return (int) row.get("userid");
            }
        }
        return userid;
    }

    public int getInvestigatorId(int userId) throws IOException, CommandException
    {
        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        SelectRowsCommand sr = new SelectRowsCommand("ehr", "investigators");
        sr.addFilter(new Filter("userid", userId));
        SelectRowsResponse resp = sr.execute(cn, EHR_FOLDER_PATH);

        int investigatorId = -1;
        List<Map<String, Object>> rows = resp.getRows();
        if(rows.size() == 1)
        {
            for (Map<String, Object> row : rows)
            {
                return (int) row.get("rowid");
            }
        }
        return investigatorId;
    }

    private void addInvestigators() throws IOException, CommandException
    {
        log("Add investigators to ehr.investigators table.");

        navigateToFolder(PROJECT_NAME, EHR_FOLDER);

        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        log("Inserting Principal Investigator Jon Snow.");

        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr", "investigators");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("firstName", "Jon");
        rowMap.put("lastName", "Snow");
        rowMap.put("emailAddress", INVESTIGATOR_PRINCIPAL.getEmail());
        rowMap.put("userid", getUserId(INVESTIGATOR_PRINCIPAL.getEmail()));
        insertCmd.addRow(rowMap);

        log("Inserting Junior Investigator Sansa Stark.");
        rowMap = new HashMap<>();
        rowMap.put("firstName", "Sansa");
        rowMap.put("lastName", "Stark");
        rowMap.put("emailAddress", INVESTIGATOR.getEmail());
        rowMap.put("userid", getUserId(INVESTIGATOR.getEmail()));
        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, EHR_FOLDER_PATH);

        log("Investigators inserted in to ehr.investigators table.");

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        clickAndWait(Locator.bodyLinkContainingText("Grant Accounts - ALL"));
        DataRegionTable aliases = new DataRegionTable("query", getDriver());
        aliases.setSort("alias", SortDirection.ASC);
        log("Update Grant Account with Investigator 'Stark'");
        updateRecordsAndVerify(aliases, 0, "Investigator:", "Stark, Sansa", "investigatorId");
        log("Update Grant Account with Investigator 'Snow'");
        updateRecordsAndVerify(aliases, 1, "Investigator:", "Snow, Jon", "investigatorId");

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        clickAndWait(Locator.bodyLinkContainingText("WNPRC Projects"));
        DataRegionTable projects = new DataRegionTable("query", getDriver());
        projects.setSort("project", SortDirection.ASC);
        log("Update Project with Investigator 'Stark'");
        updateRecordsAndVerify(projects, 0, "Investigator:", "Stark, Sansa", "investigatorId");
        log("Update Project with Investigator 'Snow'");
        updateRecordsAndVerify(projects, 1, "Investigator:", "Snow, Jon", "investigatorId");
    }

    private void updateRecordsAndVerify(DataRegionTable table, int rowNum, String inputLabel, String inputValue, String inputName)
    {
        table.clickEditRow(rowNum);
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining(inputLabel), Ext4Helper.TextMatchTechnique.CONTAINS, inputValue);
        clickButton("Submit",0);
        checkMessageWindow("Success", "Your upload was successful!", "OK");

        log("Verify '" + inputLabel + "' value '" + inputValue + "' was inserted.");
        List<String> actualRowData = table.getRowDataAsText(rowNum, inputName);
        List<String> expectedRowData = Arrays.asList(inputValue);
        assertEquals(inputName + " value not found: ", expectedRowData, actualRowData);
    }

    private void provideBillingDataAccess() throws IOException, CommandException
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        clickAndWait(Locator.bodyLinkContainingText("Access To Billing Data"));
        DataRegionTable dataAccessTable = new DataRegionTable("query", getDriver());
        dataAccessTable.clickInsertNewRow();

        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("User With Access:"), Ext4Helper.TextMatchTechnique.CONTAINS, _userHelper.getDisplayNameForEmail(INVESTIGATOR.getEmail()));
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Investigator:"), Ext4Helper.TextMatchTechnique.CONTAINS, "Stark, Sansa");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithLabelContaining("Project:"), Ext4Helper.TextMatchTechnique.CONTAINS, "640991");
        _ext4Helper.checkCheckbox("Access to all projects?:");
        clickButton("Submit",0);
        checkMessageWindow("Error", "Must choose 'Project' or check 'Access to all projects' but not both.", "OK");
        _ext4Helper.uncheckCheckbox("Access to all projects?:");
        clickButton("Submit",0);

        log("Verify row insert in ehr_billing.dataAccess.");
        List<String> actualRowData = dataAccessTable.getRowDataAsText(0, "investigatorid", "userId", "project", "alldata");
        List<String> expectedRowData = Arrays.asList("Stark, Sansa", "investigator", "640991", "No");
        assertEquals("Data access row not inserted as expected: " , expectedRowData, actualRowData);
    }

    private void viewBillingQueries()
    {
        String startDate="09%2F01%2F2011";
        String endDate="09%2F30%2F2011";
//        clickAndWait(Locator.bodyLinkContainingText("View Billing Queries"), WAIT_FOR_JAVASCRIPT); //firefox45 on teamcity does not load this page.

        navigateToFolder(PROJECT_NAME, EHR_FOLDER);
        log("Verify misc charges");
        beginAt(String.format("query/%s/executeQuery.view?schemaName=wnprc_billing&query.queryName=miscChargesFeeRates&query.param.StartDate=%s&query.param.EndDate=%s", getContainerPath(), startDate, endDate));
        DataRegionTable miscChargesFeeRates = new DataRegionTable("query", this);
        List<String> expectedRowData = Arrays.asList(PROJECT_MEMBER_ID, "2011-09-15", "640991", "acct101", "$19.50", "10.0", "$195.00", getDisplayName());
        List<String> actualRowData = miscChargesFeeRates.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "unitCost", "quantity", "totalCost", "createdby");
        assertEquals("Wrong row data for Misc Charges: ", expectedRowData, actualRowData);
        assertEquals("One row should be displayed", miscChargesFeeRates.getDataRowCount(), 1);

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        log("Verify per diems");
        beginAt(String.format("query%s/executeQuery.view?schemaName=wnprc_billing&query.queryName=perDiemFeeRates&query.param.StartDate=%s&query.param.EndDate=%s", PRIVATE_FOLDER_PATH, startDate, endDate));
        DataRegionTable perDiemFeeRates = new DataRegionTable("query", this);
        expectedRowData = Arrays.asList(PROJECT_MEMBER_ID, "2011-09-01 00:00", "640991", "acct101", "$26.00", "30.0", "0.3", "$780.00");
        actualRowData = perDiemFeeRates.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "unitCost", "quantity", "tierRate", "totalCost");
        assertEquals("Wrong row data for Per Diems: ", expectedRowData, actualRowData);
        assertEquals("One row should be displayed", perDiemFeeRates.getDataRowCount(), 1);

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        log("Verify blood draws");
        beginAt(String.format("query%s/executeQuery.view?schemaName=wnprc_billing&query.queryName=procedureFeeRates&query.param.StartDate=%s&query.param.EndDate=%s", PRIVATE_FOLDER_PATH, startDate, endDate));
        DataRegionTable procedureFeeRates = new DataRegionTable("query", this);
        expectedRowData = Arrays.asList(PROJECT_MEMBER_ID, "2011-09-27 09:30", "00640991", "acct101", "$13.00", "1", "0.3", "$13.00", " ");
        actualRowData = procedureFeeRates.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "unitCost", "quantity", "tierRate", "totalCost", "performedby");
        assertEquals("Wrong row data for Procedure Fee Rates/Blood Draws: ", expectedRowData, actualRowData);
        assertEquals("Two rows should be displayed", procedureFeeRates.getDataRowCount(), 2);
    }

    private void viewChargesAdjustmentsNotYetBilled(int numRows, String filterCol, String filterVal, List<String> expectedRowData)
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);

        clickAndWait(Locator.bodyLinkContainingText("View Charges and Adjustments Not Yet Billed"));

        DataRegionTable notBilled = new DataRegionTable("query", getDriver());
        notBilled.setFilter(filterCol, "Equals", filterVal);
        notBilled.setSort("Id", SortDirection.ASC);

        DataRegionTable table = new DataRegionTable("query", getDriver());

        List<String> actualRowData = notBilled.getRowDataAsText(0, "Id", "date", "project", "investigator", "chargeId/name", "chargeId/chargeCategoryId/name", "chargeGroup", "chargetype", "debitedaccount", "quantity", "unitCost", "comment");

        assertEquals("Wrong number of rows for misc charges not billed for '" + filterVal + "': ", numRows, notBilled.getDataRowCount());
        assertEquals("Wrong row data for misc charges not billed: ", expectedRowData, actualRowData);
    }

    private void viewJET()
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);

        DataRegionTable invoiceRunsDataRegionTable = getInvoiceRunsDataRegionTable();
        invoiceRunsDataRegionTable.link(0, "viewJETInvoice").click();

        DataRegionTable jetRegionTable  = new DataRegionTable("query", this);
        assertEquals("Wrong jet item count",1,jetRegionTable.getDataRowCount());

        invoiceRunsDataRegionTable = getInvoiceRunsDataRegionTable();
        DataRegionTable finalInvoiceRunsDataRegionTable = invoiceRunsDataRegionTable;
        File csv = doAndWaitForDownload(() -> {
            finalInvoiceRunsDataRegionTable.link(0, "downloadJetCsv").click();
        });
        TextSearcher tsvSearcher = new TextSearcher(() -> TestFileUtils.getFileContents(csv)).setSearchTransformer(t -> t);
        assertTextPresentInThisOrder(tsvSearcher, "NSCT", "Primate Center OCT", "-94.8", "1010Set Project");
    }

    private DataRegionTable getInvoiceRunsDataRegionTable()
    {
        goToSchemaBrowser();
        return viewQueryData("ehr_billing", "invoiceRuns");
    }

    private void viewPDF(String pdfName)
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);

        goToSchemaBrowser();
        DataRegionTable dataRegionTable = viewQueryData("ehr_billing", "invoiceExternal");

        log("Download "+ (pdfName.equalsIgnoreCase("downloadPDF") ? "Invoice PDF.": "Summary PDF."));
        File pdf = doAndWaitForDownload(() -> dataRegionTable.link(0, pdfName).click());

        assertTrue("Wrong file type for export pdf [" + pdf.getName() + "]", pdf.getName().endsWith(".pdf"));
        assertTrue("Empty pdf downloaded [" + pdf.getName() + "]", pdf.length() > 0);
    }

    public String getBillingContainerPath()
    {
        return getProjectName() + "/WNPRC_Units/Operation_Services/Financial_Management/Private/";
    }

    private void enterCharges()
    {
        Map<String, String> mapWithAnimalId = new LinkedHashMap<>();
        mapWithAnimalId.put("Id", PROJECT_MEMBER_ID);
        mapWithAnimalId.put("date", "2010-10-23");
        mapWithAnimalId.put("project", PROJECT_ID);
        mapWithAnimalId.put("chargeGroup", "Clinical Pathology");
        mapWithAnimalId.put("chargeId", "vaccine supplies");
        mapWithAnimalId.put("quantity", "10");
        mapWithAnimalId.put("chargetype", "Adjustment");
        mapWithAnimalId.put("comment", "charge 1 with animal id");

        Map<String, String> mapWithDebitAcct = new LinkedHashMap<>();
        mapWithDebitAcct.put("debitedaccount", ACCOUNT_ID_1);
        mapWithDebitAcct.put("date", "2010-10-23");
        mapWithDebitAcct.put("chargeGroup", "Business Office");
        mapWithDebitAcct.put("chargeId", "Blood draws - Additional Tubes");
        mapWithDebitAcct.put("quantity", "8");
        mapWithDebitAcct.put("chargetype", "Adjustment");
        mapWithDebitAcct.put("comment", "charge 1 without animal id");

        Map<String, String> mapWithDebitAcct2 = new LinkedHashMap<>();
        mapWithDebitAcct2.put("debitedaccount", ACCOUNT_ID_1);
        mapWithDebitAcct2.put("date", "2010-10-22");
        mapWithDebitAcct2.put("chargeGroup", "Clinical Pathology");
        mapWithDebitAcct2.put("chargeId", "vaccine supplies");
        mapWithDebitAcct2.put("quantity", "5");
        mapWithDebitAcct2.put("comment", "charge 2 without animal id");

        Map<String, String> mapWithAnimalId2 = new LinkedHashMap<>();
        mapWithAnimalId2.put("Id", PROJECT_MEMBER_ID);
        mapWithAnimalId2.put("date", "2011-09-15");
        mapWithAnimalId2.put("project", PROJECT_ID);
        mapWithAnimalId2.put("chargeGroup", "Clinical Pathology");
        mapWithAnimalId2.put("chargeId", "vaccine supplies");
        mapWithAnimalId2.put("quantity", "10");
        mapWithAnimalId2.put("comment", "charge 2 with animal id");

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);

        log("Enter Misc. Charges with animal Id.");
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges with Animal Ids"));
        enterChargesInGrid(1, mapWithAnimalId);

        log("Submit & Reload Form");
        sleep(5000);
        submitAndReloadForm();

        log("Enter another Misc. Charges with animal Id");
        enterChargesInGrid(1, mapWithAnimalId2);

        log("Submit the form");
        sleep(5000);
        submitForm();

        log("Enter Misc. Charges with debit account");
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges without Animal Ids"));
        enterChargesInGrid(1, mapWithDebitAcct);

        log("Submit & Reload");
        sleep(5000);
        submitAndReloadForm();

        log("Enter another Misc. Charges with debit account");
        enterChargesInGrid(1, mapWithDebitAcct2);

        log("Submit the form");
        sleep(5000);
        submitForm();

    }

    private void enterChargesInGrid(int rowIndex, Map<String, String> items)
    {
        Ext4GridRef miscChargesGrid = _helper.getExt4GridForFormSection("Misc. Charges");
        _helper.addRecordToGrid(miscChargesGrid);

        Iterator iterator = items.entrySet().iterator();
        while (iterator.hasNext())
        {
            Map.Entry pair = (Map.Entry) iterator.next();
            String colName = pair.getKey().toString();
            String colValue = pair.getValue().toString();
            if (colName.equals("Id") || colName.equals("date") || colName.equals("quantity") || colName.equals("comment"))
                miscChargesGrid.setGridCell(rowIndex, colName, colValue);
            else
                addComboBoxRecord(rowIndex, colName, colValue, miscChargesGrid, CONTAINS);
        }
    }

    private void submitAndReloadForm()
    {
        sleep(2000);
        clickButton("Submit And Reload", 0);
        _extHelper.waitForExtDialog("Finalize Form");
        click(Ext4Helper.Locators.ext4Button("Yes"));
        waitForTextToDisappear("Saving Changes", 5000);
    }

    private void submitForm()
    {
//        new WebDriverWait(getDriver(), 15).until(ExpectedConditions.elementToBeClickable(Locator.button("Submit")));
        sleep(2000);
        clickButton("Submit", 0);
        _extHelper.waitForExtDialog("Finalize Form");
        click(Ext4Helper.Locators.ext4Button("Yes"));
        waitForTextToDisappear("Saving Changes", 5000);
    }
    private void addComboBoxRecord(int rowIndex, String colName, String comboBoxSelectionValue, Ext4GridRef miscChargesGrid,
                                   @Nullable Ext4Helper.TextMatchTechnique matchTechnique)
    {
        Locator chargetype = miscChargesGrid.getCell(rowIndex, colName);
        click(chargetype);
        Locator.XPathLocator chargetypeLocator = Ext4Helper.Locators.formItemWithInputNamed(colName);

        if (matchTechnique != null)
            _ext4Helper.selectComboBoxItem(chargetypeLocator, matchTechnique, comboBoxSelectionValue);
        else
            _ext4Helper.selectComboBoxItem(chargetypeLocator, comboBoxSelectionValue);

    }

    private void checkExtensibleTablesCols()
    {
        checkGrantAccountsColumns("Grant Accounts");
        checkChargeRatesColumns("Standard Rates");
        checkChargeableItemsColumns("Chargeable Items");
    }

    private void checkGrantAccountsColumns(String linkText)
    {
        List<String> expectedColumns = Arrays.asList(
                "alias",
                "isActive",
                "isAcceptingCharges",
                "gencredits",
                "grantNumber",
                "tier_rate",
                "type",
                "budgetStartDate",
                "budgetEndDate",
                "affiliate",
                "investigatorName",
                "investigatorId",
                "contact_name",
                "contact_phone",
                "contact_email",
                "address",
                "city",
                "state",
                "zip",
                "comments",
                "po_number",
                "po_amount",
                "charge_grant_accounts_id",
                "uw_fund",
                "uw_account",
                "uw_udds",
                "uw_class_code",
                "grant_period_end",
                "order_cutoff",
                "successor_account",
                "predecessor_account",
                "mds_number"
        );

        checkColumns(linkText, expectedColumns);
    }

    private void checkChargeRatesColumns(String linkText)
    {
        List<String> expectedColumns = Arrays.asList(
                "chargeId",
                "unitCost",
                "startDate",
                "endDate",
                "genCredits"
        );

        checkColumns(linkText, expectedColumns);
    }

    private void checkChargeableItemsColumns(String linkText)
    {
        List<String> expectedColumns = Arrays.asList(
                "rowid",
                "oldPk",
                "name",
                "chargeCategoryId",
                "departmentCode",
                "comment",
                "active",
                "startDate",
                "endDate"
        );

        checkColumns(linkText, expectedColumns);
    }

    private void checkColumns(String linkText, List<String> expectedColumns)
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        clickAndWait(Locator.bodyLinkContainingText(linkText));
        DataRegionTable results = new DataRegionTable("query", getDriver());
        assertEquals("Wrong columns for " + linkText, expectedColumns, results.getColumnNames());
    }

    private void updateChargeRates()
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        waitForText("Standard Rates");
        clickAndWait(Locator.bodyLinkContainingText("Standard Rates"));

        DataRegionTable drt = new DataRegionTable("query", getDriver());
        drt.clickHeaderButton("Import bulk data");
        waitForText("Format:");

        log("Test for Overlapping date error during data upload");
        String error1 = "ERROR: For charge Item Per diems: Charge item start date (2050-01-01) is after charge item end date (2049-12-31).";
        String error2 = "ERROR: For charge Item Medicine A per dose: Charge rate (2018-05-05 to 2019-12-31) overlaps a previous charge rate (2007-01-01 to 2045-12-31).";
        attemptUploadWithBadData(CHARGEABLE_ITEMS_RATES_ERROR_TSV);

        refresh();

        log("Test for Group-Category association during data upload");
        error1 = "ERROR: 'Scientific Protocol Implementation, Surgery' is not a valid group and category association. If this is a new association, then add this association to ehr_billing.groupCategoryAssociations table by going to 'GROUP CATEGORY ASSOCIATIONS' link on the main Finance page.";
        error2 = "ERROR: 'Clinical Pathology, Surgery' is not a valid group and category association. If this is a new association, then add this association to ehr_billing.groupCategoryAssociations table by going to 'GROUP CATEGORY ASSOCIATIONS' link on the main Finance page.";
        attemptUploadWithBadData(CHARGEABLE_ITEMS_RATES_GROUP_CATEGORY_ERROR_TSV, error1, error2);

        uploadChargeRates(CHARGEABLE_ITEMS_RATES_UPDATE_TSV, CHARGE_RATES_NUM_UPDATE_ROWS, CHARGEABLE_ITEMS_NUM_UPDATE_ROWS);

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        waitForText("Standard Rates");
        clickAndWait(Locator.bodyLinkContainingText("Standard Rates"));
        assertTextPresent("Blood draws", 2);
        assertTextPresent("Per diems", 1);
        assertTextPresent("Medicine A per dose", 2);
        assertTextPresent("vaccine supplies", 4);

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        waitForText("Chargeable Items");
        clickAndWait(Locator.bodyLinkContainingText("Chargeable Items"));
        assertTextPresent("Blood draws", 2);
        assertTextPresent("Per diems", 1);
        assertTextPresent("Medicine A per dose", 2);
        assertTextPresent("vaccine supplies", 3);

    }

    private void attemptUploadWithBadData(File file, String... errors)
    {
        click(Locator.id("uploadFileDiv2Expando"));
        waitForText("Import Lookups by Alternate Key");

        setFormElement(Locator.xpath("//div[@id='uploadFileDiv2']/descendant::input[@name='file']"), file.getPath());
        click(Locator.button("Submit"));

        waitForText("ERROR");
        assertTextPresent(errors);
    }

    private void uploadChargeRates(File file, int rateRows, int itemRows)
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        waitForText("Standard Rates");
        clickAndWait(Locator.bodyLinkContainingText("Standard Rates"));

        DataRegionTable drt = new DataRegionTable("query", getDriver());
        drt.clickHeaderButton("Import bulk data");
        waitForText("Format:");

        click(Locator.id("uploadFileDiv2Expando"));
        waitForText("Import Lookups by Alternate Key");

        setFormElement(Locator.xpath("//div[@id='uploadFileDiv2']/descendant::input[@name='file']"), file.getPath());
        clickButton("Submit");

        waitForText("Standard Rates");
        drt = new DataRegionTable("query", getDriver());
        assertEquals(rateRows, drt.getDataRowCount());

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        clickAndWait(Locator.bodyLinkContainingText("Chargeable Items"));
        drt = new DataRegionTable("query", getDriver());
        assertEquals(itemRows, drt.getDataRowCount());
    }

    private void uploadData() throws IOException, CommandException
    {
        //upload Tier Rates
        importBulkDataFromFile(TIER_RATES_TSV, "Tier Rates", TIER_RATES_NUM_ROWS);
        testExpectedRowCount(TIER_RATES_NUM_ROWS);

        //upload Grant Accounts
        importBulkDataFromFile(ALIASES_TSV, "Grant Accounts - ALL", ALIASES_NUM_ROWS);
        testExpectedRowCount(ALIASES_NUM_ROWS);

        //upload Charge Units
        importBulkDataFromFile(CHARGE_UNITS_TSV, "Groups", CHARGE_UNITS_NUM_ROWS);
        testExpectedRowCount(CHARGE_UNITS_NUM_ROWS);

        //upload Chargeable Item Categories
        importBulkDataFromFile(CHARGEABLE_ITEM_CATEGORIES_TSV, "Chargeable Item Categories", CHARGEABLE_ITEM_CATEGORIES_NUM_ROWS);
        testExpectedRowCount(CHARGEABLE_ITEM_CATEGORIES_NUM_ROWS);

        //upload Group-Category Associations
        importBulkDataFromFile(GROUP_CATEGORY_ASSOCIATIONS_TSV, "Group Category Associations", GROUP_CATEGORY_ASSOCIATIONS_NUM_ROWS);
        testExpectedRowCount(GROUP_CATEGORY_ASSOCIATIONS_NUM_ROWS);

        //upload Chargeable Items and Charge Rates
        uploadChargeRates(CHARGEABLE_ITEMS_RATES_TSV, CHARGE_RATES_NUM_ROWS, CHARGEABLE_ITEMS_NUM_ROWS);

    }

    private void testExpectedRowCount(int expectedNumRows)
    {
        DataRegionTable results = new DataRegionTable("query", getDriver());
        assertEquals("Wrong row count", expectedNumRows, results.getDataRowCount());
    }

    private void importBulkDataFromFile(File file, String linkText, int numRows)
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);

        clickAndWait(Locator.bodyLinkContainingText(linkText));

        DataRegionTable drt = new DataRegionTable("query", getDriver());
        drt.clickHeaderButton("Import bulk data");

        waitForText("Import Data");

        _ext4Helper.clickTabContainingText("Import Spreadsheet");
        waitForText("Upload From File");
        RadioButton().withLabel("Upload From File").find(this.getDriver()).check();

        Ext4FileFieldRef fileField = Ext4FileFieldRef.create(this);
        fileField.setToFile(file);

        waitAndClick(Ext4Helper.Locators.ext4ButtonContainingText("Upload"));

        checkMessageWindow("Success", "Success! " + numRows + " rows inserted.", "OK");
    }

    private void performBillingPeriodRun()
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);

        performBillingRun("10/01/2010", "10/31/2010",++BILLING_RUN_COUNT);
        testInvoicedItems();
        testSummaryReports();
    }

    private void performBillingRun(String startDate, String endDate, int billingRunCount)
    {
        waitAndClickAndWait(Locator.linkContainingText("Perform Billing Run"));
        Ext4FieldRef.waitForField(this, "Start Date");
        Ext4FieldRef.getForLabel(this, "Start Date").setValue(startDate);
        Ext4FieldRef.getForLabel(this, "End Date").setValue(endDate);
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        checkMessageWindow("Success", "Run Started!", "OK");
        waitAndClickAndWait(Locator.linkWithText("All"));
        waitForPipelineJobsToComplete(billingRunCount, "Billing Run", false);
    }

    private void testInvoicedItems()
    {
        testReports("Invoiced Items", 7, "test2312318","640991" , "$19.50", "$15.00",
                "Blood draws - Additional Tubes", "Per diems", "Misc. Fees", "vaccine supplies", "$195.00");
    }

    private void testSummaryReports()
    {
        testReports("Invoice Runs", 1, "2010-10-01", "2010-10-31");
        testReports("Monthly Summary Indirect", 1, "Animal Per Diem", "Blood Draws", "Misc. Fees", "$806.00", "$32.75", "$285.00");
    }

    private void testReports(String linkText, int numRows, String... texts)
    {
        clickFolder(PRIVATE_FOLDER);
        click(Locator.bodyLinkContainingText(linkText));
        DataRegionTable results = new DataRegionTable("query", getDriver());
        assertEquals("Wrong row count", numRows, results.getDataRowCount());
        assertTextPresent(texts);
    }

    public void testDownloadMultipleInvoices()
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        performBillingRun("11/01/2010", "11/10/2010", ++BILLING_RUN_COUNT);

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        performBillingRun("11/11/2010", "11/20/2010", ++BILLING_RUN_COUNT);

        goToSchemaBrowser();
        DataRegionTable dataRegionTable = viewQueryData("ehr_billing", "invoiceExternal");
        dataRegionTable.checkCheckbox(0);
        dataRegionTable.checkCheckbox(1);
        File zip = doAndWaitForDownload(() -> dataRegionTable.clickHeaderButton("Download Invoices"));
        assertTrue("Wrong file type for download invoices [" + zip.getName() + "]", zip.getName().endsWith(".zip"));
        assertTrue("Empty zip downloaded [" + zip.getName() + "]", zip.length() > 0);
    }

    public void testDeleteInvoiceRuns()
    {
        log("Enter Misc Charges");
        Map<String, String> mapWithAnimalId = new LinkedHashMap<>();
        mapWithAnimalId.put("Id", PROJECT_MEMBER_ID);
        mapWithAnimalId.put("date", "2010-11-22");
        mapWithAnimalId.put("project", PROJECT_ID);
        mapWithAnimalId.put("chargeGroup", "Clinical Pathology");
        mapWithAnimalId.put("chargeId", "vaccine supplies");
        mapWithAnimalId.put("quantity", "10");
        mapWithAnimalId.put("chargetype", "Adjustment");
        mapWithAnimalId.put("comment", "charge 1 with animal id");
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        log("Enter Misc. Charges with animal Id.");
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges with Animal Ids"));
        enterChargesInGrid(1, mapWithAnimalId);
        log("Submit the form");
        sleep(5000);
        submitForm();

        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        performBillingRun("11/21/2010", "11/30/2010", ++BILLING_RUN_COUNT);

        goToFinanceFolderTable("Invoiced Items");
        DataRegionTable invoicedItems = new DataRegionTable("query", getDriver());
        int invoicedItemsBeforeDelete = invoicedItems.getDataRowCount();

        goToFinanceFolderTable("Invoice Runs");
        DataRegionTable invoiceRuns = new DataRegionTable("query", getDriver());
        int invoiceRunsBeforeDelete = invoiceRuns.getDataRowCount();
        invoiceRuns.checkCheckbox(0);
        invoiceRuns.clickHeaderButton("Delete");

        assertTextPresent("2 records from invoiced items");
        assertTextPresent("1 records from invoice");
        assertTextPresent("1 invoice records from misc charges");

        clickButton("OK");

        invoiceRuns = new DataRegionTable("query", getDriver());
        assertEquals("Invoiced Run was not deleted", invoiceRuns.getDataRowCount(), invoiceRunsBeforeDelete-1);

        goToFinanceFolderTable("Invoiced Items");
        invoicedItems = new DataRegionTable("query", getDriver());
        assertEquals("Invoiced Items were not deleted", invoicedItems.getDataRowCount(), invoicedItemsBeforeDelete-2);

        navigateToFolder(PROJECT_NAME, EHR_FOLDER);
        goToSchemaBrowser();
        DataRegionTable miscCharges = viewQueryData("ehr_billing", "miscCharges");
        miscCharges.setFilter("date", "Equals", "2010-11-22");
        List<String> invoiceId = miscCharges.getColumnDataAsText("invoiceId");
        assertTrue("invoiceId should be blank after invoice deletion", StringUtils.isBlank(invoiceId.get(0)));
    }

    private void goToFinanceFolderTable(String tableName)
    {
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        waitForText(tableName);
        clickAndWait(Locator.bodyLinkContainingText(tableName));
    }

    @Test
    public void testWeightDataEntry()
    {
        goToEHRFolder();
        saveLocation();
        impersonate(FULL_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));

        log("Create weight measurement task.");
        waitAndClickAndWait(Locator.linkWithText("Enter Weights"));
        WebElement titleEl = waitForElement(Locator.xpath("//input[@name='title' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        waitForFormElementToEqual(titleEl, "Weight");

        setFormElement(Locator.name("title"), TASK_TITLE);
        _extHelper.selectComboBoxItem("Assigned To:", BASIC_SUBMITTER.getGroup() + "\u00A0"); // appended with a nbsp (Alt+0160)
        assertEquals(TASK_TITLE, getFormElement(Locator.name("title")));

        log("Add blank weight entries");
        waitAndClick(Locator.extButtonEnabled("Add Record"));
        waitForElement(Locator.tag("td").withClass("x-grid3-cell-invalid"));
        waitForElement(Locator.xpath("//input[@name='Id' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        // Form input doesn't seem to be enabled yet, so wait
        sleep(500);
        _extHelper.setExtFormElementByLabel("Id:", "noSuchAnimal");
        waitForElement(Locator.tagContainingText("div", "Id not found"), WAIT_FOR_JAVASCRIPT);
        _extHelper.setExtFormElementByLabel("Id:", DEAD_ANIMAL_ID);
        waitForElement(Locator.linkWithText(DEAD_ANIMAL_ID), WAIT_FOR_JAVASCRIPT);

        //these fields seem to be forgetting their values, so verify they show the correct value
        assertEquals(TASK_TITLE, getFormElement(Locator.name("title")));

        waitForElement(Locator.button("Add Batch"), WAIT_FOR_JAVASCRIPT);
        click(Locator.extButton("Add Batch"));
        _extHelper.waitForExtDialog("");
        _extHelper.setExtFormElementByLabel("", "Room(s):", ROOM_ID);
        _extHelper.clickExtButton("", "Submit", 0);
        waitForElement(Locator.tagWithText("div", PROJECT_MEMBER_ID).withClass("x-grid3-cell-inner"), WAIT_FOR_JAVASCRIPT);
        click(Locator.extButton("Add Batch"));
        _extHelper.waitForExtDialog("");
        _extHelper.setExtFormElementByLabel("", "Id(s):", MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1] + ";" + MORE_ANIMAL_IDS[2] + " " + MORE_ANIMAL_IDS[3] + "\n" + MORE_ANIMAL_IDS[4]);
        _extHelper.clickExtButton("", "Submit", 0);
        waitForElement(Locator.tagWithText("div", MORE_ANIMAL_IDS[0]).withClass("x-grid3-cell-inner"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.tagWithText("div", MORE_ANIMAL_IDS[1]).withClass("x-grid3-cell-inner"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.tagWithText("div", MORE_ANIMAL_IDS[2]).withClass("x-grid3-cell-inner"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.tagWithText("div", MORE_ANIMAL_IDS[3]).withClass("x-grid3-cell-inner"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.tagWithText("div", MORE_ANIMAL_IDS[4]).withClass("x-grid3-cell-inner"), WAIT_FOR_JAVASCRIPT);

        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[0], true);
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[1], true);
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[2], true);
        click(Locator.extButton("Delete Selected"));
        _extHelper.waitForExtDialog("Confirm");
        click(Locator.extButton("Yes"));
        waitForElementToDisappear(Locator.tagWithText("div", PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);
        waitForElementToDisappear(Locator.tagWithText("div", MORE_ANIMAL_IDS[0]), WAIT_FOR_JAVASCRIPT);
        waitForElementToDisappear(Locator.tagWithText("div", MORE_ANIMAL_IDS[1]), WAIT_FOR_JAVASCRIPT);

        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[4], true);
        click(Locator.extButton("Duplicate Selected"));
        _extHelper.waitForExtDialog("Duplicate Records");
        _extHelper.clickExtButton("Duplicate Records", "Submit", 0);
        _extHelper.waitForLoadingMaskToDisappear(WAIT_FOR_JAVASCRIPT);
        waitAndClickAndWait(Locator.extButtonEnabled("Save & Close"));

        waitForElement(Locator.tagWithText("em", "No data to show."), WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtTab("All Tasks");
        waitForElement(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")));
        _extHelper.clickExtTab("Tasks By Room");
        waitForElement(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 3, getElementCount(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")));
        _extHelper.clickExtTab("Tasks By Id");
        waitForElement(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 3, getElementCount(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")));
        sleep(1000); //Weird
        stopImpersonating();

        log("Fulfill measurement task");
        impersonate(BASIC_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.linkContainingText(TASK_TITLE));

        String href = getAttribute(Locator.linkWithText(TASK_TITLE), "href");
        beginAt(href); // Clicking link opens in another window.
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-weight-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        waitForTextToDisappear("Loading...", WAIT_FOR_JAVASCRIPT);
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[4], false);
        waitForElement(Locator.linkWithText(MORE_ANIMAL_IDS[4]), WAIT_FOR_JAVASCRIPT);
        click(Locator.extButton("Delete Selected")); // Delete duplicate record. It has served its purpose.
        _extHelper.waitForExtDialog("Confirm");
        click(Locator.extButton("Yes"));
        waitForElement(Locator.tagWithText("div", "No Animal Selected"), WAIT_FOR_JAVASCRIPT);
        _helper.selectDataEntryRecord("weight", PROJECT_MEMBER_ID, false);
        _extHelper.setExtFormElementByLabel("Weight (kg):", "3.333");
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[3], false);
        _extHelper.setExtFormElementByLabel("Weight (kg):", "4.444");
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[4], false);
        _extHelper.setExtFormElementByLabel("Weight (kg):", "5.555");

        waitAndClick(Locator.extButtonEnabled("Submit for Review"));
        _extHelper.waitForExtDialog("Submit For Review");
        _extHelper.selectComboBoxItem("Assign To:", DATA_ADMIN.getGroup());
        _extHelper.clickExtButton("Submit For Review", "Submit");
        waitForElement(Locator.linkWithText("Enter Blood Draws"));

        sleep(1000); // Weird
        stopImpersonating();

        log("Verify Measurements");
        sleep(1000); // Weird
        impersonate(DATA_ADMIN.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtTab("Review Required");
        waitForElement(Locator.xpath("//div[contains(@class, 'review-requested-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'review-requested-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        String href2 = getAttribute(Locator.linkWithText(TASK_TITLE), "href");
        beginAt(href2); // Clicking opens in a new window.
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-weight-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        waitAndClick(Locator.extButtonEnabled("Validate"));
        waitForElement(Locator.xpath("//button[text() = 'Submit Final' and " + Locator.ENABLED + "]"), WAIT_FOR_JAVASCRIPT);
        sleep(1000);
        click(Locator.extButton("Submit Final"));
        _extHelper.waitForExtDialog("Finalize Form");
        _extHelper.clickExtButton("Finalize Form", "Yes");
        waitForElement(Locator.linkWithText("Enter Blood Draws"));

        sleep(1000); // Weird
        stopImpersonating();
        sleep(1000); // Weird

        navigateToFolder(PROJECT_NAME, FOLDER_NAME);
        waitAndClickAndWait(Locator.linkWithText("Browse All Datasets"));
        waitAndClickAndWait(LabModuleHelper.getNavPanelItem("Weight:", "Browse All"));

        (new DataRegionTable("query", this)).setFilter("date", "Equals", DATE_FORMAT.format(new Date()));
        assertTextPresent("3.333", "4.444", "5.555");
        assertEquals("Completed was not present the expected number of times", 6, getElementCount(Locator.xpath("//td[text() = 'Completed']")));
    }

    @Test
    public void testMprDataEntry()
    {
        goToEHRFolder();
        saveLocation();
        impersonate(FULL_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));

        log("Create MPR task.");
        waitAndClickAndWait(Locator.linkWithText("Enter MPR"));
        // Wait for page to fully render.
        waitForElement(Locator.tagWithText("span", "Treatments & Procedures"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.name("Id"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.name("title"), WAIT_FOR_JAVASCRIPT);
        _extHelper.selectComboBoxItem("Assigned To:", BASIC_SUBMITTER.getGroup() + "\u00A0"); // appended with a nbsp (Alt+0160)
        _extHelper.setExtFormElementByLabel("Id:", PROJECT_MEMBER_ID + "\t");
        click(Locator.xpath("//div[./label[normalize-space()='Id:']]//input"));
        waitForElement(Locator.linkWithText(PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT);
        _helper.setDataEntryField("title", MPR_TASK_TITLE);
        waitAndClick(Locator.name("title"));

        waitAndClickAndWait(Locator.extButtonEnabled("Save & Close"));

        waitForElement(Locator.tagWithText("em", "No data to show."), WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtTab("All Tasks");
        //TODO: make these more
        waitForElement(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a").withText(MPR_TASK_TITLE)));
        _extHelper.clickExtTab("Tasks By Room");
        waitForElement(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a").withText(MPR_TASK_TITLE)));
        _extHelper.clickExtTab("Tasks By Id");
        waitForElement(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a").withText(MPR_TASK_TITLE)));
        stopImpersonating();

        // this might be a workaround (not fix) for Issue 22361
        recallLocation();

        log("Fulfill MPR task");
        impersonate(BASIC_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and "+VISIBLE+"]//table"), WAIT_FOR_JAVASCRIPT);
        String href = getAttribute(Locator.linkWithText(MPR_TASK_TITLE), "href");
        beginAt(href);

        // Wait for page to fully render.
        waitForMprPageLoad();

        // NOTE: we have had intermittent failures where the project field does not contain the appropriate project ID.
        // once the form loads, the ID field should populate (which is what we test above).  after it populates, the field will fire the participantchange event.
        // this bubbles to the form, and projectfield listens for this.  next, the project field queries the server to request a new list of project IDs for the ID.
        // i suspect we need a short delay to allow this to happen.  alternately, we could use JS to test the record count of that field's store.

        // NOTE: the change to the Ext4 EHR ProjectField store to autoLoad:false may help this
        try
        {
            _extHelper.selectComboBoxItem("Project:", PROJECT_ID + " (" + DUMMY_PROTOCOL + ")\u00A0");
        }
        catch (NoSuchElementException e)
        {
            // NOTE: there might be a real product bug underlying this; however, on Team City intermittently this combo
            // doesnt seem to populate with the correct like of projects.  This should get triggered to query active projects when the
            // Id field fires the participantchange event (ie. when record is bound).  If there is a bug,
            // it doesnt seem to hit users or at least hasnt been reported.  therefore give it another try to reload:
            log("project field failed to load");

            // my best guess is that we initiate 2 different requests to populate the combo (one blank on load and one with the ID once populated)
            // these happen very close to one another, and in theory they could return out of sequence.

            //switching IDs causes the project field to re-calculate.  this is a workaround, not a fix
            _extHelper.setExtFormElementByLabel("Id:", PROTOCOL_MEMBER_IDS[0] + "\t");
            sleep(1000);
            _extHelper.setExtFormElementByLabel("Id:", PROJECT_MEMBER_ID + "\t");
            sleep(5000);
            _extHelper.selectComboBoxItem("Project:", PROJECT_ID + " (" + DUMMY_PROTOCOL + ")\u00A0");
        }

        //_extHelper.selectComboBoxItem("Type:", "Physical Exam\u00A0");  //this lookup table is not currently populated
        _helper.setDataEntryField("remark", "Bonjour");
        _helper.setDataEntryField("performedby", BASIC_SUBMITTER.getEmail());

        log("Add treatments record.");
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-drug_administration-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        _helper.clickVisibleButton("Add Record");

        //a proxy for when the record has been added and bound to the form
        waitForElement(Locator.xpath("//div[./div/span[text()='Treatments & Procedures']]//input[@name='enddate' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        setFormElementJS(Locator.xpath("//div[./div/span[text()='Treatments & Procedures']]//input[@name='enddate']/..//input[contains(@id, 'date')]"), DATE_FORMAT.format(new Date()));

        waitForElement(Locator.xpath("//div[./div/span[text()='Treatments & Procedures']]//input[@name='code' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        sleep(250);

        _extHelper.selectComboBoxItem("Code:", "Antibiotic");
        sleep(250);

        //this store can take a long time to load, which is problematic for the combo helper
        waitFor(() -> (Boolean) executeScript("return !Ext.StoreMgr.get(\"ehr_lookups||snomed||code||meaning||Drug Administration||code\").isLoading && Ext.StoreMgr.get(\"ehr_lookups||snomed||code||meaning||Drug Administration||code\").getCount() > 0"),
                "SNOMED Store did not load", WAIT_FOR_PAGE * 2);

        //not an ideal solution, but the custom template isnt being selected with the standard helper
        String selection = "amoxicillin (c-54620)";
        click(Locator.xpath("//input[@name='code']/..").append("//*[contains(@class, 'x-form-arrow-trigger')]"));
        Locator.XPathLocator listItem = Locator.xpath("//div").withClass("x-combo-list-item").notHidden().containing(selection);
        executeScript("arguments[0].scrollIntoView(true);", listItem.waitForElement(getDriver(), WAIT_FOR_JAVASCRIPT));
        click(listItem);
        waitForElementToDisappear(Locator.xpath("//div[" + Locator.NOT_HIDDEN + "]/div/div[contains(text(), '" + selection + "')]"), WAIT_FOR_JAVASCRIPT);

        try
        {
            _extHelper.selectComboBoxItem("Route:", "oral\u00a0");
        }
        catch (NoSuchElementException retry)
        {
            // Not all ehr_lookups are cleared by populateInitialData
            // cnprc_ehr/resources/data/routes.tsv has different casing
            WebElement comboListItem = ExtHelper.Locators.comboListItem().withText("ORAL\u00a0").findElementOrNull(getDriver());
            if (comboListItem == null)
                throw retry;
            comboListItem.click();
            shortWait().until(ExpectedConditions.invisibilityOfAllElements(Arrays.asList(comboListItem)));
        }
        _extHelper.selectComboBoxItem(Locator.xpath("//input[@name='conc_units']/.."), "mg/tablet\u00a0");

        // NOTE: there is a timing issue causing this field to not get set properly, which is a long-standing team city problem
        // the workaround below is a ugly hack around this.  the issue doesnt appear to cause actual end-user problems, so not currently worth the extra time
        try
        {
            setDoseConcFields();
        }
        catch (NoSuchElementException e)
        {
            // if we hit the timing error, just give it a second try.
            if (isElementPresent(ExtHelper.Locators.window("Error")))
            {
                _extHelper.clickExtButton("Error", "OK", 0);
                waitForElementToDisappear(ExtHelper.Locators.window("Error"));
            }
            setDoseConcFields();
        }

        _helper.setDataEntryFieldInTab("Treatments & Procedures", "remark", "Yum");

        log("clicking save button and waiting");
        waitAndClickAndWait(Locator.extButtonEnabled("Save & Close"));
        log("MPR save complete");
        waitForElement(Locator.tagWithText("span", "Data Entry"));
        log("returned to data entry page");
        sleep(1500);
        stopImpersonating();
    }

    @Test
    public void testDetailsPages()
    {
        goToEHRFolder();
        waitAndClickAndWait(Locator.linkWithText("Browse All Datasets"));

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Drug Administration");
        waitAndClick(LabModuleHelper.getNavPanelItem("Drug Administration:", VIEW_TEXT));

        waitForText(WAIT_FOR_PAGE * 2, "details");
        DataRegionTable dr = new DataRegionTable("query", this);
        dr.clickRowDetails(0);
        //these are the sections we expect
        waitForText("Drug Details");
        waitForText("Clinical Remarks From ");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Housing");
        waitAndClick(LabModuleHelper.getNavPanelItem("Housing:", VIEW_TEXT));

        waitForText(ROOM_ID2);
        dr = new DataRegionTable("query", this);
        clickAndWait(dr.link(1, "Room"));

        //these are the sections we expect
        waitForText("Cage Details");
        waitForText("Animals Currently Housed");
        waitForText("Cage Observations For This Location");
        waitForText("All Animals Ever Housed");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Clinpath Runs");
        waitAndClick(LabModuleHelper.getNavPanelItem("Clinpath Runs:", VIEW_TEXT));

        waitForText("details");
        dr = new DataRegionTable("query", this);
        dr.clickRowDetails(0);
        waitForText("Labwork Summary");
        waitForText(WAIT_FOR_JAVASCRIPT * 2, "Results");
        waitForText("No results found");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Clinical Encounters");
        waitAndClick(LabModuleHelper.getNavPanelItem("Clinical Encounters:", VIEW_TEXT));

        waitForText("details");
        dr = new DataRegionTable("query", this);
        dr.setSort("date", SortDirection.ASC);
        dr.clickRowDetails(0);
        waitForText("Encounter Details");
        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Biopsies");
        waitAndClick(LabModuleHelper.getNavPanelItem("Biopsies:", VIEW_TEXT));
        waitForText("volutpat");
        dr = new DataRegionTable("query", this);
        dr.clickRowDetails(0);
        //these are the sections we expect
        waitForText("Biopsy Details", "Morphologic Diagnoses", "Histology");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Necropsies");
        waitAndClick(LabModuleHelper.getNavPanelItem("Necropsies:", VIEW_TEXT));
        waitForText("details");
        dr = new DataRegionTable("query", getDriver());
        dr.clickRowDetails(0);
        //these are the sections we expect
        waitForText("Necropsy Details","Morphologic Diagnoses","Histology");
        assertNoErrorText();
    }

    @Test
    public void testAnimalHistory()
    {
        goToEHRFolder();
        waitAndClickAndWait(Locator.linkWithText("Animal History"));

        AnimalHistoryPage<AnimalHistoryPage> animalHistoryPage = new AnimalHistoryPage<>(getDriver());

        log("Verify Single animal history");
        animalHistoryPage
                .selectSingleAnimalSearch()
                .searchFor(PROTOCOL_MEMBER_IDS[0]);

        waitForElement(Locator.tagContainingText("span", "Overview: " + PROTOCOL_MEMBER_IDS[0]));
        waitForElement(Locator.tagContainingText("div", "There are no active medications"));
        waitForElement(Locator.tagContainingText("div", "5.62 kg")); //loading of the weight section
        assertEquals("Incorrect value in subject ID field", PROTOCOL_MEMBER_IDS[0], animalHistoryPage.selectSingleAnimalSearch().getSubjectId());

        //NOTE: rendering the entire colony is slow, so instead of abstract we load a simpler report
        log("Verify entire colony history");
        animalHistoryPage
                .selectEntireDatabaseSearch().getPage()
                .clickReportTab("Demographics");
        waitForElement(Locator.tagContainingText("a", "Rhesus")); //a proxy for the loading of the dataRegion
        waitForElement(Locator.tagContainingText("a", "test9195996"));  //the last ID on the page.  possibly a better proxy?
        waitForElement(Locator.tagContainingText("a", "Rhesus"));
        waitForElement(Locator.tagContainingText("a", "Cynomolgus"));
        waitForElement(Locator.tagContainingText("a", "Marmoset"));

        log("Verify location based history");
        animalHistoryPage = animalHistoryPage
                .selectCurrectLocation()
                .selectAreas(AREA_ID)
                .selectRooms(ROOM_ID)
                .setCage(CAGE_ID)
                .refreshReport();
        waitForElement(Locator.linkContainingText("9794992"), WAIT_FOR_JAVASCRIPT);   //this is the value of sire field

        log("Verify Project search");
        animalHistoryPage
                .selectMultiAnimalSearch()
                .searchByProjectProtocol()
                .selectProject(CONTAINS, PROJECT_ID)
                .clickSubmit();

        waitForElement(Ext4Helper.Locators.ext4ButtonContainingText(PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT);
        animalHistoryPage = refreshAnimalHistoryReport();
        waitForElement(Locator.tagContainingText("span", "Demographics - " + PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT * 2);

        log("Verify Protocol search");
        animalHistoryPage
                .selectMultiAnimalSearch()
                .searchByProjectProtocol()
                .selectProtocol(CONTAINS, PROTOCOL_ID)
                .clickSubmit();
        waitForElement(Ext4Helper.Locators.ext4ButtonContainingText(PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);

        // Check protocol search results.
        DataRegionTable drt = refreshAnimalHistoryReport().getActiveReportDataRegion();
        assertEquals("Did not find the expected number of Animals", Arrays.asList(PROTOCOL_MEMBER_IDS), drt.getColumnDataAsText("Id"));
        assertElementPresent(Locator.linkContainingText(PROTOCOL_MEMBER_IDS[0]));

        // Check animal count after removing one from search.
        waitAndClick(Ext4Helper.Locators.ext4ButtonContainingText(PROTOCOL_MEMBER_IDS[0]));
        waitForElementToDisappear(Ext4Helper.Locators.ext4ButtonContainingText(PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);
        animalHistoryPage = refreshAnimalHistoryReport();
        assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length - 1, animalHistoryPage.getActiveReportDataRegion().getDataRowCount());

        // Re-add animal.
        animalHistoryPage
                .selectMultiAnimalSearch()
                .addSubjects(PROTOCOL_MEMBER_IDS[0]);
        waitForElement(Ext4Helper.Locators.ext4ButtonContainingText(PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);
        drt = refreshAnimalHistoryReport().getActiveReportDataRegion();
        //TODO: Need to check that a button showed up under "ID's not found" section
        //assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length, DataRegionTable.findDataRegionWithin(this, demographicWebpart).getDataRowCount());

        log("Check subjectField parsing");
        animalHistoryPage
                .selectMultiAnimalSearch()
                .replaceSubjects(MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1] + ";" + MORE_ANIMAL_IDS[2] + " " + MORE_ANIMAL_IDS[3] + "\t" + MORE_ANIMAL_IDS[4]);
        drt = refreshAnimalHistoryReport().getActiveReportDataRegion();
        //TODO: Need to check that two buttons showed up under "ID's not found" section
        //assertEquals("Did not find the expected number of Animals", 5, DataRegionTable.findDataRegionWithin(this, demographicWebpart).getDataRowCount());

        //waitForElementToDisappear(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[1] + "')]").notHidden(), WAIT_FOR_JAVASCRIPT * 3);
        //assertElementNotPresent(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[2] + "')]").notHidden());

        Window error = animalHistoryPage
                .selectMultiAnimalSearch()
                .clearSubjects()
                .refreshReportError();
        assertElementNotPresent(Ext4Helper.Locators.ext4ButtonContainingText(PROTOCOL_MEMBER_IDS[2]));
        assertEquals("Error", error.getTitle());
        assertEquals("Must enter at least one valid Subject ID", error.getBody());
        error.clickButton("OK", true);

        log("checking specific tabs");

        //snapshot
        animalHistoryPage = (AnimalHistoryPage) animalHistoryPage
                .selectMultiAnimalSearch()
                .replaceSubjects(MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1])
                .refreshReport()
                .clickCategoryTab("General")
                .clickReportTab("Snapshot");
        waitForText("Location:");
        waitForText("Gender:");
        waitForElement(Locator.tagContainingText("span", "Weights - " + MORE_ANIMAL_IDS[0]));

        //weight
        animalHistoryPage
                .clickCategoryTab("Clinical")
                .clickReportTab("Weights");
        waitForElement(Locator.xpath("//span[contains(text(), 'Weight Information -')]"));
        waitForElement(Locator.tagContainingText("th", "Most Recent Weight").notHidden());
        waitForElement(Locator.tagWithText("a", "3.73").notHidden()); //first animal
        waitForElement(Locator.tagWithText("a", "3.56").notHidden()); //second animal

        // NOTE: this DR has been failing to load on TC intermittently since 14.1/14.2.  it worked solidly before,
        // and this seems like some sort of WebDriver/JS interaction problem.  The DR shows the loading indicator, but
        // never loads.  Cant repro locally.

        // TODO: consider re-enabling with a future WebDriver version.
        //waitAndClick(Ext4Helper.Locators.ext4Tab("Raw Data").notHidden().index(0));
        //waitForElement(Locator.tagWithText("span", "Percent Change"), WAIT_FOR_PAGE * 3);  //proxy for DR loading

        //chronological history
        animalHistoryPage = new AnimalHistoryPage(getDriver()); // TODO: Update test to use this throughout
        animalHistoryPage.clickCategoryTab("Clinical");
        animalHistoryPage.clickReportTab("Clinical History");
        waitForElement(Locator.tagContainingText("div", "No records found since:"), 20000);
    }

    @Test
    public void testClinicalHistoryPanelOptions(){
        pauseJsErrorChecker();
        beginAtAnimalHistoryTab();
        openClinicalHistoryForAnimal("TEST1020148");
        List<String> expectedLabels = new ArrayList<String>(
                Arrays.asList(
                        "Alert",
                        "Antibiotic Sensitivity",
                        "Assignments",
                        "Births",
                        "Body Condition",
                        "Deaths",
                        "Hematology",
                        "Labwork",
                        "Misc Tests",
                        "Pregnancy Confirmations",
                        "TB Tests",
                        "Weights",

                        "Alopecia",
                        "Arrival/Departure",
                        "Biochemistry",
                        "Blood Draws",
                        "Clinical",
                        "Deliveries",
                        "Housing Transfers",
                        "Microbiology",
                        "Parasitology",
                        "Serology",
                        "Urinalysis",
                        "iStat"
                ));
        checkClinicalHistoryType(expectedLabels);
    }

    private void waitForMprPageLoad()
    {
        waitForElement(Locator.tagWithText("span", "Treatments & Procedures"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.name("Id"), WAIT_FOR_PAGE);
        waitForElement(Locator.name("title"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.css(".ehr-drug_administration-records-grid"), WAIT_FOR_JAVASCRIPT);

        final Locator fieldLocator = Locator.tag("input").withAttribute("name", "Id").withClass("x-form-field").notHidden();

        waitForElement(fieldLocator, WAIT_FOR_JAVASCRIPT);
        waitFor(() -> PROJECT_MEMBER_ID.equals(getDriver().findElement(fieldLocator).getAttribute("value")),
                "Id field did not populate", WAIT_FOR_PAGE);

        sleep(200);
    }

    private AnimalHistoryPage refreshAnimalHistoryReport()
    {
        return new AnimalHistoryPage(getDriver()).refreshReport();
    }

    private void setDoseConcFields()
    {
        _helper.setDataEntryFieldInTab("Treatments & Procedures", "concentration", "5");
        _helper.setDataEntryFieldInTab("Treatments & Procedures", "dosage", "2");
        click(Locator.xpath("//img["+VISIBLE+" and contains(@class, 'x-form-search-trigger')]"));
        waitForElement(Locator.xpath("//div[@class='x-form-invalid-msg']"), WAIT_FOR_JAVASCRIPT);
    }

    private void selectHistoryTab(String tab)
    {
        click(Locator.tagWithText("span", tab));
    }

    private void testPaymentsReceived()
    {
        String date = LocalDateTime.now().format(_dateTimeFormatter);
        String amount = "1028.95";
        navigateToFolder(PROJECT_NAME, PRIVATE_FOLDER);
        waitForText("Invoice");
        clickAndWait(Locator.bodyLinkContainingText("Invoice"));
        DataRegionTable invoice = new DataRegionTable("query", getDriver());
        invoice.clickEditRow(0);
        setFormElement(Locator.input("invoiceSentOn"), date);
        setFormElement(Locator.input("paymentReceivedOn"), date);
        setFormElement(Locator.input("paymentAmountReceived"), amount);

        clickButton("Submit",0);

        Window msgWindow = new Window.WindowFinder(this.getDriver()).withTitle("Success").waitFor();
        assertEquals("Your upload was successful!", "Success", msgWindow.getTitle());
        msgWindow.clickButton("OK", 0);

        invoice = new DataRegionTable("query", getDriver());
        String balance = invoice.getDataAsText(0,"balanceDue");
        assertEquals("Wrong data: balance due", "$0.00", balance);

        log("Verify audit logs in admin console.");
        goToAdminConsole().clickAuditLog();
        doAndWaitForPageToLoad(() -> selectOptionByText(Locator.name("view"), "Query update events"));

        _customizeViewsHelper.openCustomizeViewPanel();
        _customizeViewsHelper.addColumn("DataChanges");
        _customizeViewsHelper.applyCustomView();
        DataRegionTable auditTable =  new DataRegionTable("query", this);
        String auditLog = auditTable.getDataAsText(0,"DataChanges");
        assertTrue(auditLog.contains("paymentamountreceived:  » 1028.95"));
        assertTrue(auditLog.contains("balancedue:  » 0.0"));
    }

    @Override
    protected String getModuleDirectory()
    {
        return "WNPRC_EHR";
    }

    @Override
    protected String getAnimalHistoryPath()
    {
        return ANIMAL_HISTORY_URL;
    }
}
