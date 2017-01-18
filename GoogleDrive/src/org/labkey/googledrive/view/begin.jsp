<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.security.User" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.googledrive.GoogleDriveController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    Container c = getContainer();
    User user = getUser();

    String addURL = new ActionURL(GoogleDriveController.AddAcountPage.class, getContainer()).toString();
    String manageURL = new ActionURL(GoogleDriveController.manageAccounts.class, getContainer()).toString();
%>
<p>
    Hello, and welcome to the GoogleDrive module.
</p>

<p>
    Perhaps you'd like to <a href="<%= addURL %>">register
    a new service account</a> to connect to a Google Drive.  You can also <a href="<%= manageURL %>">manage the list</a>.
</p>

