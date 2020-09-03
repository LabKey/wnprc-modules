<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    String url = (new ActionURL(WNPRC_ComplianceController.BeginAction.class, getContainer())).toString();
%>
<div class="text-center" style="margin-bottom: 10px;">
    <a class="btn btn-primary" href="<%= url %>">
        <span class="glyphicon glyphicon-home"></span>
        TB Dashboard
    </a>
</div>

<div class="col-xs-12">
    <div class="panel panel-primary">
        <div class="panel-heading">Upload Access Report</div>

        <div class="panel-body">
            <form id="access-report-upload" class="dropzone">
                <labkey:csrf/>
            </form>
        </div>
    </div>
</div>

<script>
    // QUnit defines a module function, so hide it before dropzone.
    var _safe = {};
    _safe.module = module;
    module = undefined;
</script>
<script type="application/javascript" src="<%= getContextPath()%>/compliance/dropzone.js"></script>
<link rel="stylesheet" href="https://rawgit.com/enyo/dropzone/master/dist/dropzone.css">
<script>
    module = _safe.module;

    // Don't autodetect
    Dropzone.autoDiscover = false;

    (function() {

        var dropZone = jQuery("#access-report-upload").dropzone({
            url: "<%= new ActionURL(WNPRC_ComplianceController.UploadAccessReportAPI.class, getContainer()).toString() %>",
            method: "post",
            maxFiles: 1,
            init: function() {
                var self = this;

                // If more than one file is added, just replace the existing one.
                self.on("maxfilesexceeded", function(file) {
                    this.removeAllFiles();
                    this.addFile(file);
                });
            }
        });
    })();
</script>