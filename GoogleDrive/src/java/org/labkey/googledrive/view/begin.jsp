
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.googledrive.GoogleDriveController" %>
<%@ page import="org.labkey.api.data.ContainerManager" %>
<%@ page import="org.labkey.googledrive.GoogleDriveSchema" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    String addURL = new ActionURL(GoogleDriveController.AddAcountPage.class, getContainer()).toString();
    String manageURL = getContextPath() + "/query/" + ContainerManager.getHomeContainer().getEncodedPath() + "/executeQuery.view?schemaName=" + GoogleDriveSchema.NAME + "&query.queryName=service_accounts";
%>
<p>
    Hello, and welcome to the GoogleDrive module.
</p>

<p>
    Perhaps you'd like to <a href="<%= addURL %>">register
    a new service account</a> to connect to a Google Drive.  You can also <a href="<%= manageURL %>">manage the list</a>.
</p>

