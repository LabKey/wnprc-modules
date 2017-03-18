<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceController" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceSchema" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

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
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.NewUserPage.class, getContainer()).toHString()%>">
                            Enter TB Results
                        </a></li>
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.PendingTBResultsPage.class, getContainer()).toHString()%>">
                            View Pending TB Results
                        </a></li>
                    </ul>
                </li>
                <li>
                    <a href="{{editPersonsURL}}">Edit Existing Persons</a>
                    <ul>
                        <li><strong>DO NOT EDIT THE ID OF ANY USER WHEN EDITING!</strong></li>
                    </ul>
                </li>
                <li><a href="{{personListURL}}">
                    View the List of Persons
                </a></li>
                <li>
                    Access Reports
                    <ul>
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.UploadAccessReportPage.class, getContainer()).toHString()%>">
                            Upload New Access Report
                        </a></li>
                        <li><a href="{{mostRecentAccessReportSummary}}">
                            View Most Recent Access Report Summary
                        </a></li>
                        <li><a href="<%= new ActionURL(WNPRC_ComplianceController.UnidentifiedCardsPage.class, getContainer()).toHString()%>">
                            View Unidentified Cards
                        </a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>


<script>
    (function() {
        WebUtils.VM = {
            personListURL: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                schemaName: "<%= WNPRC_ComplianceSchema.NAME %>",
                'query.queryName': "personsList"
            }),
            editPersonsURL: LABKEY.ActionURL.buildURL('ehr', 'updateQuery', null, {
                schemaName: "<%= WNPRC_ComplianceSchema.NAME %>",
                'query.queryName': "persons"
            }),
            mostRecentAccessReportSummary: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                schemaName: "<%= WNPRC_ComplianceSchema.NAME %>",
                'query.queryName': "MostRecentAccessReportSummary"
            })
        }
    })();
</script>