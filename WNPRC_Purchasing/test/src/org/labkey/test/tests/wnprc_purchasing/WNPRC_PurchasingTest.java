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

import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.TruncateTableCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.components.dumbster.EmailRecordTable;
import org.labkey.test.components.html.SiteNavBar;
import org.labkey.test.components.wnprc_purchasing.CreateVendorDialog;
import org.labkey.test.pages.wnprc_purchasing.CreateRequestPage;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
@BaseWebDriverTest.ClassTimeout(minutes = 5)
public class WNPRC_PurchasingTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    //folders
    private static final String PURCHASING_FOLDER = "WNPRC Purchasing";
    private static final String BILLING_FOLDER = "WNPRC Billing";

    //user groups
    private static final String PURCHASE_REQUESTER_GROUP = "Purchase Requesters";
    private static final String PURCHASE_RECEIVER_GROUP = "Purchase Receivers";
    private static final String PURCHASE_ADMIN_GROUP = "Purchase Admins";

    //users
    private static final String REQUESTER_USER_1 = "purchaserequester1@test.com";
    private static final String REQUESTER_USER_2 = "purchaserequester2@test.com";
    private static final String RECEIVER_USER = "purchasereceiver@test.com";
    private static final String requester1Name = "purchaserequester1";
    private static final String requester2Name = "purchaserequester2";

    private static final String ADMIN_USER = "purchaseadmin@test.com";
    private static final String PURCHASE_DIRECTOR_USER = "purchasedirector@test.com";
    //other properties

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
    File pdfFile = new File(TestFileUtils.getSampleData("fileTypes"), "pdf_sample.pdf");
    DateTimeFormatter _dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    LocalDateTime today = LocalDateTime.now();
    private int _adminUserId;
    private int _requesterUserId1;
    private int _requesterUserId2;
    private int _receiverUserId;
    private int _directorUserId;
    private int _adminGroupId;
    private int _receiverGroupId;
    private int _requesterGroupId;
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
    }

    private void doSetup() throws IOException, CommandException
    {
        goToHome();

        log("Create 'WNPRC Billing' folder");
        _containerHelper.createProject(BILLING_FOLDER, PURCHASING_FOLDER);
        _containerHelper.enableModules(Arrays.asList("EHR_Billing", "Dumbster"));

        log("Populate ehr_billing.aliases");
        goToProjectHome(BILLING_FOLDER);
        addExtensibleColumn("groupName");
        uploadData(ALIASES_TSV, "ehr_billing", "aliases", BILLING_FOLDER);

        goToHome();

        log("Create a 'WNPRC Purchasing' folder");
        _containerHelper.createProject(getProjectName(), PURCHASING_FOLDER);

        log("Add WNPRC Purchasing Landing page webpart");
        new SiteNavBar(getDriver()).enterPageAdminMode();
        (new PortalHelper(this)).addWebPart("WNPRC Purchasing Landing Page");
        new SiteNavBar(getDriver()).exitPageAdminMode();

        goToProjectHome();

        log("Upload purchasing data");
        uploadPurchasingData();

        log("Create ehrBillingLinked schema");
        _schemaHelper.createLinkedSchema(getProjectName(), "ehr_billingLinked", BILLING_FOLDER, "ehr_billingLinked", null, null, null);

        log("Create users and groups");
        createUsersAndGroups();
        log("Add groups to purchasing folder");
        addUsersToPurchasingFolder();

        log("Create user-account associations");
        createUserAccountAssociations();

        goToHome();
    }

    private void addExtensibleColumn(String extensibleCol)
    {
        goToSchemaBrowser();
        selectQuery("ehr_billing", "aliases");
        clickAndWait(Locator.linkWithText("create definition"), 5000);

        Locator.XPathLocator manuallyDefineFieldsLoc = Locator.tagWithClass("div", "domain-form-manual-btn");
        click(manuallyDefineFieldsLoc);
        setFormElement(Locator.inputByNameContaining("domainpropertiesrow-name"), extensibleCol);
        clickButton("Save");
    }

    private void createUsersAndGroups()
    {
        log("Create a purchasing admin user");
        _adminUserId = _userHelper.createUser(ADMIN_USER).getUserId().intValue();

        log("Create a purchasing requester users");
        _requesterUserId1 = _userHelper.createUser(REQUESTER_USER_1).getUserId().intValue();
        _requesterUserId2 = _userHelper.createUser(REQUESTER_USER_2).getUserId().intValue();

        log("Create a purchasing receiver user");
        _receiverUserId = _userHelper.createUser(RECEIVER_USER).getUserId().intValue();

        log("Create a purchasing director user");
        _directorUserId = _userHelper.createUser(PURCHASE_DIRECTOR_USER).getUserId().intValue();

        log("Create a purchasing groups");
        _adminGroupId = _permissionsHelper.createPermissionsGroup(PURCHASE_ADMIN_GROUP);
        _receiverGroupId = _permissionsHelper.createPermissionsGroup(PURCHASE_RECEIVER_GROUP);
        _requesterGroupId = _permissionsHelper.createPermissionsGroup(PURCHASE_REQUESTER_GROUP);
    }

    private void addUsersToPurchasingFolder()
    {
        goToProjectHome();
        log("Add users to " + PURCHASE_ADMIN_GROUP);
        _permissionsHelper.addUserToProjGroup(getCurrentUserName(), getProjectName(), PURCHASE_ADMIN_GROUP);
        _permissionsHelper.addUserToProjGroup(ADMIN_USER, getProjectName(), PURCHASE_ADMIN_GROUP);
        _permissionsHelper.addUserToProjGroup(PURCHASE_DIRECTOR_USER, getProjectName(), PURCHASE_ADMIN_GROUP);

        log("Add users to " + PURCHASE_RECEIVER_GROUP);
        _permissionsHelper.addUserToProjGroup(RECEIVER_USER, getProjectName(), PURCHASE_RECEIVER_GROUP);

        log("Add users to " + PURCHASE_REQUESTER_GROUP);
        _permissionsHelper.addUserToProjGroup(REQUESTER_USER_1, getProjectName(), PURCHASE_REQUESTER_GROUP);
        _permissionsHelper.addUserToProjGroup(REQUESTER_USER_2, getProjectName(), PURCHASE_REQUESTER_GROUP);

        _permissionsHelper.setPermissions(PURCHASE_ADMIN_GROUP, "Project Administrator");
        _permissionsHelper.setPermissions(PURCHASE_REQUESTER_GROUP, "Submitter");
        _permissionsHelper.setPermissions(PURCHASE_REQUESTER_GROUP, "Reader");
        _permissionsHelper.setPermissions(PURCHASE_RECEIVER_GROUP, "Editor");
        _permissionsHelper.setUserPermissions(PURCHASE_DIRECTOR_USER, "WNPRC Purchasing Director");
    }

    private void goToPurchaseAdminPage()
    {
        beginAt(buildRelativeUrl("WNPRC_Purchasing", getProjectName(), "purchaseAdmin"));
    }

    private void goToRequesterPage()
    {
        beginAt(buildRelativeUrl("WNPRC_Purchasing", getProjectName(), "requester"));
    }

    private void goToReceiverPage()
    {
        beginAt(buildRelativeUrl("WNPRC_Purchasing", getProjectName(), "purchaseReceiver"));
    }

    private void createUserAccountAssociations() throws IOException, CommandException
    {
        List<Map<String, Object>> userAcctAssocRows = new ArrayList<>();

        Map<String, Object> userAcctRow = new HashMap<>();
        userAcctRow.put("userId", _requesterGroupId);
        userAcctRow.put("account", ACCT_100);
        userAcctAssocRows.add(userAcctRow);

        userAcctRow = new HashMap<>();
        userAcctRow.put("userId", _requesterGroupId);
        userAcctRow.put("account", ACCT_101);
        userAcctAssocRows.add(userAcctRow);

        userAcctRow = new HashMap<>();
        userAcctRow.put("userId", _adminGroupId);
        userAcctRow.put("accessToAllAccounts", true);
        userAcctAssocRows.add(userAcctRow);

        int rowsInserted = insertData(getRemoteApiConnection(true), "ehr_purchasing", "userAccountAssociations", userAcctAssocRows, getProjectName()).size();
        assertEquals("Incorrect number of rows created", 3, rowsInserted);
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
    public void preTest() throws IOException, CommandException
    {
        goToProjectHome();
        clearAllRequest();
    }

    @Test
    public void testCreateRequestAndEmailNotification() throws IOException, CommandException
    {
        log("Delete emails from dumbster");
        enableEmailRecorder();

        goToRequesterPage();
        impersonate(REQUESTER_USER_1);
        waitAndClickAndWait(Locator.linkWithText("Create Request"));
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());

        log("Verifying the validation for mandatory fields");
        requestPage.submitForReviewExpectingError();
        checker().verifyEquals("Invalid error message", "Unable to submit request, missing required fields.", requestPage.getAlertMessage());

        log("Creating a request order");
        requestPage.setAccountsToCharge("acct100 - Assay Services")
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
        assertEquals("Invalid number of requests ", 1, table.getDataRowCount());
        assertEquals("Invalid request status ", "Review Pending",
                table.getDataAsText(0, "requestStatus"));
        String requestId = table.getDataAsText(0, "rowId");
        stopImpersonating();

        goToModule("Dumbster");
        log("Verify email sent to purchase admins for orders < $5000");
        EmailRecordTable mailTable = new EmailRecordTable(this);
        String subject = "A new purchase request for $250.00 is submitted";

        List<String> sortedExpected = Arrays.asList("purchaseadmin@test.com");
        sortedExpected.sort(String.CASE_INSENSITIVE_ORDER);

        List<String> sortedActual = mailTable.getColumnDataAsText("To");
        sortedActual.sort(String.CASE_INSENSITIVE_ORDER);

        checker().verifyEquals("Incorrect To for the emails sent", sortedExpected, sortedActual);

        mailTable.clickSubjectAtIndex(subject, 0);
        log("Email body " + mailTable.getMessage(subject).getBody());
        checker().verifyTrue("Incorrect email body",
                mailTable.getMessage(subject).getBody().contains("A new purchasing request # " + requestId + " by " + requester1Name + " was submitted on " + _dateTimeFormatter.format(today) + " for the total of $250.00."));

    }

    @Test
    public void testOtherVendorRequest() throws IOException, CommandException
    {
        goToRequesterPage();
        impersonate(REQUESTER_USER_1);
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
        requestPage.setAccountsToCharge("acct101 - Business Office")
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
        checker().verifyEquals("Invalid number of requests ", 1, table.getDataRowCount());
        checker().verifyEquals("Invalid request status ", "Review Pending",
                table.getDataAsText(0, "requestStatus"));
        checker().verifyEquals("Invalid Vendor ", "Test1", table.getDataAsText(0, "vendor"));
        checker().screenShotIfNewError("other_vendor_request");
        stopImpersonating();
    }

    @Test
    public void testPurchaseAdminWorkflow() throws IOException, CommandException
    {
        File jpgFile = new File(TestFileUtils.getSampleData("fileTypes"), "jpg_sample.jpg");

        log("-----Create request as lab end user-----");
        log("Impersonate as " + REQUESTER_USER_1);
        impersonate(REQUESTER_USER_1);

        log("Create new Request - START");
        goToRequesterPage();
        clickButton("Create Request");
        final CreateRequestPage requestPage = new CreateRequestPage(getDriver());

        requestPage.setAccountsToCharge("acct100 - Assay Services")
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

        log("Verify " + REQUESTER_USER_1 + " can view the request submitted");
        waitForElement(Locator.tagWithAttribute("h3", "title", "Purchase Requests"));
        DataRegionTable table = DataRegionTable.DataRegion(getDriver()).find();
        String requestID = table.getDataAsText(0, "rowId");
        checker().verifyEquals("Invalid number of requests ", 1, table.getDataRowCount());
        checker().verifyEquals("Invalid request status ", "Review Pending",
                table.getDataAsText(0, "requestStatus"));
        checker().verifyEquals("Invalid requester", requester1Name, table.getDataAsText(0, "requester"));
        checker().screenShotIfNewError("requester_view_submitted");
        stopImpersonating();

        log("-----Update request as Purchasing Admin-----");
        goToPurchaseAdminPage();
        log("Impersonate as " + ADMIN_USER);
        impersonate(ADMIN_USER);
        clickAndWait(Locator.linkContainingText("All Open Requests"));
        DataRegionTable requestsQueryForAdmins = new DataRegionTable("query", getDriver());
        requestsQueryForAdmins.setFilter("requestNum", "Equals", requestID);

        assertEquals("Admin is not seeing the request " + requestID, 1, requestsQueryForAdmins.getDataRowCount());
        clickAndWait(Locator.linkWithText(requestID));

        final CreateRequestPage requestPage2 = new CreateRequestPage(getDriver());
        waitFor(() -> !requestPage2.getAccountsToCharge().equals("Select"), "Form didn't load existing values", 5_000);
        checker().verifyEquals("Invalid value for Accounts to charge ", "acct100 - Assay Services", requestPage2.getAccountsToCharge());
        checker().verifyEquals("Invalid value for Vendor ", "Real Santa Claus", requestPage2.getVendor());
        checker().verifyEquals("Invalid value for BusinessPurpose ", "Holiday Party", requestPage2.getBusinessPurpose());
        checker().verifyEquals("Invalid value for Comments/Special Instructions ", "Ho Ho Ho", requestPage2.getSpecialInstructions());
        checker().verifyEquals("Invalid value for Shipping Destination", "456 Thompson lane (Math bldg)", requestPage2.getShippingDestination());
        checker().verifyEquals("Invalid value for Delivery Attention to ", "Mrs Claus", requestPage2.getDeliveryAttentionTo());
        checker().verifyEquals("Invalid value for Line Item ", "Pen", requestPage2.getItemDesc());
        checker().verifyEquals("Invalid value for Unit Input ", "CS", requestPage2.getUnitInput());
        checker().verifyEquals("Invalid value for Unit cost ", "10", requestPage2.getUnitCost());
        checker().verifyEquals("Invalid value for Quantity ", "25", requestPage2.getQuantity());
        checker().screenShotIfNewError("admin_view_submitted");

        log("Upload another attachment");
        requestPage2.addAttachment(pdfFile);

        log("Verify Status in 'Purchase Admin' panel is 'Review Pending'");
        checker().verifyEquals("Invalid Assigned to value ", "Select", requestPage2.getAssignedTo());
        checker().verifyEquals("Invalid Program value", "4", requestPage2.getProgram());
        checker().verifyEquals("Invalid status ", "Review Pending", requestPage2.getStatus());
        checker().screenShotIfNewError("status_review_pending");

        requestPage2.setStatus("Request Approved")
                .setConfirmationNo("12345")
                .submit();

        stopImpersonating(false);

        beginAt(buildRelativeUrl("WNPRC_Purchasing", getProjectName(), "requestEntry", Maps.of("requestRowId", requestID)));
        log("Impersonate as " + REQUESTER_USER_2);
        impersonate(REQUESTER_USER_2);
        assertTextPresent("You do not have sufficient permissions to update this request.");
        stopImpersonating();
    }

    @Test
    public void testReferenceTables()
    {
        goToProjectHome();
        clickAndWait(Locator.linkWithText("Purchasing Admin"));

        log("Checking if the link is present on the Purchasing Admin page");
        checker().verifyTrue("Vendors reference is not present", isElementPresent(Locator.linkWithText("Vendors")));
        checker().verifyTrue("User Account Associations reference is not present", isElementPresent(Locator.linkWithText("User Account Associations")));
        checker().verifyTrue("Shipping Info reference is not present", isElementPresent(Locator.linkWithText("Shipping Info")));
        checker().verifyTrue("Item Units reference is not present", isElementPresent(Locator.linkWithText("Item Units")));
        checker().verifyTrue("Line Items reference is not present", isElementPresent(Locator.linkWithText("Line Items")));

        log("Verifying if link navigates to correct query");
        checker().verifyEquals("Incorrect link for Vendors", "Vendor", getQueryName("Vendors"));
        checker().verifyEquals("Incorrect link for User Account Associations", "User Account Associations",
                getQueryName("User Account Associations"));
        checker().verifyEquals("Incorrect link for Shipping Info", "Shipping Info", getQueryName("Shipping Info"));
        checker().verifyEquals("Incorrect link for Item Units", "Item Units", getQueryName("Item Units"));
        checker().verifyEquals("Incorrect link for Line Items", "Line Items", getQueryName("Line Items"));
    }

    @Test
    public void testAdminPage() throws IOException, CommandException
    {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime date = LocalDateTime.now();

        log("Verifying requester does not access to admin web part");
        goToProjectHome();
        impersonate(REQUESTER_USER_1);
        goToPurchaseAdminPage();
        checker().verifyTrue(REQUESTER_USER_1 + "user should not permission for admin page",
                isElementPresent(Locator.tagWithClass("div", "labkey-error-subheading")
                        .withText("User does not have permission to perform this operation.")));
        checker().screenShotIfNewError("requester_view_restricted");
        goBack();

        log("Creating request as " + REQUESTER_USER_1);
        goToRequesterPage();
        waitAndClickAndWait(Locator.linkWithText("Create Request"));
        Map<String, String> requesterRequest = new HashMap<>();
        requesterRequest.put("Account to charge", "acct100 - Assay Services");
        requesterRequest.put("Shipping destination", "456 Thompson lane (Math bldg)");
        requesterRequest.put("Vendor", "Dunder Mifflin");
        requesterRequest.put("Delivery attention to", "testing the workflow");
        requesterRequest.put("Business purpose", "regression test");
        requesterRequest.put("Item description", "Item1");
        requesterRequest.put("Unit", "Term");
        requesterRequest.put("Unit Cost", "10");
        requesterRequest.put("Quantity", "6");

        String requestId1 = createRequest(requesterRequest, null);
        stopImpersonating();

        log("Creating request as " + ADMIN_USER);
        impersonate(ADMIN_USER);
        goToPurchaseAdminPage();
        Map<String, String> adminRequest = new HashMap<>();
        adminRequest.put("Account to charge", "acct101 - Business Office");
        adminRequest.put("Shipping destination", "456 Thompson lane (Math bldg)");
        adminRequest.put("Vendor", "Real Santa Claus");
        adminRequest.put("Delivery attention to", "testing the workflow - Admin");
        adminRequest.put("Business purpose", "regression test -Admin request");
        adminRequest.put("Item description", "Item1");
        adminRequest.put("Unit", "Term");
        adminRequest.put("Unit Cost", "20");
        adminRequest.put("Quantity", "3");
        clickAndWait(Locator.linkWithText("Enter Request"));
        String requestId2 = createRequest(requesterRequest, null);

        log("Verifying all open requests");
        goToPurchaseAdminPage();
        clickAndWait(Locator.linkWithText("All Open Requests"));
        DataRegionTable table = new DataRegionTable("query", getDriver());
        checker().verifyEquals("Incorrect request Id's", Arrays.asList(requestId1, requestId2),
                table.getColumnDataAsText("requestNum"));
        checker().verifyEquals("Incorrect requester's", Arrays.asList("purchaserequester1", "purchaseadmin"),
                table.getColumnDataAsText("requester"));
        checker().screenShotIfNewError("all_open_requests");

        log("Changing the assignment of the request");
        clickAndWait(Locator.linkWithText(requestId1));
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setAssignedTo("purchaseadmin")
                .setPurchaseOptions("Direct Payment")
                .setStatus("Request Approved")
                .setOrderDate(dtf.format(date))
                .setCardPostDate(dtf.format(date))
                .submit();

        goToPurchaseAdminPage();
        waitAndClickAndWait(Locator.linkWithText("My Open Requests"));
        table = new DataRegionTable("query", getDriver());

        checker().verifyEquals("Incorrect request in my open request", requestId1,
                table.getDataAsText(0, "requestNum"));
        checker().verifyEquals("Incorrect status", "Request Approved",
                table.getDataAsText(0, "requestStatus"));
        checker().screenShotIfNewError("my_open_requests");

        log("Completing the order");
        goToPurchaseAdminPage();
        waitAndClickAndWait(Locator.linkWithText("All Open Requests"));
        clickAndWait(Locator.linkWithText(requestId2));
        requestPage = new CreateRequestPage(getDriver());
        requestPage.setStatus("Order Complete").submit();

        clickAndWait(Locator.linkWithText("Completed Requests"));
        table = new DataRegionTable("query", getDriver());
        checker().verifyEquals("Incorrect request in my open request", requestId2,
                table.getDataAsText(0, "requestNum"));
        checker().verifyEquals("Incorrect status", "Order Complete",
                table.getDataAsText(0, "requestStatus"));
        checker().screenShotIfNewError("completed_requests");

        goToPurchaseAdminPage();
        clickAndWait(Locator.linkWithText("All Open Requests"));
        table = new DataRegionTable("query", getDriver());
        checker().verifyEquals("Completed order should not be present", Arrays.asList(requestId1),
                table.getColumnDataAsText("requestNum"));
        checker().screenShotIfNewError("requests_after_completing");
        stopImpersonating();

        log("Verifying the P-Card view");
        goToPurchaseAdminPage();
        clickAndWait(Locator.linkWithText("P-Card View"));
        table = new DataRegionTable("query", getDriver());
        assertEquals("Incorrect number of rows in P-Card view", 2, table.getDataRowCount());
    }

    @Test
    public void testReceiverActions()
    {
        goToProjectHome();
        impersonate(REQUESTER_USER_1);
        goToRequesterPage();

        log("Creating the first request as" + REQUESTER_USER_1);
        waitAndClickAndWait(Locator.linkWithText("Create Request"));
        Map<String, String> requestInputs = new HashMap<>();
        requestInputs.put("Account to charge", "acct101 - Business Office");
        requestInputs.put("Shipping destination", "456 Thompson lane (Math bldg)");
        requestInputs.put("Vendor", "Dunder Mifflin");
        requestInputs.put("Delivery attention to", "testing the workflow - receiver");
        requestInputs.put("Business purpose", "regression test -receiver request");
        requestInputs.put("Item description", "Item1");
        requestInputs.put("Unit", "Term");
        requestInputs.put("Unit Cost", "20");
        requestInputs.put("Quantity", "3");
        String requestId1 = createRequest(requestInputs, null);

        log("Creating the second request as" + REQUESTER_USER_1);
        requestInputs = new HashMap<>();
        requestInputs.put("Account to charge", "acct100 - Assay Services");
        requestInputs.put("Shipping destination", "456 Thompson lane (Math bldg)");
        requestInputs.put("Vendor", "Real Santa Claus");
        requestInputs.put("Delivery attention to", "testing the workflow - receiver");
        requestInputs.put("Business purpose", "regression test -receiver request");
        requestInputs.put("Item description", "Item2");
        requestInputs.put("Unit", "CS");
        requestInputs.put("Unit Cost", "20");
        requestInputs.put("Quantity", "300");
        clickAndWait(Locator.linkWithText("Create Request"));
        String requestId2 = createRequest(requestInputs, null);
        stopImpersonating();

        log("Updating the request by " + ADMIN_USER);
        goToPurchaseAdminPage();
        impersonate(ADMIN_USER);
        clickAndWait(Locator.linkWithText("All Open Requests"));
        clickAndWait(Locator.linkWithText(requestId1));
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setQuantityReceived("4");
        requestPage.setStatus("Order Placed");
        requestPage.submit();

        waitAndClickAndWait(Locator.linkWithText("All Open Requests"));
        clickAndWait(Locator.linkWithText(requestId2));
        requestPage = new CreateRequestPage(getDriver());
        requestPage.setQuantityReceived("40");
        requestPage.setStatus("Order Placed");
        requestPage.submit();
        stopImpersonating();

        log("Testing as receiver");
        impersonate(RECEIVER_USER);
        goToPurchaseAdminPage();
        Assert.assertTrue("Receiver should not have permission to access admin page",
                isElementPresent(Locator.tagWithClass("div", "labkey-error-subheading")
                        .withText("User does not have permission to perform this operation.")));
        goToReceiverPage();
        waitAndClickAndWait(Locator.linkWithText(requestId2));
        requestPage = new CreateRequestPage(getDriver());
        requestPage.addAttachment(pdfFile);
        requestPage.setQuantityReceived("300");
        requestPage.submit();

        DataRegionTable table = DataRegionTable.DataRegion(getDriver()).find();
        assertEquals("The line item table should be empty", 0, table.getDataRowCount());
        stopImpersonating();

        goToPurchaseAdminPage();
        waitAndClickAndWait(Locator.linkWithText("All Requests"));

        table = new DataRegionTable("query", getDriver());
        table.setFilter("requestNum", "Equals One Of (example usage: a;b;c)", requestId1 + ";" + requestId2);
        assertEquals("Incorrect order status", Arrays.asList("Order Received", "Order Received"), table.getColumnDataAsText("requestStatus"));
    }

    @Test
    public void testEmailNotificationApprovalWorkflow()
    {
        log("Delete all the emails from dumbster");
        enableEmailRecorder();

        goToProjectHome(PURCHASING_FOLDER);
        impersonate(REQUESTER_USER_2);
        goToRequesterPage();
        Map<String, String> emailApprovalRequest = new HashMap<>();
        emailApprovalRequest.put("Account to charge", "acct100 - Assay Services");
        emailApprovalRequest.put("Shipping destination", "456 Thompson lane (Math bldg)");
        emailApprovalRequest.put("Vendor", "Stuff, Inc");
        emailApprovalRequest.put("Delivery attention to", "Testing the email notification approval workflow");
        emailApprovalRequest.put("Business purpose", "BP");
        emailApprovalRequest.put("Item description", "Item1");
        emailApprovalRequest.put("Unit", "Term");
        emailApprovalRequest.put("Unit Cost", "500");
        emailApprovalRequest.put("Quantity", "10");
        waitAndClickAndWait(Locator.linkWithText("Create Request"));
        String requestId = createRequest(emailApprovalRequest, null);
        stopImpersonating();

        log("Verifying create request emails for request total of $5000");
        goToModule("Dumbster");
        EmailRecordTable mailTable = new EmailRecordTable(this);
        String subject = "A new purchase request for $5,000.00 is submitted";
        checker().verifyEquals("Incorrect To for the emails sent",
                Arrays.asList("purchasedirector@test.com", "purchaseadmin@test.com"),
                mailTable.getColumnDataAsText("To"));
        mailTable.clickSubjectAtIndex(subject, 0);
        log("Email body " + mailTable.getMessage(subject).getBody());
        checker().verifyTrue("Incorrect email body",
                mailTable.getMessage(subject).getBody().contains("A new purchasing request # " + requestId + " by " + requester2Name + " was submitted on " + _dateTimeFormatter.format(today) + " for the total of $5,000.00."));
        checker().screenShotIfNewError("request_submitted_email");

        log("Delete emails from dumbster");
        enableEmailRecorder();

        goToPurchaseAdminPage();
        impersonate(PURCHASE_DIRECTOR_USER);
        clickAndWait(Locator.linkWithText("All Requests"));
        clickAndWait(Locator.linkWithText(requestId));
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setStatus("Request Approved").submit();
        stopImpersonating();

        goToModule("Dumbster");
        mailTable = new EmailRecordTable(this);
        subject = "Purchase request # " + requestId + " status update";
        checker().verifyEquals("Incorrect To for the emails sent after approval", Arrays.asList(ADMIN_USER), mailTable.getColumnDataAsText("To"));
        mailTable.clickSubjectAtIndex(subject, 0);
        log("Email body " + mailTable.getMessage(subject).getBody());
        checker().verifyTrue("Incorrect email body",
                mailTable.getMessage(subject).getBody().contains("Purchase request # " + requestId + " from vendor Stuff, Inc submitted on " + _dateTimeFormatter.format(today) + " for the total of $5,000.00 has been approved by the purchasing director."));
        checker().screenShotIfNewError("request_approved_email");
    }

    @Test
    public void testEmailNotificationRejectWorkflow()
    {
        String rejectReasonMsg = "Rejected due to budgetary constraints, please contact your PI for more details.";
        goToProjectHome(PURCHASING_FOLDER);
        impersonate(REQUESTER_USER_1);
        goToRequesterPage();
        Map<String, String> emailApprovalRequest = new HashMap<>();
        emailApprovalRequest.put("Account to charge", "acct100 - Assay Services");
        emailApprovalRequest.put("Shipping destination", "456 Thompson lane (Math bldg)");
        emailApprovalRequest.put("Vendor", "Stuff, Inc");
        emailApprovalRequest.put("Delivery attention to", "Testing the email notification approval workflow");
        emailApprovalRequest.put("Business purpose", "BP");
        emailApprovalRequest.put("Item description", "Item1");
        emailApprovalRequest.put("Unit", "Term");
        emailApprovalRequest.put("Unit Cost", "500");
        emailApprovalRequest.put("Quantity", "20");
        waitAndClickAndWait(Locator.linkWithText("Create Request"));
        String requestId = createRequest(emailApprovalRequest, null);
        stopImpersonating();

        log("Delete the emails in the dumbster");
        enableEmailRecorder();

        log("Purchase Director : Rejecting the request >= $5000");
        goToPurchaseAdminPage();
        impersonate(PURCHASE_DIRECTOR_USER);
        clickAndWait(Locator.linkWithText("All Requests"));
        clickAndWait(Locator.linkWithText(requestId));
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setStatus("Request Rejected");
        requestPage.setRejectReason(rejectReasonMsg);
        requestPage.submit();
        stopImpersonating();

        goToModule("Dumbster");
        EmailRecordTable mailTable = new EmailRecordTable(this);
        String subject = "Purchase request # " + requestId + " status update";
        checker().verifyEquals("Incorrect To for the emails sent after rejection", Arrays.asList(ADMIN_USER),
                mailTable.getColumnDataAsText("To"));
        mailTable.clickSubjectAtIndex(subject, 0);
        log("Email body " + mailTable.getMessage(subject).getBody());
        checker().verifyTrue("Incorrect email body",
                mailTable.getMessage(subject).getBody().contains("Purchase request # " + requestId + " from vendor Stuff, Inc submitted on " + _dateTimeFormatter.format(today) + " for the total of $10,000.00 has been rejected by the purchasing director."));
        checker().verifyTrue("Reason for rejection not found in the email body",
                mailTable.getMessage(subject).getBody().contains(rejectReasonMsg));
        checker().screenShotIfNewError("request_rejection_email");
    }

    @Test
    public void testEmailCustomizationLineItemUpdate()
    {
        log("Updating the settings for custom message");
        goToAdminConsole().clickEmailCustomization();
        selectOptionByText(Locator.css("select[id='templateClass']"), "WNPRC Purchasing - Line item update notification");
        setFormElement(Locator.name("emailSubject"), "Custom subject # ^requestNum^ for line item update");
        clickButton("Save");

        goToRequesterPage();
        impersonate(REQUESTER_USER_1);
        goToRequesterPage();
        Map<String, String> emailApprovalRequest = new HashMap<>();
        emailApprovalRequest.put("Account to charge", "acct100 - Assay Services");
        emailApprovalRequest.put("Shipping destination", "456 Thompson lane (Math bldg)");
        emailApprovalRequest.put("Vendor", "Stuff, Inc");
        emailApprovalRequest.put("Delivery attention to", "Testing the email notification approval workflow");
        emailApprovalRequest.put("Business purpose", "BP");
        emailApprovalRequest.put("Item description", "Item1");
        emailApprovalRequest.put("Unit", "Term");
        emailApprovalRequest.put("Unit Cost", "500");
        emailApprovalRequest.put("Quantity", "20");
        waitAndClickAndWait(Locator.linkWithText("Create Request"));
        String requestId = createRequest(emailApprovalRequest, null);
        stopImpersonating();

        log("Deleting the emails from dumbster");
        enableEmailRecorder();

        log("Updating the request status and line item to trigger email notif");
        impersonate(ADMIN_USER);
        goToPurchaseAdminPage();
        clickAndWait(Locator.linkWithText("All Requests"));
        clickAndWait(Locator.linkWithText(requestId));
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setStatus("Order Placed");
        requestPage.setQuantity("15").submit();
        stopImpersonating();

        goToModule("Dumbster");
        EmailRecordTable mailTable = new EmailRecordTable(this);
        String subject = "Custom subject # " + requestId + " for line item update";
        checker().verifyEquals("Incorrect To for the emails sent for line item update", Arrays.asList(REQUESTER_USER_1, REQUESTER_USER_1),
                mailTable.getColumnDataAsText("To"));
        mailTable.clickSubject(subject);
        log("Email body " + mailTable.getMessage(subject).getBody());
        checker().verifyTrue("Incorrect email body",
                mailTable.getMessage(subject).getBody().contains("Your purchase request # " + requestId + " from vendor Stuff, Inc submitted on " + _dateTimeFormatter.format(today) + " has been updated."));

        subject = "Purchase request # " + requestId + " status update";
        mailTable.clickSubject(subject);
        log("Email body " + mailTable.getMessage(subject).getBody());
        checker().verifyTrue("Incorrect email body",
                mailTable.getMessage(subject).getBody().contains("Purchase request # " + requestId + " from vendor Stuff, Inc submitted on " + _dateTimeFormatter.format(today) + " for the total of $7,500.00 has been ordered by the purchasing department."));
        checker().screenShotIfNewError("custom_request_email");


        log("Delete emails from dumbster");
        enableEmailRecorder();

        log("Verify quantity received email notif");
        goToReceiverPage();
        impersonate(RECEIVER_USER);
        waitAndClickAndWait(Locator.linkWithText(requestId));
        requestPage = new CreateRequestPage(getDriver());
        requestPage.setQuantityReceived("15").submit();
        stopImpersonating();

        goToModule("Dumbster");
        mailTable = new EmailRecordTable(this);
        subject = "Custom subject # " + requestId + " for line item update";
        checker().verifyEquals("Incorrect To for the emails sent for line item update", Arrays.asList(REQUESTER_USER_1),
                mailTable.getColumnDataAsText("To"));
        mailTable.clickSubject(subject);
        log("Email body " + mailTable.getMessage(subject).getBody());
        checker().verifyTrue("Incorrect email body",
                mailTable.getMessage(subject).getBody().contains("All line items are received."));
        checker().screenShotIfNewError("custom_request_email");

    }

    @Test
    public void testReorderRequest()
    {
        File jpgFile = new File(TestFileUtils.getSampleData("fileTypes"), "jpg_sample.jpg");
        goToProjectHome();
        impersonate(REQUESTER_USER_1);
        goToRequesterPage();
        log("Creating the first request as" + REQUESTER_USER_1);
        waitAndClickAndWait(Locator.linkWithText("Create Request"));
        Map<String, String> requestInputs = new HashMap<>();
        requestInputs.put("Account to charge", "acct101 - Business Office");
        requestInputs.put("Shipping destination", "456 Thompson lane (Math bldg)");
        requestInputs.put("Vendor", "Dunder Mifflin");
        requestInputs.put("Delivery attention to", "testing the reorder");
        requestInputs.put("Business purpose", "regression test -reorder");
        requestInputs.put("Item description", "Item1");
        requestInputs.put("Unit", "Term");
        requestInputs.put("Unit Cost", "20");
        requestInputs.put("Quantity", "3");
        String requestId = createRequest(requestInputs, null);

        log("Verifying reorder by link");
        clickAndWait(Locator.linkWithText("Reorder"));
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setAccountsToCharge("acct100 - Assay Services");
        requestPage.addAttachment(jpgFile);
        requestPage.submitForReview();

        DataRegionTable table = DataRegionTable.DataRegion(getDriver()).find();
        assertEquals("No new request created for reorder link", 2, table.getDataRowCount());
        stopImpersonating();

        log("verifying reorder by button");
        impersonate(ADMIN_USER);
        goToPurchaseAdminPage();
        clickAndWait(Locator.linkWithText("All Requests"));
        clickAndWait(Locator.linkWithText(requestId));
        requestPage = new CreateRequestPage(getDriver());
        requestPage.reorderButton();
        requestPage.setAccountsToCharge("acct100 - Assay Services");
        requestPage.addAttachment(jpgFile);
        requestPage.submitForReview();

        table = new DataRegionTable("query", getDriver());
        clickAndWait(Locator.linkWithText("All Requests"));
        assertEquals("No new request created from reorder button", 3, table.getDataRowCount());

    }


    private String getQueryName(String linkName)
    {
        clickAndWait(Locator.linkWithText(linkName));
        String retVal = Locator.tag("h3").findElement(getDriver()).getText();
        goBack();

        return retVal;
    }

    private String createRequest(Map<String, String> request, @Nullable File fileName)
    {
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());
        requestPage.setAccountsToCharge(request.get("Account to charge"))
                .setVendor(request.get("Vendor"))
                .setBusinessPurpose(request.get("Business purpose"))
                .setShippingDestination(request.get("Shipping destination"))
                .setDeliveryAttentionTo(request.get("Delivery attention to"))
                .setItemDesc(request.get("Item description"))
                .setUnitInput(request.get("Unit"))
                .setUnitCost(request.get("Unit Cost"))
                .setQuantity(request.get("Quantity"));

        if (request.containsKey("Comments/Special instructions"))
            requestPage.setSpecialInstructions(request.get("Comments/Special instructions"));

        if (fileName != null)
            requestPage.addAttachment(fileName);

        requestPage.submitForReview();
        if (getCurrentUser().equals("purchaseadmin@test.com"))
        {
            clickAndWait(Locator.linkWithText("All Open Requests"));
            DataRegionTable table = new DataRegionTable("query", getDriver());
            table.setFilter("requester", "Equals", "purchaseadmin");
            return table.getDataAsText(0, "requestNum");
        }
        else
        {
            DataRegionTable table = DataRegionTable.DataRegion(getDriver()).find();
            return table.getDataAsText(table.getDataRowCount() - 1, "rowId");
        }
    }

    private void clearAllRequest() throws IOException, CommandException
    {
        Connection cn = createDefaultConnection();
        new TruncateTableCommand("ehr_purchasing", "lineItems").execute(cn, getProjectName());
        new TruncateTableCommand("ehr_purchasing", "purchasingRequests").execute(cn, getProjectName());
    }

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    protected String getProjectName()
    {
        return PURCHASING_FOLDER;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Collections.singletonList("WNPRC_Purchasing");
    }
}
