<%
/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
                        <li><a href="<%=h(new ActionURL(WNPRC_ComplianceController.NewUserPage.class, getContainer()))%>">
                            Enter TB Results
                        </a></li>
                        <li><a href="<%=h(new ActionURL(WNPRC_ComplianceController.EditTBPage.class, getContainer()).toString())%>">
                            Edit TB Results
                        </a></li>
                        <li><a href="<%=h(new ActionURL(WNPRC_ComplianceController.PendingTBResultsPage.class, getContainer()).toString())%>">
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
                <li><a href="{{activePersonsURL}}">
                    View the List of Active Persons
                </a></li>

                <li><a href="{{archivedPersonsURL}}">
                    View the List of Archived Persons
                </a></li>
                <li>
                    Access Reports
                    <ul>
                        <li><a href="<%=h(new ActionURL(WNPRC_ComplianceController.UploadAccessReportPage.class, getContainer()))%>">
                            Upload New Access Report
                        </a></li>
                        <li><a href="{{mostRecentAccessReportSummary}}">
                            View Most Recent Access Report Summary
                        </a></li>
                        <li><a href="<%=h(new ActionURL(WNPRC_ComplianceController.UnidentifiedCardsPage.class, getContainer()).toString())%>">
                            Manage Unidentified Cards
                        </a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>


<script type="text/javascript" nonce="<%=getScriptNonce()%>">
    (function() {
        WebUtils.VM = {
            archivedPersonsURL: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                schemaName: <%=q(WNPRC_ComplianceSchema.NAME)%>,
                'query.queryName': "ArchivedPersonsList"
            }),
            activePersonsURL: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                schemaName: <%=q(WNPRC_ComplianceSchema.NAME)%>,
                'query.queryName': "ActivePersonsList"
            }),
            editPersonsURL: LABKEY.ActionURL.buildURL('ehr', 'updateQuery', null, {
                schemaName: <%=q(WNPRC_ComplianceSchema.NAME)%>,
                'query.queryName': "persons"
            }),
            mostRecentAccessReportSummary: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                schemaName: <%=q(WNPRC_ComplianceSchema.NAME)%>,
                'query.queryName': "MostRecentAccessReportSummary"
            })
        }
    })();
</script>
