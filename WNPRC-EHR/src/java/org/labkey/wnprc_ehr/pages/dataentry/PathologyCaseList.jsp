<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="org.labkey.api.data.SimpleFilter" %>
<%@ page import="org.labkey.api.query.FieldKey" %>
<%@ page import="java.util.Date" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="java.util.Calendar" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_ehr.WNPRC_EHRController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    Integer year = Calendar.getInstance().get(Calendar.YEAR);

    Calendar cal = Calendar.getInstance();
    cal.set(Calendar.YEAR, year);
    cal.set(Calendar.DAY_OF_YEAR, 1);
    Date startOfYear = cal.getTime();

    cal.set(Calendar.YEAR, year + 1);
    Date startOfNextYear = cal.getTime();

    SimpleFilter dateFilter = new SimpleFilter();
    dateFilter.addCondition(FieldKey.fromString("date"), startOfYear,    CompareType.DATE_GTE);
    dateFilter.addCondition(FieldKey.fromString("date"), startOfNextYear, CompareType.DATE_LT);

    SimpleQuery biopsyQuery = new SimpleQuery("study", "biopsy", getUser(), getContainer());
    List<JSONObject> biopsies = JsonUtils.getListFromJSONArray(biopsyQuery.getResults(dateFilter).getJSONArray("rows"));

    SimpleQuery necropsyQuery = new SimpleQuery("study", "necropsy", getUser(), getContainer());
    List<JSONObject> necropsies = JsonUtils.getListFromJSONArray(necropsyQuery.getResults(dateFilter).getJSONArray("rows"));

    ActionURL necropsyReportURL = new ActionURL(WNPRC_EHRController.NecropsyReportAction.class, getContainer());
    ActionURL collectionListURL = new ActionURL(WNPRC_EHRController.NecropsyCollectionListAction.class, getContainer());
%>

<div id="react-page"></div>

<script>
    (function() {
        window.PageLoadData = {
            biopsies: <%= biopsies.toString() %>,
            necropsies: <%= necropsies.toString() %>,
            urlData: {
                necropsyReport: {
                    controller: "<%= necropsyReportURL.getController() %>",
                    action:     "<%= necropsyReportURL.getAction()     %>"
                },
                collectionList: {
                    controller: "<%= collectionListURL.getController() %>",
                    action:     "<%= collectionListURL.getAction()     %>"
                }
            }
        };
    })();
</script>

<script src="<%= getContextPath() %>/wnprc_ehr/pages/path-case-list.js"></script>