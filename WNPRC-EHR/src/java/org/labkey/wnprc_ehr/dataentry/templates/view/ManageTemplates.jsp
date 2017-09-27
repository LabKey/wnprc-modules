<%@ page import="org.labkey.wnprc_ehr.dataentry.templates.TemplateEditorService" %>
<%@ page import="org.labkey.wnprc_ehr.dataentry.templates.message.DataEntryTemplateInfo" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.wnprc_ehr.dataentry.templates.message.ManageTemplatesInfo" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<div id="manageTemplates"></div>

<%
    TemplateEditorService service = new TemplateEditorService(getUser(), getContainer());


    JSONArray jsonArray = new JSONArray();

    ObjectMapper mapper = new ObjectMapper();

    ManageTemplatesInfo info = service.getManageableTemplates();
%>

<script>
    window.PageLoadData = <%= mapper.writeValueAsString(info) %>;
</script>

<script src="<%= getContextPath() %>/wnprc_ehr/pages/manage-templates.js"></script>