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
package org.labkey.test.util.ehr;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.DeleteRowsCommand;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.UpdateRowsCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.WebTestHelper;
import org.labkey.test.util.PasswordUtil;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class EHRClientAPIHelper
{
    private BaseWebDriverTest _test;
    private String _containerPath;
    public static final String DATE_SUBSTITUTION = "@@CURDATE@@";

    public EHRClientAPIHelper(BaseWebDriverTest test, String containerPath)
    {
        _test = test;
        _containerPath = containerPath;
    }

    public void createdIfNeeded(String schema, String query, Map<String, Object> row, String pkCol) throws Exception
    {
        if (!doesRowExist(schema, query, row, pkCol))
        {
            insertRow(schema, query, row, false);
        }
    }

    public Connection getConnection()
    {
        return new Connection(_test.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());
    }

    public boolean doesRowExist(String schema, String query, Map<String, Object> row, String pkCol) throws CommandException
    {
        return doesRowExist(schema, query, new Filter(pkCol, row.get(pkCol), Filter.Operator.EQUAL));
    }

    public boolean doesRowExist(String schema, String query, Filter filter) throws CommandException
    {
        SelectRowsCommand select = new SelectRowsCommand(schema, query);
        select.addFilter(filter);
        try
        {
            SelectRowsResponse resp = select.execute(getConnection(), _containerPath);

            return resp.getRowCount().intValue() > 0;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public int getRowCount(String schema, String query) throws Exception
    {
        SelectRowsCommand select = new SelectRowsCommand(schema, query);
        SelectRowsResponse resp = select.execute(getConnection(), _containerPath);

        return resp.getRowCount().intValue();
    }

    public SaveRowsResponse insertRow(String schema, String query, Map<String, Object> row, boolean expectFailure) throws CommandException
    {
        try
        {
            InsertRowsCommand insertCmd = new InsertRowsCommand(schema, query);
            insertCmd.addRow(row);
            SaveRowsResponse resp = insertCmd.execute(getConnection(), _containerPath);

            if (expectFailure)
                throw new RuntimeException("Expected command to fail");

            return resp;

        }
        catch (CommandException e)
        {
            if (!expectFailure)
                throw e;
            else
                return null;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public SaveRowsResponse updateRow(String schema, String query, Map<String, Object> row, boolean expectFailure) throws CommandException
    {
        try
        {
            SaveRowsCommand cmd = new UpdateRowsCommand(schema, query);
            cmd.addRow(row);

            SaveRowsResponse resp = cmd.execute(getConnection(), _containerPath);

            if (expectFailure)
                throw new RuntimeException("Expected command to fail");

            return resp;
        }
        catch (CommandException e)
        {
            if (!expectFailure)
                throw e;
            else
                return null;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public void deleteIfExists(String schema, String query, Map<String, Object> row, String pkCol) throws CommandException
    {
        if (doesRowExist(schema, query, row,pkCol))
        {
            deleteRow(schema, query, row, pkCol, false);
        }
    }

    public SaveRowsResponse deleteRow(String schema, String query, Map<String, Object> row, String pkCol, boolean expectFailure) throws CommandException
    {
        try
        {
            DeleteRowsCommand cmd = new DeleteRowsCommand(schema, query);
            cmd.addRow(row);

            SaveRowsResponse resp = cmd.execute(getConnection(), _containerPath);
            if (expectFailure)
                throw new RuntimeException("Expected command to fail");

            return resp;
        }
        catch (CommandException e)
        {
            if (expectFailure)
                return null;
            else throw e;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public JSONObject prepareInsertCommand(String schema, String queryName, String pkName, String[] fieldNames, Object[][] rows)
    {
        return prepareCommand("insertWithKeys", schema, queryName, pkName, fieldNames, rows, null);
    }

    public JSONObject prepareUpdateCommand(String schema, String queryName, String pkName, String[] fieldNames, Object[][] rows, @Nullable Object[][] oldKeys)
    {
        return prepareCommand("updateChangingKeys", schema, queryName, pkName, fieldNames, rows, oldKeys);
    }

    private JSONObject prepareCommand(String command, String schema, String queryName, String pkName, String[] fieldNames, Object[][] rows, @Nullable Object[][] oldKeys)
    {
        try
        {
            JSONObject resp = new JSONObject();
            resp.put("schemaName", schema);
            resp.put("queryName", queryName);
            resp.put("command", command);
            JSONArray jsonRows = new JSONArray();
            int idx = 0;
            for (Object[] row : rows)
            {
                JSONObject oldKeyMap = new JSONObject();
                JSONObject values = new JSONObject();

                int position = 0;
                for (String name : fieldNames)
                {
                    Object v = row[position];

                    //allow mechanism to use current time,
                    if (DATE_SUBSTITUTION.equals(v))
                        v = (new Date()).toString();

                    values.put(name, v);
                    if (pkName.equals(name))
                        oldKeyMap.put(name, v);

                    position++;
                }

                if (oldKeys != null && oldKeys.length > idx)
                {
                    JSONObject obj = new JSONObject();
                    int j = 0;
                    for (String field : fieldNames)
                    {
                        obj.put(field, oldKeys[idx][j]);
                        j++;
                    }
                    oldKeyMap = obj;
                }

                JSONObject ro = new JSONObject();
                ro.put("oldKeys", oldKeyMap);
                ro.put("values", values);
                jsonRows.put(ro);
            }
            resp.put("rows", jsonRows);

            return resp;
        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }

    public String doSaveRows(String email, List<JSONObject> commands, JSONObject extraContext, boolean expectSuccess)
    {
        HttpContext context = WebTestHelper.getBasicHttpContext();
        HttpPost method;
        HttpResponse response = null;
        try (CloseableHttpClient client = (CloseableHttpClient)WebTestHelper.getHttpClient(email, PasswordUtil.getPassword()))
        {
            JSONObject json = new JSONObject();
            json.put("commands", commands);
            json.put("extraContext", extraContext);

            String requestUrl = WebTestHelper.getBaseURL() + "/query/" + _containerPath + "/saveRows.view";
            method = new HttpPost(requestUrl);
            method.addHeader("Content-Type", "application/json");
            method.setEntity(new StringEntity(json.toString(), ContentType.create("application/json", "UTF-8")));

            response = client.execute(method, context);
            int status = response.getStatusLine().getStatusCode();

            _test.log("Expect success: " + expectSuccess + ", actual: " + (HttpStatus.SC_OK == status));

            if (expectSuccess && HttpStatus.SC_OK != status)
            {
                logResponse(response);
                assertEquals("SaveRows request failed unexpectedly with code: " + status, HttpStatus.SC_OK, status);
            }
            else if (!expectSuccess && HttpStatus.SC_BAD_REQUEST != status)
            {
                logResponse(response);
                assertEquals("SaveRows request failed unexpectedly with code: " + status, HttpStatus.SC_BAD_REQUEST, status);
            }

            String responseBody = WebTestHelper.getHttpResponseBody(response);
            EntityUtils.consume(response.getEntity()); // close connection

            return responseBody;
        }
        catch (IOException | JSONException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            if (response != null)
                EntityUtils.consumeQuietly(response.getEntity());
        }
    }

    public Map<String, Object> createHashMap(List<String> fieldNames, Object[] rowValues)
    {
        Map<String, Object> values = new HashMap<>();
        int position = 0;
        for (String name : fieldNames)
        {
            Object v = rowValues[position];

            //allow mechanism to use current time,
            if (DATE_SUBSTITUTION.equals(v))
                v = (new Date()).toString();

            values.put(name, v);

            position++;
        }

        return values;
    }

    private void logResponse(HttpResponse response)
    {
        String responseBody = WebTestHelper.getHttpResponseBody(response);
        try
        {
            JSONObject o = new JSONObject(responseBody);
            if (o.has("exception"))
                _test.log("Expection: " + o.getString("exception"));

            Map<String, List<String>> ret = processResponse(responseBody);
            for (String field : ret.keySet())
            {
                _test.log("Error in field: " + field);
                for (String err : ret.get(field))
                {
                    _test.log(err);
                }
            }
        }
        catch (JSONException e)
        {
            _test.log("Response was not JSON");
            _test.log(responseBody);
        }
    }

    public Map<String, List<String>> processResponse(String response)
    {
        try
        {
            Map<String, List<String>> ret = new HashMap<>();
            JSONObject o = new JSONObject(response);
            if (o.has("errors"))
            {
                JSONArray errors = o.getJSONArray("errors");
                for (int i = 0; i < errors.length(); i++)
                {
                    JSONObject error = errors.getJSONObject(i);
                    JSONArray subErrors = error.getJSONArray("errors");
                    if (subErrors != null)
                    {
                        for (int j = 0; j < subErrors.length(); j++)
                        {
                            JSONObject subError = subErrors.getJSONObject(j);
                            String msg = subError.getString("message");
                            if (!subError.has("field"))
                                throw new RuntimeException(msg);

                            String field = subError.getString("field");
                            String severity = subError.optString("severity");

                            List<String> list = ret.get(field);
                            if (list == null)
                                list = new ArrayList<>();

                            list.add((StringUtils.trimToNull(severity) == null ? "" : severity + ": ") + msg);
                            ret.put(field, list);
                        }
                    }
                }
            }

            //append errors from extraContext
            if (o.has("extraContext") && o.getJSONObject("extraContext").has("skippedErrors"))
            {
                JSONObject errors = o.getJSONObject("extraContext").getJSONObject("skippedErrors");

                for (String key : errors.keySet())
                {
                    JSONArray errorArray = errors.getJSONArray(key);
                    for (int i=0;i<errorArray.length();i++)
                    {
                        JSONObject subError = errorArray.getJSONObject(i);
                        String msg = subError.getString("message");
                        String field = subError.getString("field");
                        String severity = subError.optString("severity");

                        List<String> list = ret.get(field);
                        if (list == null)
                            list = new ArrayList<>();

                        list.add((StringUtils.trimToNull(severity) == null ? "" : severity + ": ") + msg);
                        ret.put(field, list);
                    }
                }
            }

            return ret;
        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }

    public int deleteAllRecords(String schemaName, String queryName, Filter filter) throws Exception
    {
        SelectRowsCommand sr = new SelectRowsCommand(schemaName, queryName);
        sr.addFilter(filter);
        SelectRowsResponse selectRowsResponse = sr.execute(getConnection(), _containerPath);
        String pk = selectRowsResponse.getIdColumn();

        DeleteRowsCommand dr = new DeleteRowsCommand(schemaName, queryName);
        for (Map<String, Object> row : selectRowsResponse.getRows())
        {
            Map<String, Object> r = new HashMap<>();
            r.put(pk, row.get(pk));
            dr.addRow(r);
        }

        if (!dr.getRows().isEmpty())
        {
            SaveRowsResponse resp = dr.execute(getConnection(), _containerPath);
            return resp.getRowsAffected().intValue();
        }

        return 0;
    }

    public String insertData(String email, String schemaName, String queryName, String[] fields, Object[][] data, Map<String, Object> additionalExtraContext)
    {
        _test.log("Inserting data into " + schemaName + "." + queryName);
        try
        {
            JSONObject extraContext = getExtraContext();
            extraContext.put("errorThreshold", "INFO");
            extraContext.put("targetQC", "In Progress");
            if (additionalExtraContext != null)
            {
                for (String key : additionalExtraContext.keySet())
                {
                    extraContext.put(key, additionalExtraContext.get(key));
                }
            }

            JSONObject insertCommand = prepareInsertCommand(schemaName, queryName, "lsid", fields, data);
            return doSaveRows(email, Collections.singletonList(insertCommand), extraContext, true);
        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }

    public void testValidationMessage(String email, String schemaName, String queryName, String[] fields, Object[][] data, Map<String, List<String>> expectedErrors)
    {
        testValidationMessage(email, schemaName, queryName, fields, data, expectedErrors, null);
    }

    public void testValidationMessage(String email, String schemaName, String queryName, String[] fields, Object[][] data, Map<String, List<String>> expectedErrors, Map<String, Object> additionalExtraContext)
    {
        expectedErrors = new HashMap<>(expectedErrors);
        expectedErrors.put("_validateOnly", Collections.singletonList("ERROR: Ignore this error"));
        try
        {
            _test.log("Testing validation for table: " + schemaName + "." + queryName);

            JSONObject extraContext = getExtraContext();
            extraContext.put("errorThreshold", "INFO");
            extraContext.put("validateOnly", true); //a flag to force failure
            extraContext.put("targetQC", "In Progress");
            if (additionalExtraContext != null)
            {
                for (String key : additionalExtraContext.keySet())
                {
                    extraContext.put(key, additionalExtraContext.get(key));
                }
            }

            JSONObject insertCommand = prepareInsertCommand(schemaName, queryName, "lsid", fields, data);
            String response = doSaveRows(email, Collections.singletonList(insertCommand), extraContext, false);
            Map<String, List<String>> errors = processResponse(response);



            //JSONHelper.compareMap()
            assertEquals("Incorrect number of fields have errors.  Fields with errors were: " + errors.keySet().toString(), expectedErrors.keySet().size(), errors.keySet().size());
            for (String field : expectedErrors.keySet())
            {
                assertEquals("No errors found for field: " + field, true, errors.containsKey(field));
                List<String> expectedErrs = expectedErrors.get(field);
                Set<String> errs = new HashSet<>(errors.get(field));

                _test.log("Expected " + expectedErrs.size() + " errors for field " + field);
                assertEquals("Wrong number of errors found for field: " + field + "; " + StringUtils.join(errs, "; "), expectedErrs.size(), errs.size());
                for (String e : expectedErrs)
                {
                    boolean success = errs.remove(e);
                    assertTrue("Error not found for field: " + field + ".  Missing error is: " + e + ".  The errors found were: [" + StringUtils.join(errs, "];[") + "]", success);
                }
                assertEquals("Unexpected error found for field: " + field + ".  They are: " + StringUtils.join(errs, "; "), 0, errs.size());
            }

        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }

    public JSONObject getExtraContext()
    {
        try
        {
            JSONObject extraContext = new JSONObject();
            extraContext.put("errorThreshold", "ERROR");
            extraContext.put("skipIdFormatCheck", true);
            extraContext.put("allowAnyId", true);
            extraContext.put("targetQC", "Completed");
            extraContext.put("isLegacyFormat", true);
            return extraContext;
        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }
}
