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
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.componenes.CreateVendorDialog;
import org.labkey.test.components.DomainDesignerPage;
import org.labkey.test.components.domain.DomainFormPanel;
import org.labkey.test.components.html.SiteNavBar;
import org.labkey.test.pages.CreateRequestPage;
import org.labkey.test.util.APIUserHelper;
import org.labkey.test.util.AbstractUserHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.SchemaHelper;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.labkey.test.WebTestHelper.getRemoteApiConnection;

@Category({EHR.class, WNPRC_EHR.class})
public class WNPRC_PurchasingTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    private static final String FOLDER_TYPE = "WNPRC Purchasing";

    private static final String BILLING_FOLDER = "WNPRC Billing";

    private static final String REQUESTER_USER = "purchaserequester@test.com";
    private static final String ADMIN_USER = "purchaseadmin@test.com";
    private static int requestCnt = 0;
    private final File ALIASES_TSV = TestFileUtils.getSampleData("wnprc_purchasing/aliases.tsv");
    private final File SHIPPING_INFO_TSV = TestFileUtils.getSampleData("wnprc_purchasing/shippingInfo.tsv");
    private final File VENDOR_TSV = TestFileUtils.getSampleData("wnprc_purchasing/vendor.tsv");
    private final String ACCT_100 = "acct100";
    private final String ACCT_101 = "acct101";
    private final String OTHER_ACCT_FIELD_NAME = "otherAcctAndInves";
    public AbstractUserHelper _userHelper = new APIUserHelper(this);
    private int _adminUserId;
    private int _requesterUserId;
    private SchemaHelper _schemaHelper = new SchemaHelper(this);

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
        log("Creating 'WNPRC Billing' folder");
        _containerHelper.createProject(BILLING_FOLDER, FOLDER_TYPE);
        _containerHelper.enableModules(Arrays.asList("EHR_Billing"));

        log("Populate ehr_billing.aliases");
        goToProjectHome(BILLING_FOLDER);
        uploadData(ALIASES_TSV, "ehr_billing", "aliases", BILLING_FOLDER);

        goToHome();

        log("Creating a 'WNPRC Purchasing' folder");
        _containerHelper.createProject(getProjectName(), FOLDER_TYPE);

        goToProjectHome();

        log("Add extensible columns");
        addExtensibleColumns();

        log("Creating a purchasing admin user");
        _adminUserId = _userHelper.createUser(ADMIN_USER).getUserId().intValue();

        log("Creating a purchasing requester user");
        _requesterUserId = _userHelper.createUser(REQUESTER_USER).getUserId().intValue();

        goToProjectHome();

        log("Adding WNPRC Purchasing webpart");
        new SiteNavBar(getDriver()).enterPageAdminMode();
        (new PortalHelper(this)).addWebPart("WNPRC Purchasing");
        new SiteNavBar(getDriver()).exitPageAdminMode();

        log("Uploading purchasing data");
        uploadPurchasingData();

        log("Creating user-account associations");
        createUserAccountAssociations();

        log("Create ehrBillingLinked schema");
        _schemaHelper.createLinkedSchema(getProjectName(), "ehr_billingLinked", BILLING_FOLDER, null, "ehr_billing", "aliases", null);
    }

    private void addExtensibleColumns()
    {
        goToSchemaBrowser();
        selectQuery("ehr_purchasing", "purchasingRequests");
        clickAndWait(Locator.linkWithText("create definition"));
        DomainDesignerPage domainDesignerPage = new DomainDesignerPage(getDriver());
        DomainFormPanel panel = domainDesignerPage.fieldsPanel();
        panel.manuallyDefineFields(OTHER_ACCT_FIELD_NAME);
        domainDesignerPage.clickSave();
        goToProjectHome();
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

        int rowsInserted = insertData(getRemoteApiConnection(true), "ehr_purchasing", "userAccountAssociations", userAcctAssocRows, getProjectName()).size();
        assertEquals("Incorrect number of rows created", 2, rowsInserted);
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
        goToProjectHome();
        clickButton("Create Request");
        CreateRequestPage requestPage = new CreateRequestPage(getDriver());

        log("Verifying the validation for mandatory fields");
        requestPage.submitForReview();
        checker().verifyEquals("Invalid error message", "Unable to submit request, missing required field(s).", requestPage.getAlertMessage());

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
    }

    @Test
    public void testOtherVendorRequest()
    {
        goToProjectHome();
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