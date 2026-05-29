<%
/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
%>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.labkey.api.util.Path" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.wnprc_ehr.notification.PregnancyNotification" %>
<%@ page import="org.labkey.api.util.JsonUtil" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JSONObject params = (JSONObject) getModelBean();
    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    // Define a default when we don't have a value for a field
    String NONE_SPECIFIED = "<em>Not Specified</em>";

    // Grab the Id
    String Id = params.getString(PregnancyNotification.idParamName);
    String objectid = params.getString(PregnancyNotification.objectidsParamName);

    SimplerFilter idFilter = new SimplerFilter("Id", CompareType.EQUAL, Id);
    SimplerFilter objectidFilter = new SimplerFilter("objectid", CompareType.EQUAL, objectid);

    JSONArray demographicsRows = queryFactory.selectRows("study", "demographics", idFilter);

    JSONObject demographicsInfo = demographicsRows.getJSONObject(0);

    //prepaid = demographicsInfo.getString("prepaid");
    String gender  = demographicsInfo.getString("gender_fs_meaning");

    // Construct the href for the animal abstract link.
    String hrefForAnimalAbstract = (new Path(ActionURL.getBaseServerURL(), "ehr", getContainer().getPath(), "animalHistory.view")).toString();
    hrefForAnimalAbstract += "?#subjects:" + Id + "&inputType:singleSubject&showReport:1&activeReport:abstract";
%>

<style type="text/css">
    table {
        margin-left: 10px;
        border: 1px solid black;
    }
    tr > td:first-child {
        font-weight: bold;
        padding-right: 8px;
        text-align: right;
    }
</style>

<p>
    <%= h(Id) %> has been reported as pregnant.  More details can be found below:
</p>
<h3>Demographic Information</h3>
<table>
    <tr>
        <td>Animal ID:</td>
        <td>
            <a href="<%= h(hrefForAnimalAbstract) %>">
                <%= h(Id) %>
            </a>
        </td>
    </tr>
    <tr>
        <td>Sex:</td>
        <td><%= h(gender) %></td>
    </tr>
</table>

<h3>Pregnancy Information</h3>
<%
    JSONArray pregnancies = queryFactory.selectRows("study", "pregnancies", objectidFilter);
    JSONObject pregnancy = pregnancies.length() > 0 ? JsonUtil.toJSONObjectList(pregnancies).get(0) : new JSONObject();

    String dateOfConception = pregnancy.getString("date_conception");
    String dateDue = pregnancy.getString("date_due");
    String sireid = pregnancy.getString("sireid");
%>

<table>
    <tr>
        <td>Date of Conception:</td>
        <td><%= h(pregnancy.optString("date_conception", NONE_SPECIFIED)) %></td>
    </tr>
    <tr>
        <td>Estimated Due Date:</td>
        <td><%= h(pregnancy.optString("date_due", NONE_SPECIFIED)) %></td>
    </tr>
    <tr>
        <td>Sire:</td>
        <td><%= h(pregnancy.optString("sireid", NONE_SPECIFIED)) %></td>
    </tr>
</table>
<br/>