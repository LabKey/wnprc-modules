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

<div id="exemptDialog" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="close">
                    <span aria-hidden="true">&times</span>
                </button>
                <h4 class="modal-title">Mark Cards as Exempt</h4>
            </div>
            <div class="modal-body" data-bind="with: form">
                <form class="form-horizontal">
                    <div class="form-group">
                        <label class="col-sm-4 control-label">Reason</label>
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
    <div class="panel-heading">Unidentified Cards</div>

    <div class="panel-body">
        <p>Give this guy a second to load...</p>
    </div>
    <lk-querytable params="schema: '<%= WNPRC_ComplianceSchema.NAME %>',
                           query: 'unidentifiedCards',
                           rowsAreSelectable: true,
                           actionButtons: actions"
    ></lk-querytable>
</div>
<%
    String markExemptUri = new ActionURL(WNPRC_ComplianceController.MarkCardExemptAPI.class, getContainer()).toString();
%>
<script type="application/javascript" src="<%= getContextPath() %>/wnprc_compliance/unidentifiedCards.js"></script>
<script>
    applyKnockoutBindings("<%= markExemptUri %>");
</script>