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
package org.labkey.test.tests.wnprc_ehr;

import org.jetbrains.annotations.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.SortDirection;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.pages.ehr.AnimalHistoryPage;
import org.labkey.test.selenium.EphemeralWebElement;
import org.labkey.test.tests.ehr.AbstractGenericEHRTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.ExtHelper;
import org.labkey.test.util.external.labModules.LabModuleHelper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.Arrays;
import java.util.Date;

import static org.junit.Assert.assertEquals;

/**
 * This should contain tests designed to validate EHR data entry or associated business logic.
 * NOTE: EHRApiTest may be a better location for tests designed to test server-side trigger scripts
 * or similar business logic.
 */
@Category({CustomModules.class, EHR.class, ONPRC.class})
public class WNPRC_EHRTest extends AbstractGenericEHRTest
{
    public static final String PROJECT_NAME = "WNPRC_TestProject";
    protected static final String PROJECT_MEMBER_ID = "test2312318"; // PROJECT_ID's single participant

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
        initTest._containerHelper.enableModule("WNPRC_EHR");
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
    public void testWeightDataEntry()
    {
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
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
        assertFormElementEquals(Locator.name("title"), TASK_TITLE);

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
        assertFormElementEquals(Locator.name("title"), TASK_TITLE);

        waitForElement(Locator.button("Add Batch"), WAIT_FOR_JAVASCRIPT);
        click(Locator.extButton("Add Batch"));
        _extHelper.waitForExtDialog("");
        _extHelper.setExtFormElementByLabel("", "Room(s):", ROOM_ID);
        _extHelper.clickExtButton("", "Submit", 0);
        waitForElement(Locator.tagWithText("div", PROJECT_MEMBER_ID).withClass("x-grid3-cell-inner"), WAIT_FOR_JAVASCRIPT);
        click(Locator.extButton("Add Batch"));
        _extHelper.waitForExtDialog("");
        _extHelper.setExtFormElementByLabel("", "Id(s):", MORE_ANIMAL_IDS[0]+","+MORE_ANIMAL_IDS[1]+";"+MORE_ANIMAL_IDS[2]+" "+MORE_ANIMAL_IDS[3]+"\n"+MORE_ANIMAL_IDS[4]);
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
        waitForElement(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")));
        _extHelper.clickExtTab("Tasks By Room");
        waitForElement(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 3, getElementCount(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")));
        _extHelper.clickExtTab("Tasks By Id");
        waitForElement(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 3, getElementCount(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']//a[.='Test weight task']")));
        sleep(1000); //Weird
        stopImpersonating();

        log("Fulfill measurement task");
        impersonate(BASIC_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
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
        waitForElement(Locator.id("userMenuPopupText"));

        sleep(1000); // Weird
        stopImpersonating();

        log("Verify Measurements");
        sleep(1000); // Weird
        impersonate(DATA_ADMIN.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtTab("Review Required");
        waitForElement(Locator.xpath("//div[contains(@class, 'review-requested-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'review-requested-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        String href2 = getAttribute(Locator.linkWithText(TASK_TITLE), "href");
        beginAt(href2); // Clicking opens in a new window.
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-weight-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        waitAndClick(Locator.extButtonEnabled("Validate"));
        waitForElement(Locator.xpath("//button[text() = 'Submit Final' and "+Locator.ENABLED+"]"), WAIT_FOR_JAVASCRIPT);
        sleep(1000);
        click(Locator.extButton("Submit Final"));
        _extHelper.waitForExtDialog("Finalize Form");
        _extHelper.clickExtButton("Finalize Form", "Yes");
        waitForElement(Locator.linkWithText("Enter Blood Draws"));
        waitForElement(Locator.id("userMenuPopupText"));

        sleep(1000); // Weird
        stopImpersonating();
        sleep(1000); // Weird

        clickProject(PROJECT_NAME);
        clickFolder(FOLDER_NAME);
        waitAndClickAndWait(Locator.linkWithText("Browse All Datasets"));
        waitAndClickAndWait(LabModuleHelper.getNavPanelItem("Weight:", "Browse All"));

        (new DataRegionTable("query", this)).setFilter("date", "Equals", DATE_FORMAT.format(new Date()));
        assertTextPresent("3.333", "4.444", "5.555");
        assertEquals("Completed was not present the expected number of times", 6, getElementCount(Locator.xpath("//td[text() = 'Completed']")));
    }

    @Test
    public void testMprDataEntry()
    {
        clickProject(PROJECT_NAME);
        clickFolder(FOLDER_NAME);
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
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);

        waitAndClickAndWait(Locator.linkWithText("Browse All Datasets"));

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Drug Administration");
        waitAndClick(LabModuleHelper.getNavPanelItem("Drug Administration:", VIEW_TEXT));

        waitForText(WAIT_FOR_PAGE * 2, "details");
        DataRegionTable dr = new DataRegionTable("query", this);
        clickAndWait(dr.link(0, 0));
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
        clickAndWait(dr.link(0, 0));
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
        waitForText("details");
        clickAndWait(dr.link(0, 0));
        waitForText("Encounter Details");
        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Biopsies");
        waitAndClick(LabModuleHelper.getNavPanelItem("Biopsies:", VIEW_TEXT));
        waitForText("volutpat");
        dr = new DataRegionTable("query", this);
        waitAndClickAndWait(Locator.linkWithText("Details"));
        //these are the sections we expect
        waitForText("Biopsy Details", "Morphologic Diagnoses", "Histology");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Necropsies");
        waitAndClick(LabModuleHelper.getNavPanelItem("Necropsies:", VIEW_TEXT));
        waitForText("details");
        dr = new DataRegionTable("query", getDriver());
        dr.link(0, 0).click();
        //these are the sections we expect
        waitForText("Necropsy Details","Morphologic Diagnoses","Histology");
        assertNoErrorText();
    }

    @Test
    public void testAnimalHistory()
    {
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);

        waitAndClick(Locator.linkWithText("Animal History"));

        log("Verify Single animal history");
        String query = "textfield[itemId=subjArea]";
        _helper.waitForCmp(query);
        Ext4FieldRef subjField = getAnimalHistorySubjField();
        subjField.setValue(PROTOCOL_MEMBER_IDS[0]);

        refreshAnimalHistoryReport();
        waitForElement(Locator.tagContainingText("th", "Overview: " + PROTOCOL_MEMBER_IDS[0]));
        waitForElement(Locator.tagContainingText("div", "There are no active medications"));
        waitForElement(Locator.tagContainingText("div", "5.62 kg")); //loading of the weight section
        _helper.waitForCmp(query);
        subjField = _ext4Helper.queryOne("#subjArea", Ext4FieldRef.class);
        assertEquals("Incorrect value in subject ID field", PROTOCOL_MEMBER_IDS[0], subjField.getValue());

        //NOTE: rendering the entire colony is slow, so instead of abstract we load a simpler report
        log("Verify entire colony history");
        waitAndClick(Ext4Helper.Locators.ext4Radio("Entire Database"));
        sleep(5000);
        waitAndClick(Ext4Helper.Locators.ext4Tab("Demographics"));
        waitForElement(Locator.tagContainingText("a", "Rhesus")); //a proxy for the loading of the dataRegion
        waitForElement(Locator.tagContainingText("a", "test9195996"));  //the last ID on the page.  possibly a better proxy?
        waitForElement(Locator.tagContainingText("a", "Rhesus"));
        waitForElement(Locator.tagContainingText("a", "Cynomolgus"));
        waitForElement(Locator.tagContainingText("a", "Marmoset"));

        log("Verify location based history");
        waitAndClick(Ext4Helper.Locators.ext4Radio("Current Location"));

        _helper.waitForCmp("#areaField");
        _ext4Helper.queryOne("#areaField", Ext4FieldRef.class).setValue(AREA_ID);
        sleep(200); //wait for 2nd field to filter
        _ext4Helper.queryOne("#roomField", Ext4FieldRef.class).setValue(ROOM_ID);
        _ext4Helper.queryOne("#cageField", Ext4FieldRef.class).setValue(CAGE_ID);
        refreshAnimalHistoryReport();
        waitForElement(Locator.linkContainingText("9794992"), WAIT_FOR_JAVASCRIPT);   //this is the value of sire field

        log("Verify Project search");
        waitAndClick(Ext4Helper.Locators.ext4Radio("Multiple Animals"));
        waitAndClick(Locator.linkContainingText("[Search By Project/Protocol]"));
        waitForElement(Ext4Helper.Locators.window("Search By Project/Protocol"));
        Ext4FieldRef.waitForField(this, "Center Project");
        Ext4ComboRef.getForLabel(this, "Center Project").setComboByDisplayValue(PROJECT_ID);
        _helper.clickExt4WindowBtn("Search By Project/Protocol", "Submit");

        waitForElement(Ext4Helper.Locators.ext4Button(PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        waitForElement(Locator.tagContainingText("span", "Demographics - " + PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT * 2);

        log("Verify Protocol search");
        waitAndClick(Ext4Helper.Locators.ext4Radio("Multiple Animals"));
        waitAndClick(Locator.linkContainingText("[Search By Project/Protocol]"));
        waitForElement(Ext4Helper.Locators.window("Search By Project/Protocol"));
        Ext4FieldRef.waitForField(this, "IACUC Protocol");
        Ext4ComboRef.getForLabel(this, "IACUC Protocol").setComboByDisplayValue(PROTOCOL_ID);
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        waitForElement(Ext4Helper.Locators.ext4Button(PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);

        WebElement demographicWebpart = new EphemeralWebElement(PortalHelper.Locators.webPartWithTitleContaining("Demographics"), getDriver()).withTimeout(1000);
        // Check protocol search results.
        refreshAnimalHistoryReport();
        assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length, DataRegionTable.findDataRegionWithin(this, demographicWebpart).getDataRowCount());
        assertElementPresent(Locator.linkContainingText(PROTOCOL_MEMBER_IDS[0]));

        // Check animal count after removing one from search.
        waitAndClick(Ext4Helper.Locators.ext4Button(PROTOCOL_MEMBER_IDS[0]));
        waitForElementToDisappear(Ext4Helper.Locators.ext4Button(PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length - 1, DataRegionTable.findDataRegionWithin(this, demographicWebpart).getDataRowCount());

        // Re-add animal.
        getAnimalHistorySubjField().setValue(PROTOCOL_MEMBER_IDS[0]);
        waitAndClick(Ext4Helper.Locators.ext4Button("Add"));
        waitForElement(Ext4Helper.Locators.ext4Button(PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        //TODO: Need to check that a button showed up under "ID's not found" section
        //assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length, DataRegionTable.findDataRegionWithin(this, demographicWebpart).getDataRowCount());

        log("Check subjectField parsing");
        getAnimalHistorySubjField().setValue(MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1] + ";" + MORE_ANIMAL_IDS[2] + " " + MORE_ANIMAL_IDS[3] + "\t" + MORE_ANIMAL_IDS[4]);
        waitAndClick(Ext4Helper.Locators.ext4Button("Replace"));
        refreshAnimalHistoryReport();
        //TODO: Need to check that two buttons showed up under "ID's not found" section
        //assertEquals("Did not find the expected number of Animals", 5, DataRegionTable.findDataRegionWithin(this, demographicWebpart).getDataRowCount());

        //waitForElementToDisappear(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[1] + "')]").notHidden(), WAIT_FOR_JAVASCRIPT * 3);
        //assertElementNotPresent(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[2] + "')]").notHidden());

        waitAndClick(Ext4Helper.Locators.ext4Button("Clear"));
        waitAndClick(Ext4Helper.Locators.ext4Button("Update Report"));
        waitForElement(Ext4Helper.Locators.window("Error"));
        assertElementNotPresent(Ext4Helper.Locators.ext4ButtonContainingText(PROTOCOL_MEMBER_IDS[2]));
        assertTextPresent("Must enter at least one valid Subject ID");
        waitAndClick(Ext4Helper.Locators.ext4Button("OK"));

        log("checking specific tabs");

        //snapshot
        getAnimalHistorySubjField().setValue(MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1]);
        waitAndClick(Ext4Helper.Locators.ext4Button("Replace"));
        sleep(1000);  // TODO: Since replace now does a query, we should create a helper to click then wait for ID buttons to appear
        refreshAnimalHistoryReport();
        waitAndClick(Ext4Helper.Locators.ext4Tab("General"));
        waitAndClick(Ext4Helper.Locators.ext4Tab("Snapshot"));
        waitForText("Location:");
        waitForText("Gender:");
        waitForElement(Locator.tagContainingText("th", "Weights - " + MORE_ANIMAL_IDS[0]));

        //weight
        waitAndClick(Ext4Helper.Locators.ext4Tab("Clinical"));
        sleep(500);
        scrollIntoView(Ext4Helper.Locators.ext4Tab("Weights"));
        waitAndClick(Ext4Helper.Locators.ext4Tab("Weights"));
        waitForElement(Locator.xpath("//th[contains(text(), 'Weights -')]"));
        waitForElement(Locator.tagContainingText("div", "Most Recent Weight").notHidden());
        waitForElement(Locator.tagWithText("a", "3.73").notHidden()); //first animal
        waitForElement(Locator.tagWithText("a", "3.56").notHidden()); //second animal

        // NOTE: this DR has been failing to load on TC intermittently since 14.1/14.2.  it worked solidly before,
        // and this seems like some sort of WebDriver/JS interaction problem.  The DR shows the loading indicator, but
        // never loads.  Cant repro locally.

        // TODO: consider re-enabling with a future WebDriver version.
        //waitAndClick(Ext4Helper.Locators.ext4Tab("Raw Data").notHidden().index(0));
        //waitForElement(Locator.tagWithText("span", "Percent Change"), WAIT_FOR_PAGE * 3);  //proxy for DR loading

        //chronological history
        AnimalHistoryPage animalHistoryPage = new AnimalHistoryPage(getDriver()); // TODO: Update test to use this throughout
        animalHistoryPage.clickCategoryTab("Clinical");
        animalHistoryPage.clickReportTab("Clinical History");
        waitForElement(Locator.tagContainingText("div", "No records found since:"), 20000);
    }


    private void waitForMprPageLoad()
    {
        waitForElement(Locator.tagWithText("span", "Treatments & Procedures"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.name("Id"), WAIT_FOR_PAGE);
        waitForElement(Locator.name("title"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.css(".ehr-drug_administration-records-grid"), WAIT_FOR_JAVASCRIPT);

        final Locator fieldLocator = Locator.tag("input").withAttribute("name", "Id").withClass("x-form-field").notHidden();

        waitForElement(fieldLocator, WAIT_FOR_JAVASCRIPT);
        waitFor(() -> PROJECT_MEMBER_ID.equals(getDriver().findElement(fieldLocator.toBy()).getAttribute("value")),
                "Id field did not populate", WAIT_FOR_PAGE);

        sleep(200);
    }

    private void refreshAnimalHistoryReport()
    {
        new AnimalHistoryPage(getDriver()).refreshReport();
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

    @Override
    protected String getModuleDirectory()
    {
        return "WNPRC_EHR";
    }
}
