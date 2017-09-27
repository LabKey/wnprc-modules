/*
 * Copyright (c) 2013-2016 LabKey Corporation
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

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.Sort;
import org.labkey.remoteapi.query.UpdateRowsCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.components.BodyWebPart;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.ehr.EHRClientAPIHelper;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.Maps;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Category({CustomModules.class, EHR.class, ONPRC.class})
@BaseWebDriverTest.ClassTimeout(minutes = 60)
public class ONPRC_EHRTest extends AbstractGenericONPRC_EHRTest
{
    protected String PROJECT_NAME = "ONPRC_EHR_TestProject";
    private boolean _hasCreatedBirthRecords = false;

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    protected String getModuleDirectory()
    {
        return "onprc_ehr";
    }

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        ONPRC_EHRTest initTest = (ONPRC_EHRTest)getCurrentTest();

        initTest.initProject();
        initTest.createTestSubjects();
        new RReportHelper(initTest).ensureRConfig();
    }

    @Override
    protected boolean doSetUserPasswords()
    {
        return true;
    }

    @Test
    public void testBloodVolumeApi() throws Exception
    {
        goToProjectHome();

        UpdateRowsCommand updateRowsCommand = new UpdateRowsCommand("ehr_lookups", "species");
        updateRowsCommand.addRow(Maps.of("common", "Rhesus", "blood_draw_interval", 21));
        updateRowsCommand.addRow(Maps.of("common", "Cynomolgus", "blood_draw_interval", 21));
        updateRowsCommand.addRow(Maps.of("common", "Marmoset", "blood_draw_interval", 21));
        updateRowsCommand.execute(getApiHelper().getConnection(), getContainerPath());

        //refresh caches to match new blood volumes.  this really should be automatic on the server
        beginAt(getBaseURL() + "/ehr/" + getContainerPath() + "/primeDataEntryCache.view");
        waitAndClickAndWait(Locator.lkButton("OK"));

        testBloodDrawForAnimal(SUBJECTS[0]);
        testBloodDrawForAnimal(SUBJECTS[1]);
        testBloodDrawForAnimal(SUBJECTS[2]);
    }

    private void testBloodDrawForAnimal(String animalId) throws Exception
    {
        log("processing blood draws for: " + animalId);

        SelectRowsCommand select = new SelectRowsCommand("study", "demographics");
        select.addFilter(new Filter("Id", animalId, Filter.Operator.EQUAL));
        SelectRowsResponse resp = select.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertEquals(1, resp.getRows().size());

        Map<String, Object> demographicsRow = resp.getRows().get(0);
        String species = (String) demographicsRow.get("species");

        //find allowable volume
        SelectRowsCommand select2 = new SelectRowsCommand("ehr_lookups", "species");
        select2.addFilter(new Filter("common", species, Filter.Operator.EQUAL));
        SelectRowsResponse resp2 = select2.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertEquals(1, resp2.getRows().size());

        Double bloodPerKg = (Double) resp2.getRows().get(0).get("blood_per_kg");
        Assert.assertTrue("Bad 'blood_per_kg': " + bloodPerKg, bloodPerKg > 0);
        Double maxDrawPct = (Double) resp2.getRows().get(0).get("max_draw_pct");
        Assert.assertTrue("Bad 'max_draw_pct': " + maxDrawPct, maxDrawPct > 0);
        Integer bloodDrawInterval = ((Double) resp2.getRows().get(0).get("blood_draw_interval")).intValue();
        Assert.assertEquals("Bad 'blood_draw_interval': " + bloodDrawInterval, 21, bloodDrawInterval.intValue());  //NOTE: this is hard coded in some queries right now

        log("Creating blood draws");
        Calendar startCal = new GregorianCalendar();
        startCal.setTime(DateUtils.truncate(new Date(), Calendar.DATE));
        startCal.add(Calendar.DATE, -15);
        startCal.add(Calendar.HOUR, 12);
        Object[][] bloodData = new Object[][]{
                {animalId, prepareDate(startCal.getTime(), -1, 0), 1.0, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 0, 0), 1.5, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 1, -4), 2.0, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 1, 0), 2.0, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 1, 4), 2.0, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 2, 0), 1.0, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 3, 1), 1.5, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 4, 0), 2.0, EHRQCState.REVIEW_REQUIRED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 5, 4), 1.0, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 4, -2), 2.0, EHRQCState.COMPLETED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 5, 0), 1.0, EHRQCState.REVIEW_REQUIRED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 5, 2), 1.0, EHRQCState.IN_PROGRESS.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), 5, 0), 1.0, EHRQCState.IN_PROGRESS.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval - 1, 0), 1.5, EHRQCState.REQUEST_PENDING.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval, 0), 2.0, EHRQCState.REQUEST_APPROVED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval + 1, 0), 2.0, EHRQCState.REQUEST_PENDING.label, generateGUID()},
                //add draw far in future
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval + bloodDrawInterval - 1, 0), 2.0, EHRQCState.REQUEST_APPROVED.label, generateGUID()},
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval + bloodDrawInterval + 1, 0), 2.0, EHRQCState.REQUEST_APPROVED.label, generateGUID()}
        };

        JSONObject insertCommand = getApiHelper().prepareInsertCommand("study", "blood", "lsid", new String[]{"Id", "date", "quantity", "QCStateLabel", "objectid"}, bloodData);
        getApiHelper().deleteAllRecords("study", "blood", new Filter("Id", animalId, Filter.Operator.EQUAL));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Arrays.asList(insertCommand), getExtraContext(), true);

        log("Creating weight records");
        Object[][] weightData = new Object[][]{
                {animalId, prepareDate(startCal.getTime(), -1, 0), 5.0, EHRQCState.COMPLETED.label},
                {animalId, prepareDate(startCal.getTime(), 5, 0), 4.0, EHRQCState.COMPLETED.label},
                {animalId, prepareDate(startCal.getTime(), 5, 1), 2.0, EHRQCState.COMPLETED.label},
                {animalId, prepareDate(startCal.getTime(), 10, 1), 6.0, EHRQCState.COMPLETED.label}
        };
        Map<Date, Double> weightByDay = new TreeMap<>();
        weightByDay.put(prepareDate(startCal.getTime(), -1, 0), 5.0);
        weightByDay.put(prepareDate(startCal.getTime(), 5, 0), 3.0);
        weightByDay.put(prepareDate(startCal.getTime(), 5, 1), 3.0);
        weightByDay.put(prepareDate(startCal.getTime(), 10, 1), 6.0);

        JSONObject insertCommand2 = getApiHelper().prepareInsertCommand("study", "weight", "lsid", new String[]{"Id", "date", "weight", "QCStateLabel"}, weightData);
        getApiHelper().deleteAllRecords("study", "weight", new Filter("Id", animalId, Filter.Operator.EQUAL));
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Arrays.asList(insertCommand2), getExtraContext(), true);

        //validate results
        //build map of daws by day:
        Map<Date, Double> bloodByDay = new TreeMap<>();
        for (Object[] row : bloodData)
        {
            Date d = DateUtils.truncate(row[1], Calendar.DATE);
            String qcLabel = (String) row[3];
            Double vol = bloodByDay.containsKey(d) ? bloodByDay.get(d) : 0.0;

            //NOTE: we are including all QCStates
            vol += (Double) row[2];

            bloodByDay.put(d, vol);
        }

        SelectRowsCommand select1 = new SelectRowsCommand("study", "blood");
        select1.setColumns(Arrays.asList("Id", "date", "quantity", "BloodRemaining/lastWeight", "BloodRemaining/allowableBlood", "BloodRemaining/previousBlood", "BloodRemaining/availableBlood", "BloodRemaining/minDate"));
        Sort sort = new Sort("date");
        sort.setDirection(Sort.Direction.DESCENDING);
        select1.setSorts(Arrays.asList(sort));
        select1.addFilter(new Filter("Id", animalId, Filter.Operator.EQUAL));
        SelectRowsResponse resp1 = select1.execute(getApiHelper().getConnection(), getContainerPath());

        //validate blood draws, which really hits bloodSummary.sql
        for (Map<String, Object> row : resp1.getRows())
        {
            Date rowDate = (Date) row.get("date");

            Calendar minDate = new GregorianCalendar();
            minDate.setTime(DateUtils.truncate(rowDate, Calendar.DATE));
            minDate.add(Calendar.DATE, (-1 * bloodDrawInterval) + 1);

            Date rowMinDate = row.get("BloodRemaining/minDate") instanceof Date ? (Date) row.get("BloodRemaining/minDate") : _df.parse(row.get("BloodRemaining/minDate").toString());
            Assert.assertEquals(minDate.getTime(), rowMinDate);

            Double lastWeight = null;
            for (Date weightDate : weightByDay.keySet())
            {
                if (rowDate.getTime() >= DateUtils.truncate(weightDate, Calendar.DATE).getTime())
                {
                    lastWeight = weightByDay.get(weightDate);
                }
            }

            Assert.assertEquals(lastWeight, row.get("BloodRemaining/lastWeight"));
            Double previousBlood = 0.0;
            for (Date bloodDate : bloodByDay.keySet())
            {
                //we want any draws GTE the min date considered and LTE the row's date
                if (bloodDate.getTime() >= minDate.getTime().getTime() && bloodDate.getTime() <= DateUtils.truncate(rowDate, Calendar.DATE).getTime())
                {
                    previousBlood += bloodByDay.get(bloodDate);
                }
            }
            Assert.assertEquals(previousBlood, row.get("BloodRemaining/previousBlood"));

            Double allowableBlood = lastWeight * bloodPerKg * maxDrawPct;
            Assert.assertEquals(allowableBlood, row.get("BloodRemaining/allowableBlood"));

            Double availableBlood = allowableBlood - previousBlood;
            Assert.assertEquals(availableBlood, row.get("BloodRemaining/availableBlood"));
        }

        //bloodDrawsByDay.sql
        SelectRowsCommand select3 = new SelectRowsCommand("study", "bloodDrawsByDay");
        select3.setColumns(Arrays.asList("Id", "date", "quantity", "dropdate", "blood_draw_interval"));
        select3.setSorts(Arrays.asList(sort));
        select3.addFilter(new Filter("Id", animalId, Filter.Operator.EQUAL));
        SelectRowsResponse resp3 = select3.execute(getApiHelper().getConnection(), getContainerPath());
        for (Map<String, Object> row : resp3.getRows())
        {
            //note: some servers seem to return this as a string?
            Date rowDate = (row.get("date") instanceof Date) ? (Date) row.get("date") : _df.parse(row.get("date").toString());
            Date rowDropDate = (row.get("dropdate") instanceof Date) ? (Date) row.get("dropdate") : _df.parse(row.get("dropdate").toString());

            Calendar dropDate = new GregorianCalendar();
            dropDate.setTime(DateUtils.truncate(rowDate, Calendar.DATE));
            dropDate.add(Calendar.DATE, bloodDrawInterval);
            Assert.assertEquals(dropDate.getTime(), rowDropDate);
            Assert.assertEquals(bloodByDay.get(rowDate), row.get("quantity"));
            Assert.assertEquals(bloodDrawInterval.doubleValue(), row.get("blood_draw_interval"));
        }

        //currentBloodDraws.sql
        SelectRowsCommand select4 = new SelectRowsCommand("study", "currentBloodDraws");
        select4.setColumns(Arrays.asList("Id", "date", "mostRecentWeight", "mostRecentWeightDate", "maxAllowableBlood", "bloodPrevious", "bloodFuture", "allowableFuture", "allowableBlood", "minDate", "maxDate"));
        select4.setSorts(Arrays.asList(sort));
        select4.setQueryParameters(Maps.of("DATE_INTERVAL", bloodDrawInterval.toString()));
        select4.addFilter(new Filter("Id", animalId, Filter.Operator.EQUAL));
        SelectRowsResponse resp4 = select4.execute(getApiHelper().getConnection(), getContainerPath());

        for (Map<String, Object> row : resp4.getRows())
        {
            //note: some servers seem to return this as a string?
            Date rowDate = (row.get("date") instanceof Date) ? (Date) row.get("date") : _df.parse(row.get("date").toString());

            Double lastWeight = null;
            Date lastWeightDate = null;
            for (Date weightDate : weightByDay.keySet())
            {
                if (lastWeightDate == null || weightDate.getTime() >= lastWeightDate.getTime())
                {
                    lastWeightDate = weightDate;
                    lastWeight = weightByDay.get(weightDate);
                }
            }
            Assert.assertEquals(lastWeight, row.get("mostRecentWeight"));
            Assert.assertEquals(lastWeightDate, row.get("mostRecentWeightDate"));

            Double allowableBlood = lastWeight * bloodPerKg * maxDrawPct;
            Assert.assertEquals(allowableBlood, row.get("maxAllowableBlood"));

            Double previousBlood = 0.0;
            Double futureBlood = 0.0;
            Calendar minDate = new GregorianCalendar();
            minDate.setTime(DateUtils.truncate(rowDate, Calendar.DATE));
            minDate.add(Calendar.DATE, -1 * bloodDrawInterval);
            Assert.assertEquals(minDate.getTime(), row.get("minDate"));

            Calendar maxDate = new GregorianCalendar();
            maxDate.setTime(DateUtils.truncate(rowDate, Calendar.DATE));
            maxDate.add(Calendar.DATE, bloodDrawInterval);
            Assert.assertEquals(maxDate.getTime(), row.get("maxDate"));

            for (Date bloodDate : bloodByDay.keySet())
            {
                //we want any draws GTE the min date considered and LTE the row's date
                if (bloodDate.getTime() > minDate.getTime().getTime() && bloodDate.getTime() <= DateUtils.truncate(rowDate, Calendar.DATE).getTime())
                {
                    previousBlood += bloodByDay.get(bloodDate);
                }

                if (bloodDate.getTime() < maxDate.getTime().getTime() && bloodDate.getTime() >= DateUtils.truncate(rowDate, Calendar.DATE).getTime())
                {
                    futureBlood += bloodByDay.get(bloodDate);
                }
            }
            Assert.assertEquals(previousBlood, row.get("bloodPrevious"));
            Assert.assertEquals(futureBlood, row.get("bloodFuture"));

            Assert.assertEquals((allowableBlood - previousBlood), row.get("allowableBlood"));
            Assert.assertEquals((allowableBlood - futureBlood), row.get("allowableFuture"));
        }

        //demographicsBloodSummary.sql
        SelectRowsCommand select5 = new SelectRowsCommand("study", "demographicsBloodSummary");
        select5.setColumns(Arrays.asList("Id", "mostRecentWeight", "mostRecentWeightDate", "availBlood", "bloodPrevious", "bloodFuture"));
        select5.addFilter(new Filter("Id", animalId, Filter.Operator.EQUAL));
        SelectRowsResponse resp5 = select5.execute(getApiHelper().getConnection(), getContainerPath());

        List<Date> dates = new ArrayList<>(weightByDay.keySet());
        Collections.sort(dates);
        Date mostRecentWeightDate = dates.get(dates.size() - 1);
        Double mostRecentWeight = weightByDay.get(mostRecentWeightDate);
        Double allowableBlood = mostRecentWeight * bloodPerKg * maxDrawPct;
        for (Map<String, Object> row : resp5.getRows())
        {
            Assert.assertEquals(mostRecentWeight, row.get("mostRecentWeight"));
            Assert.assertEquals(DateUtils.truncate(mostRecentWeightDate, Calendar.DATE), row.get("mostRecentWeightDate"));

            Calendar minDate = new GregorianCalendar();
            minDate.setTime(DateUtils.truncate(new Date(), Calendar.DATE));
            minDate.add(Calendar.DATE, -1 * bloodDrawInterval);

            Calendar maxDate = new GregorianCalendar();
            maxDate.setTime(DateUtils.truncate(new Date(), Calendar.DATE));
            maxDate.add(Calendar.DATE, bloodDrawInterval);

            Double previousBlood = 0.0;
            Double futureBlood = 0.0;
            for (Date bloodDate : bloodByDay.keySet())
            {
                if (bloodDate.getTime() <= (new Date()).getTime() && bloodDate.getTime() >= minDate.getTime().getTime())
                {
                    previousBlood += bloodByDay.get(bloodDate);
                }

                if (bloodDate.getTime() > (new Date()).getTime() && bloodDate.getTime() < maxDate.getTime().getTime())
                {
                    futureBlood += bloodByDay.get(bloodDate);
                }
            }
            Assert.assertEquals(previousBlood, row.get("bloodPrevious"));
            Assert.assertEquals(futureBlood, row.get("bloodFuture"));

            Double availableBlood = allowableBlood - previousBlood;
            Assert.assertEquals(availableBlood, row.get("availBlood"));
        }

        log("checking validation errors");

        //request that will exceed allowable
        String[] bloodFields = new String[]{"Id", "date", "quantity", "QCStateLabel", "objectid", "_recordid"};
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "blood", bloodFields, new Object[][]{
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval, 1), 73, EHRQCState.REQUEST_PENDING.label, generateGUID(), "recordID"}
        }, Maps.of(
                "quantity", Arrays.asList("ERROR: Blood volume of 73.0 (93.0 over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)"),
                "num_tubes", Arrays.asList("ERROR: Blood volume of 73.0 (93.0 over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)")
        ), Maps.of("targetQC", null));

        //2 requests that will exceed the volume together
        Double amount = 40.0;
        Double warn1 = 20.0 + amount;
        Double warn2 = 20.0 + amount + amount;
        List<String> expectedErrors = new ArrayList<>();
        expectedErrors.add("ERROR: Blood volume of 40.0 (" + warn2 + " over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)");
        if (warn1 > allowableBlood)
        {
            expectedErrors.add("ERROR: Blood volume of 40.0 (" + warn1 + " over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)");
        }

        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "blood", bloodFields, new Object[][]{
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval, 1), amount, EHRQCState.REQUEST_PENDING.label, generateGUID(), "recordID"},
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval, 1), amount, EHRQCState.REQUEST_PENDING.label, generateGUID(), "recordID2"}
        }, Maps.of(
                "quantity", expectedErrors,
                "num_tubes", expectedErrors
        ), Maps.of("targetQC", null));

        //use different date, which triggers different weight
        Map<String, Object> additionalExtraContext = new HashMap<>();
        JSONObject weightInTransaction = new JSONObject();
        Double newWeight = 2.0;
        Double newAllowableBlood = newWeight * bloodPerKg * maxDrawPct;
        weightInTransaction.put(animalId, Arrays.asList(Maps.<String, Object>of("objectid", generateGUID(), "date", prepareDate(startCal.getTime(), bloodDrawInterval, 2), "weight", newWeight)));
        additionalExtraContext.put("weightInTransaction", weightInTransaction.toString());
        additionalExtraContext.put("targetQC", null);

        List<String> expectedErrors2 = new ArrayList<>();
        expectedErrors2.add("ERROR: Blood volume of 40.0 (" + warn2 + " over " + bloodDrawInterval + " days) exceeds the allowable volume of " + newAllowableBlood + " mL (weight: " + newWeight + " kg)");
        if (warn1 > newAllowableBlood)
        {
            expectedErrors2.add("ERROR: Blood volume of 40.0 (" + warn1 + " over " + bloodDrawInterval + " days) exceeds the allowable volume of " + newAllowableBlood + " mL (weight: " + newWeight + " kg)");
        }

        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "blood", bloodFields, new Object[][]{
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval, 1), amount, EHRQCState.REQUEST_PENDING.label, generateGUID(), "recordID"},
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval, 1), amount, EHRQCState.REQUEST_PENDING.label, generateGUID(), "recordID2"}
        }, Maps.of(
                "quantity", expectedErrors2,
                "num_tubes", expectedErrors2
        ), additionalExtraContext);

        // try request right on date borders
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "blood", bloodFields, new Object[][]{
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval * 2, 1), 70.5, EHRQCState.COMPLETED.label, generateGUID(), "recordID"}
        }, Maps.of(
                "quantity", Arrays.asList(
                        "INFO: Blood volume of 70.5 (74.5 over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)"
                ),
                "num_tubes", Arrays.asList(
                        "INFO: Blood volume of 70.5 (74.5 over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)"
                ),
                "date", Arrays.asList("INFO: Date is in the future")
        ), Maps.of("targetQC", null));

        // this should fail
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "blood", bloodFields, new Object[][]{
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval * 2, 1), (allowableBlood - 5), EHRQCState.REQUEST_PENDING.label, generateGUID(), "recordID"}
        }, Collections.emptyMap());

        // advance one day and it should succeed, showing the draw drops off correctly
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "blood", bloodFields, new Object[][]{
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval * 2 + 1, 1), (allowableBlood - 5), EHRQCState.REQUEST_PENDING.label, generateGUID(), "recordID"}
        }, Collections.emptyMap());

        //insert record between two existing records.  this record will itself be valid in either direction over the window; however, it will invalidate the previous draw
        Map<String, Object> newRow = new HashMap<>();
        newRow.put("Id", animalId);
        newRow.put("date", prepareDate(startCal.getTime(), bloodDrawInterval + bloodDrawInterval - 2, 4));
        newRow.put("quantity", 2);
        newRow.put("QCStateLabel", EHRQCState.REQUEST_APPROVED.label);
        newRow.put("objectid", generateGUID());
        newRow.put("recordid", "recordID");

        getApiHelper().insertRow("study", "blood", newRow, false);

        Map<String, Object> newRow2 = new HashMap<>();
        newRow2.put("Id", animalId);
        newRow2.put("date", prepareDate(startCal.getTime(), bloodDrawInterval + bloodDrawInterval + 2, 4));
        newRow2.put("quantity", 6);
        newRow2.put("QCStateLabel", EHRQCState.REQUEST_APPROVED.label);
        newRow2.put("objectid", generateGUID());
        newRow2.put("recordid", "recordID");

        getApiHelper().insertRow("study", "blood", newRow2, false);
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "blood", bloodFields, new Object[][]{
                {animalId, prepareDate(startCal.getTime(), bloodDrawInterval + bloodDrawInterval, 4), 62.0, EHRQCState.REQUEST_APPROVED.label, generateGUID(), "recordID"}
        }, Maps.of(
                "quantity", Arrays.asList(
                        "ERROR: Blood volume of 62.0 (74.0 over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)"
                ),
                "num_tubes", Arrays.asList(
                        "ERROR: Blood volume of 62.0 (74.0 over " + bloodDrawInterval + " days) exceeds the allowable volume of " + allowableBlood + " mL (weight: " + mostRecentWeight + " kg)"
                )
        ), Maps.of("targetQC", null));
    }

    @Test
    public void testAssignmentApi() throws Exception
    {
        goToProjectHome();

        String[][] CONDITION_FLAGS = new String[][]{
                {"Nonrestricted", "201"},
                {"Protocol Restricted", "202"},
                {"Surgically Restricted", "203"}
        };

        final Map<String, String> flagMap = new HashMap<>();
        for (String[] row : CONDITION_FLAGS)
        {
            flagMap.put(row[0], ensureFlagExists("Condition", row[0], row[1]));
        }

        //pre-clean
        getApiHelper().deleteAllRecords("study", "flags", new Filter("Id", SUBJECTS[1], Filter.Operator.EQUAL));

        //create project
        String protocolTitle = generateGUID();
        InsertRowsCommand protocolCommand = new InsertRowsCommand("ehr", "protocol");
        protocolCommand.addRow(Maps.of("protocol", null, "title", protocolTitle));
        protocolCommand.execute(getApiHelper().getConnection(), getContainerPath());

        SelectRowsCommand protocolSelect = new SelectRowsCommand("ehr", "protocol");
        protocolSelect.addFilter(new Filter("title", protocolTitle));
        final String protocolId = (String)protocolSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRows().get(0).get("protocol");
        Assert.assertNotNull(StringUtils.trimToNull(protocolId));

        InsertRowsCommand projectCommand = new InsertRowsCommand("ehr", "project");
        String projectName = generateGUID();
        projectCommand.addRow(Maps.of("project", null, "name", projectName, "protocol", protocolId));
        projectCommand.execute(getApiHelper().getConnection(), getContainerPath());

        SelectRowsCommand projectSelect = new SelectRowsCommand("ehr", "project");
        projectSelect.addFilter(new Filter("protocol", protocolId));
        final Integer projectId = (Integer)projectSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRows().get(0).get("project");

        InsertRowsCommand protocolCountsCommand = new InsertRowsCommand("ehr", "protocol_counts");
        protocolCountsCommand.addRow(new HashMap<String, Object>(){
            {
                put("protocol", protocolId);
                put("species", "Cynomolgus");
                put("allowed", 2);
                put("start", prepareDate(new Date(), -10, 0));
                put("end", prepareDate(new Date(), 370, 0));
            }});
        protocolCountsCommand.execute(getApiHelper().getConnection(), getContainerPath());

        //create assignment
        InsertRowsCommand assignmentCommand = new InsertRowsCommand("study", "assignment");
        assignmentCommand.addRow(new HashMap<String, Object>(){
        {
            put("Id", SUBJECTS[1]);
            put("date", prepareDate(new Date(), -10, 0));
            put("objectid", generateGUID());
            put("assignCondition", 202); //Protocol Restricted
            put("projectedReleaseCondition", 203); //Surgically Restricted
            put("project", projectId);
        }});
        assignmentCommand.execute(getApiHelper().getConnection(), getContainerPath());

        //setting of enddatefinalized, datefinalized
        SelectRowsCommand assignmentSelect1 = new SelectRowsCommand("study", "assignment");
        assignmentSelect1.addFilter(new Filter("Id", SUBJECTS[1]));
        assignmentSelect1.addFilter(new Filter("project", projectId));
        assignmentSelect1.setColumns(Arrays.asList("Id", "lsid", "datefinalized", "enddatefinalized"));
        SelectRowsResponse assignmentResponse1 = assignmentSelect1.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertNotNull(assignmentResponse1.getRows().get(0).get("datefinalized"));
        Assert.assertNull(assignmentResponse1.getRows().get(0).get("enddatefinalized"));
        final String assignmentLsid1 = (String)assignmentResponse1.getRows().get(0).get("lsid");

        //expect animal condition to change
        SelectRowsCommand conditionSelect1 = new SelectRowsCommand("study", "flags");
        conditionSelect1.addFilter(new Filter("Id", SUBJECTS[1]));
        conditionSelect1.addFilter(new Filter("flag/category", "Condition"));
        conditionSelect1.addFilter(new Filter("isActive", true));
        SelectRowsResponse conditionResponse1 = conditionSelect1.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertEquals(1, conditionResponse1.getRowCount().intValue());
        Assert.assertEquals("Protocol Restricted", conditionResponse1.getRows().get(0).get("flag/value"));

        //terminate, expect animal condition to change based on release condition
        UpdateRowsCommand assignmentUpdateCommand = new UpdateRowsCommand("study", "assignment");
        assignmentUpdateCommand.addRow(new HashMap<String, Object>(){
            {
                put("lsid", assignmentLsid1);
                put("enddate", prepareDate(new Date(), -5, 0));
                put("releaseCondition", 203); //Surgically Restricted
            }});
        assignmentUpdateCommand.execute(getApiHelper().getConnection(), getContainerPath());

        SelectRowsCommand conditionSelect2 = new SelectRowsCommand("study", "flags");
        conditionSelect2.addFilter(new Filter("Id", SUBJECTS[1]));
        conditionSelect2.addFilter(new Filter("flag/category", "Condition"));
        conditionSelect2.addFilter(new Filter("isActive", true));
        SelectRowsResponse conditionResponse2 = conditionSelect2.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertEquals(1, conditionResponse2.getRowCount().intValue());
        Assert.assertEquals("Surgically Restricted", conditionResponse2.getRows().get(0).get("flag/value"));

        //make sure other flag terminated on correct date
        SelectRowsCommand conditionSelect3 = new SelectRowsCommand("study", "flags");
        conditionSelect3.addFilter(new Filter("Id", SUBJECTS[1]));
        conditionSelect3.addFilter(new Filter("flag", flagMap.get("Protocol Restricted")));
        conditionSelect3.addFilter(new Filter("enddate", prepareDate(new Date(), -5, 0), Filter.Operator.DATE_EQUAL));
        SelectRowsResponse conditionResponse3 = conditionSelect3.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertEquals(1, conditionResponse3.getRowCount().intValue());

        //setting of enddatefinalized, datefinalized
        SelectRowsCommand assignmentSelect2 = new SelectRowsCommand("study", "assignment");
        assignmentSelect2.addFilter(new Filter("Id", SUBJECTS[1]));
        assignmentSelect2.addFilter(new Filter("project", projectId));
        assignmentSelect2.setColumns(Arrays.asList("Id", "lsid", "datefinalized", "enddatefinalized"));
        SelectRowsResponse assignmentResponse2 = assignmentSelect2.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertNotNull(assignmentResponse2.getRows().get(0).get("datefinalized"));
        Assert.assertNotNull(assignmentResponse2.getRows().get(0).get("enddatefinalized"));

        // insert second animal, should succeed
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "assignment", new String[]{"Id", "date", "enddate", "project", "_recordId"}, new Object[][]{
                {SUBJECTS[3], prepareDate(new Date(), 10, 0), null, projectId, "recordID"}
        }, Collections.emptyMap());

        // try 2, should fail
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "assignment", new String[]{"Id", "date", "enddate", "project", "_recordId"}, new Object[][]{
                {SUBJECTS[3], prepareDate(new Date(), 10, 0), null, projectId, "recordID"},
                {SUBJECTS[4], prepareDate(new Date(), 10, 0), null, projectId, "recordID"}
        }, Maps.of(
                "project", Arrays.asList(
                        "INFO: There are not enough spaces on protocol: " + protocolId + ". Allowed: 2, used: 3"
                )
        ));

        // add assignmentsInTransaction, should fail
        Map<String, Object> additionalExtraContext = new HashMap<>();
        JSONArray assignmentsInTransaction = new JSONArray();
        assignmentsInTransaction.put(Maps.of(
                "Id", SUBJECTS[4],
                "objectid", generateGUID(),
                "date", _df.format(new Date()),
                "enddate", null,
                "project", projectId
        ));
        additionalExtraContext.put("assignmentsInTransaction", assignmentsInTransaction.toString());

        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "assignment", new String[]{"Id", "date", "enddate", "project", "_recordId"}, new Object[][]{
                {SUBJECTS[3], prepareDate(new Date(), 10, 0), null, projectId, "recordID"}
        }, Maps.of(
                "project", Arrays.asList(
                        "INFO: There are not enough spaces on protocol: " + protocolId + ". Allowed: 2, used: 3"
                )
        ), additionalExtraContext);
    }

    @Test
    public void testAnimalGroupsApi() throws Exception
    {
        goToProjectHome();

        int group1 = getOrCreateGroup("Group1");
        int group2 = getOrCreateGroup("Group2");

        ensureGroupMember(group1, MORE_ANIMAL_IDS[2]);

        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "animal_group_members", new String[]{"Id", "date", "groupId", "_recordId"}, new Object[][]{
                {MORE_ANIMAL_IDS[2], new Date(), group2, "recordID"}
        }, Maps.of(
                "groupId", Arrays.asList(
                        "INFO: Actively assigned to other groups: Group1"
                )
        ));
    }

    @Test
    public void testProjectProtocolApi() throws Exception
    {
        goToProjectHome();

        //auto-assignment of IDs
        String protocolTitle = generateGUID();
        InsertRowsCommand protocolCommand = new InsertRowsCommand("ehr", "protocol");
        protocolCommand.addRow(Maps.of("protocol", null, "title", protocolTitle));
        protocolCommand.execute(getApiHelper().getConnection(), getContainerPath());

        SelectRowsCommand protocolSelect = new SelectRowsCommand("ehr", "protocol");
        protocolSelect.addFilter(new Filter("title", protocolTitle));
        String protocolId = (String)protocolSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRows().get(0).get("protocol");
        Assert.assertNotNull(StringUtils.trimToNull(protocolId));

        InsertRowsCommand projectCommand = new InsertRowsCommand("ehr", "project");
        String projectName = generateGUID();
        projectCommand.addRow(Maps.of("project", null, "name", projectName, "protocol", protocolId));
        projectCommand.execute(getApiHelper().getConnection(), getContainerPath());

        SelectRowsCommand projectSelect = new SelectRowsCommand("ehr", "project");
        projectSelect.addFilter(new Filter("protocol", protocolId));
        Integer projectId = (Integer)projectSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRows().get(0).get("project");
        Assert.assertNotNull(projectId);

        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "ehr", "project", new String[]{"project", "name"}, new Object[][]{
                {null, projectName}
        }, Maps.of(
                "name", Arrays.asList(
                        "ERROR: There is already a project with the name: " + projectName
                )
        ));
    }

    @Test
    public void testDrugApi()
    {
        goToProjectHome();

        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "drug", new String[]{"Id", "date", "code", "outcome", "remark", "amount", "volume", "QCStateLabel", "objectid", "_recordId"}, new Object[][]{
                {MORE_ANIMAL_IDS[0], new Date(), "code", "Abnormal", null, 1.0, 2.0, EHRQCState.COMPLETED.label, generateGUID(), "recordID"}
        }, Maps.of(
                "remark", Arrays.asList(
                    "WARN: A remark is required if a non-normal outcome is reported"
                )
        ));

        // successful
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "drug", new String[]{"Id", "date", "code", "outcome", "remark", "amount", "volume", "QCStateLabel", "objectid", "_recordId"}, new Object[][]{
                {MORE_ANIMAL_IDS[0], new Date(), "code", "Normal", null, 1.0, 2.0, EHRQCState.COMPLETED.label, generateGUID(), "recordID"}
        }, Collections.emptyMap());


        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "drug", new String[]{"Id", "date", "code", "outcome", "remark", "amount", "volume", "QCStateLabel", "objectid", "_recordId"}, new Object[][]{
                {MORE_ANIMAL_IDS[0], new Date(), null, "Normal", null, 1.0, 2.0, EHRQCState.COMPLETED.label, generateGUID(), "recordID"}
        }, Maps.of(
                "code", Arrays.asList(
                        "WARN: Must enter a treatment"
                )
        ));

        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "drug", new String[]{"Id", "date", "code", "outcome", "remark", "amount", "volume", "QCStateLabel", "objectid", "_recordId"}, new Object[][]{
                {MORE_ANIMAL_IDS[0], new Date(), "code", "Normal", null, null, null, EHRQCState.COMPLETED.label, generateGUID(), "recordID"}
        }, Maps.of(
                "amount", Arrays.asList(
                        "WARN: Must enter an amount or volume"
                ),
                "volume", Arrays.asList(
                        "WARN: Must enter an amount or volume"
                )
        ));

        // ketamine / telazol
        for (String code : Arrays.asList("E-70590", "E-YY928"))
        {
            getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "drug", new String[]{"Id", "date", "code", "outcome", "remark", "amount", "volume", "amount_units", "QCStateLabel", "objectid", "_recordId"}, new Object[][]{
                    {MORE_ANIMAL_IDS[0], new Date(), code, "Normal", null, 1.0, 2.0, "mL", EHRQCState.COMPLETED.label, generateGUID(), "recordID"}
            }, Maps.of(
                    "amount_units", Arrays.asList(
                            "WARN: When entering ketamine or telazol, amount must be in mg"
                    )
            ));

            getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "drug", new String[]{"Id", "date", "code", "outcome", "remark", "amount", "volume", "amount_units", "QCStateLabel", "objectid", "_recordId"}, new Object[][]{
                    {MORE_ANIMAL_IDS[0], new Date(), code, "Normal", null, null, 2.0, "mg", EHRQCState.COMPLETED.label, generateGUID(), "recordID"}
            }, Maps.of(
                    "amount_units", Arrays.asList(
                            "WARN: When entering ketamine or telazol, amount must be in mg"
                    )
            ));
        }
    }

    @Test
    public void testArrivalApi() throws Exception
    {
        goToProjectHome();

        final String arrivalId1 = "Arrival1";
        final String arrivalId2 = "Arrival2";
        final String arrivalId3 = "Arrival3";

        log("deleting existing records");
        cleanRecords(arrivalId1, arrivalId2, arrivalId3);
        String flagId = ensureFlagExists("Surveillance", "Quarantine", null);

        //insert into arrival
        log("Creating Ids");
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(getApiHelper().prepareInsertCommand("study", "arrival", "lsid",
                new String[]{"Id", "Date", "gender", "species", "geographic_origin", "birth", "initialRoom", "initialCage", "QCStateLabel"},
                new Object[][]{
                        {arrivalId1, prepareDate(new Date(), -3, 0), "f", RHESUS, INDIAN, new Date(), ROOMS[0], CAGES[0], EHRQCState.COMPLETED.label}
                }
        )), getExtraContext(), true);

        //expect to find demographics record.
        Assert.assertTrue("demographics row was not created for arrival", getApiHelper().doesRowExist("study", "demographics", new Filter("Id", arrivalId1, Filter.Operator.EQUAL)));

        //validation of housing
        SelectRowsCommand housingSelect = new SelectRowsCommand("study", "housing");
        housingSelect.addFilter(new Filter("Id", arrivalId1));
        housingSelect.addFilter(new Filter("room", ROOMS[0]));
        housingSelect.addFilter(new Filter("cage", CAGES[0]));
        housingSelect.addFilter(new Filter("date", prepareDate(new Date(), -3, 0), Filter.Operator.DATE_EQUAL));
        housingSelect.addFilter(new Filter("enddate", null, Filter.Operator.ISBLANK));
        Assert.assertEquals(1, housingSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRowCount().intValue());

        //add quarantine flag
        SelectRowsCommand flagSelect = new SelectRowsCommand("study", "flags");
        flagSelect.addFilter(new Filter("Id", arrivalId1));
        flagSelect.addFilter(new Filter("flag", flagId));
        flagSelect.addFilter(new Filter("date", prepareDate(new Date(), -3, 0), Filter.Operator.DATE_EQUAL));
        flagSelect.addFilter(new Filter("enddate", null, Filter.Operator.ISBLANK));
        Assert.assertEquals(1, flagSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRowCount().intValue());

        //demographics status
        SelectRowsCommand demographicsSelect = new SelectRowsCommand("study", "demographics");
        demographicsSelect.addFilter(new Filter("Id", arrivalId1));
        demographicsSelect.addFilter(new Filter("Id", arrivalId1));
        demographicsSelect.addFilter(new Filter("calculated_status", "Alive"));
        demographicsSelect.addFilter(new Filter("gender", "f"));
        demographicsSelect.addFilter(new Filter("species", RHESUS));
        demographicsSelect.addFilter(new Filter("geographic_origin", INDIAN));
        Assert.assertEquals(1, demographicsSelect.execute(getApiHelper().getConnection(), getContainerPath()).getRowCount().intValue());
    }

    @Test
    public void testCustomActions() throws Exception
    {
        // make sure we have age class records for these species
        // NOTE: consider populating species table in populateData.html, and switching this test to use ONPRC-style names (ie. RHESUS MACAQUE vs. Rhesus).
        // if doing this, we'd also want to make populateInitialData.html (the core version) populate the wnprc-style names.
        for (String species : new String[]{"Rhesus", "Cynomolgus", "Marmoset"})
        {
            SelectRowsCommand sr1 = new SelectRowsCommand("ehr_lookups", "ageclass");
            sr1.addFilter(new Filter("species", species));
            sr1.addFilter(new Filter("gender", null, Filter.Operator.ISBLANK));
            sr1.addFilter(new Filter("min", 0));

            SelectRowsResponse srr1 = sr1.execute(getApiHelper().getConnection(), getContainerPath());
            if (srr1.getRowCount().intValue() == 0)
            {
                log("creating ehr.ageclass record for: " + species);
                InsertRowsCommand ir1 = new InsertRowsCommand("ehr_lookups", "ageclass");
                ir1.addRow(Maps.of("species", species, "min", 0, "max", 1, "label", "Infant"));
                ir1.execute(getApiHelper().getConnection(), getContainerPath());
            }
        }

        //colony overview
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Colony Overview"));

        //NOTE: depending on the test order and whether demographics records were created, so we test this
        EHRClientAPIHelper apiHelper = new EHRClientAPIHelper(this, getProjectName());
        if (apiHelper.getRowCount("study", "demographics") > 0)
        {
            waitForElement(Locator.tagContainingText("b", "Current Population:"), WAIT_FOR_JAVASCRIPT * 3);
        }
        else
        {
            waitForElement(Locator.tagContainingText("div", "No animals were found"), WAIT_FOR_JAVASCRIPT);
        }

        waitAndClick(Locator.tagContainingText("span", "SPF Colony"));
        waitForElement(Locator.tagContainingText("b", "SPF 9 (ESPF)"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Utilization Summary"));
        waitForElement(Locator.tagContainingText("b", "Colony Utilization"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Housing Summary"));
        //NOTE: depending on test order, there may or may not be housing records created
        waitForElement(Locator.tagContainingText("div", "No buildings were found"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Utilization Summary"));
        if (apiHelper.getRowCount("study", "demographics") > 0)
        {
            waitForElement(Locator.tagContainingText("b", "Colony Utilization:"), WAIT_FOR_JAVASCRIPT * 2);
        }
        else
        {
            waitForElement(Locator.tagContainingText("div", "No records found"), WAIT_FOR_JAVASCRIPT * 2);
        }

        waitAndClick(Locator.tagContainingText("span", "Clinical Case Summary"));
        if (apiHelper.getRowCount("study", "cases") > 0)
        {
            waitForElement(Locator.tagContainingText("i", "Open Cases:"), WAIT_FOR_JAVASCRIPT * 2);
        }
        else
        {
            waitForElement(Locator.tagContainingText("div", "There are no open cases or problems"), WAIT_FOR_JAVASCRIPT * 2);
        }

        //bulk history export
        log("testing bulk history export");
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Bulk History Export"));
        waitForElement(Locator.tagContainingText("label", "Enter Animal Id(s)"));
        Ext4FieldRef.getForLabel(this, "Enter Animal Id(s)").setValue("12345;23432\nABCDE");
        Ext4FieldRef.getForLabel(this, "Show Snapshot Only").setValue(true);
        Ext4FieldRef.getForLabel(this, "Redact Information").setValue(true);
        clickAndWait(Ext4Helper.Locators.ext4Button("Submit"));
        assertElementPresent(Locator.tagContainingText("b", "12345"));
        assertElementPresent(Locator.tagContainingText("b", "23432"));
        assertElementPresent(Locator.tagContainingText("b", "ABCDE"));
        assertElementNotPresent(Locator.tagContainingText("b", "Chronological History").notHidden()); //check hide history
        assertElementNotPresent(Locator.tagContainingText("label", "Projects").notHidden()); //check redaction

        //exposure report
        log("testing exposure export");
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Exposure Report"));
        waitForElement(Locator.tagContainingText("label", "Enter Animal Id"));
        Ext4FieldRef.getForLabel(this, "Enter Animal Id").setValue("12345");
        clickAndWait(Ext4Helper.Locators.ext4Button("Submit"));
        assertElementPresent(Locator.tagContainingText("b", "12345"));
        assertElementPresent(Locator.tagContainingText("b", "Chronological History"));

        //compare lists of animals
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Compare Lists of Animals"));
        waitForElement(Locator.id("unique"));
        setFormElement(Locator.id("unique"), "1,2,1\n3,3;4");
        click(Locator.id("uniqueButton"));
        waitForElement(Locator.id("uniqueInputTotal").withText("6 total"));
        assertElementPresent(Locator.id("uniqueTargetTotal").withText("4 total"));
        Assert.assertEquals("Incorrect text", "1\n2\n3\n4", getDriver().findElement(Locator.id("uniqueTarget").toBy()).getAttribute("value"));

        setFormElement(Locator.id("subtract1"), "1,2,1\n3,3;4");
        setFormElement(Locator.id("subtract2"), "1,4;23 48");
        click(Locator.id("compareButton"));
        waitForElement(Locator.id("subtractList1Total").withText("6 total"));
        assertElementPresent(Locator.id("subtractList2Total").withText("4 total"));

        assertElementPresent(Locator.id("intersectTargetTotal").withText("2 total"));
        Assert.assertEquals("Incorrect text", "1\n4", getDriver().findElement(Locator.id("intersectTarget").toBy()).getAttribute("value"));

        assertElementPresent(Locator.id("subtractTargetTotal").withText("3 total"));
        Assert.assertEquals("Incorrect text", "2\n3\n3", getDriver().findElement(Locator.id("subtractTarget").toBy()).getAttribute("value"));

        assertElementPresent(Locator.id("subtractTargetTotal2").withText("2 total"));
        Assert.assertEquals("Incorrect text", "23\n48", getDriver().findElement(Locator.id("subtractTarget2").toBy()).getAttribute("value"));

        //animal groups
        String groupName = "A TestGroup";
        int groupId = getOrCreateGroup(groupName);
        ensureGroupMember(groupId, MORE_ANIMAL_IDS[0]);
        ensureGroupMember(groupId, MORE_ANIMAL_IDS[1]);

        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Animal Groups"));
        waitForElement(Locator.tagContainingText("span", "Active Groups"));
        DataRegionTable dr = new DataRegionTable("query", this);
        clickAndWait(dr.link(0, dr.getColumn("Name")));
        DataRegionTable membersTable = DataRegionTable.findDataRegionWithin(this, new BodyWebPart(this, "Group Members"));
        Assert.assertEquals(2, membersTable.getDataRowCount());

        //more reports
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "More Reports"));
        waitForElement(Locator.tagContainingText("a", "View Summary of Clinical Tasks"));
    }

    @Test
    public void testPrintableReports()
    {
        // NOTE: these primarily run SSRS, so we will just setup the UI and test whether the URL matches expectations
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Printable Reports"));
        waitForElement(Ext4Helper.Locators.ext4Button("Print Version"));

        //TODO: test JSESSIONID
    }

    @Test
    public void testPedigreeReport() throws Exception
    {
        createBirthRecords();
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Animal History"));
        _helper.waitForCmp("textfield[itemId=subjArea]");
        String id = ID_PREFIX + 1;
        getAnimalHistorySubjField().setValue(id);
        waitAndClick(Ext4Helper.Locators.ext4Tab("Genetics"));
        waitAndClick(Ext4Helper.Locators.ext4Tab("Pedigree Plot"));

        waitForElement(Locator.tagContainingText("span", "Pedigree Plot - " + id), WAIT_FOR_JAVASCRIPT * 3);
        assertTextNotPresent("Error executing command");
        Assert.assertTrue(isTextPresent("Console output"));
    }

    @Test
    public void testLabworkResultEntry() throws Exception
    {
        _helper.goToTaskForm("Lab Results");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Task 1");

        Ext4GridRef panelGrid = _helper.getExt4GridForFormSection("Panels / Services");

        //panel, tissue, type
        String[][] panels = new String[][]{
                {"BASIC Chemistry Panel in-house", "T-0X500", "Biochemistry", "chemistry_tests"},
                {"Anaerobic Culture", null, "Microbiology", null, "T-0X000"},  //NOTE: cultures dont have a default tissue, so we set it using value
                {"CBC with automated differential", "T-0X000", "Hematology", "hematology_tests"},
                {"Antibiotic Sensitivity", null, "Antibiotic Sensitivity", null, "T-0X000"},
                {"Fecal parasite exam", "T-6Y100", "Parasitology", null},
                {"ESPF Surveillance - Monthly", "T-0X500", "Serology/Virology", null},
                {"Urinalysis", "T-7X100", "Urinalysis", "urinalysis_tests"},
                {"Occult Blood", "T-6Y100", "Misc Tests", "misc_tests"}
        };

        int panelIdx = 1;
        for (String[] arr : panels)
        {
            Ext4GridRef panelGrid2 = _helper.getExt4GridForFormSection("Panels / Services");
            Assert.assertEquals(panelGrid.getId(), panelGrid2.getId());

            _helper.addRecordToGrid(panelGrid);
            panelGrid.setGridCell(panelIdx, "Id", MORE_ANIMAL_IDS[(panelIdx % MORE_ANIMAL_IDS.length)]);
            panelGrid.setGridCellJS(panelIdx, "servicerequested", arr[0]);

            if (arr[1] != null && arr.length == 4)
            {
                Assert.assertEquals("Tissue not set properly", arr[1], panelGrid.getFieldValue(panelIdx, "tissue"));
            }
            else if (arr.length > 4)
            {
                //for some panels, tissue will not have a default.  therefore we set one and verify it gets copied into the results downstream
                panelGrid.setGridCellJS(panelIdx, "tissue", arr[4]);
                arr[1] = arr[4];

                Assert.assertEquals("Tissue not set properly", arr[1], panelGrid.getFieldValue(panelIdx, "tissue"));
            }

            Assert.assertEquals("Category not set properly", arr[2], panelGrid.getFieldValue(panelIdx, "type"));

            validatePanelEntry(arr[0], arr[1], arr[2], arr[3], panelIdx == panels.length, panelIdx);

            panelIdx++;
        }


        _helper.discardForm();
    }

    @LogMethod
    public void validatePanelEntry(String panelName, String tissue, String title, String lookupTable, boolean doDeletePanel, int panelRowIdx) throws Exception
    {
        SelectRowsCommand cmd = new SelectRowsCommand("ehr_lookups", "labwork_panels");
        cmd.addFilter(new Filter("servicename", panelName));
        cmd.addSort(new Sort("sort_order"));
        SelectRowsResponse srr = cmd.execute(new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword()), getContainerPath());
        List<Map<String, Object>> expectedRows = srr.getRows();

        waitAndClick(Ext4Helper.Locators.ext4Tab(title));
        Ext4GridRef grid = _helper.getExt4GridForFormSection(title);
        waitForElement(Locator.id(grid.getId()).notHidden());

        grid.clickTbarButton("Copy From Above");
        waitForElement(Ext4Helper.Locators.window("Copy From Above"));
        Ext4CmpRef submitBtn = _ext4Helper.queryOne("button[text='Submit']", Ext4CmpRef.class);
        submitBtn.waitForEnabled();
        click(Ext4Helper.Locators.ext4Button("Submit"));

        if (expectedRows.size() == 0)
        {
            grid.waitForRowCount(1);

            if (tissue != null && grid.isColumnPresent("tissue", true))
            {
                Assert.assertEquals("Tissue was not copied from runs action", tissue, grid.getFieldValue(1, "tissue"));
            }
        }
        else
        {
            grid.waitForRowCount(expectedRows.size());

            int rowIdx = 1;  //1-based
            String testFieldName = null;
            for (Map<String, Object> row : expectedRows)
            {
                testFieldName = (String)row.get("testfieldname");
                String testname = (String)row.get("testname");
                Assert.assertEquals("Wrong testId", testname, grid.getFieldValue(rowIdx, testFieldName));

                String method = (String)row.get("method");
                if (method != null)
                {
                    Assert.assertEquals("Wrong method", method, grid.getFieldValue(rowIdx, "method"));
                }

                if (lookupTable != null)
                {
                    String units = getUnits(lookupTable, testname);
                    if (units != null)
                    {
                        Assert.assertEquals("Wrong units for test: " + testname, units, grid.getFieldValue(rowIdx, "units"));
                    }
                }

                rowIdx++;
            }

            //iterate rows, checking keyboard navigation
            if (testFieldName != null)
            {
                Integer rowCount = grid.getRowCount();

                //TODO: test keyboard navigation
                //grid.startEditing(1, grid.getIndexOfColumn(testFieldName));

                // click through each testId and make sure the value persists.
                // this might not occur if the lookup is invalid
                for (int j = 1; j <= rowCount; j++)
                {
                    log("testing row: " + j);
                    Object origVal = grid.getFieldValue(j, testFieldName);

                    grid.startEditing(j, testFieldName);
                    sleep(50);
                    grid.completeEdit();

                    Object newVal = grid.getFieldValue(j, testFieldName);
                    Assert.assertEquals("Test Id value did not match after key navigation", origVal, newVal);
                }

                //test cascade update + delete
                Ext4GridRef panelGrid = _helper.getExt4GridForFormSection("Panels / Services");
                panelGrid.setGridCell(panelRowIdx, "Id", MORE_ANIMAL_IDS[0]);
                for (int j = 1; j <= rowCount; j++)
                {
                    Assert.assertEquals(MORE_ANIMAL_IDS[0], grid.getFieldValue(j, "Id"));
                }

                if (doDeletePanel)
                {
                    waitAndClick(panelGrid.getRow(panelRowIdx));
                    panelGrid.clickTbarButton("Delete Selected");
                    waitForElement(Ext4Helper.Locators.window("Confirm"));
                    assertTextPresent("along with the " + rowCount + " results associated with them");
                    waitAndClick(Ext4Helper.Locators.window("Confirm").append(Ext4Helper.Locators.ext4Button("Yes")));
                }
                else
                {
                    grid.clickTbarButton("Select All");
                    grid.waitForSelected(grid.getRowCount());
                    grid.clickTbarButton("Delete Selected");
                    waitForElement(Ext4Helper.Locators.window("Confirm"));
                    waitAndClick(Ext4Helper.Locators.ext4Button("Yes"));
                }

                grid.waitForRowCount(0);
                sleep(200);
            }
        }
    }

    private Map<String, Map<String, String>> _unitsMap = new HashMap<>();

    private String getUnits(String queryName, String testId) throws Exception
    {
        if (_unitsMap.containsKey(queryName))
        {
            return _unitsMap.get(queryName).get(testId);
        }

        Map<String, String> queryResults = new HashMap<>();
        SelectRowsCommand cmd = new SelectRowsCommand("ehr_lookups", queryName);
        SelectRowsResponse srr = cmd.execute(new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword()), getContainerPath());
        for (Map<String, Object> row : srr.getRows())
        {
            if (row.get("units") != null)
                queryResults.put((String)row.get("testid"), (String)row.get("units"));
        }

        _unitsMap.put(queryName, queryResults);

        return _unitsMap.get(queryName).get(testId);
    }

    protected void createBirthRecords() throws Exception
    {
        log("creating birth records");

        if (_hasCreatedBirthRecords)
        {
            log("birth records already created, skipping");
            return;
        }

        //note: these should cascade insert into demographics
        EHRClientAPIHelper apiHelper = new EHRClientAPIHelper(this, getProjectName());
        String schema = "study";
        String query = "birth";
        String parentageQuery = "parentage";

        int i = 0;
        Set<String> createdIds = new HashSet<>();
        while (i < 10)
        {
            i++;
            Map<String, Object> row = new HashMap<>();
            row.put("Id", ID_PREFIX + i);
            createdIds.add(ID_PREFIX + i);
            row.put("date", new Date());
            row.put("gender", ((i % 2) == 0 ? "m" : "f"));
            row.put("dam", ID_PREFIX + (i + 100 + "0"));

            apiHelper.deleteIfExists(schema, query, row, "Id");
            apiHelper.insertRow(schema, query, row, false);

            Map<String, Object> parentageRow = new HashMap<>();
            parentageRow.put("Id", ID_PREFIX + i);
            parentageRow.put("date", new Date());
            parentageRow.put("relationship", "Sire");
            parentageRow.put("parent", ID_PREFIX + (i + 100 + "1"));
            parentageRow.put("method", "Genetic");

            //we dont have the LSID, so dont bother deleting the record.  it wont hurt anything to have 2 copies
            apiHelper.insertRow(schema, parentageQuery, parentageRow, false);
        }

        //force caching of demographics on new IDs.
        cacheIds(createdIds);

        _hasCreatedBirthRecords = true;
    }

    @Test
    public void testExamEntry() throws Exception
    {
        _helper.goToTaskForm("Exams/Cases");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Exam 1");

        waitAndClick(_helper.getDataEntryButton("More Actions"));
        click(Ext4Helper.Locators.menuItem("Apply Form Template"));
        waitForElement(Ext4Helper.Locators.window("Apply Template To Form"));
        waitForTextToDisappear("Loading...");
        String templateName1 = "Bone Marrow Biopsy";
        String templateName2 = "Achilles Tendon Repair";
        waitForElement(Ext4Helper.Locators.window("Apply Template To Form").append(Locator.tagContainingText("label", "Choose Template")));
        Ext4ComboRef templateCombo = Ext4ComboRef.getForLabel(this, "Choose Template");
        templateCombo.waitForStoreLoad();
        _ext4Helper.selectComboBoxItem("Choose Template:", Ext4Helper.TextMatchTechnique.CONTAINS, templateName1);
        _ext4Helper.selectComboBoxItem("Choose Template:", Ext4Helper.TextMatchTechnique.CONTAINS, templateName2);

        //these should not be shown
        Assert.assertFalse(Ext4FieldRef.isFieldPresent(this, "Task:"));
        Assert.assertFalse(Ext4FieldRef.isFieldPresent(this, "Animal Details"));

        Ext4ComboRef combo = Ext4ComboRef.getForLabel(this, "SOAP");
        if (!templateName2.equals(combo.getDisplayValue()))
        {
            log("combo value not set initially, retrying");
            combo.setComboByDisplayValue(templateName2);
        }
        sleep(100); //allow field to cascade

        Assert.assertEquals("Section template not set", templateName2, Ext4ComboRef.getForLabel(this, "SOAP").getDisplayValue());
        Assert.assertEquals("Section template not set", "Vitals", Ext4ComboRef.getForLabel(this, "Observations").getDisplayValue());
        String obsTemplate = (String) Ext4ComboRef.getForLabel(this, "Observations").getValue();

        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        waitForElementToDisappear(Ext4Helper.Locators.window("Apply Template To Form"));
        waitFor(() -> "BAR prior to sedation.".equals(_helper.getExt4FieldForFormSection("SOAP", "Subjective").getValue()),
                "Subjective field not set", WAIT_FOR_JAVASCRIPT);

        sleep(100);

        //this is a proxy the 1st record validation happening
        waitForElement(Locator.tagWithText("div", "The form has the following errors and warnings:"));
        sleep(200);
        final Ext4FieldRef idField = _helper.getExt4FieldForFormSection("SOAP", "Id");
        idField.waitForEnabled();
        idField.setValue(MORE_ANIMAL_IDS[0]);

        // NOTE: we have had problems w/ the ID field value not sticking.  i think it might have to do with the timing of server-side validation,
        //
        for (int i = 0; i < 4; i++)
        {
            sleep(50);
            Assert.assertEquals("Id field not set on try: " + i, MORE_ANIMAL_IDS[0], idField.getValue());
        }

        //observations section
        waitAndClick(Ext4Helper.Locators.ext4Tab("Observations"));
        Ext4GridRef observationsGrid = _helper.getExt4GridForFormSection("Observations");
        SelectRowsCommand cmd = new SelectRowsCommand("ehr", "formtemplaterecords");
        cmd.addFilter(new Filter("templateid", obsTemplate));
        cmd.addSort(new Sort("rowid"));
        SelectRowsResponse srr = cmd.execute(new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword()), getContainerPath());

        int expectedObsRows = srr.getRowCount().intValue();
        observationsGrid.waitForRowCount(expectedObsRows);
        Assert.assertEquals("Incorrect row count", expectedObsRows, observationsGrid.getRowCount());
        for (int i=0;i<expectedObsRows;i++)
        {
            Assert.assertEquals("Id not copied properly", MORE_ANIMAL_IDS[0], observationsGrid.getFieldValue(1 + i, "Id"));

            Assert.assertEquals("formSort not set properly on row: " + i, new Long(i + 1), observationsGrid.getFnEval("return this.store.getAt(arguments[0]).get('formSort');", i));
        }

        int i = 1;
        for (Map<String, Object> row : srr.getRows())
        {
            JSONObject json = new JSONObject((String)row.get("json"));
            Assert.assertEquals(json.getString("category"), observationsGrid.getFieldValue(i, "category"));
            i++;
        }

        //weight section
        waitAndClick(Ext4Helper.Locators.ext4Tab("Weights"));
        Ext4GridRef weightGrid = _helper.getExt4GridForFormSection("Weights");
        Assert.assertEquals("Incorrect row count", 0, weightGrid.getRowCount());
        _helper.addRecordToGrid(weightGrid);
        Assert.assertEquals("Id not copied property", MORE_ANIMAL_IDS[0], weightGrid.getFieldValue(1, "Id"));
        Double weight = 5.3;
        weightGrid.setGridCell(1, "weight", weight.toString());

        //procedures section
        waitAndClick(Ext4Helper.Locators.ext4Tab("Procedures"));
        Ext4GridRef proceduresGrid = _helper.getExt4GridForFormSection("Procedures");
        Assert.assertEquals("Incorrect row count", 0, proceduresGrid.getRowCount());
        _helper.addRecordToGrid(proceduresGrid);
        Assert.assertEquals("Id not copied property", MORE_ANIMAL_IDS[0], proceduresGrid.getFieldValue(1, "Id"));

        //medications section
        waitAndClick(Ext4Helper.Locators.ext4Tab("Medications"));
        Ext4GridRef drugGrid = _helper.getExt4GridForFormSection("Medications/Treatments Given");
        Assert.assertEquals("Incorrect row count", 7, drugGrid.getRowCount());

        Assert.assertEquals(drugGrid.getFieldValue(1, "code"), "E-721X0");
        Assert.assertEquals(drugGrid.getFieldValue(1, "route"), "IM");
        Assert.assertEquals(drugGrid.getFieldValue(1, "dosage"), 25L);

        //verify formulary used
        drugGrid.setGridCellJS(1, "code", "E-YY035");
        Assert.assertEquals("Formulary not applied", "PO", drugGrid.getFieldValue(1, "route"));
        Assert.assertEquals("Formulary not applied", 8L, drugGrid.getFieldValue(1, "dosage"));
        Assert.assertEquals("Formulary not applied", "mg", drugGrid.getFieldValue(1, "amount_units"));

        Ext4GridRef ordersGrid = _helper.getExt4GridForFormSection("Medication/Treatment Orders");
        Assert.assertEquals("Incorrect row count", 3, ordersGrid.getRowCount());
        Assert.assertEquals("E-YY732", ordersGrid.getFieldValue(3, "code"));   //tramadol
        Assert.assertEquals("PO", ordersGrid.getFieldValue(3, "route"));
        Assert.assertEquals(50L, ordersGrid.getFieldValue(3, "concentration"));
        Assert.assertEquals("mg/tablet", ordersGrid.getFieldValue(3, "conc_units"));
        Assert.assertEquals(3L, ordersGrid.getFieldValue(3, "dosage"));
        Assert.assertEquals("mg/kg", ordersGrid.getFieldValue(3, "dosage_units"));

        //note: amount calculation testing handled in surgery test

        //blood draws
        waitAndClick(Ext4Helper.Locators.ext4Tab("Blood Draws"));
        Ext4GridRef bloodGrid = _helper.getExt4GridForFormSection("Blood Draws");
        Assert.assertEquals("Incorrect row count", 0, bloodGrid.getRowCount());
        bloodGrid.clickTbarButton("Templates");
        waitAndClick(Ext4Helper.Locators.menuItem("Apply Template").notHidden());
        waitForElement(Ext4Helper.Locators.window("Apply Template"));
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

        Date date = DateUtils.truncate(new Date(), Calendar.DATE);
        Date date2 = DateUtils.addDays(date, 1);

        _helper.applyTemplate(bloodGrid, "CBC and Chem", false, date);
        bloodGrid.waitForRowCount(2);

        _helper.applyTemplate(bloodGrid, "CBC and Chem", true, date2);
        _helper.toggleBulkEditField("Remark");
        String remark = "The Remark";
        Ext4FieldRef.getForLabel(this, "Remark").setValue(remark);
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        bloodGrid.waitForRowCount(4);

        Assert.assertEquals(bloodGrid.getDateFieldValue(1, "date"), date);
        Assert.assertEquals(bloodGrid.getDateFieldValue(2, "date"), date);
        Assert.assertEquals(bloodGrid.getDateFieldValue(3, "date"), date2);
        Assert.assertEquals(bloodGrid.getDateFieldValue(4, "date"), date2);

        Assert.assertEquals(bloodGrid.getFieldValue(3, "remark"), remark);
        Assert.assertEquals(bloodGrid.getFieldValue(4, "remark"), remark);

        waitAndClickAndWait(_helper.getDataEntryButton("Save & Close"));
        waitForElement(Locator.tagWithText("span", "Enter Data"));
    }

    @Test
    public void testWeightEntry() throws Exception
    {
        _helper.goToTaskForm("Weights");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Weight 1");

        Ext4GridRef weightGrid = _helper.getExt4GridForFormSection("Weights");
        weightGrid.clickTbarButton("Add Batch");
        waitForElement(Ext4Helper.Locators.window("Choose Animals"));
        Ext4FieldRef.getForLabel(this, "Id(s)").setValue(StringUtils.join(MORE_ANIMAL_IDS, ";"));
        waitAndClick(Ext4Helper.Locators.window("Choose Animals").append(Ext4Helper.Locators.ext4Button("Submit")));
        Assert.assertEquals(weightGrid.getRowCount(), MORE_ANIMAL_IDS.length);

        weightGrid.clickTbarButton("Add Batch");
        waitForElement(Ext4Helper.Locators.window("Choose Animals"));
        Ext4FieldRef.getForLabel(this, "Id(s)").setValue(StringUtils.join(MORE_ANIMAL_IDS, ";"));
        Ext4FieldRef.getForLabel(this, "Bulk Edit Values").setChecked(true);
        waitAndClick(Ext4Helper.Locators.window("Choose Animals").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElement(Ext4Helper.Locators.window("Bulk Edit"));
        _helper.toggleBulkEditField("Weight (kg)");
        double weight = 4.0;
        Ext4FieldRef.getForLabel(this, "Weight (kg)").setValue(weight);
        waitAndClick(Ext4Helper.Locators.window("Bulk Edit").append(Ext4Helper.Locators.ext4Button("Submit")));
        Assert.assertEquals(weightGrid.getRowCount(), MORE_ANIMAL_IDS.length * 2);

        //verify IDs added in correct order
        for (int i=0;i<MORE_ANIMAL_IDS.length;i++)
        {
            Assert.assertEquals(weightGrid.getFieldValue(i + 1, "Id"), MORE_ANIMAL_IDS[i]);
            Assert.assertEquals(weightGrid.getFieldValue(MORE_ANIMAL_IDS.length + i + 1, "Id"), MORE_ANIMAL_IDS[i]);
        }

        Assert.assertEquals(weight, Double.parseDouble(weightGrid.getFieldValue(MORE_ANIMAL_IDS.length + 1, "weight").toString()), (weight / 10e6));

        //TB section
        Ext4GridRef tbGrid = _helper.getExt4GridForFormSection("TB Tests");
        tbGrid.clickTbarButton("Copy From Section");
        waitAndClick(Ext4Helper.Locators.menuItem("Weights"));
        waitForElement(Ext4Helper.Locators.window("Copy From Weights"));
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        Assert.assertEquals(tbGrid.getRowCount(), MORE_ANIMAL_IDS.length);

        //sedations
        Ext4GridRef drugGrid = _helper.getExt4GridForFormSection("Medications/Treatments Given");
        drugGrid.clickTbarButton("Add Sedation(s)");
        waitAndClick(Ext4Helper.Locators.menuItem("Copy Ids From: Weights"));
        waitForElement(Ext4Helper.Locators.window("Add Sedations"));
        Ext4FieldRef.getForLabel(this, "Lot # (optional)").setValue("Lot");
        Ext4CmpRef.waitForComponent(this, "field[fieldName='weight']");
        waitForElement(Ext4Helper.Locators.window("Add Sedations").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[4])));

        //set weights
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='weight']", Ext4FieldRef.class))
        {
            field.setValue(4.1);
        }

        //verify dosage
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='dosage']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)10.0, field.getDoubleValue());
        }

        //verify amount
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)40.0, field.getDoubleValue());
        }

        //modify rounding + dosage
        Ext4FieldRef dosageField = Ext4FieldRef.getForLabel(this, "Reset Dosage");
        dosageField.setValue(23);
        dosageField.eval("onTriggerClick()");
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='dosage']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)23.0, field.getDoubleValue());
        }

        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)95.0, field.getDoubleValue());
        }

        Ext4FieldRef roundingField = Ext4FieldRef.getForLabel(this, "Round To Nearest");
        roundingField.setValue(0.5);
        roundingField.eval("onTriggerClick()");
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRef.class))
        {
            Assert.assertEquals(94.5, (Object)field.getDoubleValue());
        }

        //deselect the first row
        _ext4Helper.queryOne("field[fieldName='exclude']", Ext4FieldRef.class).setChecked(true);

        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));

        int expectedRecords = MORE_ANIMAL_IDS.length - 1;
        Assert.assertEquals(drugGrid.getRowCount(), expectedRecords);

        for (int i=0;i<expectedRecords;i++)
        {
            Assert.assertEquals(drugGrid.getFieldValue(i + 1, "lot"), "Lot");
            Assert.assertEquals(drugGrid.getFieldValue(i+1, "reason"), "Weight");
            Assert.assertEquals(drugGrid.getFieldValue(i + 1, "amount"), 94.5);
        }

        //TB section
        tbGrid.clickTbarButton("Copy From Section");
        waitAndClick(Ext4Helper.Locators.menuItem("Medications/Treatments Given"));
        waitForElement(Ext4Helper.Locators.window("Copy From Medications/Treatments Given"));
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='exclude']", Ext4FieldRef.class))
        {
            Assert.assertEquals(field.getValue(), true);
        }

        //deselect the first row
        _ext4Helper.queryOne("field[fieldName='exclude']", Ext4FieldRef.class).setChecked(false);

        Ext4FieldRef.getForLabel(this, "Bulk Edit Values").setChecked(true);
        waitAndClick(Ext4Helper.Locators.window("Copy From Medications/Treatments Given").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElement(Ext4Helper.Locators.window("Bulk Edit"));
        _helper.toggleBulkEditField("Performed By");
        Ext4FieldRef.getForLabel(this, "Performed By").setValue("me");
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        waitForElementToDisappear(Ext4Helper.Locators.window("Bulk Edit"));

        for (int i=1;i<=5;i++)
        {
            Assert.assertEquals(getDisplayName(), tbGrid.getFieldValue(i, "performedby"));
            i++;
        }
        Assert.assertEquals("me", tbGrid.getFieldValue(6, "performedby"));

        Assert.assertEquals(tbGrid.getRowCount(), MORE_ANIMAL_IDS.length + 1);

        _helper.discardForm();
    }

    @Test
    public void testGeneticsPipeline() throws Exception
    {
        createBirthRecords();
        goToProjectHome();

        //retain pipeline log for debugging
        getArtifactCollector().addArtifactLocation(new File(TestFileUtils.getLabKeyRoot(), getModulePath() + GENETICS_PIPELINE_LOG_PATH),
                pathname -> pathname.getName().endsWith(".log"));

        waitAndClickAndWait(Locator.tagContainingText("a", "EHR Admin Page"));
        waitAndClickAndWait(Locator.tagContainingText("a", "Genetics Calculations"));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("Run Now"));
        waitAndClickAndWait(Locator.lkButton("OK"));
        waitForPipelineJobsToComplete(2, "genetics pipeline", false);
    }

    @Test
    public void testNotifications()
    {
        setupNotificationService();

        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "EHR Admin Page"));
        waitAndClickAndWait(Locator.tagContainingText("a", "Notification Admin"));

        _helper.waitForCmp("field[fieldLabel='Notification User']");

        Locator manageLink = Locator.tagContainingText("a", "Manage Subscribed Users/Groups").index(1);
        waitAndClick(manageLink);
        waitForElement(Ext4Helper.Locators.window("Manage Subscribed Users"));
        Ext4ComboRef.waitForComponent(this, "field[fieldLabel^='Add User Or Group']");
        Ext4ComboRef combo = Ext4ComboRef.getForLabel(this, "Add User Or Group");
        combo.waitForStoreLoad();
        _ext4Helper.selectComboBoxItem(Locator.id(combo.getId()), Ext4Helper.TextMatchTechnique.CONTAINS, DATA_ADMIN.getEmail());
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"));

        Ext4FieldRef.waitForComponent(this, "field[fieldLabel^='Add User Or Group']");
        combo = Ext4ComboRef.getForLabel(this, "Add User Or Group");
        combo.waitForStoreLoad();
        _ext4Helper.selectComboBoxItem(Locator.id(combo.getId()), Ext4Helper.TextMatchTechnique.CONTAINS, BASIC_SUBMITTER.getEmail());
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"), 2);
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

        waitAndClick(manageLink);
        waitForElement(Ext4Helper.Locators.window("Manage Subscribed Users"));
        waitForElement(Locator.tagContainingText("div", DATA_ADMIN.getEmail()));
        waitForElement(Locator.tagContainingText("div", BASIC_SUBMITTER.getEmail()));
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"));
        assertElementPresent(Ext4Helper.Locators.ext4Button("Remove"), 2);
        waitAndClick(Ext4Helper.Locators.ext4Button("Remove").index(0));  //remove admin
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

        waitAndClick(manageLink);
        waitForElement(Ext4Helper.Locators.window("Manage Subscribed Users"));
        waitForElement(Locator.tagContainingText("div", BASIC_SUBMITTER.getEmail()));
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"));
        assertElementPresent(Ext4Helper.Locators.ext4Button("Remove"), 1);
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

        //iterate all notifications and run them.
        log("running all notifications");
        List<String> skippedNotifications = Arrays.asList("ETL Validation Notification");

        int count = getElementCount(Locator.tagContainingText("a", "Run Report In Browser"));
        for (int i = 0; i < count; i++)
        {
            beginAt(getBaseURL() + "/ldk/" + getContainerPath() + "/notificationAdmin.view");
            Locator link = Locator.tagContainingText("a", "Run Report In Browser").index(i);
            Locator label = Locator.tag("div").withClass("ldk-notificationlabel").index(i);
            waitForElement(label);
            String notificationName = label.findElement(getDriver()).getText();
            Assert.assertNotNull(notificationName);
            if (skippedNotifications.contains(notificationName))
            {
                log("skipping notification: " + notificationName);
                continue;
            }

            log("running notification: " + notificationName);
            waitAndClickAndWait(link);
            waitForText("The notification email was last sent on:");
            assertTextNotPresent("not configured");
        }
    }

    @Test
    public void testObservationsGrid()
    {
        _helper.goToTaskForm("Bulk Clinical Entry");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Observations 1");

        Ext4GridRef obsGrid = _helper.getExt4GridForFormSection("Observations");
        _helper.addRecordToGrid(obsGrid);

        // depending on the value set for category, a different editor should appear in the observations field
        obsGrid.setGridCell(1, "Id", MORE_ANIMAL_IDS[0]);
        obsGrid.setGridCell(1, "category", "BCS");

        //first BCS
        Ext4FieldRef editor = obsGrid.getActiveEditor(1, "observation");
        editor.getFnEval("this.expand()");
        Assert.assertEquals("ehr-simplecombo", editor.getFnEval("return this.xtype"));
        waitForElement(Locator.tagContainingText("li", "1.5").notHidden().withClass("x4-boundlist-item"));
        waitForElement(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();

        //then alopecia
        obsGrid.setGridCell(1, "category", "Alopecia Score");
        editor = obsGrid.getActiveEditor(1, "observation");
        editor.getFnEval("this.expand()");
        Assert.assertEquals("ehr-simplecombo", editor.getFnEval("return this.xtype"));
        waitForElement(Locator.tagContainingText("li", "1").notHidden().withClass("x4-boundlist-item"));
        waitForElement(Locator.tagContainingText("li", "4").notHidden().withClass("x4-boundlist-item"));
        assertElementNotPresent(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();

        //then pain score
        obsGrid.setGridCell(1, "category", "Pain Score");
        editor = obsGrid.getActiveEditor(1, "observation");
        Assert.assertEquals("ldk-numberfield", editor.getFnEval("return this.xtype"));
        assertElementNotPresent(Locator.tagContainingText("li", "4").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();
        obsGrid.setGridCell(1, "observation", "10");

        //add new row
        _helper.addRecordToGrid(obsGrid);
        obsGrid.setGridCell(2, "Id", MORE_ANIMAL_IDS[0]);
        obsGrid.setGridCell(2, "category", "BCS");

        //verify BCS working on new row
        editor = obsGrid.getActiveEditor(2, "observation");
        editor.getFnEval("this.expand()");
        Assert.assertEquals("ehr-simplecombo", editor.getFnEval("return this.xtype"));
        waitForElement(Locator.tagContainingText("li", "1.5").notHidden().withClass("x4-boundlist-item"));
        waitForElement(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();

        //now return to original row and make sure editor remembered
        editor = obsGrid.getActiveEditor(1, "observation");
        Assert.assertEquals("ldk-numberfield", editor.getFnEval("return this.xtype"));
        assertElementNotPresent(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();
        Assert.assertEquals("10", obsGrid.getFieldValue(1, "observation"));

        _helper.discardForm();
    }

    @Test
    public void testPathology()
    {
        _helper.goToTaskForm("Necropsy", false);

        //this is a proxy for the page loading and 1st record validation happening
        waitForElement(Locator.tagWithText("div", "The form has the following errors and warnings:"));

        _helper.getExt4FieldForFormSection("Necropsy", "Id").setValue(MORE_ANIMAL_IDS[1]);
        Ext4ComboRef procedureField = new Ext4ComboRef(_helper.getExt4FieldForFormSection("Necropsy", "Procedure").getId(), this);
        procedureField.setComboByDisplayValue("Necropsy & Histopathology Grade 2: Standard");

        Ext4FieldRef.getForLabel(this, "Case Number").clickTrigger();
        waitForElement(Ext4Helper.Locators.window("Create Case Number"));
        Ext4FieldRef.waitForField(this, "Prefix");
        Ext4FieldRef.getForLabel(this, "Year").setValue(2013);
        waitAndClick(Ext4Helper.Locators.window("Create Case Number").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        final String caseNoBase = "2013A00";
        waitFor(() -> Ext4FieldRef.getForLabel(ONPRC_EHRTest.this, "Case Number").getValue().toString().startsWith(caseNoBase),
                "Case Number field was not set", WAIT_FOR_JAVASCRIPT);
        Assert.assertTrue(Ext4FieldRef.getForLabel(this, "Case Number").getValue().toString().startsWith(caseNoBase));
        String caseNo = Ext4FieldRef.getForLabel(this, "Case Number").getValue().toString();

        // apply form template
        waitAndClick(Ext4Helper.Locators.ext4Button("Apply Form Template"));
        waitForElement(Ext4Helper.Locators.window("Apply Template To Form"));
        Ext4FieldRef.waitForField(this, "Diagnoses");
        Ext4ComboRef.getForLabel(this, "Choose Template").setComboByDisplayValue("Necropsy");
        sleep(100);
        Assert.assertEquals("Gross Findings", Ext4ComboRef.getForLabel(this, "Gross Findings").getDisplayValue());
        Assert.assertEquals("Necropsy", Ext4ComboRef.getForLabel(this, "Staff").getDisplayValue());
        waitAndClick(Ext4Helper.Locators.window("Apply Template To Form").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElementToDisappear(Ext4Helper.Locators.window("Apply Template To Form"));

        //staff sections
        _ext4Helper.clickExt4Tab("Staff");
        Ext4GridRef staffGrid = _helper.getExt4GridForFormSection("Staff");
        staffGrid.waitForRowCount(3);

        //check gross findings second, because the above is a more reliable wait
        Assert.assertNotNull(StringUtils.trimToNull((String) _helper.getExt4FieldForFormSection("Gross Findings", "Notes").getValue()));

        //test SNOMED codes
        _ext4Helper.clickExt4Tab("Histologic Findings");
        Ext4GridRef histologyGrid = _helper.getExt4GridForFormSection("Histologic Findings");
        _helper.addRecordToGrid(histologyGrid, "Add Record");
        scrollIntoView(histologyGrid.getCell(1,7), true);
        waitAndClick(histologyGrid.getCell(1, 7));
        waitForElement(Ext4Helper.Locators.window("Manage SNOMED Codes"));
        Ext4ComboRef field = Ext4ComboRef.getForLabel(this, "Add Code");
        field.waitForEnabled();
        field.waitForStoreLoad();

        List<WebElement> visible = new ArrayList<>();
        for (WebElement element : getDriver().findElements(By.id(field.getId() + "-inputEl")))
        {
            if (element.isDisplayed())
            {
                visible.add(element);
            }
        }
        Assert.assertEquals(1, visible.size());

        visible.get(0).sendKeys("ketamine");
        visible.get(0).sendKeys(Keys.ENTER);
        String code1 = "Ketamine injectable (100mg/ml) (E-70590)";
        waitForElement(Locator.tagContainingText("div", code1));

        visible.get(0).sendKeys("heart");
        visible.get(0).sendKeys(Keys.ENTER);
        String code2 = "APEX OF HEART (T-32040)";
        waitForElement(Locator.tagContainingText("div", code2));
        Assert.assertTrue(isTextBefore(code1, code2));

        visible.get(0).sendKeys("disease");
        visible.get(0).sendKeys(Keys.ENTER);
        String code3 = "ALEUTIAN DISEASE (D-03550)";
        waitForElement(Locator.tagContainingText("div", code3));
        Assert.assertTrue(isTextBefore(code2, code3));

        //move first code down
        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedDownArrow]", Ext4CmpRef.class).get(0).getId()));
        waitForElement(Locator.tagContainingText("div", "1: " + code2));
        assertElementPresent(Locator.tagContainingText("div", "2: " + code1));
        assertElementPresent(Locator.tagContainingText("div", "3: " + code3));

        //once more
        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedUpArrow]", Ext4CmpRef.class).get(2).getId()));
        waitForElement(Locator.tagContainingText("div", "3: " + code1));
        assertElementPresent(Locator.tagContainingText("div", "1: " + code2));
        assertElementPresent(Locator.tagContainingText("div", "2: " + code3));

        //this should do nothing
        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedUpArrow]", Ext4CmpRef.class).get(0).getId()));
        waitForElement(Locator.tagContainingText("div", "1: " + code2));
        assertElementPresent(Locator.tagContainingText("div", "2: " + code3));
        assertElementPresent(Locator.tagContainingText("div", "3: " + code1));

        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedDelete]", Ext4CmpRef.class).get(0).getId()));
        assertElementNotPresent(Locator.tagContainingText("div", code2));

        waitAndClick(Ext4Helper.Locators.window("Manage SNOMED Codes").append(Ext4Helper.Locators.ext4Button("Submit")));
        Assert.assertEquals("1<>D-03550;2<>E-70590", histologyGrid.getFieldValue(1, "codesRaw").toString());
        Assert.assertTrue(isTextBefore("1: " + code3, "2: " + code1));

        //enter death
        waitAndClick(Ext4Helper.Locators.ext4ButtonEnabled("Enter/Manage Death"));
        Locator.XPathLocator deathWindow = Ext4Helper.Locators.window("Deaths");
        waitForElement(deathWindow);
        Ext4FieldRef.waitForField(this, "Necropsy Case No");
        waitForElement(deathWindow.append(Locator.tagContainingText("div", MORE_ANIMAL_IDS[1])));  //proxy for record loading
        Ext4ComboRef causeField = _ext4Helper.queryOne("window field[name=cause]", Ext4ComboRef.class);
        causeField.waitForEnabled();
        causeField.waitForStoreLoad();
        causeField.setValue("EUTHANASIA, EXPERIMENTAL");
        Assert.assertEquals(caseNo, _ext4Helper.queryOne("window field[name=necropsy]", Ext4FieldRef.class).getValue());
        waitAndClick(deathWindow.append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        waitForElementToDisappear(deathWindow);
        waitForElementToDisappear(Locator.tagContainingText("div", "Saving Changes...").notHidden());

        waitAndClickAndWait(_helper.getDataEntryButton("Save & Close"));

        //make new necropsy, copy from previous
        _helper.goToTaskForm("Necropsy", false);
        _helper.getExt4FieldForFormSection("Necropsy", "Id").setValue(MORE_ANIMAL_IDS[1]);
        procedureField = new Ext4ComboRef(_helper.getExt4FieldForFormSection("Necropsy", "Procedure").getId(), this);
        procedureField.setComboByDisplayValue("Necropsy & Histopathology Grade 2: Standard");

        waitAndClick(Ext4Helper.Locators.ext4Button("Copy Previous Case"));
        Locator.XPathLocator caseWindow = Ext4Helper.Locators.window("Copy From Previous Case");
        waitForElement(caseWindow);
        Ext4FieldRef.waitForField(this, "Animal Id");
        _ext4Helper.queryOne("window field[fieldLabel=Case No]", Ext4FieldRef.class).setValue(caseNo);
        Ext4FieldRef.getForBoxLabel(this, "Staff").setChecked(true);
        Ext4FieldRef.getForBoxLabel(this, "Notes").setChecked(true);
        Ext4FieldRef.getForBoxLabel(this, "Gross Findings").setChecked(true);
        Ext4FieldRef.getForBoxLabel(this, "Histologic Findings").setChecked(true);
        Ext4FieldRef.getForBoxLabel(this, "Diagnoses").setChecked(true);
        waitAndClick(caseWindow.append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));

        //verify records
        _helper.getExt4GridForFormSection("Staff").waitForRowCount(3);
        _ext4Helper.clickExt4Tab("Histologic Findings");
        Assert.assertEquals(1, _helper.getExt4GridForFormSection("Histologic Findings").getRowCount());
        _ext4Helper.clickExt4Tab("Diagnoses");
        Assert.assertEquals(0, _helper.getExt4GridForFormSection("Diagnoses").getRowCount());
        Assert.assertNotNull(StringUtils.trimToNull((String) _helper.getExt4FieldForFormSection("Gross Findings", "Notes").getValue()));

        _helper.discardForm();
    }

    @Test
    public void testSurgeryForm()
    {
        _helper.goToTaskForm("Surgeries");

        Ext4GridRef proceduresGrid = _helper.getExt4GridForFormSection("Procedures");
        _helper.addRecordToGrid(proceduresGrid);
        proceduresGrid.setGridCell(1, "Id", MORE_ANIMAL_IDS[1]);

        Ext4ComboRef procedureCombo = new Ext4ComboRef(proceduresGrid.getActiveEditor(1, "procedureid"), this);
        procedureCombo.setComboByDisplayValue("Lymph Node and Skin Biopsy - FITC");
        proceduresGrid.completeEdit();
        sleep(100);
        proceduresGrid.setGridCellJS(1, "instructions", "These are my instructions");
        sleep(100);
        proceduresGrid.setGridCellJS(1, "chargetype", "Center Staff");

        waitAndClick(Ext4Helper.Locators.ext4Button("Add Procedure Defaults"));
        waitForElement(Ext4Helper.Locators.window("Add Procedure Defaults"));
        waitForElement(Ext4Helper.Locators.window("Add Procedure Defaults").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[1])));
        waitAndClick(Ext4Helper.Locators.window("Add Procedure Defaults").append(Ext4Helper.Locators.ext4Button("Submit")));

        _ext4Helper.clickExt4Tab("Staff");
        Ext4GridRef staffGrid = _helper.getExt4GridForFormSection("Staff");
        staffGrid.waitForRowCount(1);
        Assert.assertEquals("Surgeon", staffGrid.getFieldValue(1, "role"));

        _ext4Helper.clickExt4Tab("Weight");
        Ext4GridRef weightGrid = _helper.getExt4GridForFormSection("Weight");
        weightGrid.waitForRowCount(1);
        weightGrid.setGridCell(1, "weight", "5");

        _ext4Helper.clickExt4Tab("Medication/Treatment Orders");
        Ext4GridRef treatmentGrid = _helper.getExt4GridForFormSection("Medication/Treatment Orders");
        treatmentGrid.clickTbarButton("Order Post-Op Meds");
        waitForElement(Ext4Helper.Locators.window("Order Post-Op Meds"));
        waitForElement(Ext4Helper.Locators.window("Order Post-Op Meds").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[1])));
        _ext4Helper.queryOne("field[fieldName=analgesiaRx]", Ext4ComboRef.class).waitForStoreLoad();
        _ext4Helper.queryOne("field[fieldName=antibioticRx]", Ext4ComboRef.class).waitForStoreLoad();
        waitAndClick(Ext4Helper.Locators.window("Order Post-Op Meds").append(Ext4Helper.Locators.ext4Button("Submit")));
        treatmentGrid.waitForRowCount(2);
        Assert.assertEquals(0.30, treatmentGrid.getFieldValue(1, "amount"));
        Assert.assertEquals("mg", treatmentGrid.getFieldValue(1, "amount_units"));
        Assert.assertEquals("E-YY792", treatmentGrid.getFieldValue(1, "code"));

        //review amounts window
        treatmentGrid.clickTbarButton("Review Amount(s)");
        waitForElement(Ext4Helper.Locators.window("Review Drug Amounts"));
        waitForElement(Ext4Helper.Locators.window("Review Drug Amounts").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[1])), 2);

        Map<String, Object> expectedVals1 = new HashMap<>();
        expectedVals1.put("weight", 5L);
        expectedVals1.put("concentration", 0.3);
        expectedVals1.put("conc_units", "mg/ml");
        expectedVals1.put("dosage", 0.01);
        expectedVals1.put("dosage_units", "mg/kg");
        expectedVals1.put("volume", 1L);
        expectedVals1.put("vol_units", "mL");
        expectedVals1.put("amount", 0.3);
        expectedVals1.put("amount_units", "mg");
        expectedVals1.put("include", true);

        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("weight", 0, 6L, expectedVals1);
        expectedVals1.put("volume", 0.2);
        expectedVals1.put("amount", 0.06);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("conc_units", 0, "mg/tablet", expectedVals1);
        expectedVals1.put("vol_units", "tablet(s)");
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("dosage_units", 0, "ounces/kg", expectedVals1);
        expectedVals1.put("amount_units", "ounces");
        expectedVals1.put("conc_units", null);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("dosage", 0, 0.02, expectedVals1);
        expectedVals1.put("volume", 0.4);
        expectedVals1.put("amount", 0.12);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("include", 0, false, expectedVals1);
        setDrugAmountField("dosage", 0, 0.01, expectedVals1);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("include", 0, true, expectedVals1);

        //now doses tab
        _ext4Helper.clickExt4Tab("Doses Used");
        waitForElement(Locator.tagContainingText("b", "Standard Conc"));
        _ext4Helper.queryOne("field[fieldName=concentration][recordIdx=0][snomedCode]", Ext4FieldRef.class).setValue(0.5);
        _ext4Helper.queryOne("field[fieldName=dosage][recordIdx=0][snomedCode]", Ext4FieldRef.class).setValue(2);
        _ext4Helper.queryOne("field[fieldName=volume_rounding][recordIdx=0][snomedCode]", Ext4FieldRef.class).setValue(0.8);
        click(Locator.id(_ext4Helper.queryOne("button[recordIdx=0][snomedCode]", Ext4FieldRef.class).getId()));
        _ext4Helper.clickExt4Tab("All Rows");
        waitForElement(Locator.tagContainingText("div", "This tab shows one row per drug"));
        expectedVals1.put("concentration", 0.5);
        expectedVals1.put("conc_units", "mg/ml");
        expectedVals1.put("dosage", 2L);
        expectedVals1.put("dosage_units", "mg/kg");
        expectedVals1.put("volume", null);
        expectedVals1.put("vol_units", "mL");
        expectedVals1.put("amount", null);
        expectedVals1.put("amount_units", "mg");
        inspectDrugAmountFields(expectedVals1, 0);

        click(Ext4Helper.Locators.ext4Button("Recalculate All"));
        click(Ext4Helper.Locators.menuItem("Recalculate Both Amount/Volume"));
        expectedVals1.put("volume", 24L);
        expectedVals1.put("amount", 12L);
        inspectDrugAmountFields(expectedVals1, 0);

        //weight tab
        _ext4Helper.clickExt4Tab("Weights Used");
        waitForElement(Locator.tagContainingText("div", "From Form"));
        _ext4Helper.queryOne("field[fieldName=globalWeight][recordIdx=0]", Ext4FieldRef.class).setValue(3);
        waitForElement(Locator.tagContainingText("div", "Custom"));

        _ext4Helper.clickExt4Tab("All Rows");
        waitForElement(Locator.tagContainingText("div", "This tab shows one row per drug"));
        expectedVals1.put("weight", 3L);
        expectedVals1.put("volume", 12L);
        expectedVals1.put("amount", 6L);
        inspectDrugAmountFields(expectedVals1, 0);

        waitAndClick(Ext4Helper.Locators.window("Review Drug Amounts").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElementToDisappear(Ext4Helper.Locators.window("Review Drug Amounts"));

        Assert.assertEquals(12L, treatmentGrid.getFieldValue(1, "volume"));
        Assert.assertEquals(6L, treatmentGrid.getFieldValue(1, "amount"));

        //open cases btn
        waitAndClick(Ext4Helper.Locators.ext4Button("Open Cases"));
        Locator.XPathLocator caseWindow = Ext4Helper.Locators.window("Open Cases");
        waitForElement(caseWindow);
        waitForElement(caseWindow.append(Locator.tagWithText("div", "7"))); //followup days
        waitAndClick(caseWindow.append(Ext4Helper.Locators.ext4ButtonEnabled("Open Selected Cases")));
        waitForElementToDisappear(caseWindow);
        waitForElement(Ext4Helper.Locators.window("Success").append(Locator.tagWithText("div", "Surgical cases opened")));
        waitAndClick(Ext4Helper.Locators.window("Success").append(Ext4Helper.Locators.ext4ButtonEnabled("OK")));

        _helper.discardForm();
    }

    private void inspectDrugAmountFields(Map<String, Object> expectedVals, int rowIdx)
    {
        for (String fieldName : expectedVals.keySet())
        {
            Ext4FieldRef field = _ext4Helper.queryOne("field[fieldName=" +fieldName + "][recordIdx=" + rowIdx + "]", Ext4FieldRef.class);
            Assert.assertEquals("incorrect field value: " + fieldName, expectedVals.get(fieldName), field.getValue());
        }
    }

    private void setDrugAmountField(String fieldName, int rowIdx, Object value, Map<String, Object> expectedVals)
    {
        _ext4Helper.queryOne("field[fieldName=" +fieldName + "][recordIdx=" + rowIdx + "]", Ext4FieldRef.class).setValue(value);
        expectedVals.put(fieldName, value);
    }

    @Test
    public void testBehaviorRounds() throws Exception
    {
        _helper.goToTaskForm("BSU Rounds");

        //create a previous observation for the active case
        SelectRowsCommand select = new SelectRowsCommand("study", "cases");
        select.addFilter(new Filter("Id", SUBJECTS[0], Filter.Operator.EQUAL));
        select.addFilter(new Filter("category", "Behavior", Filter.Operator.EQUAL));
        select.setColumns(Arrays.asList("Id", "objectid"));
        SelectRowsResponse resp = select.execute(getApiHelper().getConnection(), getContainerPath());
        String caseId = (String)resp.getRows().get(0).get("objectid");

        getApiHelper().deleteAllRecords("study", "clinical_observations", new Filter("Id", SUBJECTS[0], Filter.Operator.EQUAL));
        InsertRowsCommand insertRowsCommand = new InsertRowsCommand("study", "clinical_observations");
        Map<String, Object> row = new HashMap<>();
        row.put("Id", SUBJECTS[0]);
        row.put("category", "Alopecia Score");
        row.put("date", prepareDate(new Date(), -4, 0));
        row.put("caseid", caseId);
        row.put("observation", "5");
        row.put("objectid", generateGUID());
        row.put("taskid", generateGUID());  //required for lastestObservationsForCase.sql to work
        insertRowsCommand.addRow(row);
        insertRowsCommand.execute(getApiHelper().getConnection(), getContainerPath());

        Ext4GridRef obsGrid = _helper.getExt4GridForFormSection("Observations");
        obsGrid.clickTbarButton("Add Open Cases");

        Locator.XPathLocator caseWindow = Ext4Helper.Locators.window("Add Open Behavior Cases");
        waitForElement(caseWindow);

        //just load all behavior cases
        waitAndClick(Ext4Helper.Locators.windowButton("Add Open Behavior Cases", "Submit"));
        waitForElementToDisappear(caseWindow);
        obsGrid.waitForRowCount(1);
        Assert.assertEquals("Alopecia Score", obsGrid.getFieldValue(1, "category"));
        Assert.assertEquals(null, obsGrid.getFieldValue(1, "observation"));
        Assert.assertEquals(SUBJECTS[0], obsGrid.getFieldValue(1, "Id"));

        _ext4Helper.clickExt4Tab("Treatments Given");
        waitForElement(Locator.tagWithText("div", "No Charge"));
        Ext4GridRef treatmentsGrid = _ext4Helper.queryOne("panel[title=Treatments Given] ehr-gridpanel", Ext4GridRef.class);
        treatmentsGrid.waitForRowCount(1);
        Assert.assertEquals(SUBJECTS[0], treatmentsGrid.getFieldValue(1, "Id"));
        Assert.assertEquals("No Charge", treatmentsGrid.getFieldValue(1, "chargetype"));

        waitAndClick(Ext4Helper.Locators.ext4Button("Close/Review Cases"));
        Locator.XPathLocator closeCaseWindow = Ext4Helper.Locators.window("Manage Cases");
        waitForElement(closeCaseWindow);
        waitForElement(closeCaseWindow.append(Locator.tagWithText("div", SUBJECTS[0])));

        Ext4FieldRef caseField1 = _ext4Helper.queryOne("window field[fieldName=date]", Ext4FieldRef.class);
        Ext4FieldRef changeField = _ext4Helper.queryOne("#changeAll", Ext4FieldRef.class);
        Ext4CmpRef changeBtn = _ext4Helper.queryOne("button[text=Change All]", Ext4CmpRef.class);
        Date twoWeeks = prepareDate(DateUtils.truncate(new Date(), Calendar.DATE), 14, 0);
        Date fourWeeks = prepareDate(DateUtils.truncate(new Date(), Calendar.DATE), 28, 0);
        Assert.assertEquals(twoWeeks, caseField1.getDateValue());
        Assert.assertEquals(null, changeField.getValue());
        changeField.setValue(_df.format(fourWeeks));
        click(Locator.id(changeBtn.getId()));
        Assert.assertEquals(fourWeeks, caseField1.getDateValue());

        waitAndClick(closeCaseWindow.append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        waitForElementToDisappear(closeCaseWindow);

        _helper.discardForm();
    }
}

