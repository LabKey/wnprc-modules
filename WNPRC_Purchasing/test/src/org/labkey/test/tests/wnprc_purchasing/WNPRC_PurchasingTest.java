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
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.util.APIUserHelper;
import org.labkey.test.util.AbstractUserHelper;
import org.labkey.test.util.PostgresOnlyTest;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.labkey.test.WebTestHelper.getRemoteApiConnection;

@Category({CustomModules.class, EHR.class})
public class WNPRC_PurchasingTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    private static final String FOLDER_TYPE = "WNPRC Purchasing";

    private static final String REQUESTER_USER = "purchaserequester@test.com";
    private int _adminUserId;

    private static final String ADMIN_USER = "purchaseadmin@test.com";
    private int _requesterUserId;

    private final File ALIASES_TSV = TestFileUtils.getSampleData("wnprc_purchasing/aliases.tsv");
    private final File ITEM_UNITS_TSV = TestFileUtils.getSampleData("wnprc_purchasing/itemUnits.tsv");
    private final File LINE_ITEM_STATUS_TSV = TestFileUtils.getSampleData("wnprc_purchasing/lineItemStatus.tsv");
    private final File SHIPPING_INFO_TSV = TestFileUtils.getSampleData("wnprc_purchasing/shippingInfo.tsv");
    private final File VENDOR_TSV = TestFileUtils.getSampleData("wnprc_purchasing/vendor.tsv");

    private final String ACCT_100 = "acct100";
    private final String ACCT_101 = "acct101";

    public AbstractUserHelper _userHelper = new APIUserHelper(this);

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        _containerHelper.deleteProject(getProjectName(), afterTest);
    }

    @BeforeClass
    public static void setupProject() throws IOException, CommandException
    {
        WNPRC_PurchasingTest init = (WNPRC_PurchasingTest) getCurrentTest();

        init.doSetup();
    }

    private void doSetup() throws IOException, CommandException
    {
        log("Creating a 'WNPRC Purchasing' folder");
        _containerHelper.createProject(getProjectName(), FOLDER_TYPE);

        log("Creating a purchasing admin user");
        _adminUserId = _userHelper.createUser(ADMIN_USER).getUserId().intValue();

        log("Creating a purchasing requester user");
        _requesterUserId = _userHelper.createUser(REQUESTER_USER).getUserId().intValue();

        goToProjectHome();

        log("Uploading purchasing data");
        uploadPurchasingData();

        log("Creating user-account associations");
        createUserAccountAssociations();

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

        int rowsInserted = insertData(getRemoteApiConnection(true), "ehr_purchasing", "userAccountAssociations", userAcctAssocRows).size();
        assertEquals("Incorrect number of rows created", 2, rowsInserted);
    }

    private void uploadPurchasingData() throws IOException, CommandException
    {
        Connection connection = getRemoteApiConnection(true);
        Map<String, Object> responseMap = new HashMap<>();

        List<Map<String, Object>> tsv = loadTsv(ITEM_UNITS_TSV);
        insertData(connection, "ehr_purchasing", "itemUnits", tsv)
                .forEach(row -> responseMap.put(row.get("itemUnit").toString(), row.get("rowid")));

        tsv = loadTsv(LINE_ITEM_STATUS_TSV);
        insertData(connection, "ehr_purchasing", "lineItemStatus", tsv)
                .forEach(row -> responseMap.put(row.get("status").toString(), row.get("rowid")));

        tsv = loadTsv(SHIPPING_INFO_TSV);
        insertData(connection, "ehr_purchasing", "shippingInfo", tsv)
                .forEach(row -> responseMap.put(row.get("attentionTo").toString(), row.get("rowid")));

        tsv = loadTsv(VENDOR_TSV);
        insertData(connection, "ehr_purchasing", "vendor", tsv)
                .forEach(row -> responseMap.put(row.get("vendorName").toString(), row.get("rowid")));

        tsv = loadTsv(ALIASES_TSV);
        insertData(connection, "ehr_billing", "aliases", tsv)
                .forEach(row -> responseMap.put(row.get("alias").toString(), row.get("rowid")));
    }

    private List<Map<String, Object>> insertData(Connection connection, String schemaName, String queryName, List<Map<String, Object>> rows) throws IOException, CommandException
    {
        log("Loading data in: " + schemaName + "." + queryName);
        InsertRowsCommand command = new InsertRowsCommand(schemaName, queryName);
        command.setRows(rows);
        SaveRowsResponse response = command.execute(connection, getProjectName());
        return response.getRows();
    }

    @Before
    public void preTest()
    {
        goToProjectHome();
    }

    @Test
    public void testPurchasingLandingPage()
    {
        goToProjectHome();
        clickButton("Create Request");
        assertTextPresent("Work in progress"); //TODO: Remove once Purchase Request data entry is implemented, & replace with appropriate text
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