/*
 * Copyright (c) 2012-2016 LabKey Corporation
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
package org.labkey.test.tests.onprc_ehr;

import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.AdvancedSqlTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.ehr.EHRClientAPIHelper;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.external.labModules.LabModuleHelper;
import org.labkey.test.util.Maps;
import org.labkey.test.util.PasswordUtil;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category({CustomModules.class, EHR.class, ONPRC.class})
public class ComplianceTrainingTest extends BaseWebDriverTest implements AdvancedSqlTest
{
    private String listZIP = TestFileUtils.getLabKeyRoot() + "/server/customModules/EHR_ComplianceDB/tools/SOP_Lists.zip";
    private LabModuleHelper _helper = new LabModuleHelper(this);

    @Override
    protected String getProjectName()
    {
        return "ComplianceTraining";// + TRICKY_CHARACTERS_FOR_PROJECT_NAMES;
    }

    @BeforeClass
    public static void doSetup() throws Exception
    {
        ComplianceTrainingTest initTest = (ComplianceTrainingTest)getCurrentTest();
        initTest.setUpTest();
        initTest.cleanupRecords(false);
    }

    private final String prefix = "complianceTest_";

    private final String requirementType1 = prefix + "reqtype1";
    private final String requirementType2 = prefix + "reqtype2";

    private final String requirementName1 = prefix + "req1";
    private final String requirementName2 = prefix + "req2";
    private final String requirementName3 = prefix + "req3";
    private EHRClientAPIHelper _apiHelper = new EHRClientAPIHelper(this, getProjectName());




    private final String employeeCategory1 = prefix + "category1";
    private final String employeeCategory2 = prefix + "category2";
    private final String employeeType1 = prefix + "type1";
    private final String employeeType2 = prefix + "type2";
    private final String employeeLocation1 = prefix + "location1";
    private final String employeeLocation2 = prefix + "location2";
    private final String employeeLocation3 = prefix + "location3";
    private final String employeeTitle1 = prefix + "title1";
    private final String employeeTitle2 = prefix + "title2";
    private final String employee1 = prefix + "employee1";
    private final String employee2 = prefix + "employee2";
    private final String employee3 = prefix + "employee3";
    private final String employeeLastName1 = prefix + "lastName1";

    private void cleanupRecords(boolean ignoreErrors)
    {
        try
        {
            _apiHelper.deleteIfExists("ehr_compliancedb", "requirements", Maps.of("requirementname", requirementName1), "requirementname");
            _apiHelper.deleteIfExists("ehr_compliancedb", "requirements", Maps.of("requirementname", requirementName2), "requirementname");
            _apiHelper.deleteIfExists("ehr_compliancedb", "requirements", Maps.of("requirementname", requirementName3), "requirementname");

            _apiHelper.deleteIfExists("ehr_compliancedb", "requirementtype", Maps.of("type", requirementType1), "type");
            _apiHelper.deleteIfExists("ehr_compliancedb", "requirementtype", Maps.of("type", requirementType2), "type");

            _apiHelper.deleteIfExists("ehr_compliancedb", "employees", Maps.of("employeeid", employee1), "employeeid");
            _apiHelper.deleteIfExists("ehr_compliancedb", "employees", Maps.of("employeeid", employee2), "employeeid");
            _apiHelper.deleteIfExists("ehr_compliancedb", "employees", Maps.of("employeeid", employee3), "employeeid");

            _apiHelper.deleteIfExists("ehr_compliancedb", "employeecategory", Maps.of("categoryname", employeeCategory1), "categoryname");
            _apiHelper.deleteIfExists("ehr_compliancedb", "employeecategory", Maps.of("categoryname", employeeCategory2), "categoryname");

            _apiHelper.deleteIfExists("ehr_compliancedb", "employeetypes", Maps.of("type", employeeType1), "type");
            _apiHelper.deleteIfExists("ehr_compliancedb", "employeetypes", Maps.of("type", employeeType2), "type");

            _apiHelper.deleteIfExists("ehr_compliancedb", "employeelocations", Maps.of("location", employeeLocation1), "location");
            _apiHelper.deleteIfExists("ehr_compliancedb", "employeelocations", Maps.of("location", employeeLocation2), "location");
            _apiHelper.deleteIfExists("ehr_compliancedb", "employeelocations", Maps.of("location", employeeLocation3), "location");

            _apiHelper.deleteIfExists("ehr_compliancedb", "employeetitles", Maps.of("title", employeeTitle1), "title");
            _apiHelper.deleteIfExists("ehr_compliancedb", "employeetitles", Maps.of("title", employeeTitle2), "title");
        }
        catch (CommandException e)
        {
            if (!ignoreErrors)
                throw new RuntimeException(e);
        }
    }

    @Test
    public void testTriggerScripts() throws Exception
    {
        //the module's triggers perform cascade updates and also enforce FKs
        //this section will insert dummy data and make sure the code works as expected

        log("checking triggers for requirements table");
        _apiHelper.createdIfNeeded("ehr_compliancedb", "requirementtype", Maps.of("type", requirementType1), "type");

        //expect failure b/c type wont match
        _apiHelper.insertRow("ehr_compliancedb", "requirements", Maps.of(
                "type", "garbage value",
                "requirementname", requirementName1
        ), true);

        //expect success
        _apiHelper.insertRow("ehr_compliancedb", "requirements", Maps.of(
                "type", requirementType1,
                "requirementname", requirementName1
        ), false);

        //this should cascade update the row in requirements
        JSONObject cmd = _apiHelper.prepareUpdateCommand("ehr_compliancedb", "requirementtype", "type", new String[]{"type"}, new Object[][]{{requirementType2}}, new Object[][]{{requirementType1}});
        _apiHelper.doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(cmd), new JSONObject(), true);

        SelectRowsCommand src = new SelectRowsCommand("ehr_compliancedb", "requirements");
        src.addFilter(new Filter("requirementname", requirementName1));

        SelectRowsResponse resp = src.execute(_apiHelper.getConnection(), getProjectName());
        assertEquals(1, resp.getRowCount().intValue());
        assertEquals(requirementType2, resp.getRows().get(0).get("type"));

        log("checking triggers for employees table");

        _apiHelper.createdIfNeeded("ehr_compliancedb", "employeecategory", Maps.of("categoryname", employeeCategory1), "categoryname");
        _apiHelper.createdIfNeeded("ehr_compliancedb", "employeelocations", Maps.of("location", employeeLocation1), "location");
        _apiHelper.createdIfNeeded("ehr_compliancedb", "employeetitles", Maps.of("title", employeeTitle1), "title");
        _apiHelper.createdIfNeeded("ehr_compliancedb", "employeetypes", Maps.of("type", employeeType1), "type");

        _apiHelper.insertRow("ehr_compliancedb", "employees", Maps.of(
                "category", "garbage value",
                "lastName", employeeLastName1,
                "employeeid", employee1
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "employees", Maps.of(
                "location", "garbage value",
                "lastName", employeeLastName1,
                "employeeid", employee1
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "employees", Maps.of(
                "title", "garbage value",
                "lastName", employeeLastName1,
                "employeeid", employee1
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "employees", Maps.of(
                "type", "garbage value",
                "lastName", employeeLastName1,
                "employeeid", employee1
        ), true);

        Map<String, Object> map = new HashMap<>();
        map.put("category", employeeCategory1);
        map.put("location", employeeLocation1);
        map.put("title", employeeTitle1);
        map.put("type", employeeType1);
        map.put("employeeid", employee1);
        map.put("lastName", employeeLastName1);

        _apiHelper.insertRow("ehr_compliancedb", "employees", map, false);

        //this should cascade update the row in requirements
        cmd = _apiHelper.prepareUpdateCommand("ehr_compliancedb", "employeelocations", "location", new String[]{"location"}, new Object[][]{{employeeLocation3}}, new Object[][]{{employeeLocation1}});
        _apiHelper.doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(cmd), new JSONObject(), true);

        cmd = _apiHelper.prepareUpdateCommand("ehr_compliancedb", "employeecategory", "categoryname", new String[]{"categoryname"}, new Object[][]{{employeeCategory2}}, new Object[][]{{employeeCategory1}});
        _apiHelper.doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(cmd), new JSONObject(), true);

        cmd = _apiHelper.prepareUpdateCommand("ehr_compliancedb", "employeetitles", "title", new String[]{"title"}, new Object[][]{{employeeTitle2}}, new Object[][]{{employeeTitle1}});
        _apiHelper.doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(cmd), new JSONObject(), true);

        cmd = _apiHelper.prepareUpdateCommand("ehr_compliancedb", "employeetypes", "type", new String[]{"type"}, new Object[][]{{employeeType2}}, new Object[][]{{employeeType1}});
        _apiHelper.doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(cmd), new JSONObject(), true);

        src = new SelectRowsCommand("ehr_compliancedb", "employees");
        src.addFilter(new Filter("employeeid", employee1));

        resp = src.execute(_apiHelper.getConnection(), getProjectName());
        assertEquals(1, resp.getRowCount().intValue());
        assertEquals(employeeLocation3, resp.getRows().get(0).get("location"));
        assertEquals(employeeCategory2, resp.getRows().get(0).get("category"));
        assertEquals(employeeTitle2, resp.getRows().get(0).get("title"));
        assertEquals(employeeType2, resp.getRows().get(0).get("type"));

        _apiHelper.updateRow("ehr_compliancedb", "employees", Maps.of("employeeid", employee1, "location", "garbage value"), true);

        _apiHelper.createdIfNeeded("ehr_compliancedb", "employeecategory", Maps.of("categoryname", employeeCategory2), "categoryname");
        _apiHelper.createdIfNeeded("ehr_compliancedb", "employeelocations", Maps.of("location", employeeLocation2), "location");

        Map<String, Object> map2 = new HashMap<>();
        map2.put("category", employeeCategory2);
        map2.put("location", employeeLocation2);
        map2.put("title", employeeTitle1);
        map2.put("type", employeeType1);
        map2.put("lastName", employeeLastName1);
        map2.put("employeeid", employee2);
        _apiHelper.insertRow("ehr_compliancedb", "employees", map2, true);

        _apiHelper.deleteRow("ehr_compliancedb", "employeelocations", Maps.of("location", employeeLocation1), "location", false);
        _apiHelper.deleteRow("ehr_compliancedb", "employeecategory", Maps.of("categoryname", employeeCategory2), "categoryname", true);

        map2.put("type", employeeType2);
        _apiHelper.insertRow("ehr_compliancedb", "employees", map2, true);

        _apiHelper.insertRow("ehr_compliancedb", "employeerequirementexemptions", Maps.of(
                "employeeid", employee1,
                "requirementname", "garbage value"
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "employeerequirementexemptions", Maps.of(
                "employeeid", "garbage value",
                "requirementname", requirementName1
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "employeerequirementexemptions", Maps.of(
                "employeeid", employee1,
                "requirementname", requirementName1
        ), false);

        _apiHelper.insertRow("ehr_compliancedb", "requirementsperemployee", Maps.of(
                "employeeid", "garbage value",
                "requirementname", requirementName1
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "requirementsperemployee", Maps.of(
                "employeeid", "garbage value",
                "requirementname", requirementName1
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "requirementsperemployee", Maps.of(
                "employeeid", employee1,
                "requirementname", requirementName1
        ), false);

        //requirementspercategory
        _apiHelper.insertRow("ehr_compliancedb", "requirementspercategory", Maps.of(
                "category", employeeCategory1,
                "requirementname", "garbage value"
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "requirementspercategory", Maps.of(
                "category", "garbage value",
                "requirementname", requirementName1
        ), true);

        _apiHelper.insertRow("ehr_compliancedb", "requirementspercategory", Maps.of(
                "employeeid", employeeCategory1,
                "requirementname", requirementName1
        ), false);

        _apiHelper.deleteRow("ehr_compliancedb", "employees", Maps.of("employeeid", employee1), "employeeid", true);

        Map<String, Object> map3 = new HashMap<>();
        map3.put("lastName", employeeLastName1);
        map3.put("employeeid", employee3);
        _apiHelper.insertRow("ehr_compliancedb", "employees", map3, false);

        cmd = _apiHelper.prepareUpdateCommand("ehr_compliancedb", "employees", "employeeid", new String[]{"employeeid"}, new Object[][]{{employee2}}, new Object[][]{{employee1}});
        _apiHelper.doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(cmd), new JSONObject(), true);

        assertEquals(false, _apiHelper.doesRowExist("ehr_compliancedb", "requirementsperemployee", Maps.of("employeeid", employee1), "employeeid"));
        assertEquals(false, _apiHelper.doesRowExist("ehr_compliancedb", "employeerequirementexemptions", Maps.of("employeeid", employee1), "employeeid"));

        assertEquals(true, _apiHelper.doesRowExist("ehr_compliancedb", "requirementsperemployee", Maps.of("employeeid", employee2), "employeeid"));
        assertEquals(true, _apiHelper.doesRowExist("ehr_compliancedb", "employeerequirementexemptions", Maps.of("employeeid", employee2), "employeeid"));

        cmd = _apiHelper.prepareUpdateCommand("ehr_compliancedb", "requirements", "requirementname", new String[]{"requirementname"}, new Object[][]{{requirementName2}}, new Object[][]{{requirementName1}});
        _apiHelper.doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(cmd), new JSONObject(), true);
        assertEquals(false, _apiHelper.doesRowExist("ehr_compliancedb", "requirementspercategory", Maps.of("requirementname", requirementName1), "requirementname"));
        assertEquals(true, _apiHelper.doesRowExist("ehr_compliancedb", "requirementspercategory", Maps.of("requirementname", requirementName2), "requirementname"));
    }

    @Test
    public void testCustomActions() throws Exception
    {
        goToProjectHome();
        waitAndClickAndWait(Locator.linkContainingText("Employee List"));
        DataRegionTable dr = new DataRegionTable("query", getDriver());
        clickAndWait(dr.detailsLink(0));
        waitForElement(Locator.tagContainingText("th", "Employee Details"));
        waitForElement(Locator.tagContainingText("span", "Training / Requirement Summary"));
        waitForElement(Locator.tagContainingText("span", "Training History"));
        waitForElement(Locator.tagContainingText("span", "Exemptions From Training Requirements"));

        goToProjectHome();
        waitAndClickAndWait(Locator.linkContainingText("View/Edit Requirements Tracked In System"));
        dr = new DataRegionTable("query", getDriver());
        clickAndWait(dr.detailsLink(0));
        waitForElement(Locator.tagContainingText("th", "Requirement Details"));
        waitForElement(Locator.tagContainingText("span", "All Employees Who Must Complete This Requirement"));
        waitForElement(Locator.tagContainingText("span", "Categories/Units That Must Complete This Requirement"));
        waitForElement(Locator.tagContainingText("span", "Individual Employees That Must Complete This Requirement (beyond their category/unit)"));
        waitForElement(Locator.tagContainingText("span", "Individual Employees Exempt From This Requirement"));
    }

    @Test
    public void testSopSubmission() throws Exception
    {
        beginAt("/ehr_compliancedb/" + getProjectName() + "/SOP_submission.view");
        reloadPage();

        assertTrue("Submit button not disabled", isElementPresent(Locator.xpath("//button[@id='SOPsubmitButton' and @disabled]")));

        DataRegionTable dr1 = DataRegionTable.findDataRegionWithinWebpart(this, "Unread SOPs (Less Than 10 Months Until Renewal)");
        DataRegionTable dr2 = DataRegionTable.findDataRegionWithinWebpart(this, "Dates SOPs Were Last Read");
        assertEquals("Incorrect row count found", 1, dr1.getDataRowCount());
        assertEquals("Incorrect row count found", 0, dr2.getDataRowCount());

        dr1.checkAllOnPage();
        clickButton("Mark Read");
        reloadPage();


        dr1 = DataRegionTable.findDataRegionWithinWebpart(this, "Unread SOPs (Less Than 10 Months Until Renewal)");
        dr2 = DataRegionTable.findDataRegionWithinWebpart(this, "Dates SOPs Were Last Read");
        assertEquals("Incorrect row count found", 0, dr1.getDataRowCount());
        assertEquals("Incorrect row count found", 1, dr2.getDataRowCount());

        assertFalse("Submit button is still disabled", isElementPresent(Locator.xpath("//button[@id='SOPsubmitButton' and @disabled]")));

        dr2.checkAllOnPage();
        clickButton("Mark Reread");
        reloadPage();

        waitForElement(Locator.xpath("//button[@id='SOPsubmitButton' and not(@disabled)]"));
        click(Locator.id("SOPsubmitButton"));
        assertAlert("You must check the box above the submit button to certify you have read your SOPs");

        checkCheckbox(Locator.id("sopCheck"));
        click(Locator.button("Submit"));
        waitForElement(Ext4Helper.Locators.window("SOPs Complete"));
        click(Ext4Helper.Locators.ext4Button("OK"));
    }

    private void reloadPage()
    {
        waitForText("Mark Read");
        waitForText("Mark Reread");
    }

    protected void setUpTest() throws Exception
    {
        _containerHelper.createProject(getProjectName(), "Compliance and Training");
        goToProjectHome();

        setModuleProperties(Arrays.asList(new ModulePropertyValue("EHR_ComplianceDB", "/" +  getProjectName(), "EmployeeContainer", "/" + getProjectName())));

        log("Creating Lists");
        _listHelper.importListArchive(getProjectName(), new File(listZIP));

        try
        {
            Connection cn = new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

            InsertRowsCommand insertCmd;
            Map<String,Object> rowMap;

            //verify SOP requirement present
            String reqName = "SOP REVIEW-ANNUAL";
            SelectRowsCommand select = new SelectRowsCommand("ehr_compliancedb", "requirements");
            select.addFilter(new Filter("requirementname", reqName, Filter.Operator.EQUAL));
            SelectRowsResponse resp = select.execute(cn, getProjectName());

            if (resp.getRows().size() == 0)
            {
                insertCmd = new InsertRowsCommand("ehr_compliancedb", "requirements");
                rowMap = new HashMap<>();
                rowMap.put("requirementname", reqName);

                insertCmd.addRow(rowMap);
                insertCmd.execute(cn, getProjectName());
            }

            //verify category present
            String category = "Category";
            select = new SelectRowsCommand("ehr_compliancedb", "employeecategory");
            select.addFilter(new Filter("categoryname", category, Filter.Operator.EQUAL));
            resp = select.execute(cn, getProjectName());

            if (resp.getRows().size() == 0)
            {
                insertCmd = new InsertRowsCommand("ehr_compliancedb", "employeecategory");
                rowMap = new HashMap<>();
                rowMap.put("categoryname", category);

                insertCmd.addRow(rowMap);
                insertCmd.execute(cn, getProjectName());
            }

            //create employee record
            insertCmd = new InsertRowsCommand("ehr_compliancedb", "employees");
            rowMap = new HashMap<>();
            rowMap.put("employeeid", PasswordUtil.getUsername());
            rowMap.put("email", PasswordUtil.getUsername());
            rowMap.put("firstname", "Test");
            rowMap.put("lastname", "User");
            rowMap.put("category", category);

            insertCmd.addRow(rowMap);
            insertCmd.execute(cn, getProjectName());

            //add SOP record
            insertCmd = new InsertRowsCommand("lists", "SOPs");
            rowMap = new HashMap<>();
            rowMap.put("Id", "SOP1");
            rowMap.put("name", "SOP 1");

            insertCmd.addRow(rowMap);
            insertCmd.execute(cn, getProjectName());

            //add record to SOP requirements
            insertCmd = new InsertRowsCommand("ehr_compliancedb", "sopbycategory");
            rowMap = new HashMap<>();
            rowMap.put("sop_id", "SOP1");
            rowMap.put("category", category);

            insertCmd.addRow(rowMap);
            insertCmd.execute(cn, getProjectName());
        }
        catch (CommandException | IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        cleanupRecords(true);

        super.doCleanup(afterTest);
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return null;
    }

    @Override public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }
}
