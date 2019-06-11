<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.util.Path" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.wnprc_ehr.TriggerScriptHelper" %>
<%@ page import="org.labkey.wnprc_ehr.notification.PregnancyNotification" %>
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
            <a href="<%= hrefForAnimalAbstract %>">
                <%= h(Id) %>
            </a>
        </td>
    </tr>
    <tr>
        <td>Sex:</td>
        <td><%= gender %></td>
    </tr>
</table>

<h3>Pregnancy Information</h3>
<%
    JSONArray pregnancies = queryFactory.selectRows("study", "pregnancies", objectidFilter);
    JSONObject pregnancy = pregnancies.length() > 0 ? pregnancies.toJSONObjectArray()[0] : new JSONObject();

    String dateOfConception = pregnancy.getString("date_conception");
    String dateDue = pregnancy.getString("date_due");
    String sireid = pregnancy.getString("sireid");
%>

<table>
    <tr>
        <td>Date of Conception:</td>
        <td><%= pregnancy.optString("date_conception", NONE_SPECIFIED) %></td>
    </tr>
    <tr>
        <td>Estimated Due Date:</td>
        <td><%= pregnancy.optString("date_due", NONE_SPECIFIED) %></td>
    </tr>
    <tr>
        <td>Sire:</td>
        <td><%= pregnancy.optString("sireid", NONE_SPECIFIED) %></td>
    </tr>
</table>
<br/>