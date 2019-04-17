<%--<%@ page import="org.labkey.api.view.ActionURL" %>--%>
<%--<%@ page import="org.labkey.api.util.Path" %>--%>
<%--<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>--%>
<%--<%@ page import="org.json.JSONArray" %>--%>
<%--<%@ page import="org.labkey.api.data.CompareType" %>--%>
<%--<%@ page import="org.json.JSONObject" %>--%>
<%--<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>--%>
<%--<%@ page import="org.labkey.wnprc_ehr.TriggerScriptHelper" %>--%>
<%--<%@ page import="org.labkey.wnprc_ehr.notification.PregnancyNotification" %>--%>
<%--<%@ page extends="org.labkey.api.jsp.JspBase" %>--%>
<%--<%--%>
    <%--JSONObject params = (JSONObject) getModelBean();--%>
    <%--SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());--%>

    <%--// Define a default when we don't have a value for a field--%>
    <%--String NONE_SPECIFIED = "<em>Not Specified</em>";--%>

    <%--// Grab the Id--%>
    <%--String Id = params.getString(PregnancyNotification.idParamName);--%>
    <%--String objectid = params.getString(PregnancyNotification.objectidsParamName);--%>

    <%--SimplerFilter idFilter = new SimplerFilter("Id", CompareType.EQUAL, Id);--%>
    <%--SimplerFilter objectidFilter = new SimplerFilter("objectid", CompareType.EQUAL, objectid);--%>

    <%--JSONArray demographicsRows = queryFactory.selectRows("study", "demographics", idFilter);--%>

    <%--JSONObject demographicsInfo = demographicsRows.getJSONObject(0);--%>

    <%--//prepaid = demographicsInfo.getString("prepaid");--%>
    <%--String gender  = demographicsInfo.getString("gender_fs_meaning");--%>

    <%--// Construct the href for the animal abstract link.--%>
    <%--String hrefForAnimalAbstract = (new Path(ActionURL.getBaseServerURL(), "ehr", getContainer().getPath(), "animalHistory.view")).toString();--%>
    <%--hrefForAnimalAbstract += "?#subjects:" + Id + "&inputType:singleSubject&showReport:1&activeReport:abstract";--%>
<%--%>--%>

<%--<style type="text/css">--%>
    <%--table {--%>
        <%--margin-left: 10px;--%>
        <%--border: 1px solid black;--%>
    <%--}--%>
    <%--tr > td:first-child {--%>
        <%--font-weight: bold;--%>
        <%--padding-right: 8px;--%>
        <%--text-align: right;--%>
    <%--}--%>
<%--</style>--%>

<%--<p>--%>
    <%--<%= h(Id) %> has been reported as pregnant.  More details can be found below:--%>
<%--</p>--%>
<%--<h3>Demographic Information</h3>--%>
<%--<table>--%>
    <%--<tr>--%>
        <%--<td>Animal ID:</td>--%>
        <%--<td>--%>
            <%--<a href="<%= hrefForAnimalAbstract %>">--%>
                <%--<%= h(Id) %>--%>
            <%--</a>--%>
        <%--</td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Sex:</td>--%>
        <%--<td><%= gender %></td>--%>
    <%--</tr>--%>
<%--</table>--%>

<%--<h3>Pregnancy Information</h3>--%>
<%--<%--%>
    <%--JSONArray pregnancies = queryFactory.selectRows("study", "pregnancies", objectidFilter);--%>
    <%--JSONObject pregnancy = pregnancies.length() > 0 ? pregnancies.toJSONObjectArray()[0] : new JSONObject();--%>

    <%--String dateOfConception = pregnancy.getString("date_conception");--%>
    <%--String dateDue = pregnancy.getString("date_due");--%>
    <%--String sireid = pregnancy.getString("sireid");--%>
<%--%>--%>

<%--<table>--%>
    <%--<tr>--%>
        <%--<td>Necropsy Case Number:</td>--%>
        <%--<td><%= necropsy.optString("caseno", NONE_SPECIFIED) %></td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Task ID:</td>--%>
        <%--<td>--%>
            <%--<a href="<%= ActionURL.getBaseServerURL() + "/ehr/" + getContainer().getPath() + "/taskDetails.view?formtype=" + necropsy.getString("taskid_fs_formtype") + "&taskid=" + taskid%>">--%>
                <%--<%= necropsy.getString("taskid_fs_rowid") %>--%>
            <%--</a>--%>
        <%--</td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Date of Necropsy:</td>--%>
        <%--<td><%= necropsy.optString("date", NONE_SPECIFIED) %></td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Weight:</td>--%>
        <%--<td><%= weight %></td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Time of Death:</td>--%>
        <%--<td><%= necropsy.optString("timeofdeath", NONE_SPECIFIED) %></td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Type of Death:</td>--%>
        <%--<td><%= cause.equals("") ? NONE_SPECIFIED : h(cause) %></td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Grant #:</td>--%>
        <%--<td><%= necropsy.optString("account", NONE_SPECIFIED) %></td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Animal Replacement Fee:</td>--%>
        <%--<td>--%>
            <%--<%--%>
                <%--SimplerFilter causeFilter = new SimplerFilter("value", CompareType.EQUAL, cause);--%>
                <%--JSONArray deathCause = queryFactory.selectRows("ehr_lookups", "death_cause", causeFilter);--%>
                <%--String feeCategory = deathCause.getJSONObject(0).getString("category");--%>

                <%--if (feeCategory.equals("No Fee")) {--%>
            <%--%>--%>
            <%--No animal replacement fee to be paid (clinical death)--%>
            <%--<%--%>
            <%--}--%>
            <%--else if (feeCategory.equals("Fee")){--%>
            <%--%>--%>
            <%--<%= (prepaid == null) ? "Animal Replacement fee to be paid (not prepaid animal)" : prepaid %>--%>

            <%--<%--%>
            <%--}--%>
            <%--else if (isPrenatalDeath) {--%>
            <%--%>--%>
            <%--<em>N/A (prenatal death)</em>--%>
            <%--<%--%>
                <%--}--%>
            <%--%>--%>
        <%--</td>--%>
    <%--</tr>--%>
    <%--<tr>--%>
        <%--<td>Manner of Death:</td>--%>
        <%--<td><%= necropsy.optString("mannerofdeath", NONE_SPECIFIED) %></td>--%>
    <%--</tr>--%>
    <%--<%--%>
        <%--JSONArray animalDeath = queryFactory.selectRows("study", "deaths", idFilter);--%>
        <%--String deathRemark = animalDeath.getJSONObject(0).getString("remark");--%>
        <%--if (deathRemark != null && !deathRemark.isEmpty()){--%>
    <%--%>--%>
    <%--<tr>--%>
        <%--<td>Death Remark:</td>--%>
        <%--<td><%=deathRemark.equals("") ? NONE_SPECIFIED : h(deathRemark) %></td>--%>
        <%--<%--%>
            <%--}--%>
        <%--%>--%>

    <%--</tr>--%>
<%--</table>--%>
<%--<br/>--%>