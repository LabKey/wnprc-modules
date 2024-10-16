/*
 * Copyright (c) 2012-2024 LabKey Corporation
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
import org.assertj.core.api.Assertions;
import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.Command;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.CommandResponse;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.SimplePostCommand;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.Sort;
import org.labkey.remoteapi.query.TruncateTableCommand;
import org.labkey.remoteapi.query.UpdateRowsCommand;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.SortDirection;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.components.bootstrap.ModalDialog;
import org.labkey.test.components.domain.DomainFieldRow;
import org.labkey.test.components.domain.DomainFormPanel;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.components.html.SelectWrapper;
import org.labkey.test.components.html.SiteNavBar;
import org.labkey.test.pages.ImportDataPage;
import org.labkey.test.pages.ReactAssayDesignerPage;
import org.labkey.test.pages.assay.ChooseAssayTypePage;
import org.labkey.test.pages.ehr.AnimalHistoryPage;
import org.labkey.test.pages.ehr.EHRAdminPage;
import org.labkey.test.pages.ehr.NotificationAdminPage;
import org.labkey.test.params.FieldDefinition;
import org.labkey.test.params.list.IntListDefinition;
import org.labkey.test.params.list.ListDefinition;
import org.labkey.test.tests.ehr.AbstractGenericEHRTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.ExtHelper;
import org.labkey.test.util.FileBrowserHelper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.Maps;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.SchemaHelper;
import org.labkey.test.util.TestLogger;
import org.labkey.test.util.TextSearcher;
import org.labkey.test.util.ehr.EHRTestHelper;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.labkey.test.util.external.labModules.LabModuleHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.WebTestHelper.buildURL;
import static org.labkey.test.WebTestHelper.getRemoteApiConnection;
import static org.labkey.test.util.Ext4Helper.TextMatchTechnique.CONTAINS;

/**
 * This should contain tests designed to validate EHR data entry or associated business logic.
 * NOTE: EHRApiTest may be a better location for tests designed to test server-side trigger scripts
 * or similar business logic.
 */
@Category({CustomModules.class, EHR.class, WNPRC_EHR.class})
public class WNPRC_EHRTest extends AbstractGenericEHRTest implements PostgresOnlyTest
{
    public static final String PROJECT_NAME = "WNPRC";
    public static final String EHR_FOLDER_PATH = PROJECT_NAME + "/EHR";
    private static final String PRIVATE_FOLDER = "Private";
    private static final String EHR_FOLDER = "EHR";
    private static final String PI_PORTAL = "PI Portal";
    public static final String PI_FOLDER_FOLDER_PATH = "/WNPRC_Units/Operation_Services/Financial_Management/PI Portal";
    public static final String PRIVATE_FOLDER_PATH = PROJECT_NAME + "/WNPRC_Units/Operation_Services/Financial_Management/Private";
    public static final String PRIVATE_TARGET_FOLDER_PATH = "WNPRC_Units/Operation_Services/Financial_Management/Private";

    private final String ANIMAL_HISTORY_URL = "/" + PROJECT_NAME + "/EHR/ehr-animalHistory.view";
    protected static final String PROJECT_MEMBER_ID = "test2312318"; // PROJECT_ID's single participant
    protected static final String PROJECT_MEMBER_ID_2 = "test3804589"; // PROJECT_ID's single participant

    private final File ALIASES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/aliases.tsv");
    private static final int ALIASES_NUM_ROWS = 4;

    private final File CHARGEABLE_ITEMS_RATES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRates.tsv");
    private final File CHARGEABLE_ITEMS_RATES_ERROR_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRatesError.tsv");
    private final File CHARGEABLE_ITEMS_RATES_GROUP_CATEGORY_ERROR_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRatesGroupCategoryError.tsv");
    private static final int CHARGE_RATES_NUM_ROWS = 10;
    private static final int CHARGEABLE_ITEMS_NUM_ROWS = 9;

    private final File CHARGEABLE_ITEMS_RATES_UPDATE_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemsRatesUpdate.tsv");
    private static final int CHARGE_RATES_NUM_UPDATE_ROWS = 13;
    private static final int CHARGEABLE_ITEMS_NUM_UPDATE_ROWS = 12;

    private final File CHARGEABLE_ITEM_CATEGORIES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeableItemCategories.tsv");

    private final File GROUP_CATEGORY_ASSOCIATIONS_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/groupCategoryAssociations.tsv");

    private static final int GROUP_CATEGORY_ASSOCIATIONS_NUM_ROWS = 11;

    private final File TIER_RATES_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/tierRates.tsv");

    private final File CHARGE_UNITS_TSV = TestFileUtils.getSampleData("wnprc_ehr/billing/chargeUnits.tsv");
    private final File BLOOD_DATA_TSV = TestFileUtils.getSampleData("wnprc_ehr/study/datasetBlood.tsv");
    private static int BILLING_RUN_COUNT = 0;

    protected EHRTestHelper _helper = new EHRTestHelper(this);
    private final SchemaHelper _schemaHelper = new SchemaHelper(this);

    public FileBrowserHelper _fileBrowserHelper = new FileBrowserHelper(this);

    protected DateTimeFormatter _dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static final String NON_GEN_CREDIT_ACCOUNT_ID = "acct102";
    public static final String GEN_CREDIT_ACCT_ID = "acct103";

    private final Map<String, Object> aliasesMap = new HashMap<>();

    protected static final Double FEEDING_AMT = 12.12;
    protected static final Double WEIGHT_VAL = 12.12;
    protected static final Double NEW_WEIGHT_VAL = 12.13;
    protected static final Double LOW_VAL = 0.1;
    protected static final Double HIGH_VAL = 0.12;
    protected static final String ROOM_ID_LOCAL = "ab160";
    protected static final String[] EXPECTED_ANIMALS_LOCAL = {"r19022","r19028","r19035","r19043","r19050"};

    protected static String[] TEST_SUBJECTS = {"r12345", "cy23456", "cj3456", "cy45678", "cy56789", "cj3457"};
    protected static final String ROOM_ID_EHR_TEST = "2341092";
    protected static final String[] ANIMAL_SUBSET_EHR_TEST = {"test3844307", "test8976544", "test9195996"};

    //Note: if updating this file, also update VIROLOGY_RESULT_DATA variable to match it, that way we can test
    // the api end point which converts xlsx to JSON as well as the frontend extJS after it gets uploaded.
    private static final String CORRECT_SAMPLE_FILE_NAME = "virologyResults_correct.xlsx";
    private static final Map<String, Object> VIROLOGY_RESULT_DATA = new HashMap<>();
    //shortcut to getting the file content in the xlsx file.

    private static final String INCORRECT_FORMAT_SAMPLE_FILE_NAME = "virologyResults_baddate.xlsx";
    private static final String NO_MATCHING_RECORDS_SAMPLE_FILE_NAME = "virologyResults_nomatch.xlsx";
    private static final File CORRECT_SAMPLE_FILE = TestFileUtils.getSampleData("wnprc_ehr/clinpath/" + CORRECT_SAMPLE_FILE_NAME);
    private static final File INCORRECT_FORMAT_SAMPLE_FILE = TestFileUtils.getSampleData("wnprc_ehr/clinpath/" + INCORRECT_FORMAT_SAMPLE_FILE_NAME);
    private static final File NO_MATCHING_RECORDS_SAMPLE_FILE = TestFileUtils.getSampleData("wnprc_ehr/clinpath/" + NO_MATCHING_RECORDS_SAMPLE_FILE_NAME);
    protected static final String VIROLOGY_CLINPATH_TASKID = "0ebd60fd-c6ac-102e-990b-48cf881b52cf";

    private static final String ASSIGNS_MSG_BOARD_PRIVATE_PATH = "/" + EHR_FOLDER_PATH + "/Assigns/PrivateBoard/";
    private static final String ASSIGNS_MSG_BOARD_RESTRICTED_PATH = "/" + EHR_FOLDER_PATH + "/Assigns/RestrictedBoard/";
    private static final String MHC_SSP_LIST = "MHC SSP List";
    private static final String QPCR_QC_list = "QPCR_QC_list";
    public static final String PROTOCOL_PROJECT_ID_2 = "795645";
    public static final String PROTOCOL_PROJECT_ID_3 = "795646";
    public static final String PROTOCOL_ID_2 = "protocol102";
    public static final String PROTOCOL_ID_3 = "protocol103";


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

    @Override
    protected File getStudyPolicyXML()
    {
        return TestFileUtils.getSampleData("wnprc_ehr/wnprcEhrTestStudyPolicy.xml");
    }

    private static void folderSetup()
    {

    }

    @BeforeClass @LogMethod
    public static void doSetup() throws Exception
    {
        WNPRC_EHRTest initTest = (WNPRC_EHRTest)getCurrentTest();

        initTest.createProjectAndFolders("EHR");
        initTest.clickFolder(initTest.getProjectName());
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_EHR", "EHR_Billing", "WNPRC_Billing", "WNPRC_BillingPublic"));
        initTest.clickFolder("EHR");
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_EHR", "EHR_Billing", "WNPRC_Billing", "WNPRC_BillingPublic", "PrimateId"));
        initTest.setModuleProperties(Arrays.asList(new ModulePropertyValue("EHR_Billing", "/" +
                initTest.getProjectName(), "BillingContainer", PRIVATE_FOLDER_PATH)));
        initTest.setModuleProperties(Arrays.asList(new ModulePropertyValue("EHR_Billing", "/" +
                initTest.getProjectName(), "BillingContainer", PRIVATE_FOLDER_PATH)));
        initTest.setModuleProperties(Arrays.asList(new ModulePropertyValue("PrimateId", "/" +
                initTest.getProjectName(), "PrimateIdPrefix", "Prefix (2 chars max)", "XX")));

        initTest.goToEHRFolder();
        initTest._containerHelper.createSubfolder(initTest.getProjectName(), "WNPRC_Units", "Collaboration");

        initTest.createResearchServicesFolders();
        initTest.createAnimalServicesFolders();
        initTest._containerHelper.enableModule("EHR_ComplianceDB");
        initTest.createRequiredLists();
        initTest.createRequiredAssays();
        initTest.clickFolder("EHR");

        initTest.updateEHRFormFrameworkTypes();

        initTest.createEHRLinkedSchema("/" + EHR_FOLDER_PATH); // Needed for query validation
        initTest._schemaHelper.createLinkedSchema("/" + EHR_FOLDER_PATH, "PublicSOPs", "/" + EHR_FOLDER_PATH, null, "lists", null, null);

        initTest.goToEHRFolder();
        initTest.createStudyLinkedSchemaForQueryValidation();

        // The next several step are done in a particular order to ensure query validation passes. Change at your own risk.
        initTest.defineQCStates();
        initTest.setEHRModuleProperties();
        initTest.billingSetup();

        initTest.goToEHRFolder();
        initTest.populateInitialData();
        initTest.createEHRLookupsLinkedSchemaQueryValidation();

        initTest.initCreatedProject();

        initTest.goToPIPortal();
        initTest.addBillingPublicWebParts();
        initTest.uploadBillingDataAndVerify();

        // Blood triggers are dependent on weights, so the blood sample data has to be imported after weights. Doing this after
        // study import ensures that order.
        initTest.importBlood();

        initTest.createTestSubjects();

        initTest.setupClinpathVirologySection();

        initTest.setupAnimalRequests();

        initTest.checkUpdateProgramIncomeAccount();

        initTest.notificationRevampSetup(); //TODO: to uncomment, fix issue mentioned here - https://www.labkey.org/WNPRC/support%20tickets/issues-details.view?issueId=51256
    }

    private void billingSetup() throws Exception
    {
        WNPRC_EHRTest initTest = (WNPRC_EHRTest)getCurrentTest();
        initTest.createFinanceManagementFolders();
        goToBillingFolder();
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_EHR", "EHR_Billing", "WNPRC_Billing", "WNPRC_BillingPublic"));
        initTest.addFinanceRelatedWebParts(initTest.getBillingContainerPath());

        goToBillingFolder();
        initTest.loadEHRBillingTableDefinitions();

        initTest.createStudyLinkedSchema();
        initTest.createCoreLinkedSchema();
        initTest.createEHRLinkedSchema(PROJECT_NAME + "/" + PRIVATE_TARGET_FOLDER_PATH);

        goToEHRFolder();
        initTest.createEHRBillingPublicLinkedSchema();
        initTest.createWNPRCBillingLinkedSchema();
        initTest.loadEHRBillingExtensibleCols();

        goToPIPortal();
        initTest._containerHelper.enableModules(Arrays.asList("WNPRC_BillingPublic"));

        initTest.createWNPRCBillingPublicLinkedSchema();
    }

    private void loadEHRBillingExtensibleCols()
    {
        log("Setup the EHR Billing table definitions");
        EHRAdminPage.beginAt(this,getContainerPath());
        click(Locator.linkWithText("EHR EXTENSIBLE COLUMNS"));
        click(Locator.linkWithText("Load EHR_Billing table definitions"));
        waitForElement(Locator.tagWithClass("span", "x4-window-header-text").withText("Success"));
        assertExt4MsgBox("EHR_Billing tables updated successfully.", "OK");
    }

    private void importBlood() throws IOException, CommandException
    {
        Connection connection = createDefaultConnection();
        Map<String, Object> responseMap = new HashMap<>();

        List<Map<String, Object>> tsv = loadTsv(BLOOD_DATA_TSV);
        insertTsvData(connection, "study", "blood", tsv, EHR_FOLDER_PATH)
                .forEach(row -> responseMap.put(row.get("Id").toString(),row.get("date")));
    }

    private void uploadBillingDataAndVerify() throws Exception
    {
        log("Load billedBy lookup used in 'Blood Draws' dataset.");
        loadBloodBilledByLookup();

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

        log("Add procedure queries.");
        addProcedureQueries();
    }

    private void addProcedureQueries() throws IOException, CommandException
    {
        log("Add procedure queries into ehr_billing.procedureQueryChargeIdAssoc table.");

        goToBillingFolder();

        Connection cn = WebTestHelper.getRemoteApiConnection();

        log("Inserting procedure query names info into ehr_billing.procedureQueryChargeIdAssoc table.");
        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr_billing", "procedureQueryChargeIdAssoc");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("schemaName", "wnprc_billing");
        rowMap.put("queryName", "bloodDrawsOneTubeAnimalServices");
        rowMap.put("description", "Blood Draws One Tube - Animal Services");
        rowMap.put("chargeId", getChargeId("Blood draws"));
        insertCmd.addRow(rowMap);

        rowMap = new HashMap<>();
        rowMap.put("schemaName", "wnprc_billing");
        rowMap.put("queryName", "bloodDrawsAdditionalTubesAnimalServices");
        rowMap.put("description", "Blood Draws Additional Tubes - Animal Services");
        rowMap.put("chargeId", getChargeId("Blood draws - Additional Tubes"));
        insertCmd.addRow(rowMap);

        rowMap = new HashMap<>();
        rowMap.put("schemaName", "wnprc_billing");
        rowMap.put("queryName", "bloodDrawsAllTubesSPI");
        rowMap.put("description", "Blood Draws - SPI");
        rowMap.put("chargeId", getChargeId("Blood Draws"));
        insertCmd.addRow(rowMap);

        int numRows = insertCmd.execute(cn, PRIVATE_FOLDER_PATH).getRows().size();
        log("Inserted " + numRows + " into ehr_billing.procedureQueryChargeIdAssoc table.");
    }

    @LogMethod
    @Override
    protected void createTestSubjects() throws Exception
    {
        String[] fields;
        Object[][] data;
        SimplePostCommand insertCommand;

        //insert into demographics
        log("Creating test subjects");
        fields = new String[]{"Id", "Species", "Birth", "Gender", "date", "calculated_status", "objectid"};
        data = new Object[][]{
                {TEST_SUBJECTS[0], "Rhesus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {TEST_SUBJECTS[1], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {TEST_SUBJECTS[2], "Marmoset", (new Date()).toString(), getFemale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {TEST_SUBJECTS[3], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {TEST_SUBJECTS[4], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {TEST_SUBJECTS[5], "Marmoset", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "demographics", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "demographics", new Filter("Id", StringUtils.join(TEST_SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), insertCommand, getExtraContext());

        //for simplicity, also create the animals from MORE_ANIMAL_IDS right now
        data = new Object[][]{
                {MORE_ANIMAL_IDS[0], "Rhesus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {MORE_ANIMAL_IDS[1], "Rhesus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {MORE_ANIMAL_IDS[2], "Rhesus", (new Date()).toString(), getFemale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {MORE_ANIMAL_IDS[3], "Rhesus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()},
                {MORE_ANIMAL_IDS[4], "Rhesus", (new Date()).toString(), getMale(), new Date(), "Alive", UUID.randomUUID().toString()}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "demographics", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "demographics", new Filter("Id", StringUtils.join(MORE_ANIMAL_IDS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), insertCommand, getExtraContext());

        //used as initial dates
        Date pastDate1 = TIME_FORMAT.parse("2012-01-03 09:30");
        Date pastDate2 = TIME_FORMAT.parse("2012-05-03 19:20");

        //set housing
        log("Creating initial housing records");
        fields = new String[]{"Id", "date", "enddate", "room", "cage"};
        data = new Object[][]{
                {TEST_SUBJECTS[0], pastDate1, pastDate2, getRooms()[0], CAGES[0]},
                {TEST_SUBJECTS[0], pastDate2, null, getRooms()[0], CAGES[0]},
                {TEST_SUBJECTS[1], pastDate1, pastDate2, getRooms()[0], CAGES[0]},
                {TEST_SUBJECTS[1], pastDate2, null, getRooms()[2], CAGES[2]}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Housing", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "Housing", new Filter("Id", StringUtils.join(SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), insertCommand, getExtraContext());

        //set a base weight
        log("Setting initial weights");
        fields = new String[]{"Id", "date", "weight", "QCStateLabel"};
        data = new Object[][]{
                {TEST_SUBJECTS[0], pastDate2, 10.5, EHRQCState.COMPLETED.label},
                {TEST_SUBJECTS[0], new Date(), 12, EHRQCState.COMPLETED.label},
                {TEST_SUBJECTS[1], new Date(), 12, EHRQCState.COMPLETED.label},
                {TEST_SUBJECTS[2], new Date(), 12, EHRQCState.COMPLETED.label}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Weight", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "Weight", new Filter("Id", StringUtils.join(TEST_SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), insertCommand, getExtraContext());

        //set assignment
        log("Setting initial assignments");
        fields = new String[]{"Id", "date", "enddate", "project"};
        data = new Object[][]{
                {TEST_SUBJECTS[0], pastDate1, pastDate2, PROJECTS[0]},
                {TEST_SUBJECTS[1], pastDate1, pastDate2, PROJECTS[0]},
                {TEST_SUBJECTS[1], pastDate2, null, PROJECTS[2]}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Assignment", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "Assignment", new Filter("Id", StringUtils.join(TEST_SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), insertCommand, getExtraContext());
    }

    @LogMethod
    @Override
    protected void populateProjectRecords() throws Exception
    {
        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr", "project");

        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("project", PROTOCOL_PROJECT_ID);
        rowMap.put("name", PROTOCOL_PROJECT_ID);
        rowMap.put("protocol", PROTOCOL_ID);
        rowMap.put("account", ACCOUNT_ID_1);
        rowMap.put("investigatorId", "1");
        insertCmd.addRow(rowMap);

        rowMap = new HashMap<>();
        rowMap.put("project", PROJECT_ID);
        rowMap.put("name", PROJECT_ID);
        rowMap.put("protocol", DUMMY_PROTOCOL);
        rowMap.put("account", ACCOUNT_ID_2);
        rowMap.put("research", true);
        rowMap.put("investigatorId", "2");
        insertCmd.addRow(rowMap);

        insertCmd.execute(createDefaultConnection(), getContainerPath());
    }

    private int getChargeId(String chargeName) throws IOException, CommandException
    {
        Connection cn = getRemoteApiConnection();
        SelectRowsCommand selectCmd = new SelectRowsCommand("ehr_billing", "chargeableItems");
        selectCmd.setColumns(Arrays.asList("rowId, name"));
        selectCmd.addFilter(new Filter("name", chargeName));
        
        SelectRowsResponse response = selectCmd.execute(cn, getBillingContainerPath());
        return (Integer) response.getRows().get(0).get("rowId");
    }

    @Override
    public void goToProjectHome()
    {
        goToProjectHome(PROJECT_NAME);
    }

    protected final void goToBillingFolder()
    {
        beginAt(buildURL("project", getBillingContainerPath(), "begin"));
    }

    protected final void goToPIPortal()
    {
        beginAt(buildURL("project", getPIPortalContainerPath(), "begin"));
    }


    // Validate queries at end of tests instead of during import
    // TODO: Add linked schemas to tests
    @Override
    protected boolean shouldValidateQueries()
    {
        return false;
    }

    @Override
    protected boolean skipStudyImportQueryValidation()
    {
        return false;
    }

    private void createFinanceManagementFolders()
    {
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units", "Operation_Services", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Operation_Services", "Financial_Management", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Operation_Services/Financial_Management", "Private", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Operation_Services/Financial_Management", "PI Portal", "Collaboration");
    }

    private void createResearchServicesFolders()
    {
        // This assumes WNPRC_Units is already created
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units", "Research_Services", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Research_Services", "Virology_Services", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Research_Services/Virology_Services", "VL_DB", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Research_Services/Virology_Services", "VS_group_wiki", "Collaboration");

        //MHC folders
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Research_Services", "MHC_SSP", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Research_Services/MHC_SSP", "Private", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Research_Services/MHC_SSP/Private", "MHC_DB", "Collaboration");
    }

    private void createAnimalServicesFolders()
    {
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units", "Animal_Services", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Animal_Services", "Compliance_Training", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Animal_Services/Compliance_Training", "Private", "Collaboration");
        _containerHelper.createSubfolder(getProjectName() + "/WNPRC_Units/Animal_Services/Compliance_Training/Private", "EmployeeDB", "Collaboration");

    }

    private void createRequiredLists() throws IOException, CommandException
    {
        Connection cn = getRemoteApiConnection();
        List<FieldDefinition> listColumns = List.of(
                new FieldDefinition("ref_nt_name", FieldDefinition.ColumnType.String),
                new FieldDefinition("shortName", FieldDefinition.ColumnType.String));
        ListDefinition listDef = new IntListDefinition(MHC_SSP_LIST, "Key");
        listDef.setFields(listColumns);
        listDef.create(cn, getProjectName() + "/WNPRC_Units/Research_Services/MHC_SSP/Private/MHC_DB");

        listColumns = List.of(
                new FieldDefinition("Expt_nr", FieldDefinition.ColumnType.Decimal),
                new FieldDefinition("QC_Pass", FieldDefinition.ColumnType.String));
        listDef = new IntListDefinition(QPCR_QC_list, "Key");
        listDef.setFields(listColumns);
        listDef.create(cn, getProjectName() + "/WNPRC_Units/Research_Services/Virology_Services/VS_group_wiki");
    }

    private void createRequiredAssays()
    {
        beginAt(buildURL("project", getProjectName() + "/WNPRC_Units/Research_Services/MHC_SSP/Private/MHC_DB", "begin"));
        goToManageAssays();
        clickButton("New Assay Design");
        ChooseAssayTypePage chooseAssayTypePage = new ChooseAssayTypePage(getDriver());
        chooseAssayTypePage.selectAssayLocation("Current Folder (MHC_DB)");
        ReactAssayDesignerPage assayDesignerPage = chooseAssayTypePage.selectAssayType("General");
        assayDesignerPage.setName("MHC_SSP");
        DomainFormPanel domainFormPanel = assayDesignerPage.goToResultsFields();
        domainFormPanel.addField("SubjectId").setType(FieldDefinition.ColumnType.String);
        domainFormPanel.addField("Institution").setType(FieldDefinition.ColumnType.String);
        domainFormPanel.addField("Result").setType(FieldDefinition.ColumnType.String);
        DomainFieldRow domainFieldRow = domainFormPanel.addField("PrimerPair");
        domainFieldRow.setLookup(new FieldDefinition.IntLookup("lists", MHC_SSP_LIST));
        assayDesignerPage.clickFinish();

        beginAt(buildURL("project", getProjectName() + "/WNPRC_Units/Research_Services/Virology_Services/VL_DB", "begin"));
        goToManageAssays();
        clickButton("New Assay Design");
        chooseAssayTypePage = new ChooseAssayTypePage(getDriver());
        chooseAssayTypePage.selectAssayLocation("Current Folder (VL_DB)");
        assayDesignerPage = chooseAssayTypePage.selectAssayType("Viral Loads");
        assayDesignerPage.setName("Viral_Load");
        domainFormPanel = assayDesignerPage.goToRunFields();
        domainFormPanel.addField("exptNumber").setType(FieldDefinition.ColumnType.String);
        assayDesignerPage.clickFinish();
    }

    private void loadBloodBilledByLookup() throws IOException, CommandException
    {
        goToEHRFolder();
        Connection cn = WebTestHelper.getRemoteApiConnection();

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

    private void addFinanceRelatedWebParts(String container)
    {
        log("Add Finance Related Web Parts.");
        beginAt(buildURL("project", container, "begin"));

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
        _schemaHelper.createLinkedSchema(getProjectName() + "/" + PRIVATE_TARGET_FOLDER_PATH,
                "studyLinked", "/"+EHR_FOLDER_PATH, "studyLinked", null,
                null, null);
    }

    private void createStudyLinkedSchemaForQueryValidation()
    {
        final String BLOOD_SCHED_METADATA =
                "<tables xmlns=\"http://labkey.org/data/xml\" xmlns:cv=\"http://labkey.org/data/xml/queryCustomView\"> \n" +
                        "  <table tableName=\"BloodSchedule\" tableDbType=\"TABLE\">\n" +
                        "    <columns>\n" +
                        "      <column columnName=\"qcstate\">\n" +
                        "        <fk>\n" +
                        "          <fkDbSchema>core</fkDbSchema>\n" +
                        "          <fkTable>QCState</fkTable>\n" +
                        "          <fkColumnName>RowId</fkColumnName>\n" +
                        "          <fkDisplayColumnName>Label</fkDisplayColumnName>\n" +
                        "        </fk>\n" +
                        "      </column>\n" +
                        "  </columns>\n" +
                        "  </table>\n" +
                        "</tables>";

        log("Creating studyLinked Schema");
        _schemaHelper.setQueryLoadTimeout(60000);
        _schemaHelper.createLinkedSchema("/"+EHR_FOLDER_PATH,
                "studyLinked", "/"+EHR_FOLDER_PATH, "studyLinked", null,
                null, BLOOD_SCHED_METADATA);
    }

    private void createCoreLinkedSchema()
    {
        log("Creating coreLinked Schema");
        _schemaHelper.setQueryLoadTimeout(30000);
        _schemaHelper.createLinkedSchema(getProjectName() + "/" + PRIVATE_TARGET_FOLDER_PATH,
                "coreLinked", "/"+EHR_FOLDER_PATH, "coreLinked", null,
                null, null);
    }

    private void createEHRLinkedSchema(String target)
    {
        log("Creating ehrLinked Schema");
        _schemaHelper.setQueryLoadTimeout(30000);
        _schemaHelper.createLinkedSchema(target,
                "ehrLinked", "/"+EHR_FOLDER_PATH, "ehrLinked", null,
                null, null);
    }

    private void createEHRLookupsLinkedSchemaQueryValidation()
    {
        log("Creating ehr_LookupsLinked Schema");
        _schemaHelper.setQueryLoadTimeout(30000);
        _schemaHelper.createLinkedSchema("/"+EHR_FOLDER_PATH,
                "ehr_lookupsLinked", "/"+EHR_FOLDER_PATH, null, "ehr_lookups",
                "blood_billed_by", null);
    }

//    private void createPublicSOPsList()
//    {
//        ListDefinition listDef = new IntListDefinition("Labfee_NoChargeProjects", "key");
//        listDef.addField(new FieldDefinition("project", FieldDefinition.ColumnType.Integer));
//        listDef.addField(new FieldDefinition("startDate", FieldDefinition.ColumnType.DateAndTime));
//        listDef.addField(new FieldDefinition("dateDisabled", FieldDefinition.ColumnType.DateAndTime));
//        listDef.addField(new FieldDefinition("Createdb", FieldDefinition.ColumnType.Integer));
//        listDef.addField(new FieldDefinition("Notes", FieldDefinition.ColumnType.String));
//        listDef.getCreateCommand().execute(createDefaultConnection(), getProjectName());
//    }

    private void createEHRBillingPublicLinkedSchema()
    {
        log("Creating ehr_billing_public Linked Schema");
        _schemaHelper.setQueryLoadTimeout(20000);
        _schemaHelper.createLinkedSchema(getProjectName() + "/" + "EHR",
                "ehr_billing_public", PRIVATE_FOLDER_PATH, "ehr_billing_public", null,
                null, null);
    }

    private void createWNPRCBillingLinkedSchema()
    {
        log("Creating wnprc_billingLinked Linked Schema");
        _schemaHelper.setQueryLoadTimeout(20000);
        _schemaHelper.createLinkedSchema(getProjectName() + "/" + "EHR",
                "wnprc_billingLinked", PRIVATE_FOLDER_PATH, "wnprc_billingLinked", null,
                null, null);
    }

    private void createWNPRCBillingPublicLinkedSchema()
    {
        log("Creating wnprc_billing_public Linked Schema");
        _schemaHelper.setQueryLoadTimeout(20000);
        _schemaHelper.createLinkedSchema(getProjectName() + "/" + PI_FOLDER_FOLDER_PATH,
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

    @Override
    public String getModulePath()
    {
        return "/server/modules/wnprc-modules/" + getModuleDirectory();
    }

    @Override
    public void importStudy()
    {
        importFolderFromPath(1);
    }

    // this mocks the behavior of enterweights sql update script
    public void updateEHRFormFrameworkTypes() throws IOException, CommandException
    {
        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        SelectRowsCommand sr = new SelectRowsCommand("ehr", "form_framework_types");
        sr.addFilter(new Filter("queryname","feeding", Filter.Operator.EQUAL));
        sr.addFilter(new Filter("framework","reactjs", Filter.Operator.EQUAL));
        SelectRowsResponse resp = sr.execute(cn, EHR_FOLDER_PATH);
        if (resp.getRowCount().intValue() == 0)
        {

            log("Inserting feeding as a reactjs form type into ehr.form_framework_types");

            InsertRowsCommand insertCmd = new InsertRowsCommand("ehr", "form_framework_types");
            Map<String, Object> rowMap = new HashMap<>();
            rowMap.put("schemaname", "study");
            rowMap.put("queryname", "feeding");
            rowMap.put("framework", "reactjs");
            rowMap.put("url", "/wnprc_ehr/feeding.view");
            insertCmd.addRow(rowMap);

            insertCmd.execute(cn, EHR_FOLDER_PATH);

            log("Inserted feeding as a reactjs form type into ehr.form_framework_types");
            log("Inserting weight as a reactjs form type into ehr.form_framework_types");

            InsertRowsCommand insertCmd2 = new InsertRowsCommand("ehr", "form_framework_types");
            Map<String, Object> rowMap2 = new HashMap<>();
            rowMap2.put("schemaname", "study");
            rowMap2.put("queryname", "weight");
            rowMap2.put("framework", "reactjs");
            rowMap2.put("url", "/wnprc_ehr/weight.view");
            insertCmd2.addRow(rowMap2);

            insertCmd2.execute(cn, EHR_FOLDER_PATH);

            log("Inserted weight as a reactjs form type into ehr.form_framework_types");
        } else
        {
            log("feeding/weight framework type already exists, no action needed");
        }
    }

    public void setupClinpathVirologySection() throws IOException, CommandException
    {
        // update virology results section buttons
        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());
        log("populating ehr.FormPanelSections with new clinpath file import button");
        UpdateRowsCommand insertCmd = new UpdateRowsCommand("ehr", "FormPanelSections");
        SelectRowsCommand sr = new SelectRowsCommand("ehr","FormPanelSections");
        sr.addFilter("schemaName","study", Filter.Operator.EQUAL);
        sr.addFilter("queryName","Virology Results", Filter.Operator.EQUAL);
        sr.addFilter("formtype","Clinpath", Filter.Operator.EQUAL);
        SelectRowsResponse resp = sr.execute(createDefaultConnection(), EHR_FOLDER_PATH);
        Integer rowid = null;
        for (Map<String, Object> row : resp.getRows())
        {
            rowid = (Integer) row.get("rowid");
        }
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("rowid",rowid);
        rowMap.put("destination","formSections");
        rowMap.put("formtype","Clinpath");
        rowMap.put("xtype","ehr-gridformpanel");
        rowMap.put("schemaName","study");
        rowMap.put("sort_order",10);
        rowMap.put("queryName","Virology Results");
        rowMap.put("metadatasources","Task,Assay");
        rowMap.put("buttons","add,requestdelete,copyfromclinpath,selectall,duplicate,bulk_edit,sortany,apply_template,save_template,import_results_from_file");
        insertCmd.addRow(rowMap);
        insertCmd.execute(cn, EHR_FOLDER_PATH);

        // upload virology results excel file
        goToEHRFolder();
        goToModule("FileContent");
        _fileBrowserHelper.uploadFile(CORRECT_SAMPLE_FILE);
        _fileBrowserHelper.uploadFile(INCORRECT_FORMAT_SAMPLE_FILE);
        _fileBrowserHelper.uploadFile(NO_MATCHING_RECORDS_SAMPLE_FILE);

        // set up the viral load hashmap to match CORRECT_SAMPLE_FILE
        VIROLOGY_RESULT_DATA.put("Id", "test1993532");
        VIROLOGY_RESULT_DATA.put("Date", "2022-07-22");
        VIROLOGY_RESULT_DATA.put("Sample Type", "Blood - EDTA Whole Blood");
        VIROLOGY_RESULT_DATA.put("Virus", "SRV 1,2,3,4,5");
        VIROLOGY_RESULT_DATA.put("Method", "PCR");
        VIROLOGY_RESULT_DATA.put("Result", "-");
        VIROLOGY_RESULT_DATA.put("Qualifier", "Negative");
        VIROLOGY_RESULT_DATA.put("Remark", "CRL");


        // set the location of the virology results upload location
        goToEHRFolder();
        List<ModulePropertyValue> properties = new ArrayList<>();
        properties.add(new ModulePropertyValue("WNPRC_EHR", "/", "VirologyResultsUploadFolder", EHR_FOLDER_PATH));
        setModuleProperties(properties);
    }

    public void setupAnimalRequests()
    {
        _containerHelper.createSubfolder(EHR_FOLDER_PATH, "Assigns", "Collaboration");
        _containerHelper.createSubfolder(EHR_FOLDER_PATH + "/Assigns", "PrivateBoard", "Collaboration");
        _containerHelper.createSubfolder(EHR_FOLDER_PATH + "/Assigns", "RestrictedBoard", "Collaboration");
        // set the location of the virology results upload location
        goToEHRFolder();
        List<ModulePropertyValue> properties = new ArrayList<>();
        properties.add(new ModulePropertyValue("WNPRC_EHR", "/", "AssignsSecureMessageBoardPrivateFolder", ASSIGNS_MSG_BOARD_PRIVATE_PATH));
        properties.add(new ModulePropertyValue("WNPRC_EHR", "/", "AssignsSecureMessageBoardRestrictedFolder", ASSIGNS_MSG_BOARD_RESTRICTED_PATH));
        setModuleProperties(properties);
    }

    @Override
    protected boolean doSetUserPasswords()
    {
        return true;
    }

    public void navigateToFeeding()
    {
        /*WebElement modeElement = Locator.tagWithText("a", "Enter Data").findElement(getDriver());
        modeElement.click();
        waitForElement(Locator.linkContainingText("Enter Feeding Orders"));
        WebElement modeElement2 = Locator.tagWithText("a", "Enter Feeding Orders").findElement(getDriver());
        modeElement2.click();*/
        beginAt(buildURL("wnprc_ehr", getContainerPath(), "feeding"));
    }

    public void navigateToWeights()
    {
        beginAt(buildURL("wnprc_ehr", getContainerPath(), "weight"));
        waitForElement(Locator.id("submit-all-btn"), defaultWaitForPage);
    }

    public void navigateToAnimalRequestForm()
    {
        beginAt(buildURL("animalrequests", getContainerPath(), "app"));
    }

    public WebElement fillAnInput(String inputId, String value)
    {
        WebElement el = Locator.id(inputId).findElement(getDriver());
        el.sendKeys(value);
        return el;
    }

    public void fillFeedingForm(String weightVal, Integer index)
    {
        WebElement el = fillAnInput("id_" + index.toString(), ANIMAL_SUBSET_EHR_TEST[index]);
        el.sendKeys(Keys.TAB);
        el.sendKeys(Keys.TAB);
        WebElement el3 = fillAnInput("type_" + index.toString(), "l");
        WebElement el4 = fillAnInput("amount_" + index.toString(), weightVal);
        WebElement el5 = fillAnInput("remark_"+ index.toString(), "Entered from automated test");
    }

    public void fillWeightForm(String weightVal, Integer index)
    {
        String animalId = ANIMAL_SUBSET_EHR_TEST[index];
        fillAnInput("animalid_" + index, animalId );
        sleep(1000);
        WebElement el2 = fillAnInput("weight_" + index.toString(), weightVal);

        //commenting out since this tries to tab over the date and time and fails, since looks like it requires selecting the date and time value
//        el2.sendKeys(Keys.TAB);
//        el2.sendKeys(Keys.TAB);

        fillAnInput("remark_"+ index, "Entered from automated test");
        sleep(1000);
        fillAnInput("restraint_" + index, "T");
        waitForElement(Locator.linkWithText(animalId), WAIT_FOR_PAGE * 2); // Wait for the Animal Info window to load
    }

    public WebElement waitUntilElementIsClickable(String id)
    {
        return longWait().until(ExpectedConditions.elementToBeClickable(Locator.id(id)));
    }

    public void clickNewButton(String id)
    {
        waitUntilElementIsClickable(id).click();
    }

    public SelectRowsResponse fetchFeedingData() throws IOException, CommandException
    {
        Connection cn = createDefaultConnection();
        SelectRowsCommand cmd = new SelectRowsCommand("study", "feeding");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("Id", "date", "type", "amount", "remark", "QCState", "taskid", "objectid"));
        cmd.setSorts(Collections.singletonList(new Sort("date", Sort.Direction.DESCENDING)));
        cmd.setMaxRows(100);
        return cmd.execute(cn, EHR_FOLDER_PATH);

    }

    public SelectRowsResponse fetchWeightData() throws IOException, CommandException
    {
        Connection cn = createDefaultConnection();
        SelectRowsCommand cmd = new SelectRowsCommand("study", "weight");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("Id", "date", "weight", "remark", "QCState", "taskid", "objectid", "restraint_objectid"));
        cmd.setSorts(Collections.singletonList(new Sort("date", Sort.Direction.DESCENDING)));
        cmd.setMaxRows(100);
        return cmd.execute(cn, EHR_FOLDER_PATH);
    }

    @Test
    public void testWeightValidation()
    {
        //initialize weight of subject 3
        String[] fields;
        Object[][] data;
        SimplePostCommand insertCommand;
        fields = new String[]{"Id", "date", "weight", "QCStateLabel"};
        data = new Object[][]{
                {TEST_SUBJECTS[3], new Date(), 12, EHRQCState.COMPLETED.label},
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Weight", "lsid", fields, data);
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), insertCommand, getExtraContext());

        //expect weight out of range
        data = new Object[][]{
                {TEST_SUBJECTS[3], new Date(), null, null, 120, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        Map<String, List<String>> expected = new HashMap<>();
        expected.put("weight", Arrays.asList(
                "WARN: Weight above the allowable value of 20.0 kg for Cynomolgus",
                "INFO: Weight gain of >10%. Last weight 12 kg")
        );
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "weight", weightFields, data, expected);

        //expect INFO for +10% diff
        data = new Object[][]{
                {TEST_SUBJECTS[3], new Date(), null, null, 20, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        expected = new HashMap<>();
        expected.put("weight", Collections.singletonList("INFO: Weight gain of >10%. Last weight 12 kg"));
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "weight", weightFields, data, expected);

        //expect INFO for -10% diff
        data = new Object[][]{
                {TEST_SUBJECTS[3], new Date(), null, null, 5, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        expected = new HashMap<>();
        expected.put("weight", Collections.singletonList("INFO: Weight drop of >10%. Last weight 12 kg"));
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "weight", weightFields, data, expected);

        //TODO: test error threshold
    }

    @Test
    public void testBilling() throws IOException, CommandException
    {
        log("Enter misc charges via data entry form.");
        enterCharges();

        log("Perform Billing Run for period 10/01/2010-10/31/2010");
        performBillingRun("10/01/2010", "10/31/2010", ++BILLING_RUN_COUNT);

        log("Test Invoiced Items");
        testInvoicedItems();

        log("Test Summary Reports");
        testSummaryReports();

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
        goToBillingFolder();
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

    @Test
    public void testDebitAccountFiltering()
    {
        log("Verify Debit Account drop down with list of account(s) active on the date of charge");

        goToBillingFolder();
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges without Animal Ids"));

        Ext4GridRef miscChargesGrid = _helper.getExt4GridForFormSection("Misc. Charges");
        _helper.addRecordToGrid(miscChargesGrid);

        miscChargesGrid.setGridCell(1, "date", "1997-05-16");
        Locator comboCol = miscChargesGrid.getCell(1, "debitedaccount");
        click(comboCol);
        List<String> options = _ext4Helper.getComboBoxOptions(Ext4Helper.Locators.formItemWithInputNamed("debitedaccount"));
        assertEquals("There should be only one account listed in Debited Account drop down: ", 1, options.size());
        assertEquals("Account not found: ", ACCOUNT_ID_1, options.get(0));
    }

    @Test
    public void testJETWithNonGenCreditAccount()
    {
        goToBillingFolder();
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges without Animal Ids"));

        String startDate = LocalDateTime.now().minusDays(45).format(_dateTimeFormatter);
        String endDate = LocalDateTime.now().minusDays(16).format(_dateTimeFormatter);

        Map<String, String> mapWithDebitAcct = new LinkedHashMap<>();
        mapWithDebitAcct.put("date", startDate);
        mapWithDebitAcct.put("debitedaccount", NON_GEN_CREDIT_ACCOUNT_ID);
        mapWithDebitAcct.put("chargeGroup", "Business Office");
        mapWithDebitAcct.put("chargeId", "Blood draws - Additional Tubes");
        mapWithDebitAcct.put("quantity", "8");
        mapWithDebitAcct.put("chargetype", "Adjustment");
        mapWithDebitAcct.put("comment", "charge without non gen credit acct");

        Map<String, String> mapWithDebitAcct2 = new LinkedHashMap<>();
        mapWithDebitAcct2.put("date", startDate);
        mapWithDebitAcct2.put("debitedaccount", GEN_CREDIT_ACCT_ID);
        mapWithDebitAcct2.put("chargeGroup", "Clinical Pathology");
        mapWithDebitAcct2.put("chargeId", "vaccine supplies");
        mapWithDebitAcct2.put("quantity", "5");
        mapWithDebitAcct2.put("comment", "charge with gen credit acct");

        log("Enter Misc. Charges with debit account " + NON_GEN_CREDIT_ACCOUNT_ID + " in grid row 1");
        enterChargesInGrid(1, mapWithDebitAcct);

        log("Enter Misc. Charges with debit account " + GEN_CREDIT_ACCT_ID + " in grid row 2");
        enterChargesInGrid(2, mapWithDebitAcct2);

        log("Submit the form");
        sleep(5000);
        submitForm();

        performBillingRun(startDate, endDate, ++BILLING_RUN_COUNT);

        goToBillingFolder();

        DataRegionTable invoiceRunsDataRegionTable = getInvoiceRunsDataRegionTable();
        invoiceRunsDataRegionTable.link(0, "viewJETInvoice").click();

        DataRegionTable jetRegionTable  = new DataRegionTable("query", this);
        assertEquals("Wrong jet item count: ", 1, jetRegionTable.getDataRowCount());

        List<String> expectedRowData = Arrays.asList(NON_GEN_CREDIT_ACCOUNT_ID, "8.00");
        List<String> actualRowData = jetRegionTable.getRowDataAsText(0, "Project", "Amount");
        assertEquals("Wrong row data for CSV to JET Preview report ", expectedRowData, actualRowData);
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

        _helper.toggleBulkEditField("Date of Charge");
        if (Ext4FieldRef.getForLabel(this, "Date of Charge").getValue() == null)
        {
            Ext4FieldRef.getForLabel(this, "Date of Charge").setValue(LocalDateTime.now().format(_dateTimeFormatter));
        }

        log ("Toggle fields");
        if (hasAnimalId)
        {
            _helper.toggleBulkEditField("Project");
        }
        else
        {
            _helper.toggleBulkEditField("Debit Account");
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
        goToBillingFolder();
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

        verifyChargeSummary("Blood Draws Additional Tubes - Animal Services", 1);
        verifyChargeSummary("Blood Draws One Tube - Animal Services", 50);

        verifyChargeSummary("Misc. Charges", 1);
        verifyChargeSummary("Per Diems", 1);

        goBack(WAIT_FOR_PAGE);
    }

    private void verifyChargeSummary(String category, int rowCount)
    {
        log("Verifying '" + category + "' charge summary in the notification");
        pushLocation();
        clickAndWait(Locator.linkWithText(category));
        DataRegionTable table = new DataRegionTable("query", getDriver());
        assertEquals("Wrong number of rows in " + category, rowCount, table.getDataRowCount());
        popLocation();
    }

    private void testInvestigatorFacingLinks()
    {
        goToPIPortal();
        log("Give EHR Lab Read access to PI Portal folder.");
        _permissionsHelper.setPermissions("EHR Lab", "ReaderRole");

        goToPIPortal();
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
        //unit cost indirect is 40
        expectedRowData = Arrays.asList("2010-10-01", "2010-10-31", "00640991", "47.00",	"$1,068.95");
        actualRowData = invoicedItemsByProject.getRowDataAsText(0, "invoiceId/billingPeriodStart", "invoiceId/billingPeriodEnd", "project", "numItems", "total");
        assertEquals("Wrong row data for invoicedItemsByProject ", expectedRowData, actualRowData);

        log("Validating Summary By Item's total sum value");
        clickAndWait(Locator.linkContainingText("Summary By Item"));
        assertTextPresent("Sum", "$1,068.95");

        goBack();

        clickAndWait(Locator.linkContainingText("All Items"));
        DataRegionTable invoicedItems = new DataRegionTable("query", getDriver());
        assertEquals("Wrong row count", 6, invoicedItems.getDataRowCount());
        log("Validating Totals");
        assertTextPresent("$806.00", "$13.00", "$1.95", "$195.00");

        stopImpersonating();
    }

    public int getUserId(String email) throws IOException, CommandException
    {
        Connection cn = WebTestHelper.getRemoteApiConnection();

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

    private void addInvestigators() throws IOException, CommandException
    {
        Map<String,Object> investigatorsMap = new HashMap<>();

        log("Add investigators to ehr.investigators table.");

        goToEHRFolder();

        Connection cn = WebTestHelper.getRemoteApiConnection();

        log("Inserting Principal Investigator Jon Snow.");
        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr", "investigators");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("firstName", "Jon");
        rowMap.put("lastName", "Snow");
        rowMap.put("investigatorType", "Core");
        rowMap.put("emailAddress", INVESTIGATOR_PRINCIPAL.getEmail());
        rowMap.put("userid", getUserId(INVESTIGATOR_PRINCIPAL.getEmail()));
        insertCmd.addRow(rowMap);

        log("Inserting Junior Investigator Sansa Stark.");
        rowMap = new HashMap<>();
        rowMap.put("firstName", "Sansa");
        rowMap.put("lastName", "Stark");
        rowMap.put("investigatorType", "External");
        rowMap.put("emailAddress", INVESTIGATOR.getEmail());
        rowMap.put("userid", getUserId(INVESTIGATOR.getEmail()));
        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, EHR_FOLDER_PATH).getRows().forEach(row -> investigatorsMap.put(row.get("emailAddress").toString(), row.get("rowid")));
        log("Investigators inserted in to ehr.investigators table.");

        log("Update ehr_billing.aliases with investigators.");
        UpdateRowsCommand cmdUpd = new UpdateRowsCommand("ehr_billing", "aliases");
        Map<String,Object> aliasesRowMap = new HashMap<>();
        aliasesRowMap.put("rowid", aliasesMap.get(ACCOUNT_ID_1));
        aliasesRowMap.put("investigatorId", investigatorsMap.get(INVESTIGATOR.getEmail()));
        cmdUpd.addRow(aliasesRowMap);

        aliasesRowMap = new HashMap<>();
        aliasesRowMap.put("rowid", aliasesMap.get(ACCOUNT_ID_2));
        aliasesRowMap.put("investigatorId", investigatorsMap.get(INVESTIGATOR_PRINCIPAL.getEmail()));
        cmdUpd.addRow(aliasesRowMap);

        cmdUpd.execute(cn, PRIVATE_FOLDER_PATH);

        log("Update ehr_billing.project with investigators.");
        cmdUpd = new UpdateRowsCommand("ehr", "project");
        Map<String,Object> projRowMap = new HashMap<>();
        projRowMap.put("project", Integer.valueOf(PROJECT_ID));
        projRowMap.put("investigatorId", investigatorsMap.get(INVESTIGATOR.getEmail()));
        cmdUpd.addRow(projRowMap);

        projRowMap = new HashMap<>();
        projRowMap.put("project", Integer.valueOf(PROTOCOL_PROJECT_ID));
        projRowMap.put("investigatorId", investigatorsMap.get(INVESTIGATOR_PRINCIPAL.getEmail()));
        cmdUpd.addRow(projRowMap);

        cmdUpd.execute(cn, EHR_FOLDER_PATH);

    }

    private void provideBillingDataAccess() throws IOException, CommandException
    {
        goToBillingFolder();
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
        waitForText("Stark, Sansa");
        List<String> actualRowData = dataAccessTable.getRowDataAsText(0, "investigatorid", "userId", "project", "alldata");
        List<String> expectedRowData = Arrays.asList("Stark, Sansa", "investigator", "640991", "No");
        assertEquals("Data access row not inserted as expected: " , expectedRowData, actualRowData);
    }

    private void viewBillingQueries()
    {
        String startDate="09%2F01%2F2011";
        String endDate="09%2F30%2F2011";
//        clickAndWait(Locator.bodyLinkContainingText("View Billing Queries"), WAIT_FOR_JAVASCRIPT); //firefox45 on teamcity does not load this page.

        goToEHRFolder();
        log("Verify misc charges");
        beginAt(buildURL("query", getContainerPath(), "executeQuery", Maps.of("schemaName", "wnprc_billing", "queryName", "miscChargesFeeRates", "query.param.StartDate", startDate, "query.param.EndDate", endDate)));
        DataRegionTable miscChargesFeeRates = new DataRegionTable("query", this);
        List<String> expectedRowData = Arrays.asList(PROJECT_MEMBER_ID, "2011-09-15", "640991", "acct101", "$19.50", "10.0", "$195.00", getDisplayName());
        List<String> actualRowData = miscChargesFeeRates.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "unitCost", "quantity", "totalCost", "createdby");
        assertEquals("Wrong row data for Misc Charges: ", expectedRowData, actualRowData);
        assertEquals("One row should be displayed", miscChargesFeeRates.getDataRowCount(), 1);

        goToBillingFolder();
        log("Verify per diems");
        beginAt(buildURL("query", PRIVATE_FOLDER_PATH, "executeQuery", Maps.of("schemaName", "wnprc_billing", "queryName", "perDiemFeeRates", "query.param.StartDate", startDate, "query.param.EndDate", endDate)));
        DataRegionTable perDiemFeeRates = new DataRegionTable("query", this);
        expectedRowData = Arrays.asList(PROJECT_MEMBER_ID, "2011-09-01 00:00", "640991", "acct101", "$26.00", "30.0", "0.3", "$780.00");
        actualRowData = perDiemFeeRates.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "unitCost", "quantity", "tierRate", "totalCost");
        assertEquals("Wrong row data for Per Diems: ", expectedRowData, actualRowData);
        assertEquals("One row should be displayed", perDiemFeeRates.getDataRowCount(), 1);

        goToBillingFolder();
        log("Verify num. rows for 'blood draws with one tube'");
        beginAt(buildURL("query", PRIVATE_FOLDER_PATH, "executeQuery", Maps.of("schemaName", "wnprc_billing", "queryName", "bloodDrawsOneTubeAnimalServices", "query.date~dategte", startDate, "query.date~datelte", endDate)));
        DataRegionTable bloodDrawProcedureOneTube = new DataRegionTable("query", this);
        expectedRowData = Arrays.asList(PROJECT_MEMBER_ID, "2011-09-27 09:30", "640991", "acct101", "0.3", "1.0", " ");
        actualRowData = bloodDrawProcedureOneTube.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "otherRate", "quantity", "performedby");
        assertEquals("Wrong row data for Blood Draws with one tube: ", expectedRowData, actualRowData);
        assertEquals("Four rows should be displayed", bloodDrawProcedureOneTube.getDataRowCount(), 4);

        goToBillingFolder();
        log("Verify num. rows for 'blood draws with additional tubes'");
        beginAt(String.format("query/%s/executeQuery.view?schemaName=wnprc_billing&query.queryName=bloodDrawsAdditionalTubesAnimalServices&query.date~dategte=2011-09-01&query.date~datelte=2011-09-30", PRIVATE_FOLDER_PATH));
        DataRegionTable bloodDrawProcedureAddnlTubes = new DataRegionTable("query", this);
        expectedRowData = Arrays.asList(PROJECT_MEMBER_ID, "2011-09-27 09:30", "640991", "acct101", "0.3", "2.0", " ");
        actualRowData = bloodDrawProcedureAddnlTubes.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "otherRate", "quantity", "performedby");
        assertEquals("Wrong row data for Blood Draws with Additional tubes: ", expectedRowData, actualRowData);
        assertEquals("One row should be displayed", bloodDrawProcedureAddnlTubes.getDataRowCount(), 1);

        goToBillingFolder();
        log("Verify num. rows for 'blood draws for spi'");
        beginAt(String.format("query/%s/executeQuery.view?schemaName=wnprc_billing&query.queryName=bloodDrawsAllTubesSPI&query.date~dategte=2010-10-01&query.date~datelte=2010-10-30", PRIVATE_FOLDER_PATH));
        DataRegionTable bloodDrawProcedureSPI = new DataRegionTable("query", this);
        expectedRowData = Arrays.asList(PROJECT_MEMBER_ID_2, "2010-10-18 07:30", "640991", "acct103", "1.0", "1.0", "rk");
        actualRowData = bloodDrawProcedureSPI.getRowDataAsText(0, "Id", "date", "project", "debitedAccount", "otherRate", "quantity", "performedby");
        assertEquals("Wrong row data for Blood Draws with Additional tubes: ", expectedRowData, actualRowData);
        assertEquals("One row should be displayed", bloodDrawProcedureSPI.getDataRowCount(), 1);
    }

    private void viewChargesAdjustmentsNotYetBilled(int numRows, String filterCol, String filterVal, List<String> expectedRowData)
    {
        goToBillingFolder();

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
        goToBillingFolder();

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
        goToBillingFolder();

        goToSchemaBrowser();
        DataRegionTable dataRegionTable = viewQueryData("ehr_billing", "invoiceExternal");

        log("Download "+ (pdfName.equalsIgnoreCase("downloadPDF") ? "Invoice PDF.": "Summary PDF."));
        File pdf = doAndWaitForDownload(() -> dataRegionTable.link(0, pdfName).click());

        assertTrue("Wrong file type for export pdf [" + pdf.getName() + "]", pdf.getName().endsWith(".pdf"));
        assertTrue("Empty pdf downloaded [" + pdf.getName() + "]", pdf.length() > 0);
    }

    public String getBillingContainerPath()
    {
        return getProjectName() + "/" + PRIVATE_TARGET_FOLDER_PATH;
    }

    public String getPIPortalContainerPath()
    {
        return getProjectName() + PI_FOLDER_FOLDER_PATH;
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
        mapWithDebitAcct.put("date", "2010-10-23");
        mapWithDebitAcct.put("debitedaccount", ACCOUNT_ID_1);
        mapWithDebitAcct.put("chargeGroup", "Business Office");
        mapWithDebitAcct.put("chargeId", "Blood draws - Additional Tubes");
        mapWithDebitAcct.put("quantity", "8");
        mapWithDebitAcct.put("chargetype", "Adjustment");
        mapWithDebitAcct.put("comment", "charge 1 without animal id");

        Map<String, String> mapWithDebitAcct2 = new LinkedHashMap<>();
        mapWithDebitAcct2.put("date", "2010-10-22");
        mapWithDebitAcct2.put("debitedaccount", ACCOUNT_ID_1);
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

        goToBillingFolder();

        log("Enter Misc. Charges with animal Id.");
        waitAndClickAndWait(Locator.bodyLinkContainingText("Enter Charges with Animal Ids"));
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
        waitAndClickAndWait(Locator.bodyLinkContainingText("Enter Charges without Animal Ids"));
        enterChargesInGrid(1, mapWithDebitAcct);

        log("Submit & Reload");
        sleep(5000);
        submitAndReloadForm();

        log("Enter another Misc. Charges with debit account");
        waitForElement(Locator.tagContainingText("label", "Assigned To"));
        enterChargesInGrid(1, mapWithDebitAcct2);

        log("Submit the form");
        sleep(5000);
        submitForm();

    }

    private void enterChargesInGrid(int rowIndex, Map<String, String> items)
    {
        Ext4GridRef miscChargesGrid = _helper.getExt4GridForFormSection("Misc. Charges");
        _helper.addRecordToGrid(miscChargesGrid);

        for (Map.Entry<String, String> pair : items.entrySet())
        {
            String colName = pair.getKey();
            String colValue = pair.getValue();
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
        sleep(5000);
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
        Locator comboCol = miscChargesGrid.getCell(rowIndex, colName);
        click(comboCol);
        sleep(2000);
        Locator.XPathLocator comboColLocator = Ext4Helper.Locators.formItemWithInputNamed(colName);

        if (matchTechnique != null)
            _ext4Helper.selectComboBoxItem(comboColLocator, matchTechnique, comboBoxSelectionValue);
        else
            _ext4Helper.selectComboBoxItem(comboColLocator, comboBoxSelectionValue);

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
                "chargeId/departmentCode",
                "unitCost",
                "startDate",
                "endDate",
                "genCredits",
                "chargeId/isAutomatic"
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
                "endDate",
                "isAutomatic"
        );

        checkColumns(linkText, expectedColumns);
    }

    private void checkColumns(String linkText, List<String> expectedColumns)
    {
        goToBillingFolder();
        clickAndWait(Locator.bodyLinkContainingText(linkText));
        DataRegionTable results = new DataRegionTable("query", getDriver());
        assertEquals("Wrong columns for " + linkText, expectedColumns, results.getColumnNames());
    }

    private void updateChargeRates()
    {
        goToBillingFolder();
        waitForText("Standard Rates");
        clickAndWait(Locator.bodyLinkContainingText("Standard Rates"));

        DataRegionTable drt = new DataRegionTable("query", getDriver());
        ImportDataPage importDataPage = drt.clickImportBulkData();

        log("Test for Overlapping date error during data upload");
        String error1 = "ERROR: For charge Item Per diems: Charge item start date (2050-01-01) is after charge item end date (2049-12-31).";
        String error2 = "ERROR: For charge Item Medicine A per dose: Charge rate (2018-05-05 to 2019-12-31) overlaps a previous charge rate (2007-01-01 to 2045-12-31).";
        importDataPage.setFile(CHARGEABLE_ITEMS_RATES_ERROR_TSV);
        importDataPage.submitExpectingError();
        assertTextPresent(error1, error2);

        log("Test for Group-Category association during data upload");
        error1 = "ERROR: 'Scientific Protocol Implementation, Surgery' is not a valid group and category association. If this is a new association, then add this association to ehr_billing.groupCategoryAssociations table by going to 'GROUP CATEGORY ASSOCIATIONS' link on the main Finance page.";
        error2 = "ERROR: 'Clinical Pathology, Surgery' is not a valid group and category association. If this is a new association, then add this association to ehr_billing.groupCategoryAssociations table by going to 'GROUP CATEGORY ASSOCIATIONS' link on the main Finance page.";
        importDataPage.setFile(CHARGEABLE_ITEMS_RATES_GROUP_CATEGORY_ERROR_TSV);
        importDataPage.submitExpectingError();
        assertTextPresent(error1, error2);

        uploadChargeRates(CHARGEABLE_ITEMS_RATES_UPDATE_TSV, CHARGE_RATES_NUM_UPDATE_ROWS, CHARGEABLE_ITEMS_NUM_UPDATE_ROWS);

        goToBillingFolder();
        waitForText("Standard Rates");
        clickAndWait(Locator.bodyLinkContainingText("Standard Rates"));
        assertTextPresent("Blood draws", 2);
        assertTextPresent("Per diems", 1);
        assertTextPresent("Medicine A per dose", 2);
        assertTextPresent("vaccine supplies", 4);

        goToBillingFolder();
        waitForText("Chargeable Items");
        clickAndWait(Locator.bodyLinkContainingText("Chargeable Items"));
        assertTextPresent("Blood draws", 2);
        assertTextPresent("Per diems", 1);
        assertTextPresent("Medicine A per dose", 2);
        assertTextPresent("vaccine supplies", 3);

    }

    private void uploadChargeRates(File file, int rateRows, int itemRows)
    {
        goToBillingFolder();
        waitForText("Standard Rates");
        clickAndWait(Locator.bodyLinkContainingText("Standard Rates"));

        DataRegionTable drt = new DataRegionTable("query", getDriver());
        drt.clickImportBulkData();
        ImportDataPage importDataPage = new ImportDataPage(getDriver());
        importDataPage.setFile(file);
        importDataPage.submit();

        waitForText("Standard Rates");
        drt = new DataRegionTable("query", getDriver());
        assertEquals(rateRows, drt.getDataRowCount());

        goToBillingFolder();
        clickAndWait(Locator.bodyLinkContainingText("Chargeable Items"));
        drt = new DataRegionTable("query", getDriver());
        assertEquals(itemRows, drt.getDataRowCount());
    }

    private void truncateBillingTables(Connection connection) throws IOException, CommandException
    {
        truncateTable(connection, "wnprc_billing", "tierRates");
        truncateTable(connection, "ehr_billing", "aliases");
        truncateTable(connection, "ehr_billing", "chargeUnits");
        truncateTable(connection, "ehr_billing", "chargeRates");
        truncateTable(connection, "ehr_billing", "chargeableItems");
        truncateTable(connection, "ehr_billing", "chargeableItemCategories");
        truncateTable(connection, "wnprc_billing", "groupCategoryAssociations");

    }

    private void uploadData() throws IOException, CommandException
    {
        Connection connection = createDefaultConnection();
        Map<String, Object> responseMap = new HashMap<>();

        truncateBillingTables(connection);

        //upload Tier Rates
        List<Map<String, Object>> tsv = loadTsv(TIER_RATES_TSV);
        insertTsvData(connection, "wnprc_billing", "tierrates", tsv, PRIVATE_FOLDER_PATH)
                .forEach(row -> responseMap.put(row.get("tierRateType").toString(),row.get("rowid")));

        //upload Grant Accounts
        tsv = loadTsv(ALIASES_TSV);
        insertTsvData(connection, "ehr_billing", "aliases", tsv, PRIVATE_FOLDER_PATH)
                .forEach(row -> aliasesMap.put(row.get("alias").toString(),row.get("rowid")));

        //upload Charge Units
        tsv = loadTsv(CHARGE_UNITS_TSV);
        insertTsvData(connection, "ehr_billing", "chargeUnits", tsv, PRIVATE_FOLDER_PATH)
                .forEach(row -> responseMap.put(row.get("groupName").toString(),row.get("active")));

        //upload Chargeable Item Categories
        tsv = loadTsv(CHARGEABLE_ITEM_CATEGORIES_TSV);
        insertTsvData(connection, "ehr_billing", "chargeableItemCategories", tsv, PRIVATE_FOLDER_PATH)
                .forEach(row -> responseMap.put(row.get("name").toString(),row.get("rowId")));

        //upload Group-Category Associations
        tsv = loadTsv(GROUP_CATEGORY_ASSOCIATIONS_TSV);
        insertTsvData(connection, "wnprc_billing", "groupCategoryAssociations", tsv, PRIVATE_FOLDER_PATH)
                .forEach(row -> responseMap.put(row.get("chargeGroupName").toString(),row.get("rowid")));

        //upload Chargeable Items and Charge Rates
        uploadChargeRates(CHARGEABLE_ITEMS_RATES_TSV, CHARGE_RATES_NUM_ROWS, CHARGEABLE_ITEMS_NUM_ROWS);

    }

    private List<Map<String, Object>> insertTsvData(Connection connection, String schemaName, String queryName, List<Map<String, Object>> tsv, String folderPath) throws IOException, CommandException
    {
        log("Loading tsv data: " + schemaName + "." + queryName);
        InsertRowsCommand command = new InsertRowsCommand(schemaName,queryName);
        command.setRows(tsv);
        SaveRowsResponse response = command.execute(connection, folderPath);
        return response.getRows();
    }

    private void truncateTable(Connection connection, String schemaName, String queryName) throws IOException, CommandException
    {
        log("Truncating table: " + schemaName + "." + queryName);
        TruncateTableCommand command = new TruncateTableCommand(schemaName, queryName);
        command.execute(connection, PRIVATE_FOLDER_PATH);
    }

    private void performBillingRun(String startDate, String endDate, int billingRunCount)
    {
        goToBillingFolder();
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
        testReports("Invoiced Items", 8, "test2312318","640991" , "$19.50", "$15.00",
                "Blood draws - Additional Tubes", "Per diems", "Misc. Fees", "vaccine supplies", "$195.00");
        // check that the acct103 was charged and not the account associated w/ project 640991
        testReports("Invoice Internal", 2, "acct103", "40.00");
    }

    private void testSummaryReports()
    {
        testReports("Invoice Runs", 1, "2010-10-01", "2010-10-31");
        testReports("Monthly Summary Indirect", 1, "Animal Per Diem", "Blood Draws", "Misc. Fees", "$806.00", "$72.75", "$285.00");
    }

    private void testReports(String linkText, int numRows, String... texts)
    {
        goToBillingFolder();
        click(Locator.bodyLinkContainingText(linkText));
        DataRegionTable results = new DataRegionTable("query", getDriver());
        assertEquals("Wrong row count", numRows, results.getDataRowCount());
        assertTextPresent(texts);
    }

    public void testDownloadMultipleInvoices()
    {
        goToBillingFolder();
        performBillingRun("11/01/2010", "11/10/2010", ++BILLING_RUN_COUNT);

        goToBillingFolder();
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
        goToBillingFolder();
        log("Enter Misc. Charges with animal Id.");
        clickAndWait(Locator.bodyLinkContainingText("Enter Charges with Animal Ids"));
        enterChargesInGrid(1, mapWithAnimalId);
        log("Submit the form");
        sleep(5000);
        submitForm();

        goToBillingFolder();
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

        goToEHRFolder();
        goToSchemaBrowser();
        DataRegionTable miscCharges = viewQueryData("ehr_billing", "miscCharges");
        miscCharges.setFilter("date", "Equals", "2010-11-22");
        List<String> invoiceId = miscCharges.getColumnDataAsText("invoiceId");
        assertTrue("invoiceId should be blank after invoice deletion", StringUtils.isBlank(invoiceId.get(0)));
    }

    private void goToFinanceFolderTable(String tableName)
    {
        goToBillingFolder();
        waitForText(tableName);
        clickAndWait(Locator.bodyLinkContainingText(tableName));
    }
    public LocalDate convertToLocalDateViaSqlDate(Date dateToConvert)
    {
        return new java.sql.Date(dateToConvert.getTime()).toLocalDate();
    }

    //@Test - old ext form
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
        clickBootstrapTab("All Tasks");
        waitForElement(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, ((Locator) Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")).findElements(getDriver()).size());
        clickBootstrapTab("Tasks By Room");
        waitForElement(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        sleep(WAIT_FOR_JAVASCRIPT); //For the table to completely load - Teamcity error fix.
        assertEquals("Incorrect number of task rows.", 3, ((Locator) Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")).findElements(getDriver()).size());
        clickBootstrapTab("Tasks By Id");
        waitForElement(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        sleep(WAIT_FOR_JAVASCRIPT); //For the table to completely load - Teamcity error fix.
        assertEquals("Incorrect number of task rows.", 3, ((Locator) Locator.xpath("//div[contains(@class, 'id-tasks-marker') and "
                + Locator.NOT_HIDDEN + "]//tr[contains(@class, 'labkey-alternate-row') or contains(@class, 'labkey-row')]//a[.='Test weight task']")).findElements(getDriver()).size());
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
        clickBootstrapTab("Tasks Requiring Review");
        waitForElement(Locator.xpath("//div[contains(@class, 'review-requested-marker') and " + Locator.NOT_HIDDEN + "]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, Locator.xpath("//div[contains(@class, 'review-requested-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']").findElements(getDriver()).size());
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

        goToEHRFolder();
        waitAndClickAndWait(Locator.linkWithText("Browse All Datasets"));
        waitAndClickAndWait(LabModuleHelper.getNavPanelItem("Weight:", "Browse All"));

        (new DataRegionTable("query", this)).setFilter("date", "Equals", DATE_FORMAT.format(new Date()));
        assertTextPresent("3.333", "4.444", "5.555");
        assertEquals("Completed was not present the expected number of times", 6, Locator.xpath("//td[text() = 'Completed']").findElements(getDriver()).size());
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
        _helper.setDataEntryField("title", MPR_TASK_TITLE);
        waitAndClick(Locator.name("title"));
        _extHelper.selectComboBoxItem("Assigned To:", BASIC_SUBMITTER.getGroup() + "\u00A0"); // appended with a nbsp (Alt+0160)
        sleep(2000);
        _extHelper.setExtFormElementByLabel("Id:", PROJECT_MEMBER_ID + "\t");
        sleep(2000);
        click(Locator.xpath("//div[./label[normalize-space()='Id:']]//input"));
        waitForElement(Locator.linkWithText(PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT);
        _helper.setDataEntryField("performedby", FULL_SUBMITTER.getEmail());
        waitAndClickAndWait(Locator.extButtonEnabled("Save & Close"));

        waitForElement(Locator.tagWithText("em", "No data to show."), WAIT_FOR_JAVASCRIPT);
        clickBootstrapTab("All Tasks");
        //TODO: make these more
        waitForElement(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a").withText(MPR_TASK_TITLE).findElements(getDriver()).size());
        clickBootstrapTab("Tasks By Room");
        waitForElement(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a").withText(MPR_TASK_TITLE).findElements(getDriver()).size());
        clickBootstrapTab("Tasks By Id");
        waitForElement(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a").withText(MPR_TASK_TITLE).findElements(getDriver()).size());
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

    private void clickBootstrapTab(String tab)
    {
        Locator loc = Locator.tagWithClass("ul", "nav-tabs").append(Locator.tagWithText("a", tab));
        click(loc);
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
        waitForElement(Locator.tag("th").containing("Most Recent Weight").notHidden());
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
    public void testAnimalAbstract() {
        goToEHRFolder();
        waitAndClickAndWait(Locator.linkWithText("Animal History"));

        AnimalHistoryPage<AnimalHistoryPage> animalHistoryPage = new AnimalHistoryPage<>(getDriver());

        log("Verify abstract shows with single animal");
        animalHistoryPage
                .selectSingleAnimalSearch()
                .searchFor(MORE_ANIMAL_IDS[0])
                .clickCategoryTab("General")
                .clickReportTab("Abstract");
        waitForElement(Locator.tagWithClass("table", "animal-info-table"));
        assertElementPresent(Locator.tagWithClass("table", "animal-info-table"));

    }

    @Test
    public void testClinicalHistoryPanelOptions(){
        pauseJsErrorChecker();
        beginAtAnimalHistoryTab();
        openClinicalHistoryForAnimal("TEST1020148");
        List<String> expectedLabels = new ArrayList<>(
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

    private void testPaymentsReceived()
    {
        String date = LocalDateTime.now().format(_dateTimeFormatter);
        String amount = "1028.95";
        goToBillingFolder();
        Locator invoiceLink = Locator.bodyLinkContainingText("Invoice");
        waitForElement(invoiceLink);
        scrollIntoView(invoiceLink);
        clickAndWait(invoiceLink);
        DataRegionTable invoice = new DataRegionTable("query", getDriver());
        invoice.clickEditRow(0);
        setFormElement(Locator.inputByNameContaining("invoiceSentOn"), date);
        setFormElement(Locator.inputByNameContaining("paymentReceivedOn"), date);
        setFormElement(Locator.inputByNameContaining("paymentAmountReceived"), amount);

        clickButton("Submit",0);
        waitForText("Your upload was successful!");
        clickButton("OK");

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
        Assertions.assertThat(auditLog).as("Audit entry for ehr_billing.invoice")
                .contains("paymentamountreceived:  \u00BB 1028.95")
                .contains("balancedue:  \u00BB 0.0");
    }

    @Test
    public void testEnterFeeding() throws IOException, CommandException
    {
        //getDriver().manage().window().setSize(new Dimension(768, 1024));
        //getDriver().manage().window().setSize(new Dimension(800,650));
        //getDriver().manage().window().setPosition(new Point(0,500));
        //navigate to weights form and fill it out
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToFeeding();
        fillFeedingForm(FEEDING_AMT.toString(), 0);
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));

        SelectRowsResponse r = fetchFeedingData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("amount");
        TestLogger.log((wt.get("value")).toString());
        Assert.assertEquals(null, FEEDING_AMT, wt.get("value"));
    }

    @Test
    public void testWeights()
    {
      //dummy test
    }

    @Test
    public void testEnterWeights() throws IOException, CommandException
    {
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));
        assertTextPresent("Data Entry");

        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));
        testWeightToRestraintObjectIdRelationship();
    }

    @Test
    public void testWeightWarning() throws IOException, CommandException
    {
        navigateToWeights();
        fillWeightForm(LOW_VAL.toString(),0);
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));

        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, LOW_VAL, wt.get("value"));

        //beginAt(buildURL("wnprc_ehr", getContainerPath(), "dataEntry"));
        //beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(HIGH_VAL.toString(),0);
        sleep(1000);
        assertElementPresent(Locator.id("weight-warning"));
        sleep(2000);

    }
    public SelectRowsResponse fetchTaskData(String taskid) throws IOException, CommandException
    {
        Connection cn = createDefaultConnection();
        SelectRowsCommand cmd = new SelectRowsCommand("ehr", "tasks");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("rowid", "updateTitle", "formtype", "assignedto", "duedate", "createdby", "created", "qcstate"));
        cmd.addFilter("taskId", taskid, Filter.Operator.EQUAL);
        cmd.setSorts(Arrays.asList(new Sort("duedate", Sort.Direction.DESCENDING), new Sort("created", Sort.Direction.DESCENDING)));

        return cmd.execute(cn, EHR_FOLDER_PATH);
    }

    @Test
    public void testWeightSubmitForReview() throws IOException, CommandException
    {
        String reviewer = "EHR Full Submitters";
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(), 0);
        waitUntilElementIsClickable("submit-review-btn");
        clickNewButton("submit-review-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        Select assignedTo = SelectWrapper.Select(Locator.name("reviewers")).find(modalDialog);
        waitForElement(Locator.tagWithText("option", reviewer), WAIT_FOR_PAGE);
        assignedTo.selectByVisibleText(reviewer);
        WebElement selectedOption = assignedTo.getFirstSelectedOption();
        String reviewerValue = selectedOption.getAttribute("value");
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));

        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));

        Map<String, Object> taskidob = (Map<String, Object>) r.getRows().get(0).get("taskid");
        String taskid = taskidob.get("value").toString();

        SelectRowsResponse t = fetchTaskData(taskid);
        //assert that this task's assigned to is the same as info entered above
        Map<String, Object> id = (Map<String, Object>) t.getRows().get(0).get("assignedto");
        Assert.assertEquals(null, reviewerValue, id.get("value").toString());

        testWeightToRestraintObjectIdRelationship();
    }

    @Test
    public void testSaveWeightDraft() throws IOException, CommandException
    {
        navigateToWeights();
        fillWeightForm(LOW_VAL.toString(),0);
        waitUntilElementIsClickable("save-draft-btn");
        clickNewButton("save-draft-btn");
        //clickNewButton("submit-final");
        waitForText("Saved");
        //and check that it was actually saved and QC state is "In Progress"
        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, LOW_VAL, wt.get("value"));
        Map<String, Object> qc = (Map<String, Object>) r.getRows().get(0).get("QCState");
        Assert.assertEquals(null, "In Progress", qc.get("displayValue"));

    }

    public SelectRowsResponse fetchWeightDataGivenTaskRowId(String taskrowid) throws IOException, CommandException
    {
        Connection cn = createDefaultConnection();
        SelectRowsCommand cmd = new SelectRowsCommand("study", "weight");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("Id", "date", "weight", "remark", "QCState", "taskid"));
        cmd.addFilter("taskid/rowid", taskrowid, Filter.Operator.EQUAL);
        cmd.setSorts(Collections.singletonList(new Sort("date", Sort.Direction.DESCENDING)));
        return cmd.execute(cn, EHR_FOLDER_PATH);
    }

    @Test
    public void testEditAndDelete() throws IOException, CommandException
    {
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        clickNewButton("add-record");
        fillWeightForm(WEIGHT_VAL.toString(),1);
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));

        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));

        //make sure we are done saving things
        waitForText("My Tasks");
        //navigate to the weights table to click on the task id
        navigateToWeightsTable();
        Map<String, Object> taskidob = (Map<String, Object>) r.getRows().get(0).get("taskid");
        String taskid = taskidob.get("value").toString();
        SelectRowsResponse t = fetchTaskData(taskid);
        Map<String, Object> id = (Map<String, Object>) t.getRows().get(0).get("rowid");
        TestLogger.log("testEditAndDelete: Navigating to task id...");
        TestLogger.log(id.get("value").toString());
        waitAndClick(Locator.linkWithText(id.get("value").toString()));
        waitForText("Task Details");
        //waitAndClick(Locator.linkWithText("Weight"));
        //since clicking the link directly opens a new tab and loses focus, go to url directly
        waitForElement(Locator.linkWithText("Weight"));
        WebElement el = Locator.linkWithText("Weight").findElement(getDriver());
        String url = el.getAttribute("href");
        getDriver().navigate().to(url);
        TestLogger.log("waiting for button..");
        sleep(2000);
        //query weights and go to the weights view
        waitForText(ANIMAL_SUBSET_EHR_TEST[0]);
        //TestLogger.log(Locator.className("content-left").findElement(getDriver()).getAttribute("outerHTML"));
        clickNewButton("remove-record-btn_1");
        sleep(2000);
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog1 = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog1.dismiss("Submit final"));
        //verify that it was deleted by counting that task has only 1 record in it
        //do a a query to get weights filtered by taskid
        SelectRowsResponse r2 =  fetchWeightDataGivenTaskRowId(id.get("value").toString());
        Assert.assertEquals(1,r2.getRows().size());
        TestLogger.log(String.valueOf(countText(id.get("value").toString())));
    }

    public void addBatchByIds()
    {
        clickNewButton("add-batch");
        waitForElement(Locator.id("ids"));
        WebElement el = Locator.id("ids").findElement(getDriver());
        for (int i = 0; i < ANIMAL_SUBSET_EHR_TEST.length; i++){
            el.sendKeys(ANIMAL_SUBSET_EHR_TEST[i]);
            if (i < ANIMAL_SUBSET_EHR_TEST.length-1 ){
                el.sendKeys(",");
            }
        }
        clickNewButton("submit-batch");
        sleep(10000);
    }

    public void addBatchByLocation()
    {
        clickNewButton("add-batch");
        waitForElement(Locator.id("locations"));
        WebElement el = Locator.id("locations").findElement(getDriver());
        WebElement in = el.findElement(By.tagName("input"));
        in.sendKeys(ROOM_ID_EHR_TEST);
        sleep(2000);
        in.sendKeys(Keys.ENTER);
        clickNewButton("submit-batch");
        sleep(5000);
    }

    public SelectRowsResponse fetchRestraintDataGivenObjectId(String objectid) throws IOException, CommandException
    {
        Connection cn = createDefaultConnection();
        SelectRowsCommand cmd = new SelectRowsCommand("study", "restraints");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("Id", "date", "restraintType", "objectid"));
        cmd.addFilter("objectid", objectid, Filter.Operator.EQUAL);
        cmd.setSorts(Collections.singletonList(new Sort("date", Sort.Direction.DESCENDING)));
        cmd.setMaxRows(100);
        return cmd.execute(cn, EHR_FOLDER_PATH);

    }

    @Test
    public void testAddBatchIds() throws IOException, CommandException
    {
        navigateToWeights();
        addBatchByIds();
        for (int i = 0; i < ANIMAL_SUBSET_EHR_TEST.length; i++)
        {
            assertTextPresent(ANIMAL_SUBSET_EHR_TEST[i]);
        }
        // test the navigating to next weight by hitting enter
        for (Integer i = 0; i < ANIMAL_SUBSET_EHR_TEST.length; i++)
        {
            WebElement el2 = fillAnInput("weight_" + i, "0.489");
            if (i < ANIMAL_SUBSET_EHR_TEST.length-1)
            {
                el2.sendKeys(Keys.ENTER);
            }
        }

        waitUntilElementIsClickable("submit-all-btn");
        clickNewButton("submit-all-btn");
        clickNewButton("submit-final");
        waitForText("Success");

        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, 0.489, wt.get("value"));

    }

    @Test
    public void testEditBatch() throws IOException, CommandException
    {
        navigateToWeights();
        addBatchByLocation();
        clickNewButton("edit-batch");
        WebElement el = Locator.id("weight-bulk").findElement(getDriver());
        el.sendKeys(WEIGHT_VAL.toString());
        WebElement el2 = fillAnInput("restraint-bulk", "T");
        clickNewButton("submit-bulk");
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));

        SelectRowsResponse r = fetchWeightData();
        for (int i = 0; i < ANIMAL_SUBSET_EHR_TEST.length; i++)
        {
            Map<String, Object> wt = (Map<String, Object>) r.getRows().get(i).get("weight");
            Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));
        }
        testWeightToRestraintObjectIdRelationship();
    }

    //for the most recently entered weight / restraint pair, do we have matching "FK" lookups
    //from the weight record to the restraint record. e.g., weight|restraint_objectid == restraint|objectid ?
    public void testWeightToRestraintObjectIdRelationship() throws IOException, CommandException
    {
        //get the weight data
        SelectRowsResponse w = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) w.getRows().get(0).get("restraint_objectid");
        SelectRowsResponse r = fetchRestraintDataGivenObjectId((String) wt.get("value"));
        Assert.assertEquals(1, r.getRows().size());
    }

    @Test
    public void testAddBatch()
    {
        navigateToWeights();
        addBatchByLocation();
        for (String s : ANIMAL_SUBSET_EHR_TEST)
        {
            assertTextPresent(s);
        }
    }


    @Test
    public void testDisplayAnimalInfo() throws IOException, CommandException
    {
        navigateToWeights();
        WebElement f = fillAnInput("animalid_0", ANIMAL_SUBSET_EHR_TEST[0]);
        f.sendKeys(Keys.TAB);
        f.sendKeys(Keys.TAB);
        waitForElement(Locator.byClass("animal-info-table"));

    }

    @Test
    public void testAddRestraint() throws IOException, CommandException
    {
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        /*WebElement el2 = fillAnInput("restraint_0", "T");*/
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));

        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));
        Map<String, Object> objectid = (Map<String, Object>) r.getRows().get(0).get("restraint_objectid");

        SelectRowsResponse c = fetchRestraintDataGivenObjectId(objectid.get("value").toString());
        Map<String, Object> rt = (Map<String, Object>) c.getRows().get(0).get("restraintType");
        Assert.assertEquals(null, "Table-Top", rt.get("value"));
        testWeightToRestraintObjectIdRelationship();
    }

    public void navigateToWeightsTable()
    {
        beginAt(buildURL("ehr", getContainerPath(), "updateQuery", Map.of("schemaName", "study", "queryName", "weight")));
    }


    public Boolean isCurrentlyImpersonating()
    {
        return (Boolean)executeScript("return LABKEY.impersonatingUser != undefined;");
    }
    @Test
    public void testUpdateSingleRecordThroughEHR() throws IOException, CommandException
    {
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog.dismiss("Submit final"));

        navigateToWeightsTable();
        DataRegionTable table = new DataRegionTable("query", getDriver());
        String id = table.getDataAsText(0, "Id");
        table.clickEditRow(0);
        waitForText(id);

        //delete the previous weight and replace it
        WebElement we = Locator.inputById("weight_0").findElement(getDriver());
        for (int i = 0; i < 10; i++){
            we.sendKeys(Keys.BACK_SPACE);
            sleep(500);
        }
        fillAnInput("weight_0",NEW_WEIGHT_VAL.toString());
        clickNewButton("submit-all-btn");
        ModalDialog modalDialog1 = new ModalDialog.ModalDialogFinder(getDriver()).waitFor();
        doAndWaitForPageToLoad(() -> modalDialog1.dismiss("Submit final"));

        SelectRowsResponse r = fetchWeightData();
        Map<String, Object> wt = (Map<String, Object>) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, NEW_WEIGHT_VAL, wt.get("value"));
    }

    @Test
    public void testAddBulkThenSave() throws IOException, CommandException
    {
        navigateToWeights();
        WebElement button = Locator.tagWithId("button", "save-draft-btn").findElement(getDriver());
        // Test that save button is disabled if no entries
        Assert.assertFalse("Save button is enabled with no data", button.isEnabled());
        // Test that save button is disabled if single valid id is entered
        fillWeightForm(WEIGHT_VAL.toString(), 0);
        Assert.assertTrue("Save button is disabled for correct id", button.isEnabled());
        addBatchByLocation();
        Assert.assertTrue("Save button is disabled for correct test ids", button.isEnabled());
        clickNewButton("save-draft-btn");
        sleep(2000);
        clickNewButton("save-draft-btn");
        sleep(2000);
        assertTextNotPresent("Error during operation");
    }


    public void populateLookupSet(String setNamr) throws IOException, CommandException
    {
        //insert into ehr_lookups.lookup_sets (setname,container)  select 'animal_requests_sex' as setname, container from ehr_lookups.lookup_sets where setname='viral_status';

        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        log("setting up lookupset");

        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr_lookups", "lookup_sets");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("setname", setNamr);
        rowMap.put("keyField", "value");
        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, EHR_FOLDER_PATH);

    }

    public void populateLookupVals(String setName, String valName, String val) throws IOException, CommandException
    {
        //insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'M' as value from ehr_lookups.lookup_sets where setname='animal_requests_sex';

        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        log("populating lookupset");

        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr_lookups", "lookups");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("set_name", setName);
        rowMap.put(valName,val);
        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, EHR_FOLDER_PATH);

    }

    public void populateLookupValsDirect(String setName, String valName, String val) throws IOException, CommandException
    {
        //insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'M' as value from ehr_lookups.lookup_sets where setname='animal_requests_sex';

        Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        log("populating lookupset");

        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr_lookups", setName);
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put(valName,val);
        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, EHR_FOLDER_PATH);

    }

    public void populateAnimalRequestTableLookups() throws IOException, CommandException
    {

        populateLookupSet("animal_requests_sex");
        populateLookupVals("animal_requests_sex", "value", "M");

        populateLookupSet("animal_requests_disposition");
        populateLookupVals("animal_requests_disposition", "value", "Terminal");

        populateLookupSet("animal_requests_infectiousdisease");
        populateLookupVals("animal_requests_infectiousdisease", "value","Yes");

        populateLookupSet("animal_requests_yes_no");
        populateLookupVals("animal_requests_yes_no", "value","Yes");

        populateLookupValsDirect("viral_status", "value","SPF4");
        populateLookupValsDirect("geographic_origins", "meaning", "india");
        populateLookupValsDirect("geographic_origins", "meaning", "china");
        populateLookupValsDirect("geographic_origins", "meaning", "mauritius");
        populateLookupValsDirect("geographic_origins", "meaning", "indonesia");
        populateLookupValsDirect("geographic_origins", "meaning", "laos");
        populateLookupValsDirect("geographic_origins", "meaning", "vietnam");
        populateLookupValsDirect("geographic_origins", "meaning", "any");

    }

    public WebElement fillAnInputByName(String name, String value)
    {
        WebElement el = Locator.name(name).findElement(getDriver());
        el.click();
        el.sendKeys(value);
        return el;
    }

    @Test
    public void testClinpathVirologyBulkUpload() throws IOException, CommandException
    {
        // go to clinpath task, import the virology results and submit
        beginAt(buildURL("ehr", getContainerPath(), "manageTask.view?formtype=Clinpath&taskid=" + VIROLOGY_CLINPATH_TASKID));
        WebElement titleEl = waitForElement(Locator.xpath("//input[@name='title' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        waitForFormElementToEqual(titleEl, "Clinpath");
        waitForText("Import Results from File");
        _extHelper.clickMenuButton("Import Results from File");
        waitForText("Please select a file to import results from");
        click(Locator.radioButtonByNameAndValue("fileselection","1"));
        //for this one the click works but the function times out for some reason
        //_extHelper.clickExtButton("Import");
        click(Locator.extButton("Import"));
        waitForElement(Locator.button("Submit Final"), WAIT_FOR_JAVASCRIPT);
        click(Locator.extButton("Submit Final"));
        click(Locator.extButton("Yes"));

        // verify that the clinpath task with the above taskid has virology results
        waitForElement(Locator.tagWithText("span", "Data Entry"));
        SelectRowsCommand sr = new SelectRowsCommand("study","Virology Results");
        sr.addFilter("taskid", VIROLOGY_CLINPATH_TASKID, Filter.Operator.EQUAL);
        SelectRowsResponse resp2 = sr.execute(createDefaultConnection(), EHR_FOLDER_PATH);
        //check that the results got uploaded
        Assert.assertTrue(resp2.getRowCount().intValue() > 0);
        //check that the data from in the excel file matches the results, this tests GetVirologyResultsFromFileAction action,
        // as well as the logic the Import Results From File button in ehrGridFormPanel.js
        Map<String, Object> resultRow = resp2.getRows().get(0);
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Id"), resultRow.get("Id"));
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Date"), convertToLocalDateViaSqlDate((Date) resultRow.get("date")).toString());
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Sample Type"), resultRow.get("source"));
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Virus"), resultRow.get("virus"));
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Method"), resultRow.get("method"));
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Result"), resultRow.get("result"));
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Qualifier"), resultRow.get("qualresult"));
        Assert.assertEquals(VIROLOGY_RESULT_DATA.get("Remark"), resultRow.get("performing_lab"));
    }



    @Test
    public void testClinpathVirologyBulkUploadValidations()
    {
        // go to clinpath task, import the virology results and submit
        beginAt(buildURL("ehr", getContainerPath(), "manageTask.view?formtype=Clinpath&taskid=" + VIROLOGY_CLINPATH_TASKID));
        WebElement titleEl = waitForElement(Locator.xpath("//input[@name='title' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        waitForFormElementToEqual(titleEl, "Clinpath");
        waitForText("Import Results from File");
        _extHelper.clickMenuButton("Import Results from File");
        waitForText("Please select a file to import results from");
        click(Locator.radioButtonByNameAndValue("fileselection","2"));
        click(Locator.extButton("Import"));
        Assert.assertEquals("No matching clinpath records found.",Locator.id("clinpath-virology-err").findElement(getDriver()).getText());
    }

    @Test
    public void testClinpathVirologyBulkUploadPreviewAndDate()
    {
        // go to clinpath task, import the virology results and submit
        beginAt(buildURL("ehr", getContainerPath(), "manageTask.view?formtype=Clinpath&taskid=" + VIROLOGY_CLINPATH_TASKID));
        WebElement titleEl = waitForElement(Locator.xpath("//input[@name='title' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        waitForFormElementToEqual(titleEl, "Clinpath");
        waitForText("Import Results from File");
        _extHelper.clickMenuButton("Import Results from File");
        waitForText("Please select a file to import results from");
        click(Locator.radioButtonByNameAndValue("fileselection","0"));
        //for this one the click works but the function times out for some reason
        //_extHelper.clickExtButton("Import");
        waitForText("Preview");
        click(Locator.extButton("Preview"));
        switchToWindow(1);
        Assert.assertEquals("Bad date format. Set the date column format to 'Date'.",Locator.id("bad-date-preview-err").findElement(getDriver()).getText());
        switchToMainWindow();
    }

    @Test
    public void testClinpathVirologyBulkUploadDateFormatValidation()
    {
        // go to clinpath task, import the virology results and submit
        beginAt(buildURL("ehr", getContainerPath(), "manageTask.view?formtype=Clinpath&taskid=" + VIROLOGY_CLINPATH_TASKID));
        WebElement titleEl = waitForElement(Locator.xpath("//input[@name='title' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        waitForFormElementToEqual(titleEl, "Clinpath");
        waitForText("Import Results from File");
        _extHelper.clickMenuButton("Import Results from File");
        waitForText("Please select a file to import results from");
        click(Locator.radioButtonByNameAndValue("fileselection","0"));
        //for this one the click works but the function times out for some reason
        //_extHelper.clickExtButton("Import");
        waitForText("Import");
        click(Locator.extButton("Import"));
        Assert.assertEquals("Bad date format. Set the date column format to 'Date'.",Locator.id("clinpath-virology-err").findElement(getDriver()).getText());
    }

    @Test
    public void testAnimalRequestFormSubmit() throws IOException, CommandException
    {
        LocalDate currentDate = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = currentDate.format(formatter);
        goToEHRFolder();
        populateAnimalRequestTableLookups();
        navigateToAnimalRequestForm();
        waitForText("Comments:");
        //it's a timing issue. we have to wait until the form is loaded for it to be clickable.

        //this is dependent on the billing setup above which populates the investigators table
        fillAnInputByName("principalinvestigator", "Snow, Jon");
        fillAnInputByName("numberofanimals", "23");
        fillAnInputByName("speciesneeded", "Cyno");
        fillAnInputByName("originneeded", "any");
        fillAnInputByName("sex", "M");
        fillAnInputByName("age", "10");
        fillAnInputByName("weight", "2");
        fillAnInputByName("mhctype", "2");
        fillAnInputByName("viralstatus", "SPF4");
        fillAnInputByName("infectiousdisease", "Yes");
        fillAnInputByName("majorsurgery", "Yes");
        fillAnInputByName("pregnantanimalsrequired", "Yes");
        fillAnInputByName("pregnantanimalsrequiredterminfant", "Yes");
        fillAnInputByName("pregnantanimalsrequiredtermdam", "Yes");
        fillAnInputByName("disposition", "Terminal");
        fillAnInputByName("executivecommitteeapproval", "Yes");
        fillAnInputByName("previousexposures", "None");
        fillAnInputByName("optionalproject", "TBD");
        fillAnInputByName("account", "80085");
        fillAnInputByName("protocol", "TBD");
        WebElement el = Locator.id("anticipatedstartdate").findElement(getDriver()).findElement(By.tagName("input"));
        el.sendKeys(formattedDate);
        el.sendKeys(Keys.TAB);
        el = Locator.id("anticipatedenddate").findElement(getDriver()).findElement(By.tagName("input"));
        el.sendKeys(formattedDate);
        el.sendKeys(Keys.TAB);
        fillAnInputByName("comments", "test");
        fillAnInputByName("contacts", "test@test.com");

        clickAndWait(Locator.tagWithId("button","submit-final"));
        assertTextPresent("Data Entry");
        SelectRowsCommand sr = new SelectRowsCommand("wnprc","animal_requests");
        sr.addFilter("numberofanimals",23, Filter.Operator.EQUAL);
        SelectRowsResponse resp = sr.execute(createDefaultConnection(), EHR_FOLDER_PATH);
        Assert.assertTrue(resp.getRowCount().intValue() > 0);
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


    public void navigateToBillingContainerWithInvalidPermissions() {
        //This test verifies a user cannot access the Finance>Internal page without proper permissions.

        //Impersonates a basic user and navigates to the Finance>Internal page via a direct URL.
        beginAt(buildURL("project", getContainerPath(), "begin"));
        impersonate(BASIC_SUBMITTER.getEmail());
        beginAt(buildURL("project", getBillingContainerPath(), "begin"));

        //Assumes an error is presented and the test is complete.
        assertTextPresent("Oops! An error has occurred.");

        //Exits function.
        stopImpersonating();
    }

    public void updateProgramIncomeAccountWithInvalidPermissions() throws UnhandledAlertException {
        //This test verifies a user cannot update the CreditToAccount module property without proper permissions.

        //Impersonates a basic user and navigates to the restricted page via a direct URL.
        beginAt(buildURL("project", getContainerPath(), "begin"));
        impersonate(BASIC_SUBMITTER.getEmail());
        beginAt(buildURL("wnprc_billing", getContainerPath(), "updateProgramIncomeAccount"));

        //Attempts to change the value.
        //Assumes an error is presented and the test is complete.
        fillAnInputByName("newCreditToAccountField", "asdf");
        click(Locator.tagWithId("button","updateCreditToAccountButton"));
        assertAlert("Unable to update the program income account.  User does not have the correct permissions.");

        //Exits function.
        stopImpersonating();
    }

    public void updateProgramIncomeAccountWithValidPermissions() throws UnhandledAlertException {
        //This test verifies a user can update the CreditToAccount module property with proper permissions.

        //Navigates to various containers and sets corresponding permissions.
        beginAt(buildURL("project", getProjectName(), "begin"));
        _permissionsHelper.setPermissions(BASIC_SUBMITTER.getGroup(), "Reader");
        _permissionsHelper.setPermissions(BASIC_SUBMITTER.getGroup(), "Editor");
        beginAt(buildURL("wnprc_billing", getContainerPath(), "updateProgramIncomeAccount"));
        _permissionsHelper.setPermissions(BASIC_SUBMITTER.getGroup(), "EHR Finance Admin");

        //Navigates to the "Update Program Income Account" page and impersonates a basic finance user.
        beginAt(buildURL("wnprc_billing", getContainerPath(), "updateProgramIncomeAccount"));
        impersonate(BASIC_SUBMITTER.getEmail());

        //Attempts to change the value.
        fillAnInputByName("newCreditToAccountField", "testString");
        click(Locator.tagWithId("button","updateCreditToAccountButton"));

        //Verifies the value has been changed, then continues. If value has not been changed, the test fails here.
        assertEquals("Updated Program Income Account with invalid permissions.", "testString", Locator.id("ctaCell1").findElement(getDriver()).getText());

        //Navigates to various containers and removes corresponding permissions.
        stopImpersonating();
        beginAt(buildURL("project", getProjectName(), "begin"));
        _permissionsHelper.removePermission(BASIC_SUBMITTER.getGroup(), "org.labkey.api.security.roles.ReaderRole");
        _permissionsHelper.removePermission(BASIC_SUBMITTER.getGroup(), "org.labkey.api.security.roles.EditorRole");
        beginAt(buildURL("wnprc_billing", getContainerPath(), "updateProgramIncomeAccount"));
        _permissionsHelper.removePermission(BASIC_SUBMITTER.getGroup(), "org.labkey.wnprc_billing.security.roles.EHRFinanceAdmin");

    }

    @Test
    public void checkUpdateProgramIncomeAccount() throws UnhandledAlertException
    {
        log("Starting checkUpdateProgramIncomeAccount.");

        navigateToBillingContainerWithInvalidPermissions();
        log("Completed navigateToBillingContainerWithInvalidPermissions.");

        updateProgramIncomeAccountWithInvalidPermissions();
        log("Completed updateProgramIncomeAccountWithInvalidPermissions.");

        updateProgramIncomeAccountWithValidPermissions();
        log("Completed updateProgramIncomeAccountWithValidPermissions.");
    }

    @Test
    public void testReactGridPanel() throws UnhandledAlertException {
        log("Starting testReactGridPanel.");
        log("Testing grid panel renders for full webpage");
        beginAt(buildURL("wnprc_ehr", getContainerPath(), "research_ultrasounds"));
        WebElement reactComp = getDriver().findElement(By.cssSelector(".grid-panel"));
        Assert.assertTrue(reactComp.isDisplayed());

        log("Testing grid panel renders for web parts");
        goToEHRFolder();
        waitAndClickAndWait(Locator.linkWithText("Animal History"));
        AnimalHistoryPage<AnimalHistoryPage> animalHistoryPage = new AnimalHistoryPage<>(getDriver());
        animalHistoryPage
                .selectSingleAnimalSearch()
                .searchFor(MORE_ANIMAL_IDS[0])
                .clickCategoryTab("Today At Center")
                .clickReportTab("Treatments - Incomplete");

        waitForElement(Locator.byClass(".grid-panel"));
        reactComp = getDriver().findElement(By.cssSelector(".grid-panel"));
        Assert.assertTrue("Grid Panel webpart failed to render in animal history",reactComp.isDisplayed());

        log("Completed testReactGridPanel.");
    }

    protected Date prepareDate(Date date, int daysOffset, int hoursOffset)
    {
        Calendar beforeInterval = Calendar.getInstance();
        beforeInterval.setTime(date);
        beforeInterval.add(Calendar.DATE, daysOffset);
        beforeInterval.add(Calendar.HOUR_OF_DAY, hoursOffset);

        return beforeInterval.getTime();
    }
    @Test
    public void testBloodDrawAPI() throws Exception
    {
        goToProjectHome();

        Date bloodDate = prepareDate(new Date(), +5, 0);

        Double tubeVolOver = 10000.5;
        Integer numTubes = 1;
        Double quantity = numTubes*tubeVolOver;
        Integer interval = 30;
        Double weight = 12.0;
        Double maxAllowable =  Math.round((weight * 60 * .20) * 100) / 100.0;
        String tubeType = "EDTA";
        Map<String, List<String>> expected = new HashMap<>();
        Integer project = 640991;
        String account = "acct102";

        String[] newBloodFields = {"Id", "date", "project", "account", "tube_type", "tube_vol", "num_tubes", "quantity", "additionalServices", "billedby", "restraint", "restraintDuration", "instructions", "remark", "performedby", FIELD_QCSTATELABEL, FIELD_OBJECTID, FIELD_LSID, "_recordid"};
        Object bloodData[][] = {{TEST_SUBJECTS[0], bloodDate, project, account, tubeType, tubeVolOver, numTubes, quantity, null, "y", "Chemical", "< 30 min", null, null,  "autotest", EHRQCState.REQUEST_PENDING.label, null, null, "_recordID"}};
        expected.put("instructions", Collections.singletonList("ERROR: Tube volume \"" + tubeVolOver.toString() + "\" does not exist for tube type \"" + tubeType + "\". Please provide instructions for the custom volume and tube type combination."));
        expected.put("num_tubes", Collections.singletonList("INFO: Blood volume of " + quantity + " (" + quantity + " over " + interval + " days) exceeds the allowable volume of " + maxAllowable + " mL (weight: " + weight + " kg).\n"));
        expected.put("quantity", Collections.singletonList("INFO: Blood volume of " + quantity + " (" + quantity + " over " + interval + " days) exceeds the allowable volume of " + maxAllowable + " mL (weight: " + weight + " kg).\n"));
        expected.put("project", Collections.singletonList("INFO: Not assigned to the protocol on this date"));
        expected.put("account", Collections.singletonList("INFO: acct102 / Jon Snow"));
        expected.put("_validateOnly", Collections.singletonList("ERROR: Ignore this error"));
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(),
                "study",
                "blood",
                newBloodFields,
                bloodData,
                expected
                //additionalExtraContext
        );
        Double tubeVolLimit = 142.5;
        Double quantityLimit = numTubes*tubeVolLimit;
        String matchingAccount = "acct101";
        Object bloodDataNearLimit[][] = {{TEST_SUBJECTS[0], bloodDate, project, matchingAccount, tubeType, tubeVolLimit, numTubes, quantityLimit, null, "y", "Chemical", "< 30 min", null, null,  "autotest", EHRQCState.REQUEST_PENDING.label, null, null, "_recordID"}};
        expected = new HashMap<>();
        expected.put("project", Collections.singletonList("INFO: Not assigned to the protocol on this date"));
        expected.put("num_tubes", Collections.singletonList("INFO: Limit notice! Blood volume of " + tubeVolLimit + " (" + tubeVolLimit + " over " + interval + " days) is within 6.0 mL of the max allowable limit of " + maxAllowable + " mL (weight: " + weight + " kg).\n"));
        expected.put("quantity", Collections.singletonList("INFO: Limit notice! Blood volume of " + tubeVolLimit + " (" + tubeVolLimit + " over " + interval + " days) is within 6.0 mL of the max allowable limit of " + maxAllowable + " mL (weight: " + weight + " kg).\n"));
        expected.put("instructions", Collections.singletonList("ERROR: Tube volume \"" + tubeVolLimit.toString() + "\" does not exist for tube type \"" + tubeType + "\". Please provide instructions for the custom volume and tube type combination."));
        expected.put("_validateOnly", Collections.singletonList("ERROR: Ignore this error"));
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(),
                "study",
                "blood",
                newBloodFields,
                bloodDataNearLimit,
                expected
                //additionalExtraContext
        );

        /*
        // move to EHR
        Double tubeVolNear = 143.5;
        Double quantityNear = numTubes*tubeVolNear;
        //test two records in the grid
        Double totalRequested = tubeVolNear*2;

        Object bloodDataNear[][] = {
                {TEST_SUBJECTS[0], bloodDate, projectId, 123456, tubeType, tubeVolNear, numTubes, quantityNear, null, "y", "Chemical", "< 30 min", null, null,  "autotest", EHRQCState.REQUEST_PENDING.label, null, null, "_recordID"},
                {TEST_SUBJECTS[0], bloodDate, projectId, 123456, tubeType, tubeVolNear, numTubes, quantityNear, null, "y", "Chemical", "< 30 min", null, null,  "autotest", EHRQCState.REQUEST_PENDING.label, null, null, "_recordID"}
        };
        expected.put("num_tubes", Collections.singletonList("INFO: Blood volume of " + totalRequested + " (" + quantity + " over " + interval + " days) exceeds the allowable volume of " + maxAllowable + " mL (weight: " + weight + " kg).\n"));
        expected.put("quantity", Collections.singletonList("INFO: Blood volume of " + totalRequested + " (" + quantity + " over " + interval + " days) exceeds the allowable volume of " + maxAllowable + " mL (weight: " + weight + " kg).\n"));
        expected.put("project", Collections.singletonList("INFO: Not assigned to the protocol on this date"));
        expected.put("_validateOnly", Collections.singletonList("ERROR: Ignore this error"));
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(),
                "study",
                "blood",
                newBloodFields,
                bloodDataNear,
                expected
                //additionalExtraContext
        );*/


        //test an actual valid entry
        Double tubeVolOK = 50.0;
        Double quantityOK = tubeVolOK*numTubes;
        InsertRowsCommand bloodCmd = new InsertRowsCommand("study", "blood");
        Date dt = prepareDate(new Date(), -11, 0);
        bloodCmd.addRow(new HashMap<String, Object>(){
            {
                put("Id", TEST_SUBJECTS[0]);
                put("date", dt);
                put("project", project);
                put("account", matchingAccount);
                put("tube_type",tubeType);
                put("tube_vol", tubeVolOK);
                put("num_tubes", numTubes);
                put("quantity", quantityOK);
                put("additionalServices", null);
                put("billedby", "y");
                put("restraint", "Chemical");
                put("restraintDuration", "< 30 min");
                put("instructions", "test special instruction");
                put("remark", "test remark");
                put("performedby", "autotest");

            }});
        bloodCmd.execute(getApiHelper().getConnection(), getContainerPath());
        SelectRowsCommand sr = new SelectRowsCommand("study","blood");
        sr.addFilter("Id", TEST_SUBJECTS[0], Filter.Operator.EQUAL);
        sr.addFilter("date", dt, Filter.Operator.EQUAL);
        SelectRowsResponse resp2 = sr.execute(getApiHelper().getConnection(), EHR_FOLDER_PATH);
        Assert.assertEquals(1, resp2.getRowCount());

        /*
        Integer newNumTubes = 200;
        expected = new HashMap<>();
        expected.put("num_tubes", Collections.singletonList("INFO: Blood volume of " + quantity + " (" + quantity + " over " + interval + " days) exceeds the allowable volume of " + maxAllowable + " mL (weight: " + weight + " kg)"));
        expected.put("quantity", Collections.singletonList("INFO: Blood volume of " + quantity + " (" + quantity + " over " + interval + " days) exceeds the allowable volume of " + maxAllowable + " mL (weight: " + weight + " kg)"));


        Map<String, Object> additionalExtraContext = new HashMap<>();
        JSONArray bloodInTransaction = new JSONArray();
        bloodInTransaction.put(new HashMap<String, Object>(){
            {
                put("Id", SUBJECTS[3]);
                put("date", bloodDate);
                put("project", projectId);
                put("account", 123456);
                put("tube_type",tubeType);
                put("tube_vol", tubeVol);
                put("num_tubes", newNumTubes);
                put("quantity", quantity);
                put("additionalServices", null);
                put("billedby", "y");
                put("restraint", "Chemical");
                put("restraintDuration", "< 30 min");
                put("instructions", "test special instruction");
                put("remark", "test remark");
                put("performedby", "autotest");

            }});

        Integer numTubesUpdated = 200;
        Double quantityUpdated =  tubeVol * numTubesUpdated;
        bloodInTransaction.put(new HashMap<String, Object>(){
            {
                put("Id", SUBJECTS[2]);
                put("date", bloodDate);
                put("project", projectId);
                put("account", 123456);
                put("tube_type",tubeType);
                put("tube_vol", tubeVol);
                put("num_tubes", numTubesUpdated);
                put("quantity", quantityUpdated);
                put("additionalServices", null);
                put("billedby", "y");
                put("restraint", "Chemical");
                put("restraintDuration", "< 30 min");
                put("instructions", "test special instruction");
                put("remark", "test remark");
                put("performedby", "autotest");

            }});
        additionalExtraContext.put("bloodInTransaction", bloodInTransaction.toString());

        getApiHelper().testValidationMessage(PasswordUtil.getUsername(),
                "study",
                "blood",
                new String[]{"Id", "date", "project", "account", "tube_type", "tube_vol", "num_tubes", "quantity", "additionalServices", "billedby", "restraint", "restraintDuration", "instructions", "remark", "performedby"}, new Object[][]{
                {SUBJECTS[0], bloodDate, projectId, 123456, tubeType, tubeVol, newNumTubes, quantity, null, "y", "Chemical", "< 30 min", "instructions", null, "autotest"}},
                expected,
                additionalExtraContext
        );*/


        /*TODO This should be moved to EHR API test, would need to add clinpath runs table to the study schema in EHR test,
          and update the labwork_services.tsv to include alertOnComplete field populated, since there the EHR trigger
          script uses it

        //create blood draw with additional services to create a clinpath request
        InsertRowsCommand bloodCmd = new InsertRowsCommand("study", "blood");
        Date dt = prepareDate(new Date(), -11, 0);
        String serviceRequested = "CBC";
        bloodCmd.addRow(new HashMap<String, Object>(){
            {
                put("Id", SUBJECTS[0]);
                put("date", dt);
                put("project", projectId);
                put("account", 123456);
                put("tube_type","Tube Type Test");
                put("tube_vol", 1);
                put("num_tubes", 1);
                put("quantity", 1);
                put("additionalServices", serviceRequested);
                put("billedby", "y");
                put("restraint", "Chemical");
                put("restraintDuration", "< 30 min");
                put("instructions", "test instruction");
                put("remark", "test remark");
                put("performedby", "autotest");

            }});
        bloodCmd.execute(getApiHelper().getConnection(), getContainerPath());
        //assert clinpath request was created
        SelectRowsCommand sr = new SelectRowsCommand("study","Clinpath Runs");
        sr.addFilter("Id",SUBJECTS[0], Filter.Operator.EQUAL);
        sr.addFilter("date",dt, Filter.Operator.EQUAL);
        sr.addFilter("servicerequested", serviceRequested, Filter.Operator.EQUAL);
        SelectRowsResponse resp2 = sr.execute(getApiHelper().getConnection(), EHR_FOLDER_PATH);
        Assert.assertEquals(1,resp2.getRowCount());
        */

    }
    protected String generateGUID()
    {
        return (String)executeScript("return LABKEY.Utils.generateUUID().toUpperCase()");
    }

    public void createProtocolAndProject(String theProtocolName, String theProjectName) throws IOException, CommandException
    {
        String protocolTitle = generateGUID();
        InsertRowsCommand protocolCommand = new InsertRowsCommand("ehr", "protocol");
        protocolCommand.addRow(Maps.of("protocol", theProtocolName, "title", protocolTitle, "approve",  new Date(653295600000L), "enddate", new Date(853295600000L) )); //;
        // Sept. 14, 1990
        protocolCommand.execute(getApiHelper().getConnection(), getContainerPath());

        SelectRowsCommand protocolSelect = new SelectRowsCommand("ehr", "protocol");
        protocolSelect.addFilter(new Filter("title", protocolTitle));
        final String protocolId = (String)protocolSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRows().get(0).get("protocol");
        Assert.assertNotNull(StringUtils.trimToNull(protocolId));

        InsertRowsCommand investigatorsCommand = new InsertRowsCommand("ehr", "investigators");
        investigatorsCommand.addRow(Maps.of("firstName", "Testt", "lastName", "Tester"));
        CommandResponse response = investigatorsCommand.execute(getApiHelper().getConnection(), getContainerPath());
        var id = ((HashMap<?, ?>) ((ArrayList<?>) response.getParsedData().get("rows")).get(0)).get("rowid");

        InsertRowsCommand projectCommand = new InsertRowsCommand("ehr", "project");
        String projectName = generateGUID();
        projectCommand.addRow(Maps.of("project", theProjectName, "name", projectName, "protocol", protocolId, "investigatorId", id));
        projectCommand.execute(getApiHelper().getConnection(), getContainerPath());

        SelectRowsCommand projectSelect = new SelectRowsCommand("ehr", "project");
        projectSelect.setColumns(List.of("project", "investigatorId/lastName"));
        projectSelect.addFilter(new Filter("protocol", protocolId));
        SelectRowsResponse resp = projectSelect.execute(getApiHelper().getConnection(), getContainerPath());
        final Integer projectId = (Integer)resp.getRows().get(0).get("project");

        assertEquals("Project not correct in project table", theProjectName, projectId.toString());

    }
    @Test
    public void testAssignmentApi() throws Exception
    {

        goToProjectHome();

        //create protocol and corresponding projects
        createProtocolAndProject(PROTOCOL_ID_2, PROTOCOL_PROJECT_ID_2);
        createProtocolAndProject(PROTOCOL_ID_3, PROTOCOL_PROJECT_ID_3);

        InsertRowsCommand protocolCountsCommand = new InsertRowsCommand("ehr", "protocol_counts");

        //protocol102 - macaque constraint
        Map<String, Object> protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_2);
        protocolCountsRow.put("species", "Macaque");
        protocolCountsRow.put("allowed", 1);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_2);
        protocolCountsRow.put("species", "Rhesus");
        protocolCountsRow.put("allowed", 3);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_2);
        protocolCountsRow.put("species", "Cynomolgus");
        protocolCountsRow.put("allowed", 1);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_2);
        protocolCountsRow.put("species", "Marmoset");
        protocolCountsRow.put("allowed", 1);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_2);
        protocolCountsRow.put("species", "All Species");
        protocolCountsRow.put("allowed", 2);
        protocolCountsCommand.addRow(protocolCountsRow);

        //protocol103-no cyno

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_3);
        protocolCountsRow.put("species", "Macaque");
        protocolCountsRow.put("allowed", 2);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_3);
        protocolCountsRow.put("species", "Rhesus");
        protocolCountsRow.put("allowed", 3);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_3);
        protocolCountsRow.put("species", "Marmoset");
        protocolCountsRow.put("allowed", 1);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsRow = new HashMap<>();
        protocolCountsRow.put("protocol", PROTOCOL_ID_3);
        protocolCountsRow.put("species", "All Species");
        protocolCountsRow.put("allowed", 2);
        protocolCountsCommand.addRow(protocolCountsRow);

        protocolCountsCommand.execute(getApiHelper().getConnection(), getContainerPath());

        //create assignment
        InsertRowsCommand assignmentCommand = new InsertRowsCommand("study", "assignment");
        assignmentCommand.addRow(new HashMap<String, Object>(){
            {
                put("Id", TEST_SUBJECTS[0]);
                put("date", prepareDate(new Date(), -10, 0));
                put("objectid", generateGUID());
                put("project", PROTOCOL_PROJECT_ID_2);
            }});
        assignmentCommand.execute(getApiHelper().getConnection(), getContainerPath());

        ArrayList<String> msgs = new ArrayList<>();
        msgs.add("WARN: There are not enough spaces on protocol: " + PROTOCOL_ID_2 + ". Allowed: 1, used: 2");
        // try 2, should fail since there is one assignment of Rhesus (macaque), and only 1 spot for that
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "assignment", new String[]{"Id", "date", "enddate", "project", "_recordId"}, new Object[][]{
                {MORE_ANIMAL_IDS[0], prepareDate(new Date(), 10, 0), null, PROTOCOL_PROJECT_ID_2, "recordID"},
        }, Maps.of(
                "project", msgs
        ));

        //shouldn't allow cyno to be assigned
        ArrayList<String> msgs3 = new ArrayList<>();
        msgs3.add("WARN: Species not allowed on protocol: " + PROTOCOL_ID_3);
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "assignment", new String[]{"Id", "date", "enddate", "project", "_recordId"}, new Object[][]{
                {TEST_SUBJECTS[1], prepareDate(new Date(), 10, 0), null, PROTOCOL_PROJECT_ID_3, "recordID"},
        }, Maps.of(
                "project", msgs3
        ));

        //shouldn't allow another marm
        ArrayList<String> msgs2 = new ArrayList<>();
        msgs2.add("WARN: There are not enough spaces on protocol: " + PROTOCOL_ID_3 + ". Allowed: 1, used: 2");
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "assignment", new String[]{"Id", "date", "enddate", "project", "_recordId"}, new Object[][]{
                {TEST_SUBJECTS[2], prepareDate(new Date(), 10, 0), null, PROTOCOL_PROJECT_ID_3, "recordID"},
                {TEST_SUBJECTS[5], prepareDate(new Date(), 10, 0), null, PROTOCOL_PROJECT_ID_3, "recordID"},
        }, Maps.of(
                "project", msgs2
        ));

    }

    // NOTIFICATION REVAMP: NEW FUNCTIONS START
//    @Test
//    public void notificationRevampTestBloodDrawsTodayAll() throws UnhandledAlertException, IOException, CommandException {
//        // Setup
//        log("Starting notification revamp test: Blood Draws Today (All)");
//        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();
//
//        // Navigates to home to get a fresh start.
//        myReusableFunctions.goHome();
//
//        // Creates test data.
//        myReusableFunctions.insertValueIntoBloodScheduleDataset("spi", "bloodDrawsTodayAllId1", true, new Date(), true, Double.valueOf(-1), true); // Testing for available blood OVER the limit.
//        myReusableFunctions.insertValueIntoBloodScheduleDataset("spi", "bloodDrawsTodayAllId2", true, new Date(), true, 0.1, true); // Testing for available blood NEAR the limit.
//        myReusableFunctions.insertValueIntoBloodScheduleDataset("spi", "bloodDrawsTodayAllId3", true, new Date(), false, 2.0, true); // Testing for "NOT ASSIGNED" project status.
//        myReusableFunctions.insertValueIntoBloodScheduleDataset("spi", "bloodDrawsTodayAllId4", true, new Date(), true, 2.0, false); // Testing for "INCOMPLETE" draw status.
//
//        // Runs test email in the browser.
//        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
//        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
//        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.BloodDrawsTodayAll").withText("Run Report In Browser"));
//
//        // Validates necessary info.
//        // Verifies a red cell exists (for blood remaining < 0).
//        assertElementVisible(Locator.tagWithAttributeContaining("td", "bgcolor", "red"));
//        // Verifies an orange cell exists (for blood remaining < bloodDrawLimit).
//        assertElementVisible(Locator.tagWithAttributeContaining("td", "bgcolor", "orange"));
//        // Verifies an incomplete cell exists (for blood not yet drawn).
//        assertElementVisible(Locator.tagContainingText("td", "INCOMPLETE"));
//        // Verifies an unassigned cell exists (for blood not yet assigned to a project).
//        assertElementVisible(Locator.tagContainingText("td", "UNASSIGNED"));
//
//        // Finishes test.
//        log("Completed notification revamp test: Blood Draws Today (All)");
//    }

//    @Test
//    public void notificationRevampTestBloodDrawsTodayAnimalCare() throws UnhandledAlertException, IOException, CommandException {
//        // Setup
//        log("Starting notification revamp test: Blood Draws Today (Animal Care)");
//        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();
//
//        // Navigates to home to get a fresh start.
//        myReusableFunctions.goHome();
//
//        // Creates test data.
//        myReusableFunctions.insertValueIntoBloodScheduleDataset("animalCare", "bloodDrawsTodayAnimalCareId1", true, new Date(), true, Double.valueOf(2.0), true); // Testing for blood draw assigned to Animal Care.
//
//        // Runs test email in the browser.
//        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
//        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
//        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.BloodDrawsTodayAnimalCare").withText("Run Report In Browser"));
//
//        // Validates necessary info.
//        // Verifies a blood draw shows up here when assigned to Animal Care.
//        assertTextPresent("bloodDrawsTodayAnimalCareId1");
//
//        // Finishes test.
//        log("Completed notification revamp test: Blood Draws Today (Animal Care)");
//    }

//    @Test
//    public void notificationRevampTestBloodDrawsTodayVetStaff() throws UnhandledAlertException, IOException, CommandException {
//        // Setup
//        log("Starting notification revamp test: Blood Draws Today (Vet Staff)");
//        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();
//
//        // Navigates to home to get a fresh start.
//        myReusableFunctions.goHome();
//
//        // Creates test data.
//        myReusableFunctions.insertValueIntoBloodScheduleDataset("vetStaff", "bloodDrawsTodayVetStaffId1", true, new Date(), true, Double.valueOf(2.0), true); // Testing for blood draw assigned to Vet Staff.
//
//        // Runs test email in the browser.
//        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
//        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
//        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.BloodDrawsTodayVetStaff").withText("Run Report In Browser"));
//
//        // Validates necessary info.
//        // Verifies a blood draw shows up here when assigned to Vet Staff.
//        assertTextPresent("bloodDrawsTodayVetStaffId1");
//
//        // Finishes test.
//        log("Completed notification revamp test: Blood Draws Today (Vet Staff)");
//    }

    @Test
    public void notificationRevampTestBloodDrawReviewDailyNotification() throws UnhandledAlertException, IOException, CommandException {
        // Setup
        log("Starting notification revamp test: Blood Draw Review (Daily)");
        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();
        // Creates tomorrow's date.
        Calendar todayCalendar = Calendar.getInstance();
        todayCalendar.add(Calendar.DATE, 1);
        Date dateTomorrow = todayCalendar.getTime();

        // Navigates to home to get a fresh start.
        myReusableFunctions.goHome();

        // Creates test data.
        myReusableFunctions.insertValueIntoBloodScheduleDataset("vetStaff", "bloodDrawReviewDailyId1", false, new Date(), true, Double.valueOf(2.0), false); // Testing for blood scheduled for today with a dead animal.
        myReusableFunctions.insertValueIntoBloodScheduleDataset("vetStaff", "bloodDrawReviewDailyId2", true, dateTomorrow, false, Double.valueOf(2.0), false); // Testing for blood scheduled for tomorrow with an animal not assigned to a project.

        // Runs test email in the browser.
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.BloodDrawReviewDailyNotification").withText("Run Report In Browser"));

        // Validates necessary info.
        // Verifies the notification shows that there is a draw scheduled for a dead animal.
        assertTextPresent("bloodDrawReviewDailyId1");
        // Verifies the notification shows that there is a draw scheduled for an animal who is unassigned to a project.
        assertTextPresent("bloodDrawReviewDailyId2");

        // Finishes test.
        log("Completed notification revamp test: Blood Draw Review (Daily)");
    }

    @Test
    public void notificationRevampTestBloodDrawReviewTriggerNotification() throws UnhandledAlertException, IOException, CommandException {
        // Setup
        log("Starting notification revamp test: Blood Draw Review (Trigger)");
        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();

        // Navigates to home to get a fresh start.
        myReusableFunctions.goHome();

        // Runs test email in the browser.
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.BloodDrawReviewTriggerNotification").withText("Run Report In Browser"));

        // Validates necessary info.
        // Verifies the notification states that there is a dead animal with a blood draw scheduled.  This is normally triggered, but here we are just testing to make sure the notification is formatted correctly and created properly.
        assertTextPresent("This animal is no longer alive.");
        // Verifies the notification states that there is an unassigned animal with a blood draw scheduled.  This is normally triggered, but here we are just testing to make sure the notification is formatted correctly and created properly.
        assertTextPresent("This animal is not assigned to a project on the date of the requested blood draw.");

        // Finishes test.
        log("Completed notification revamp test: Blood Draw Review (Trigger)");
    }

    @Test
    public void notificationRevampTestBloodOverdrawTriggerNotification() throws UnhandledAlertException, IOException, CommandException {
        // Setup
        log("Starting notification revamp test: Blood Overdraw Trigger");
        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();

        // Navigates to home to get a fresh start.
        myReusableFunctions.goHome();

        // Creates test data.
        myReusableFunctions.insertValueIntoBloodScheduleDataset("spi", "testID", true, new Date(), true, Double.valueOf(-1), true);

        // Runs test email in the browser.
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.BloodOverdrawTriggerNotification").withText("Run Report In Browser"));

        // Validates necessary info.
        // Verifies the notification states that there is an unassigned animal with a blood draw scheduled today.  This is normally triggered, but here we are just testing to make sure the notification is formatted correctly and created properly.
        assertTextPresent("This email contains warning information for an animal who just had their blood overdrawn.");

        // Finishes test.
        log("Completed notification revamp test: Blood Overdraw Trigger");
    }

    @Test
    public void notificationRevampTestDeathNotificationRevamp() throws UnhandledAlertException, IOException, CommandException {
        // Setup
        log("Starting notification revamp test: Death Notification Revamp");
        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();

        // Navigates to home to get a fresh start.
        myReusableFunctions.goHome();

        // Creates test data.
        myReusableFunctions.insertValueIntoNecropsyDataset("necropsyTestId1", new Date());

        // Runs test email in the browser.
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.DeathNotificationRevamp").withText("Run Report In Browser"));

        // Validates necessary info.
        assertTextPresent("necropsyTestId1 has been marked as dead.");

        // Finishes test.
        log("Completed notification revamp test: Death Notification Revamp");
    }

    @Test
    public void notificationRevampTestPrenatalDeathNotificationRevamp() throws UnhandledAlertException, IOException, CommandException {
        // Setup
        log("Starting notification revamp test: Prenatal Death Notification Revamp");
        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();

        // Navigates to home to get a fresh start.
        myReusableFunctions.goHome();

        // Creates test data.
        myReusableFunctions.insertValueIntoNecropsyDataset("pdNecropsyTestId2", new Date());

        // Runs test email in the browser.
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
        EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath()).clickNotificationService(this);
        waitAndClickAndWait(Locator.tagWithAttributeContaining("a", "href", "wnprc_ehr.notification.DeathNotificationRevamp").withText("Run Report In Browser"));

        // Validates necessary info.
        assertTextPresent("pdNecropsyTestId2 has been marked as dead.");
        assertTextPresent("Dam");

        // Finishes test.
        log("Completed notification revamp test: Prenatal Death Notification Revamp");
    }

    public void notificationRevampSetup() throws UnhandledAlertException, IOException, CommandException {
        // Set up.
        log("Starting notificationRevampSetup()");
        ReusableTestFunctions myReusableFunctions = new ReusableTestFunctions();

        // Navigates to home to get a fresh start.
        myReusableFunctions.goHome();

        // Navigates to admin notifications page.
        EHRAdminPage ehrAdminPage = EHRAdminPage.beginAt(this, "/ehr/" + getContainerPath());
        NotificationAdminPage notificationAdminPage = ehrAdminPage.clickNotificationService(this);
        // Updates the notification user and reply email.
        notificationAdminPage.setNotificationUserAndReplyEmail(DATA_ADMIN_USER);

        // ***PLEASE LEAVE THE FOLLOWING CODE BLOCK COMMENTED OUT - DO NOT DELETE***
        // ***THIS WILL BE USED TO ENABLE DUMBSTER IN FUTURE NOTIFICATIONS***
        // Enables all notification that we will be testing. //TODO a34: Can we remake a function with an appropriate name for this?  Something like "enableNotification" maybe.
//        notificationAdminPage.enableDeathNotification("status_org.labkey.wnprc_ehr.notification.BloodDrawsTodayAll");
//        notificationAdminPage.enableDeathNotification("status_org.labkey.wnprc_ehr.notification.BloodDrawsTodayAnimalCare");
//        notificationAdminPage.enableDeathNotification("status_org.labkey.wnprc_ehr.notification.BloodDrawsTodayVetStaff");
//        notificationAdminPage.enableDeathNotification("status_org.labkey.wnprc_ehr.notification.BloodDrawReviewDailyNotification");
//        notificationAdminPage.enableDeathNotification("status_org.labkey.wnprc_ehr.notification.BloodDrawReviewTriggerNotification");
//        notificationAdminPage.enableDeathNotification("status_org.labkey.wnprc_ehr.notification.BloodOverdrawTriggerNotification");
//        // Adds recipients for all notifications we will be testing.
//        waitForText("Blood Draws Today (All)");
//        notificationAdminPage.addManageUsers("org.labkey.wnprc_ehr.notification.BloodDrawsTodayAll", "EHR Administrators");
//        notificationAdminPage.addManageUsers("org.labkey.wnprc_ehr.notification.BloodDrawsTodayAnimalCare", "EHR Administrators");
//        notificationAdminPage.addManageUsers("org.labkey.wnprc_ehr.notification.BloodDrawsTodayVetStaff", "EHR Administrators");
//        notificationAdminPage.addManageUsers("org.labkey.wnprc_ehr.notification.BloodDrawReviewDailyNotification", "EHR Administrators");
//        notificationAdminPage.addManageUsers("org.labkey.wnprc_ehr.notification.BloodDrawReviewTriggerNotification", "EHR Administrators");
//        notificationAdminPage.addManageUsers("org.labkey.wnprc_ehr.notification.BloodOverdrawTriggerNotification", "EHR Administrators");
        // Enables dumbster.
//        _containerHelper.enableModules(Arrays.asList("Dumbster"));
        // Enable LDK Site Notification
//        beginAt(buildURL("ldk", "notificationSiteAdmin"));
//        waitForText("Notification Site Admin");
//        waitForElement(Locator.tagWithClass("div", "x4-form-arrow-trigger"));
//        click(Locator.tagWithClass("div", "x4-form-arrow-trigger"));
//        click(Locator.tagWithText("li", "Enabled"));
//        click(Locator.tagWithText("span", "Save"));
//        waitForText("Success");
//        clickButtonContainingText("OK");
//        waitForText("Notification Site Admin");

        // Creates billing groups for testing.
        myReusableFunctions.insertValueIntoBloodBilledByDataset("animalCare", "Animal Care");
        myReusableFunctions.insertValueIntoBloodBilledByDataset("vetStaff", "Vet Staff");
        myReusableFunctions.insertValueIntoBloodBilledByDataset("spi", "SPI");

        // TODO: Run test for: Admin Alerts
        // TODO: Run test for: Animal Request
        // TODO: Run test for: Colony Alerts
        // TODO: Run test for: Colony Alerts (Lite)
        // TODO: Run test for: Colony Management

        // Logs completion.
        log("Completed notificationRevampSetup().  All revamped notifications have been checked.");
    }

    public class ReusableTestFunctions {

        public void goHome() {
            beginAt(buildURL("project", getContainerPath(), "begin"));
        }

        public void insertValueIntoDataset(String schemaName, String queryName, HashMap<String, Object> valuesToInsert) throws IOException, CommandException {
            try {
                //TODO a34: Which one to use?
                Connection cn = new Connection(WebTestHelper.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());
//            Connection cn = WebTestHelper.getRemoteApiConnection();

                // Gets dataset to update.
                InsertRowsCommand insertCmd = new InsertRowsCommand(schemaName, queryName);

                // Creates values to insert.
                insertCmd.addRow(valuesToInsert);

                // Inserts rows into dataset.
                insertCmd.execute(cn, EHR_FOLDER_PATH);

                log("Inserting values into dataset.\n" +
                        "Schema Name: " + schemaName + "\n" +
                        "Query Name: " + queryName + "\n" +
                        "Values: " + valuesToInsert);
            }
            catch (Exception e) {
                log("Error executing insertValueIntoDataset(), value most likely already exists in this dataset.");
            }
        }

        public void insertValueIntoBloodBilledByDataset(String billingGroupRealName, String billingGroupDisplayName) throws IOException, CommandException
        {
            try {
                HashMap<String, Object> billingGroupTestData = new HashMap<>();
                billingGroupTestData.put("value", billingGroupRealName);
                billingGroupTestData.put("title", billingGroupDisplayName);
                insertValueIntoDataset("ehr_lookups", "blood_billed_by", billingGroupTestData);
            }
            catch (Exception e) {
                log("Error executing insertValueIntoBloodBilledByDataset(), value most likely already exists in this dataset.");
            }
        }

        /**
         * This function inserts data into the 'study/BloodSchedule' dataset.
         *      This function creates the following fields in 'study/BloodSchedule': id, date, projectStatus, BloodRemaining/AvailBlood, billedby/title, and Id/DataSet/Demographics/calculated_status.
         *      This function updates the following tables: study/demographics, study/weight, study/blood.
         * @param billingGroupRealName
         * @param animalID
         * @param animalAlive
         * @param projectAssigned
         * @param animalWeight
         * @throws IOException
         * @throws CommandException
         */
        public void insertValueIntoBloodScheduleDataset(String billingGroupRealName, String animalID, Boolean animalAlive, Date drawDate, Boolean projectAssigned, Double animalWeight, Boolean drawCompleted) throws IOException, CommandException {
            try {
                // Creates data to pass in.
                String livingStatus = "Dead";
                if (animalAlive) {
                    livingStatus = "Alive";
                }
                Integer assignmentStatus = null;
                if (projectAssigned) {
                    assignmentStatus = 300901;
                }
                Integer completionStatus = getQCStateRowID("In Progress");
                if (drawCompleted) {
                    completionStatus = getQCStateRowID("Completed");
                }

                // Creates demographic info (this updates the bloodSchedule field: 'Id/DataSet/Demographics/calculated_status').
                HashMap<String, Object> demographicInfoTestData1 = new HashMap<>();
                demographicInfoTestData1.put("id", animalID);
                demographicInfoTestData1.put("calculated_status", livingStatus);
                // Creates weight info (this updates the bloodSchedule field: 'BloodRemaining/AvailBlood').
                HashMap<String, Object> weightTestData1 = new HashMap<>();
                weightTestData1.put("id", animalID);
                weightTestData1.put("date", new Date());
                weightTestData1.put("weight", animalWeight);
                // Creates blood info (this updates the bloodSchedule fields: 'id', 'date', 'projectStatus', 'billedby/title', and QCState/label).
                HashMap<String, Object> bloodTestData1 = new HashMap<>();
                bloodTestData1.put("id", animalID);
                bloodTestData1.put("date", drawDate);
                bloodTestData1.put("project", assignmentStatus);
                bloodTestData1.put("billedBy", billingGroupRealName);
                bloodTestData1.put("QCState", completionStatus);

                // Inserts data.
                insertValueIntoDataset("study", "demographics", demographicInfoTestData1);
                insertValueIntoDataset("study", "blood", bloodTestData1);
                insertValueIntoDataset("study", "weight", weightTestData1);
            }
            catch (Exception e) {
                log("Error executing insertValueIntoBloodScheduleDataset(), value most likely already exists in this dataset.");
            }
        }

        public void insertValueIntoNecropsyDataset(String animalID, Date necropsyDate) throws IOException, CommandException {
            try {
                HashMap<String, Object> necropsyTestData = new HashMap<>();
                necropsyTestData.put("id", animalID);
                necropsyTestData.put("date", necropsyDate);
                insertValueIntoDataset("study", "necropsies", necropsyTestData);
            }
            catch (Exception e) {
                log("Error executing insertValueIntoNecropsyDataset(), value most likely already exists in this dataset.");
            }
        }

        public Integer getQCStateRowID(String qcStateLabel) throws IOException, CommandException {
            // Retrieves QCState table.
            Connection cn = createDefaultConnection();
            SelectRowsCommand cmd = new SelectRowsCommand("core", "QCState");
            cmd.setRequiredVersion(9.1);    // Not sure what this does, but it was used in 'fetchWeightData()'.
            cmd.setColumns(Arrays.asList("RowId", "Label"));
            cmd.setMaxRows(100);
            SelectRowsResponse r = cmd.execute(cn, EHR_FOLDER_PATH);

            // Goes through each QCState in the table and returns the rowID of the row matching the passed-in QCState.
            for (Map<String, Object> currentRow : r.getRows()) {
                String rowLabel = ((HashMap<String, Object>) currentRow.get("Label")).get("value").toString();
                Integer rowID = Integer.valueOf(((HashMap<String, Object>) currentRow.get("RowId")).get("value").toString());
                if (rowLabel.equals(qcStateLabel)) {
                    return rowID;
                }
            }
            return null;
        }

    }

}