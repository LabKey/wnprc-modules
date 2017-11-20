<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceController" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceSchema" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    String format = getContextPath().toString() + getContainer().getEncodedPath() + "%s-%s.view?schemaName=%s&query.queryName=%s";

    String archivedPersonsUrl = String.format(format, "query", "executeQuery", WNPRC_ComplianceSchema.NAME, "ArchivedPersonsList");
    String activePersonsUrl   = String.format(format, "query", "executeQuery", WNPRC_ComplianceSchema.NAME, "ActivePersonsList");
    String editPersonsUrl     = String.format(format, "ehr",   "updateQuery",  WNPRC_ComplianceSchema.NAME, "persons");
    String mostRecentUrl      = String.format(format, "query", "executeQuery", WNPRC_ComplianceSchema.NAME, "MostRecentAccessReportSummary");

%>
<div class="col-xs-12">
    <div class="panel panel-primary">
        <div class="panel-heading">Compliance</div>

        <div class="panel-body">
            <p>
                What would you like to do?
            </p>
            <ul>
                <li>
                    TB Results
                    <ul>
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.NewUserPage.class, getContainer()).toString()%>">
                            Enter TB Results
                        </a></li>
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.PendingTBResultsPage.class, getContainer()).toString()%>">
                            View Pending TB Results
                        </a></li>
                    </ul>
                </li>
                <li>
                    <a href="<%= editPersonsUrl %>">Edit Existing Persons</a>
                    <ul>
                        <li><strong>DO NOT EDIT THE ID OF ANY USER WHEN EDITING!</strong></li>
                    </ul>
                </li>
                <li><a href="<%= activePersonsUrl %>">View the List of Active Persons</a></li>
                <li><a href="<%= archivedPersonsUrl %>">View the List of Archived Persons</a></li>
                <li>
                    Access Reports
                    <ul>
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.UploadAccessReportPage.class, getContainer()).toString()%>">
                            Upload New Access Report
                        </a></li>
                        <li><a href="<%= mostRecentUrl %>">View Most Recent Access Report Summary</a></li>
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.UnidentifiedCardsPage.class, getContainer()).toString()%>">
                            View Unidentified Cards
                        </a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>