package org.labkey.test;

import org.json.simple.JSONObject;
import org.junit.Assert;
import org.junit.BeforeClass; import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.remoteapi.Command;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.collections.CaseInsensitiveHashMap;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.Sort;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.categories.Base;
import org.labkey.test.categories.DRT;
import org.labkey.test.categories.DailyA;
import org.labkey.test.categories.Git;
import org.labkey.test.categories.Hosting;
import org.labkey.test.tests.ehr.AbstractEHRTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.TestLogger;
import org.labkey.test.util.UIContainerHelper;
import org.labkey.test.util.external.labModules.LabModuleHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import static org.labkey.test.WebTestHelper.buildURL;

/**
 * See WNPRC_EHRTest class for tests that test this weights module.
 * Uncomment the tests below if to test it on a local instance. (You may need to adjust room ids, animal ids)
 */

@Category({Base.class, DRT.class, DailyA.class, Git.class, Hosting.class})
@BaseWebDriverTest.ClassTimeout(minutes = 6)
public class WeightsSubmitTest extends BaseWebDriverTest
{
    private static final String PROJECT_NAME = null;
    private static final String FOLDER_PATH_LOCAL = "WNPRC/EHR";
    private static final String FOLDER_RENAME = "renamedfolder";

    public WeightsSubmitTest()
    {
        super();
        _containerHelper = new UIContainerHelper(this);
    }

    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    public List<String> getAssociatedModules()
    {
        return Arrays.asList("core");
    }

    @Test
    public void dummyTest(){

    }
    /*
    protected static final String DATE_FORMAT_STRING = "yyyy-MM-dd";
    protected static final Double WEIGHT_VAL = 12.12;
    protected static final Double LOW_VAL = 0.1;
    protected static final Double HIGH_VAL = 0.12;
    protected static final String[] ANIMAL_ID_LOCAL = {"cj2078","r18051"};
    protected static final String ROOM_ID_LOCAL = "a242";
    protected static final String[] EXPECTED_ANIMALS_LOCAL = {"r05024","r07017","r88080","r93061","rh2021","rh2291","rh2563","rhav42","rhaw73","rhbd41"};
    protected static final String ROOM_ID_EHR_TEST = "2341092";
    protected static final String[] ANIMAL_SUBSET_EHR_TEST = {"Test3844307", "Test8976544", "Test9195996"};
    protected static AbstractEHRTest.EHRUser FULL_SUBMITTER = new AbstractEHRTest.EHRUser("fullsubmitter@ehrstudy.test", "EHR Full Submitters", AbstractEHRTest.EHRRole.FULL_SUBMITTER);
    protected static final String VIEW_TEXT = "Browse All";

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    public void navigateToWeights()
    {
        WebElement modeElement = Locator.tagWithText("a", "Enter Data").findElement(getDriver());
        modeElement.click();
        waitForElement(Locator.linkContainingText("Enter Weights"));
        WebElement modeElement2 = Locator.tagWithText("a", "Enter Weights").findElement(getDriver());
        modeElement2.click();
    }

    public WebElement fillAnInput(String inputId, String value)
    {
        WebElement el = Locator.id(inputId).findElement(getDriver());
        el.sendKeys(value);
        return el;
    }

    public void fillWeightForm(String weightVal, Integer index)
    {
        WebElement el = fillAnInput("animalid_" + index.toString(), ANIMAL_ID_LOCAL[index]);
        WebElement el2 = fillAnInput("weight_" + index.toString(), weightVal);
        el2.sendKeys(Keys.TAB);
        el2.sendKeys(Keys.TAB);
    }

    public void waitUntilElementIsClickable(String id)
    {
        shortWait().until(ExpectedConditions.elementToBeClickable(Locator.id(id)));
    }

    @Test
    public void testEnterWeights() throws IOException, CommandException
    {
        //getDriver().manage().window().setSize(new Dimension(768, 1024));
        //getDriver().manage().window().setSize(new Dimension(800,650));
        //getDriver().manage().window().setPosition(new Point(0,500));
        //navigate to weights form and fill it out
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        waitUntilElementIsClickable("submit-all-btn");
        //shortWait().until(ExpectedConditions.elementToBeClickable(Locator.id("submit-all-btn")));
        clickNewButton("submit-all-btn");
        clickNewButton("submit-final");
        waitForText("Success");

        SelectRowsResponse r = fetchWeightData();
        JSONObject wt = (JSONObject) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));

    }

    public SelectRowsResponse fetchWeightData() throws IOException, CommandException
    {
        Connection cn = this.createDefaultConnection(false);
        SelectRowsCommand cmd = new SelectRowsCommand("study", "weight");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("Id", "date", "weight", "remark", "QCState", "taskid", "objectid"));
        cmd.setSorts(Collections.singletonList(new Sort("date", Sort.Direction.DESCENDING)));
        cmd.setMaxRows(100);
        return cmd.execute(cn, FOLDER_PATH_LOCAL);

    }
    public SelectRowsResponse fetchTaskData(String taskid) throws IOException, CommandException
    {
        Connection cn = this.createDefaultConnection(false);
        SelectRowsCommand cmd = new SelectRowsCommand("ehr", "tasks");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("rowid", "updateTitle", "formtype", "assignedto", "duedate", "createdby", "created", "qcstate"));
        cmd.addFilter("taskId", taskid, Filter.Operator.EQUAL);
        cmd.setSorts(Arrays.asList(new Sort("duedate", Sort.Direction.DESCENDING), new Sort("created", Sort.Direction.DESCENDING)));
        cmd.setMaxRows(100);
        return cmd.execute(cn, FOLDER_PATH_LOCAL);

    }
    public SelectRowsResponse fetchRestraintDataGivenWeightObjectId(String weight_objectid) throws IOException, CommandException
    {
        Connection cn = this.createDefaultConnection(false);
        SelectRowsCommand cmd = new SelectRowsCommand("study", "restraints");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("Id", "date", "restraintType", "weight_objectid"));
        cmd.addFilter("weight_objectid", weight_objectid, Filter.Operator.EQUAL);
        cmd.setSorts(Collections.singletonList(new Sort("date", Sort.Direction.DESCENDING)));
        cmd.setMaxRows(100);
        return cmd.execute(cn, FOLDER_PATH_LOCAL);

    }

    public SelectRowsResponse fetchWeightDataGivenTaskRowId(String taskrowid) throws IOException, CommandException
    {
        Connection cn = this.createDefaultConnection(false);
        SelectRowsCommand cmd = new SelectRowsCommand("study", "weight");
        cmd.setRequiredVersion(9.1);
        cmd.setColumns(Arrays.asList("Id", "date", "weight", "remark", "QCState", "taskid"));
        cmd.addFilter("taskid/rowid", taskrowid, Filter.Operator.EQUAL);
        cmd.setSorts(Collections.singletonList(new Sort("date", Sort.Direction.DESCENDING)));
        return cmd.execute(cn, FOLDER_PATH_LOCAL);
    }

    public void clickNewButton(String id){
        WebElement o = Locator.tagWithId("button",id).findElement(getDriver());
        o.click();
    }

    @Test
    public void testSaveWeightDraft() throws IOException, CommandException
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(LOW_VAL.toString(), 0);
        waitUntilElementIsClickable("save-draft-btn");
        //shortWait().until(ExpectedConditions.elementToBeClickable(Locator.id("save-draft-btn")));
        clickNewButton("save-draft-btn");
        //clickNewButton("submit-final");
        waitForText("Saved");
        //and check that it was actually saved and QC state is "In Progress"
        SelectRowsResponse r = fetchWeightData();
        JSONObject wt = (JSONObject) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, LOW_VAL, wt.get("value"));
        JSONObject qc = (JSONObject) r.getRows().get(0).get("QCState");
        Assert.assertEquals(null, "In Progress", qc.get("displayValue"));

    }

    @Test
    public void testWeightWarning() throws IOException, CommandException
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(LOW_VAL.toString(), 0);
        waitUntilElementIsClickable("submit-all-btn");
        clickNewButton("submit-all-btn");
        clickNewButton("submit-final");
        waitForText("Success");
        SelectRowsResponse r = fetchWeightData();
        JSONObject wt = (JSONObject) r.getRows().get(0).get("weight");
        TestLogger.log(wt.get("value").toString());
        Assert.assertEquals(null, LOW_VAL, wt.get("value"));

        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(HIGH_VAL.toString(), 0);
        sleep(1000);
        assertElementPresent(Locator.id("weight-warning"));
        sleep(2000);

    }
    @Test
    public void testWeightSubmitForReview() throws IOException, CommandException
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        waitUntilElementIsClickable("submit-review-btn");
        clickNewButton("submit-review-btn");
        sleep(1000);
        //waitForElement(Locator.id("reviewers"),10000);
        waitForText("Submit for Review");
        WebElement c = Locator.id("reviewers").findElement(getDriver());
        TestLogger.log(FULL_SUBMITTER.getGroup());

        Select select = new Select(c);
        sleep(1000);
        select.selectByIndex(2);
        List<WebElement> l = select.getAllSelectedOptions();
        WebElement option = l.get(0);
        String defaultItem = option.getAttribute("value");
        TestLogger.log(defaultItem);
        //System.out.println(defaultItem );

        //c.sendKeys(LOCAL_USER);
        //c.sendKeys(Keys.ENTER);
        sleep(1000);
        clickNewButton("submit-final");
        waitForText("Success");

        SelectRowsResponse r = fetchWeightData();
        JSONObject wt = (JSONObject) r.getRows().get(0).get("weight");
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));

        JSONObject taskidob = (JSONObject) r.getRows().get(0).get("taskid");
        String taskid = taskidob.get("value").toString();

        SelectRowsResponse t = fetchTaskData(taskid);
        //assert that this task's assigned to is the same as info entered above
        JSONObject id = (JSONObject) t.getRows().get(0).get("assignedto");
        Assert.assertEquals(null, defaultItem, id.get("value").toString());

    }

    @Test
    public void testEditAndDelete() throws IOException, CommandException
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        clickNewButton("add-record");
        fillWeightForm(WEIGHT_VAL.toString(),1);
        waitUntilElementIsClickable("submit-all-btn");
        clickNewButton("submit-all-btn");
        clickNewButton("submit-final");

        waitForText("Success");
        SelectRowsResponse r = fetchWeightData();
        JSONObject wt = (JSONObject) r.getRows().get(0).get("weight");
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));

        JSONObject taskidob = (JSONObject) r.getRows().get(0).get("taskid");
        String taskid = taskidob.get("value").toString();
        SelectRowsResponse t = fetchTaskData(taskid);
        JSONObject id = (JSONObject) t.getRows().get(0).get("rowid");
        waitAndClick(Locator.linkContainingText(id.get("value").toString()));
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
        waitForText(ANIMAL_ID_LOCAL[1]);
        //TestLogger.log(Locator.className("content-left").findElement(getDriver()).getAttribute("outerHTML"));
        clickNewButton("remove-record-btn_1");
        sleep(2000);
        waitUntilElementIsClickable("submit-all-btn");
        clickNewButton("submit-all-btn");
        clickNewButton("submit-final");
        waitForText("Success");
        //verify that it was deleted by counting that task has only 1 record in it
        //do a a query to get weights filtered by taskid
        SelectRowsResponse r2 =  fetchWeightDataGivenTaskRowId(id.get("value").toString());
        Assert.assertEquals(1,r2.getRows().size());
        TestLogger.log(String.valueOf(countText(id.get("value").toString())));
    }

    @Test
    public void testAddRestraint() throws IOException, CommandException
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        fillWeightForm(WEIGHT_VAL.toString(),0);
        WebElement el2 = fillAnInput("restraint_0", "T");
        waitUntilElementIsClickable("submit-all-btn");
        clickNewButton("submit-all-btn");
        clickNewButton("submit-final");
        waitForText("Success");

        SelectRowsResponse r = fetchWeightData();
        JSONObject wt = (JSONObject) r.getRows().get(0).get("weight");
        Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));
        JSONObject objectid = (JSONObject) r.getRows().get(0).get("objectid");

        SelectRowsResponse c = fetchRestraintDataGivenWeightObjectId(objectid.get("value").toString());
        JSONObject rt = (JSONObject) c.getRows().get(0).get("restraintType");
        Assert.assertEquals(null, "Table-Top", rt.get("value"));

    }


    public void addBatchByIds()
    {
        clickNewButton("add-batch");
        waitForElement(Locator.id("ids"));
        WebElement el = Locator.id("ids").findElement(getDriver());
        for (int i = 0; i < EXPECTED_ANIMALS_LOCAL.length; i++){
            el.sendKeys(EXPECTED_ANIMALS_LOCAL[i]);
            if (i < EXPECTED_ANIMALS_LOCAL.length-1 ){
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
        in.sendKeys(ROOM_ID_LOCAL);
        sleep(2000);
        in.sendKeys(Keys.ENTER);
        clickNewButton("submit-batch");
        sleep(5000);
    }

    @Test
    public void testAddBatchIds()
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        addBatchByIds();
        for (int i = 0; i < EXPECTED_ANIMALS_LOCAL.length; i++){
            assertTextPresent(EXPECTED_ANIMALS_LOCAL[i]);
        }
    }

    @Test
    public void testAddBatch()
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        addBatchByLocation();
        for (int i = 0; i < EXPECTED_ANIMALS_LOCAL.length; i++){
            assertTextPresent(EXPECTED_ANIMALS_LOCAL[i]);
        }
    }

    @Test
    public void testEditBatch() throws IOException, CommandException
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        addBatchByLocation();
        clickNewButton("edit-batch");
        WebElement el = Locator.id("weight-bulk").findElement(getDriver());
        el.sendKeys(WEIGHT_VAL.toString());
        clickNewButton("submit-bulk");
        waitUntilElementIsClickable("submit-all-btn");
        clickNewButton("submit-all-btn");
        clickNewButton("submit-final");
        waitForText("Success");

        SelectRowsResponse r = fetchWeightData();
        for (int i = 0; i < EXPECTED_ANIMALS_LOCAL.length; i++)
        {
            JSONObject wt = (JSONObject) r.getRows().get(i).get("weight");
            Assert.assertEquals(null, WEIGHT_VAL, wt.get("value"));
        }
    }

    @Test
    public void testDisplayAnimalInfo() throws IOException, CommandException
    {
        beginAt(buildURL("project", getContainerPath(), "begin"));
        navigateToWeights();
        WebElement f = fillAnInput("animalid_0", ANIMAL_ID_LOCAL[0]);
        f.sendKeys(Keys.TAB);
        waitForElement(Locator.byClass("animal-info-table"));

    }

    public String getContainerPath()
    {
        return FOLDER_PATH_LOCAL;
    }
     */

}
