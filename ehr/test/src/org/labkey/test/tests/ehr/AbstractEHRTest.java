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
package org.labkey.test.tests.ehr;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.junit.Assert;
import org.labkey.api.reader.TabLoader;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.DeleteRowsCommand;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestProperties;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.util.AdvancedSqlTest;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.ehr.EHRClientAPIHelper;
import org.labkey.test.util.ehr.EHRTestHelper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.PermissionsHelper;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.regex.Pattern;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

abstract public class AbstractEHRTest extends BaseWebDriverTest implements AdvancedSqlTest
{
    protected String CONTAINER_PATH = getProjectName() + "/" + FOLDER_NAME;
    protected static String FOLDER_NAME = "EHR";
    protected static final File STUDY_ZIP = TestFileUtils.getSampleData("EHR Study Anon.zip");
    protected static final File STUDY_ZIP_NO_DATA = TestFileUtils.getSampleData("EHR Study Anon Small.zip");

    protected static final int POPULATE_TIMEOUT_MS = 300000;

    protected static final String PROJECT_ID = "640991"; // project with one participant
    protected static final String DUMMY_PROTOCOL = "dummyprotocol"; // need a protocol to create table entry
    protected static final String DUMMY_INVES = "dummyinvestigator";

    protected static final String ROOM_ID = "6824778"; // room of PROJECT_MEMBER_ID
    protected static final String CAGE_ID = "4434662"; // cage of PROJECT_MEMBER_ID
    protected static final String ROOM_ID2 = "2043365";

    protected static final String AREA_ID = "A1/AB190"; // arbitrary area
    protected static final String PROTOCOL_PROJECT_ID = "795644"; // Project with exactly 3 members
    protected static final String PROTOCOL_ID = "protocol101";
    protected static final String INVES_ID = "investigator101";
    protected final String[] PROTOCOL_MEMBER_IDS = { // Protocol members, sorted ASC alphabetically
            getExpectedAnimalIDCasing("TEST3997535"),
            getExpectedAnimalIDCasing("TEST4551032"),
            getExpectedAnimalIDCasing("TEST5904521")};
    protected final String[] MORE_ANIMAL_IDS = { // Some more, distinct, Ids
            getExpectedAnimalIDCasing("TEST1020148"),
            getExpectedAnimalIDCasing("TEST1099252"),
            getExpectedAnimalIDCasing("TEST1112911"),
            getExpectedAnimalIDCasing("TEST727088"),
            getExpectedAnimalIDCasing("TEST4564246")};
    protected final String DEAD_ANIMAL_ID = getExpectedAnimalIDCasing("TEST9118022");
    protected static final String TASK_TITLE = "Test weight task";
    protected static final String MPR_TASK_TITLE = "Test MPR task";
    protected static final String VIEW_TEXT = "Browse All";

    protected static EHRUser DATA_ADMIN = new EHRUser("admin@ehrstudy.test", "EHR Administrators", EHRRole.DATA_ADMIN);
    protected static EHRUser REQUESTER = new EHRUser("requester@ehrstudy.test", "EHR Requestors", EHRRole.REQUESTER);
    protected static EHRUser BASIC_SUBMITTER = new EHRUser("basicsubmitter@ehrstudy.test", "EHR Basic Submitters", EHRRole.BASIC_SUBMITTER);
    protected static EHRUser FULL_SUBMITTER = new EHRUser("fullsubmitter@ehrstudy.test", "EHR Full Submitters", EHRRole.FULL_SUBMITTER);
    protected static EHRUser REQUEST_ADMIN = new EHRUser("request_admin@ehrstudy.test", "EHR Request Admins", EHRRole.REQUEST_ADMIN);
    protected static EHRUser FULL_UPDATER = new EHRUser("full_updater@ehrstudy.test", "EHR Full Updaters", EHRRole.FULL_UPDATER);

    protected static String[] SUBJECTS = {"12345", "23456", "34567", "45678", "56789"};
    protected static String[] CAGES = {"A1", "B2", "A3"};
    protected static Integer[] PROJECTS = {12345, 123456, 1234567};

    protected static final SimpleDateFormat TIME_FORMAT = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    protected static final DateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    protected static String FIELD_QCSTATELABEL = "QCStateLabel";
    protected static String FIELD_OBJECTID = "objectid";
    protected static String FIELD_LSID = "lsid";

    protected String[] weightFields = {"Id", "date", "enddate", "project", "weight", FIELD_QCSTATELABEL, FIELD_OBJECTID, FIELD_LSID, "_recordid"};
    protected Object[] weightData1 = {getExpectedAnimalIDCasing("TESTSUBJECT1"), EHRClientAPIHelper.DATE_SUBSTITUTION, null, null, "12", EHRQCState.IN_PROGRESS.label, null, null, "_recordID"};
    protected List<Long> _saveRowsTimes;
    protected SimpleDateFormat _tf = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    protected Random _randomGenerator = new Random();

    protected EHRClientAPIHelper _apiHelper = new EHRClientAPIHelper(this, getContainerPath());

    protected abstract String getModuleDirectory();

    //xpath fragment
    public static final String VISIBLE = "not(ancestor-or-self::*[contains(@style,'visibility: hidden') or contains(@class, 'x-hide-display')])";

    protected EHRTestHelper _helper = new EHRTestHelper(this);
    protected PermissionsHelper _permissionsHelper = new ApiPermissionsHelper(this);

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("ehr");
    }

    public String getContainerPath()
    {
        return CONTAINER_PATH;
    }


    public String getModulePath()
    {
        return "/server/customModules/" + getModuleDirectory();
    }

    public String getFolderName() { return FOLDER_NAME; }

    @Override
    public void checkLinks()
    {
        if ( TestProperties.isLinkCheckEnabled() )
            log("EHR test has too many hard coded links and special actions to crawl effectively. Skipping crawl.");
    }

    @Override
    public void validateQueries(boolean validateSubfolders)
    {
        //NOTE: the queries are also validated as part of study import
        //also, validation takes place on the project root, while the EHR and required datasets are loaded into a subfolder
        log("Skipping query validation.");
    }

    protected Pattern[] getIgnoredElements()
    {
        return new Pattern[] {
                Pattern.compile("qcstate", Pattern.CASE_INSENSITIVE),//qcstate IDs aren't predictable
                Pattern.compile("stacktrace", Pattern.CASE_INSENSITIVE)
        };
    }

    protected String getMale() {
        return "m";
    }

    protected String getFemale() {
        return "f";
    }

    protected String[] getRooms()
    {
        return new String[]{"Room1", "Room2", "Room3"};
    }

    protected String getExpectedAnimalIDCasing(String id)
    {
        return id.toLowerCase();
    }

    @LogMethod
    protected void createTestSubjects() throws Exception
    {
        String[] fields;
        Object[][] data;
        JSONObject insertCommand;

        //insert into demographics
        log("Creating test subjects");
        fields = new String[]{"Id", "Species", "Birth", "Gender", "date", "calculated_status"};
        data = new Object[][]{
                {SUBJECTS[0], "Rhesus", (new Date()).toString(), getMale(), new Date(), "Alive"},
                {SUBJECTS[1], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive"},
                {SUBJECTS[2], "Marmoset", (new Date()).toString(), getFemale(), new Date(), "Alive"},
                {SUBJECTS[3], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive"},
                {SUBJECTS[4], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive"}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "demographics", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "demographics", new Filter("Id", StringUtils.join(SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), getExtraContext(), true);

        //for simplicity, also create the animals from MORE_ANIMAL_IDS right now
        data = new Object[][]{
                {MORE_ANIMAL_IDS[0], "Rhesus", (new Date()).toString(), getMale(), new Date(), "Alive"},
                {MORE_ANIMAL_IDS[1], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive"},
                {MORE_ANIMAL_IDS[2], "Marmoset", (new Date()).toString(), getFemale(), new Date(), "Alive"},
                {MORE_ANIMAL_IDS[3], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive"},
                {MORE_ANIMAL_IDS[4], "Cynomolgus", (new Date()).toString(), getMale(), new Date(), "Alive"}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "demographics", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "demographics", new Filter("Id", StringUtils.join(MORE_ANIMAL_IDS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), getExtraContext(), true);

        //used as initial dates
        Date pastDate1 = TIME_FORMAT.parse("2012-01-03 09:30");
        Date pastDate2 = TIME_FORMAT.parse("2012-05-03 19:20");

        //set housing
        log("Creating initial housing records");
        fields = new String[]{"Id", "date", "enddate", "room", "cage"};
        data = new Object[][]{
                {SUBJECTS[0], pastDate1, pastDate2, getRooms()[0], CAGES[0]},
                {SUBJECTS[0], pastDate2, null, getRooms()[0], CAGES[0]},
                {SUBJECTS[1], pastDate1, pastDate2, getRooms()[0], CAGES[0]},
                {SUBJECTS[1], pastDate2, null, getRooms()[2], CAGES[2]}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Housing", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "Housing", new Filter("Id", StringUtils.join(SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), getExtraContext(), true);

        //set a base weight
        log("Setting initial weights");
        fields = new String[]{"Id", "date", "weight", "QCStateLabel"};
        data = new Object[][]{
                {SUBJECTS[0], pastDate2, 10.5, EHRQCState.COMPLETED.label},
                {SUBJECTS[0], new Date(), 12, EHRQCState.COMPLETED.label},
                {SUBJECTS[1], new Date(), 12, EHRQCState.COMPLETED.label},
                {SUBJECTS[2], new Date(), 12, EHRQCState.COMPLETED.label}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Weight", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "Weight", new Filter("Id", StringUtils.join(SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), getExtraContext(), true);

        //set assignment
        log("Setting initial assignments");
        fields = new String[]{"Id", "date", "enddate", "project"};
        data = new Object[][]{
                {SUBJECTS[0], pastDate1, pastDate2, PROJECTS[0]},
                {SUBJECTS[1], pastDate1, pastDate2, PROJECTS[0]},
                {SUBJECTS[1], pastDate2, null, PROJECTS[2]}
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Assignment", "lsid", fields, data);
        getApiHelper().deleteAllRecords("study", "Assignment", new Filter("Id", StringUtils.join(SUBJECTS, ";"), Filter.Operator.IN));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), getExtraContext(), true);


    }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        try
        {
            //note: always delete users from root, which will always exist, even when the test project doesnt
            log("Deleting EHR users, if they exist");

            log(DATA_ADMIN.getEmail() + ": " + _helper.deleteUserAPI(DATA_ADMIN.getEmail()));
            log(REQUESTER.getEmail() + ": " + _helper.deleteUserAPI(REQUESTER.getEmail()));
            log(BASIC_SUBMITTER.getEmail() + ": " + _helper.deleteUserAPI(BASIC_SUBMITTER.getEmail()));
            log(REQUEST_ADMIN.getEmail() + ": " + _helper.deleteUserAPI(REQUEST_ADMIN.getEmail()));
            log(FULL_UPDATER.getEmail() + ": " + _helper.deleteUserAPI(FULL_UPDATER.getEmail()));
            log(FULL_SUBMITTER.getEmail() + ": " + _helper.deleteUserAPI(FULL_SUBMITTER.getEmail()));
        }
        catch (CommandException | IOException ignored)
        {
            log("unable to delete users: " + ignored.getMessage());
        }

        try
        {
            deleteHardTableRecords();
        }
        catch (CommandException | IOException ignored)
        {
            log("there was an error deleting records from EHR hard tables");
            log(ignored.getMessage());
        }

        long startTime = System.currentTimeMillis();
        deleteProject(getProjectName(), afterTest);
        if(isTextPresent(getProjectName()))
        {
            log("Wait extra long for folder to finish deleting.");
            while (isElementPresent(Locator.linkWithText(getProjectName())) && System.currentTimeMillis() - startTime < 300000) // 5 minutes max.
            {
                sleep(5000);
                refresh();
            }
            if (!isElementPresent(Locator.linkWithText(getProjectName())))
                log("Test Project deleted in " + (System.currentTimeMillis() - startTime) + "ms");
            else
                fail("Test Project not finished deleting after 5 minutes");
        }
    }

    @LogMethod
    protected abstract void importStudy();

    protected boolean skipStudyImportQueryValidation()
    {
        return false;
    }

    protected void createProjectAndFolders(String type)
    {
        _containerHelper.createProject(getProjectName(), type);
        _containerHelper.createSubfolder(getProjectName(), getProjectName(), FOLDER_NAME, type, null);
    }

    protected void createProjectAndFolders()
    {
        createProjectAndFolders("EHR");
    }

    protected void initProject() throws Exception
    {
        initProject("EHR");
    }

    @LogMethod
    protected void initProject(String type) throws Exception
    {
        createProjectAndFolders(type);
        setEHRModuleProperties();
        createUsersandPermissions();  //note: we create the users prior to study import, b/c that user is used by TableCustomizers
        populateInitialData();
        importStudy();
        shutoffProfiler();
        //note: these expect the study to exist
        setupStudyPermissions();
        defineQCStates();

        populateHardTableRecords();
        primeCaches();
    }

    protected void shutoffProfiler()
    {
        goToAdminConsole();
        clickAndWait(Locator.linkWithText("profiler"));
        uncheckCheckbox(Locator.inputById("enabled"));
        clickAndWait(Locator.tagContainingText("Span", "Save"));
        goToProjectHome();
    }

    @LogMethod(quiet = true)
    protected void populate(@LoggedParam String tableLabel)
    {
        pauseJsErrorChecker();
        Locator completeDiv = Locator.tagContainingText("div", "Populate Complete");
        List<WebElement> completeEl = completeDiv.findElements(getDriver());
        clickButton("Populate " + tableLabel, 0);
        if (completeEl.size() > 0)
            longWait().until(ExpectedConditions.stalenessOf(completeEl.get(0)));
        waitForElement(completeDiv, POPULATE_TIMEOUT_MS);
        Assert.assertFalse("Error populating " + tableLabel, elementContains(Locator.id("msgbox"), "ERROR"));
        resumeJsErrorChecker();
    }

    @LogMethod(quiet = true)
    protected void deleteDataFrom(@LoggedParam String tableLabel)
    {
        pauseJsErrorChecker();
        Locator completeDiv = Locator.tagContainingText("div", "Delete Complete");
        List<WebElement> completeEl = completeDiv.findElements(getDriver());
        clickButton(("All".equals(tableLabel) ? "Delete " : "Delete Data From ") + tableLabel, 0);
        if (completeEl.size() > 0)
            longWait().until(ExpectedConditions.stalenessOf(completeEl.get(0)));
        waitForElement(completeDiv, POPULATE_TIMEOUT_MS);
        Assert.assertFalse("Error deleting " + tableLabel, elementContains(Locator.id("msgbox"), "ERROR"));
        resumeJsErrorChecker();
    }

    @LogMethod(quiet = true)
    protected void repopulate(@LoggedParam String tableLabel)
    {
        deleteDataFrom(tableLabel);
        populate(tableLabel);
    }

    @LogMethod
    protected void populateInitialData()
    {
        beginAt(getBaseURL() + "/ehr/" + getContainerPath() + "/populateInitialData.view");

        repopulate("Lookup Sets");
        repopulate("All");
    }

    @LogMethod
    protected void primeCaches()
    {
        beginAt(getBaseURL() + "/ehr/" + getContainerPath() + "/primeDataEntryCache.view");
        waitAndClickAndWait(Locator.lkButton("OK"));

        beginAt(getBaseURL() + "/ehr/" + getContainerPath() + "/cacheLivingAnimals.view");
        waitAndClick(WAIT_FOR_JAVASCRIPT, Locator.lkButton("OK"), WAIT_FOR_PAGE * 4);
    }

    @LogMethod
    protected void setEHRModuleProperties(ModulePropertyValue... extraProps)
    {
        //set dummy values first, to test the admin UI
        ModulePropertyValue dummyValue = new ModulePropertyValue("EHR", "/" +  getProjectName(), "EHRStudyContainer", "/fakeContainer");
        setModuleProperties(Arrays.asList(dummyValue));

        List<ModulePropertyValue> props = new ArrayList<>();
        props.add(new ModulePropertyValue("EHR", "/" + getProjectName(), "EHRStudyContainer", "/" + getContainerPath()));
        props.add(new ModulePropertyValue("EHR", "/" + getProjectName(), "EHRAdminUser", DATA_ADMIN._email));
        props.add(new ModulePropertyValue("EHR", "/" + getProjectName(), "DefaultAnimalHistoryReport", "snapshot"));

        if (extraProps != null)
            props.addAll(Arrays.asList(extraProps));

        goToProjectHome();
        setModuleProperties(props);
    }

    @LogMethod
    protected void populateHardTableRecords() throws Exception
    {
        log("Inserting initial records into EHR hard tables");

        //verify delete first
        deleteHardTableRecords();

        Connection cn = new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        //first ehr.protocol
        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr", "protocol");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("protocol", PROTOCOL_ID);
        rowMap.put("inves", INVES_ID);
        insertCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("protocol", DUMMY_PROTOCOL);
        rowMap.put("inves", DUMMY_INVES);
        insertCmd.addRow(rowMap);
        SaveRowsResponse saveResp = insertCmd.execute(cn, getContainerPath());

        //then ehr.project
        insertCmd = new InsertRowsCommand("ehr", "project");
        rowMap = new HashMap<>();
        rowMap.put("project", PROTOCOL_PROJECT_ID);
        rowMap.put("protocol", PROTOCOL_ID);
        insertCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("project", PROJECT_ID);
        rowMap.put("protocol", DUMMY_PROTOCOL);
        insertCmd.addRow(rowMap);
        saveResp = insertCmd.execute(cn, getContainerPath());

        //then ehr_lookups.rooms
        insertCmd = new InsertRowsCommand("ehr_lookups", "rooms");
        rowMap = new HashMap<>();
        rowMap.put("room", ROOM_ID);
        //these fields are required in ONPRC_EHR test.  these will not be valid lookups, but that's not important for the test
        rowMap.put("housingType", 1);
        rowMap.put("housingCondition", 1);
        insertCmd.addRow(rowMap);

        rowMap = new HashMap<>();
        rowMap.put("room", ROOM_ID2);
        rowMap.put("housingType", 1);
        rowMap.put("housingCondition", 1);
        insertCmd.addRow(rowMap);

        saveResp = insertCmd.execute(cn, getContainerPath());
    }

    private void deleteIfNeeded(String schemaName, String queryName, Map<String, Object> map, String pkName) throws IOException, CommandException
    {
        Connection cn = new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        SelectRowsCommand selectCmd = new SelectRowsCommand(schemaName, queryName);
        selectCmd.addFilter(new Filter(pkName, map.get(pkName)));
        SelectRowsResponse srr = selectCmd.execute(cn, getContainerPath());

        if (srr.getRowCount().intValue() > 0)
        {
            DeleteRowsCommand deleteCmd = new DeleteRowsCommand(schemaName, queryName);
            deleteCmd.addRow(map);
            deleteCmd.execute(cn, getContainerPath());
        }
    }

    @LogMethod
    protected void deleteHardTableRecords() throws CommandException, IOException
    {
        log("Deleting initial records from EHR hard tables");

        //ehr_lookups.room
        Map<String,Object> rowMap5 = new HashMap<>();
        rowMap5.put("room", ROOM_ID);
        deleteIfNeeded("ehr_lookups", "rooms", rowMap5, "room");

        Map<String,Object> rowMap6 = new HashMap<>();
        rowMap6.put("room", ROOM_ID2);
        deleteIfNeeded("ehr_lookups", "rooms", rowMap6, "room");
    }

    protected void assertNoErrorText()
    {
        String[] texts = new String[]{"error", "Error", "ERROR", "failed", "Failed", "Invalid", "invalid"};
        String visibleText = findVisibleText(texts);
        assertTrue("Error text found: " + visibleText, visibleText == null);
    }

    /**
     * Checks if any text is visible on the page
     * @param texts Exact, case-sensitive strings to check for
     * @return The first string among texts if any are found; null if none are found
     */
    public String findVisibleText(String... texts)
    {
        if(texts==null || texts.length == 0)
            return null;

        String source = getBodyText();

        for (String text : texts)
        {
            text = text.replace("&", "&amp;");
            text = text.replace("<", "&lt;");
            text = text.replace(">", "&gt;");
            if (source.contains(text))
                return text;
        }
        return null;
    }

    @LogMethod
    protected void defineQCStates()
    {
        log("Define QC states for EHR study");

        beginAt("/ehr/" + getContainerPath() + "/ensureQCStates.view");
        clickButton("OK");
    }

    @LogMethod
    protected void createUsersandPermissions() throws Exception
    {
        enableEmailRecorder();

        _userHelper.createUser(DATA_ADMIN.getEmail(), true, true);
        _userHelper.createUser(REQUESTER.getEmail(), true, true);
        _userHelper.createUser(BASIC_SUBMITTER.getEmail(), true, true);
        _userHelper.createUser(FULL_SUBMITTER.getEmail(), true, true);
        _userHelper.createUser(FULL_UPDATER.getEmail(), true, true);
        _userHelper.createUser(REQUEST_ADMIN.getEmail(), true, true);

        goToEHRFolder();

        _permissionsHelper.createPermissionsGroup(DATA_ADMIN.getGroup(), DATA_ADMIN.getEmail());
        _permissionsHelper.createPermissionsGroup(REQUESTER.getGroup(), REQUESTER.getEmail());
        _permissionsHelper.createPermissionsGroup(BASIC_SUBMITTER.getGroup(), BASIC_SUBMITTER.getEmail());
        _permissionsHelper.createPermissionsGroup(FULL_SUBMITTER.getGroup(), FULL_SUBMITTER.getEmail());
        _permissionsHelper.createPermissionsGroup(FULL_UPDATER.getGroup(), FULL_UPDATER.getEmail());
        _permissionsHelper.createPermissionsGroup(REQUEST_ADMIN.getGroup(), REQUEST_ADMIN.getEmail());

        if (!getContainerPath().equals(getProjectName()))
            _permissionsHelper.uncheckInheritedPermissions();

        _permissionsHelper.setPermissions(DATA_ADMIN.getGroup(), "EHR Data Entry");
        _permissionsHelper.setPermissions(REQUESTER.getGroup(), "EHR Data Entry");
        _permissionsHelper.setPermissions(BASIC_SUBMITTER.getGroup(), "EHR Data Entry");
        _permissionsHelper.setPermissions(FULL_SUBMITTER.getGroup(), "EHR Data Entry");
        _permissionsHelper.setPermissions(FULL_UPDATER.getGroup(), "EHR Data Entry");
        _permissionsHelper.setPermissions(REQUEST_ADMIN.getGroup(), "EHR Data Entry");

        //this is slow, so dont set passwords unless subclasses need it
        if (doSetUserPasswords())
        {
            setEhrUserPasswords();
        }
    }

    protected boolean doSetUserPasswords()
    {
        return false;
    }

    protected void goToEHRFolder()
    {
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
    }

    protected void setupStudyPermissions() throws Exception
    {
        goToEHRFolder();
        goToManageStudy();
        clickAndWait(Locator.linkWithText("Manage Security"));

        setFormElement(Locator.name("fileUpload"), getStudyPolicyXML());
        clickButton("Import");
    }

    protected File getStudyPolicyXML()
    {
        return TestFileUtils.getSampleData("ehrTestStudyPolicy.xml");
    }

    protected EHRClientAPIHelper getApiHelper()
    {
        if (Thread.interrupted())
            throw new RuntimeException("Test thread has been terminated");
        return new EHRClientAPIHelper(this, getContainerPath());
    }

    protected JSONObject getExtraContext()
    {
        JSONObject extraContext = getApiHelper().getExtraContext();
        extraContext.remove("targetQC");
        extraContext.remove("isLegacyFormat");

        return extraContext;
    }

    @LogMethod
    private void setEhrUserPasswords()
    {
        setInitialPassword(DATA_ADMIN.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(REQUESTER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(BASIC_SUBMITTER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(FULL_SUBMITTER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(FULL_UPDATER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(REQUEST_ADMIN.getEmail(), PasswordUtil.getPassword());
    }

    protected static final ArrayList<Permission> allowedActions = new ArrayList<Permission>()
    {
        {
            // Data Admin - Users with this role are permitted to make any edits to datasets
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_APPROVED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.ABNORMAL, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.COMPLETED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_APPROVED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.ABNORMAL, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.COMPLETED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.DELETE_REQUESTED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_APPROVED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REVIEW_REQUIRED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.SCHEDULED, "delete"));

            //for the purpose of tests, full updater is essentially the save as data admin.  they just lack admin privs, which we dont really test
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_APPROVED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.ABNORMAL, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.COMPLETED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_APPROVED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.ABNORMAL, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.COMPLETED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.DELETE_REQUESTED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_APPROVED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REVIEW_REQUIRED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.SCHEDULED, "delete"));

            // Requester - Users with this role are permitted to submit requests, but not approve them
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_CANCELLED, "update"));

            // Full Submitter - Users with this role are permitted to submit and approve records.  They cannot modify public data.
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_APPROVED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.ABNORMAL, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_APPROVED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_APPROVED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.SCHEDULED, "delete"));

            // Basic Submitter - Users with this role are permitted to submit and edit non-public records, but cannot alter public ones
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.DELETE_REQUESTED, "insert"));
            //request approved: none
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.DELETE_REQUESTED, "update"));
            //request approved: none
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.IN_PROGRESS, "delete"));

            // Request Admin is basically the same as Full Submitter, except they also have RequestAdmin Permission, which is not currently tested.  It is primarily used in UI
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_APPROVED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.ABNORMAL, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_APPROVED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_APPROVED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.SCHEDULED, "delete"));
        }
    };

    public static class EHRUser
    {
        private final String _email;
        private final String _groupName;
        private final EHRRole _role;
        private Integer _userId = null;


        public EHRUser(String email, String groupName, EHRRole role)
        {
            _email = email;
            _groupName = groupName;
            _role = role;
        }

        public String getEmail()
        {
            return _email;
        }

        public Integer getUserId()
        {
            return _userId;
        }

        public void setUserId(Integer userId)
        {
            _userId = userId;
        }

        public String getGroup()
        {
            return _groupName;
        }

        public EHRRole getRole()
        {
            return _role;
        }

    }

    public static class Permission
    {
        EHRRole role;
        EHRQCState qcState;
        String action;
        public Permission(EHRRole role, EHRQCState qcState, String action)
        {
            this.role = role;
            this.qcState = qcState;
            this.action = action;
        }

        @Override
        public boolean equals(Object other)
        {
            return other.getClass().equals(Permission.class) &&
                    this.role == ((Permission)other).role &&
                    this.qcState == ((Permission)other).qcState &&
                    this.action.equals(((Permission)other).action);
        }
    }

    public static enum EHRRole
    {
        DATA_ADMIN ("EHR Data Admin"),
        REQUESTER ("EHR Requestor"),
        BASIC_SUBMITTER ("EHR Basic Submitter"),
        FULL_SUBMITTER ("EHR Full Submitter"),
        FULL_UPDATER ("EHR Full Updater"),
        REQUEST_ADMIN ("EHR Request Admin");
        private final String name;
        private EHRRole (String name)
        {this.name = name;}
        public String toString()
        {return name;}
    }

    public static enum EHRQCState
    {
        ABNORMAL("Abnormal", "Value is abnormal", true),
        COMPLETED("Completed", "Data has been approved for public release", true),
        DELETE_REQUESTED("Delete Requested", "Records are requested to be deleted", true),
        IN_PROGRESS("In Progress", "Draft Record, not public", false),
        REQUEST_APPROVED("Request: Approved", "Request has been approved", true),
        REQUEST_DENIED("Request: Denied", "Request has been denied", true),
        REQUEST_CANCELLED("Request: Cancelled", "Request has been cancelled", true),
        REQUEST_PENDING("Request: Pending", "Part of a request that has not been approved", false),
        REQUEST_SAMPLE_DELIVERED("Request: Sample Delivered", "Request where the sample is delivered", false),
        REVIEW_REQUIRED("Review Required", "Review is required prior to public release", false),
        SCHEDULED("Scheduled", "Record is scheduled, but not performed", true);

        public final String label;
        public final String description;
        public final boolean publicData;

        EHRQCState(String label, String description, boolean publicData)
        {
            this.label = label;
            this.description = description;
            this.publicData = publicData;
        }
    }

    protected Ext4FieldRef getAnimalHistorySubjField()
    {
        Ext4CmpRef.waitForComponent(this, "#subjArea");
        return _ext4Helper.queryOne("#subjArea", Ext4FieldRef.class);
    }

    public List<Map<String, Object>> loadTsv(File tsv)
    {
        try
        {
            TabLoader loader = new TabLoader(tsv, true);
            loader.setInferTypes(false);
            return loader.load();
        }
        catch (IOException fail)
        {
            throw new RuntimeException(fail);
        }
    }
}
