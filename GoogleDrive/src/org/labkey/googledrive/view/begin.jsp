
<%@ page import="org.labkey.api.data.ContainerManager" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.googledrive.GoogleDriveController" %>
<%@ page import="org.labkey.googledrive.GoogleDriveSchema" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    ActionURL addURL = new ActionURL(GoogleDriveController.AddAccountPage.class, getContainer());
    String manageURL = getContextPath() + "/query/" + ContainerManager.getHomeContainer().getEncodedPath() + "/executeQuery.view?schemaName=" + GoogleDriveSchema.NAME + "&query.queryName=service_accounts";
    /*String enableURL= new ActionURL(WNPRC_EHRController.ScheduleReports.class, getContainer()).toString();*/
%>
<p>
    Hello, and welcome to the GoogleDrive module.
</p>

<p>
    Perhaps you'd like to <a href="<%=h(addURL)%>">register
    a new service account</a> to connect to a Google Drive.  You can also <a href="<%=h(manageURL)%>">manage the list</a>.
</p>

<p>
    <%--Enable scheduled job to Drive, <a href="<%=enableURL%>">click here</a>.--%>

</p>

