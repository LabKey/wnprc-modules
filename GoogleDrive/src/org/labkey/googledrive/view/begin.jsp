<%
/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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

