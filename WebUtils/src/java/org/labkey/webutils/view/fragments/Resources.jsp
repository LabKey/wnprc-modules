<%@ page import="org.labkey.webutils.api.model.JspPageModel" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    JspPageModel model = (JspPageModel) getModelBean();
%>

<%
    for (String stylesheet: model.getStylesheets()) {
%>
<link rel="stylesheet" type="text/css" href="<%= getContextPath() %><%= stylesheet %>">
<%
    }
%>

<%
    for (String script: model.getScripts()) {
%>
<script type="application/javascript" src="<%= getContextPath() %><%= script %>"></script>
<%
    }
%>