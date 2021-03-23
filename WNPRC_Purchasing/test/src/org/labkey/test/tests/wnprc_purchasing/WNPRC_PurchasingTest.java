/*
 * Copyright (c) 2020 LabKey Corporation
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

package org.labkey.test.tests.wnprc_purchasing;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.Pages.CreateRequestPage;
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.componenes.CreateVendorDialog;
import org.labkey.test.components.html.SiteNavBar;
import org.labkey.test.util.APIUserHelper;
import org.labkey.test.util.AbstractUserHelper;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Maps;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.SchemaHelper;
import org.labkey.test.util.UIPermissionsHelper;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.labkey.test.WebTestHelper.buildRelativeUrl;
import static org.labkey.test.WebTestHelper.getRemoteApiConnection;

@Category({EHR.class, WNPRC_EHR.class})
public class WNPRC_PurchasingTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    //folders
    private static final String FOLDER_TYPE = "WNPRC Purchasing";
    private static final String BILLING_FOLDER = "WNPRC Billing";
    private static final String FOLDER_FOR_REQUESTERS = "WNPRC Purchasing Requester";

    //users
    private static final String REQUESTER_USER = "purchaserequester@test.com";
    private static final String requesterName = "purchaserequester";
    private static final String ADMIN_USER = "purchaseadmin@test.com";
    //other properties
    private static int requestCnt = 0;
    //sample data
    private final File ALIASES_TSV = TestFileUtils.getSampleData("wnprc_purchasing/aliases.tsv");
    private final File SHIPPING_INFO_TSV = TestFileUtils.getSampleData("wnprc_purchasing/shippingInfo.tsv");
    private final File VENDOR_TSV = TestFileUtils.getSampleData("wnprc_purchasing/vendor.tsv");
    //account info
    private final String ACCT_100 = "acct100";
    private final String ACCT_101 = "acct101";
    private final String OTHER_ACCT_FIELD_NAME = "otherAcctAndInves";
    //helpers
    public AbstractUserHelper _userHelper = new APIUserHelper(this);
    ApiPermissionsHelper _apiPermissionsHelper = new ApiPermissionsHelper(this);
    private int _adminUserId;
    private int _requesterUserId;
    private SchemaHelper _schemaHelper = new SchemaHelper(this);
    private UIPermissionsHelper _permissionsHelper = new UIPermissionsHelper(this);

    @BeforeClass
    public static void setupProject() throws IOException, CommandException
    {
        WNPRC_PurchasingTest init = (WNPRC_PurchasingTest) getCurrentTest();
        init.doSetup();
    }

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        _containerHelper.deleteProject(getProjectName(), afterTest);
        _containerHelper.deleteProject(BILLING_FOLDER, afterTest);
        _containerHelper.deleteProject(FOLDER_FOR_REQUESTERS, afterTest);
    }

    private void doSetup() throws IOException, CommandException
    {
        goToHome();

        log("Create a purchasing admin user");
        _adminUserId = _userHelper.createUser(ADMIN_USER).getUserId().intValue();

        log("Create a purchasing requester user");
        _requesterUserId = _userHelper.createUser(REQUESTER_USER).getUserId().intValue();

        goToHome();

        log("Create 'WNPRC Billing' folder");
        _containerHelper.createProject(BILLING_FOLDER, FOLDER_TYPE);
        _containerHelper.enableModules(Arrays.asList("EHR_Billing"));

        log("Populate ehr_billing.aliases");
        goToProjectHome(BILLING_FOLDER);
        uploadData(ALIASES_TSV, "ehr_billing", "aliases", BILLING_FOLDER);

        goToHome();

        log("Create a 'WNPRC Purchasing' folder for Admins");
        _containerHelper.createProject(getProjectName(), FOLDER_TYPE);

        log("Add WNPRC Purchasing Admin webpart");
        new SiteNavBar(getDriver()).enterPageAdminMode();
        (new PortalHelper(this)).addWebPart("WNPRC Purchasing Admin");
        new SiteNavBar(getDriver()).exitPageAdminMode();

        goToProjectHome();

        log("Upload purchasing data");
        uploadPurchasingData();

        log("Create user-account associations");
        createUserAccountAssociations();

        log("Create ehrBillingLinked schema");
        _schemaHelper.createLinkedSchema(getProjectName(), "ehr_billingLinked", BILLING_FOLDER, "ehr_billingLinked", null, null, null);

        addUsersToPurchasingAdminFolder();

        goToHome();

        log("Create a 'WNPRC Purchasing' folder for Requesters");
        _containerHelper.createProject(FOLDER_FOR_REQUESTERS, FOLDER_TYPE);

        log("Create ehrBillingLinked schema");
        _schemaHelper.createLinkedSchema(FOLDER_FOR_REQUESTERS, "ehr_purchasingLinked", getProjectName(), "ehr_purchasingLinked", null, null, null);
        _schemaHelper.createLinkedSchema(FOLDER_FOR_REQUESTERS, "coreLinked", getProjectName(), "coreLinked", null, null, null);

        goToProjectHome(FOLDER_FOR_REQUESTERS);
        setModuleProperties(Arrays.asList(new ModulePropertyValue("EHR_Purchasing", "/"+ FOLDER_FOR_REQUESTERS, "EHRPurchasingContainer", "/" + getProjectName())));
        log("Add WNPRC Purchasing Requester webpart");
        goToProjectHome(FOLDER_FOR_REQUESTERS);
        new SiteNavBar(getDriver()).enterPageAdminMode();
        (new PortalHelper(this)).addWebPart("WNPRC Purchasing Requester");
        new SiteNavBar(getDriver()).exitPageAdminMode();

        addUsersToPurchasingRequesterFolder();
    }

    private void addUsersToPurchasingAdminFolder()
    {
        goToProjectHome();
        _permissionsHelper.setUserPermissions(ADMIN_USER, "Project Administrator");
        _permissionsHelper.setUserPermissions(getCurrentUser(), "Project Administrator");
        _permissionsHelper.setUserPermissions(REQUESTER_USER, "Submitter");
        _permissionsHelper.setUserPermissions(REQUESTER_USER, "Reader");
    }

    private void addUsersToPurchasingRequesterFolder()
    {
        goToProjectHome(FOLDER_FOR_REQUESTERS);
        _permissionsHelper.setUserPermissions(ADMIN_USER, "Project Administrator");
        _permissionsHelper.setUserPermissions(getCurrentUser(), "Project Administrator");

        _permissionsHelper.setUserPermissions(REQUESTER_USER, "Reader");
    }

    private void createUserAccountAssociations() throws IOException, CommandException
    {
        List<Map<String, Object>> userAcctAssocRows = new ArrayList<>();

        Map<String, Object> userAcctRow = new HashMap<>();
        userAcctRow.put("userId", _requesterUserId);
        userAcctRow.put("account", ACCT_100);
        userAcctAssocRows.add(userAcctRow);

        userAcctRow = new HashMap<>();
        userAcctRow.put("userId", _requesterUserId);
        userAcctRow.put("account", ACCT_101);
        userAcctAssocRows.add(userAcctRow);

        userAcctRow = new HashMap<>();
        userAcctRow.put("userId", _adminUserId);
        userAcctRow.put("accessToAllAccounts", true);
        userAcctAssocRows.add(userAcctRow);

        userAcctRow = new HashMap<>();
        userAcctRow.put("userId", _apiPermissionsHelper.getUserId(getCurrentUser()));
        userAcctRow.put("accessToAllAccounts", true);
        userAcctAssocRows.add(userAcctRow);

        int rowsInserted = insertData(getRemoteApiConnection(true), "ehr_purchasing", "userAccountAssociations", userAcctAssocRows, getProjectName()).size();
        assertEquals("Incorrect number of rows created", 4, rowsInserted);
    }

    private void uploadPurchasingData() throws IOException, CommandException
    {
        uploadData(SHIPPING_INFO_TSV, "ehr_purchasing", "shippingInfo", getProjectName());
        uploadData(VENDOR_TSV, "ehr_purchasing", "vendor", getProjectName());
    }

    private void uploadData(File tsvFile, String schemaName, String tableName, String projectName) throws IOException, CommandException
    {
        Connection connection = getRemoteApiConnection(true);
        List<Map<String, Object>> tsv = loadTsv(tsvFile);
        insertData(connection, schemaName, tableName, tsv, projectName);
    }

    private List<Map<String, Object>> insertData(Connection connection, String schemaName, String queryName, List<Map<String, Object>> rows, String projectName) throws IOException, CommandException
    {
        log("Loading data in: " + schemaName + "." + queryName);
        InsertRowsCommand command = new InsertRowsCommand(schemaName, queryName);
        command.setRows(rows);
        SaveRowsResponse response = command.execute(connection, projectName);
        return response.getRows();
    }

    @Before
    public void preTest()
    {
        goToProjectHome();
    }

    @Test
    public void testCreateRequest()
    {
        goToProjectHome(FOLDER_FOR_REQUESTERS);
        impersonate(REQUESTER_USER);
        clickButton("Create Request");
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());

        log("Verifying the validation for mandatory fields");
        requestPage.submitExpectingError();
        checker().verifyEquals("Invalid error message", "Unable to submit request, missing required fields.", requestPage.getAlertMessage());

        log("Creating a request order");
        requestPage.setAccountsToCharge("acct100")
                .setVendor("Real Santa Claus")
                .setBusinessPurpose("Holiday Party")
                .setSpecialInstructions("Ho Ho Ho")
                .setShippingDestination("456 Thompson lane (Math bldg)")
                .setDeliveryAttentionTo("Mrs Claus")
                .setItemDesc("Pen")
                .setUnitInput("CS")
                .setUnitCost("10")
                .setQuantity("25")
                .submitForReview();

        log("Verifying the request created");
        waitForElement(Locator.tagWithAttribute("h3", "title", "Purchase Requests"));
        DataRegionTable table = DataRegionTable.DataRegion(getDriver()).find();
        checker().verifyEquals("Invalid number of requests ", ++requestCnt, table.getDataRowCount());
        checker().verifyEquals("Invalid request status ", "Review Pending",
                table.getDataAsText(0, "requestStatus"));
        stopImpersonating();
    }

    @Test
    public void testOtherVendorRequest()
    {
        goToProjectHome(FOLDER_FOR_REQUESTERS);
        impersonate(REQUESTER_USER);
        clickButton("Create Request");
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setVendor("Other");

        log("Creating the New vendor");
        CreateVendorDialog vendorDialog = new CreateVendorDialog(getDriver());
        vendorDialog.setVendorName("Test1")
                .setStreetAddress("123 Will street")
                .setCity("New York City")
                .setState("New York")
                .setCountry("USA")
                .setZipCode("98989")
                .save();

        log("Edit the vendor information");
        clickButton("Edit other vendor", 0);
        vendorDialog = new CreateVendorDialog(getDriver());
        vendorDialog.setNotes("Edited vendor")
                .save();

        requestPage = new CreateRequestPage(getDriver());
        requestPage.setAccountsToCharge("acct101")
                .setBusinessPurpose("New vendor")
                .setSpecialInstructions("Welcome Party")
                .setShippingDestination("89 meow ave (Chemistry Bldg)")
                .setDeliveryAttentionTo("Newcomer")
                .setItemDesc("Pencil")
                .setUnitInput("PK")
                .setUnitCost("1000")
                .setQuantity("25000")
                .submitForReview();

        log("Verifying the request created");
        waitForElement(Locator.tagWithAttribute("h3", "title", "Purchase Requests"));
        DataRegionTable table = DataRegionTable.DataRegion(getDriver()).find();
        checker().verifyEquals("Invalid number of requests ", ++requestCnt, table.getDataRowCount());
        checker().verifyEquals("Invalid request status ", "Review Pending",
                table.getDataAsText(0, "requestStatus"));
        checker().verifyEquals("Invalid Vendor ", "Test1", table.getDataAsText(0, "vendorId"));
        stopImpersonating();
    }

    @Test
    public void testPurchaseAdminWorkflow()
    {
        File jpgFile = new File(TestFileUtils.getSampleData("fileTypes"), "jpg_sample.jpg");
        File pdfFile = new File(TestFileUtils.getSampleData("fileTypes"), "pdf_sample.pdf");

        log("-----Create request as lab end user-----");
        log("Impersonate as " + REQUESTER_USER);
        impersonate(REQUESTER_USER);

        log("Create new Request - START");
        goToProjectHome(FOLDER_FOR_REQUESTERS);
        clickButton("Create Request");
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());

        requestPage.setAccountsToCharge("acct100")
                .setVendor("Real Santa Claus")
                .setBusinessPurpose("Holiday Party")
                .setSpecialInstructions("Ho Ho Ho")
                .setShippingDestination("456 Thompson lane (Math bldg)")
                .setDeliveryAttentionTo("Mrs Claus")
                .setItemDesc("Pen")
                .setUnitInput("CS")
                .setUnitCost("10")
                .setQuantity("25");

        log("Upload an attachment");
        requestPage.addAttachment(jpgFile)
                .submitForReview();

        log("Verify " + REQUESTER_USER + " can view the request submitted");
        waitForElement(Locator.tagWithAttribute("h3", "title", "Purchase Requests"));
        DataRegionTable table = DataRegionTable.DataRegion(getDriver()).find();
        String requestID = table.getDataAsText(0, "rowId");
        checker().verifyEquals("Invalid number of requests ", 1, table.getDataRowCount());
        checker().verifyEquals("Invalid request status ", "Review Pending",
                table.getDataAsText(0, "requestStatus"));
        checker().verifyEquals("Invalid requester", requesterName, table.getDataAsText(0, "requester"));
        stopImpersonating();

        log("-----Update request as Purchasing Admin-----");
        goToProjectHome();
        log("Impersonate as " + ADMIN_USER);
        impersonate(ADMIN_USER);
        clickAndWait(Locator.linkContainingText("All Open Requests"));
        DataRegionTable requestsQueryForAdmins = new DataRegionTable("query", getDriver());
        requestsQueryForAdmins.setFilter("requestNum", "Equals", requestID);

        checker().verifyEquals("Admin is not seeing the request " + requestID, 1, requestsQueryForAdmins.getDataRowCount());
        clickAndWait(Locator.linkWithText(requestID));

        requestPage = new CreateRequestPage(getDriver());
        checker().verifyEquals("Invalid value for Accounts to charge ", "acct100", requestPage.getAccountsToCharge());
        checker().verifyEquals("Invalid value for Vendor ", "Real Santa Claus", requestPage.getVendor());
        checker().verifyEquals("Invalid value for BusinessPurpose ", "Holiday Party", requestPage.getBusinessPurpose());
        checker().verifyEquals("Invalid value for Special Instructions ", "Ho Ho Ho", requestPage.getSpecialInstructions());
        checker().verifyEquals("Invalid value for Shipping Destination", "456 Thompson lane (Math bldg)", requestPage.getShippingDestination());
        checker().verifyEquals("Invalid value for Delivery Attention to ", "Mrs Claus", requestPage.getDeliveryAttentionTo());
        checker().verifyEquals("Invalid value for Line Item ", "Pen", requestPage.getItemDesc());
        checker().verifyEquals("Invalid value for Unit Input ", "CS", requestPage.getUnitInput());
        checker().verifyEquals("Invalid value for Unit cost ", "10", requestPage.getUnitCost());
        checker().verifyEquals("Invalid value for Quantity ", "25", requestPage.getQuantity());

        log("Add a line item with negative value");
        requestPage.setQuantity("-10");

        log("Upload another attachment");
        requestPage.addAttachment(pdfFile);

        log("Verify Status in 'Purchase Admin' panel is 'Review Pending'");
        checker().verifyEquals("Invalid Assigned to value ", "Select", requestPage.getAssignedTo());
        checker().verifyEquals("Invalid Program value", "4", requestPage.getProgram());
        checker().verifyEquals("Invalid status ", "Review Pending", requestPage.getStatus());

        requestPage.setStatus("Request Approved")
                .setConfirmationNo("12345")
                .submit();

        stopImpersonating(false);

        beginAt(buildRelativeUrl("WNPRC_Purchasing", getProjectName(), "requestEntry",  Maps.of("requestRowId", requestID)));
        log("Impersonate as " + REQUESTER_USER);
        impersonate(REQUESTER_USER);
        assertTextPresent("You do not have sufficient permissions to update this request.");
        stopImpersonating();
    }

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    protected String getProjectName()
    {
        return "WNPRC Purchasing";
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Collections.singletonList("WNPRC_Purchasing");
    }
}