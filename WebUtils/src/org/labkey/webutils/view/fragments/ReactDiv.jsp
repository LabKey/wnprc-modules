<%@ page import="org.labkey.webutils.api.model.JspPageModel" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspPage view = (JspPage) HttpView.currentView();
    JspPageModel model = (JspPageModel) getModelBean();
%>

<div id="reactDiv"></div>