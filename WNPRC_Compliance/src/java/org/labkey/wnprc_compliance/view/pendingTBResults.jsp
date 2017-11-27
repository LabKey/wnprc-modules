<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceSchema" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceController" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    String url = (new ActionURL(WNPRC_ComplianceController.TBDashboardPage.class, getContainer())).toString();
%>
<div class="text-center" style="margin-bottom: 10px;">
    <a class="btn btn-primary" href="<%= url %>">
        <span class="glyphicon glyphicon-home"></span>
        TB Dashboard
    </a>
</div>

<div id="resultDialog" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="close">
                    <span aria-hidden="true">&times</span>
                </button>
                <h4 class="modal-title">Finalize TB Results</h4>
            </div>
            <div class="modal-body" data-bind="with: form">
                <form class="form-horizontal">
                    <div class="form-group">
                        <label class="col-sm-4 control-label">Clearance Date</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" data-bind="dateTimePicker: date, dateTimePickerOptions: {format: 'MM/DD/YYYY'}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-sm-4 control-label">Notes</label>
                        <div class="col-sm-8">
                            <textarea rows="4" class="form-control" data-bind="textInput: notes"></textarea>
                        </div>

                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-bind="click: submit">Submit</button>
            </div>
        </div>
    </div>
</div>


<div class="panel panel-primary">
    <div class="panel-heading">Pending TB Results</div>

    <div class="panel-body">
        <p>Use the table below to finalize pending TB results.</p>
    </div>
    <lk-querytable params="schema: '<%= WNPRC_ComplianceSchema.NAME %>',
                           query: 'pendingTBResults',
                           rowsAreSelectable: true,
                           actionButtons: actions"
    ></lk-querytable>
</div>
<%
    String resolveUrl = new ActionURL(WNPRC_ComplianceController.ResolvePendingTBResultsAPI.class, getContainer()).toString();
%>

<script type="application/javascript" src="<%= getContextPath() %>/wnprc_compliance/pendingTBResults.js"></script>
<script>
    applyKnockoutBindings('<%= resolveUrl %>');
</script>