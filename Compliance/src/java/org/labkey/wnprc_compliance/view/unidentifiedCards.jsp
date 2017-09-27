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

<script>
    (function() {
        var $exemptDialog = $('#exemptDialog').modal({
            show: false
        });

        var form = {
            selectedCardIds: ko.observableArray(),
            notes: ko.observable('')
        };
        WebUtils.VM.form = form;

        WebUtils.VM.actions = [
            {
                title: "Mark as Exempt",
                execute: function(tableRows, table) {
                    form.selectedCardIds(tableRows.map(function(val) {
                        return val.rowData[0];
                    }));

                    $exemptDialog.modal('show');
                }
            }
        ];

        WebUtils.VM.submit = function() {
            $exemptDialog.modal('hide');

            WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.MarkCardExemptAPI.class, getContainer()) %>", {
                exemptions: form.selectedCardIds().map(function(id) {
                    return {
                        cardId: id,
                        reason: form.notes()
                    }
                })
            }).then(function(d) {
                toastr.success("Success!  Please reload the page to see the changes.")
            }).catch(function(e) {
                toastr.error("Hit an error: " + e.message || e);
            });
        }
    })();
</script>