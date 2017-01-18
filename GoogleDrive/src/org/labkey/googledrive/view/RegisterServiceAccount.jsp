<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.googledrive.GoogleDriveController" %>
<%@ page import="org.labkey.api.util.HString" %>
<%@ page import="org.labkey.googledrive.GoogleDriveModule" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    HString manageURL = new ActionURL(GoogleDriveController.manageAccounts.class, getContainer()).toHString();
    HString apiURL = new ActionURL(GoogleDriveController.AddAcount.class, getContainer()).toHString();
%>

<div class="panel panel-primary">
    <div class="panel-heading">Instructions</div>

    <div class="panel-body">
        <p>
            In the form below, choose a display name and copy in the JSON that Google Drive generated and downloaded
            for you.  It would have been called something like "Project Name-afe3f39480b0e.json, and would have the
            following structure:
        </p>

        <pre>{{ JSON.stringify(example, null, 3) }}</pre>
    </div>
</div>


<div class="panel panel-primary">
    <div class="panel-heading">Add New Account</div>

    <div class="panel-body">
        <form class="form-horizontal" data-bind="with: form">
            <div class="form-group">
                <label for="displayName" class="col-sm-2 control-label">Display Name</label>
                <div class="col-sm-10">
                    <input class="form-control" id="displayName" type="text" data-bind="textInput: displayName">
                </div>
            </div>

            <div class="form-group">
                <label for="keyJson" class="col-sm-2 control-label">JSON Key</label>
                <div class="col-sm-10">
                    <textarea class="form-control" id="keyJson" rows="10" data-bind="textInput: json"></textarea>
                </div>
            </div>

            <div class="row" data-bind="with: $parent.parsedValues">

                <div class="col-sm-6">
                    <div class="panel panel-primary">
                        <div class="panel-heading">Private Key</div>

                        <div class="panel-body">
                            <pre>{{private_key}}</pre>
                        </div>
                    </div>
                </div>

                <div class="col-sm-6">
                    <div class="panel panel-primary">
                        <div class="panel-heading">Parsed Values</div>
                        <div class="panel-body">
                            <div class="col-sm-12">
                                <dl class="dl-horizontal">
                                    <dt>Type</dt>
                                    <dd>{{type}}</dd>

                                    <dt>Project Id</dt>
                                    <dd>{{project_id}}</dd>

                                    <dt>Private Key Id</dt>
                                    <dd>{{private_key_id}}</dd>

                                    <dt>Client Email</dt>
                                    <dd>{{client_email}}</dd>

                                    <dt>Client Id</dt>
                                    <dd>{{client_id}}</dd>

                                    <dt>Auth URI</dt>
                                    <dd>{{auth_uri}}</dd>

                                    <dt>Token URI</dt>
                                    <dd>{{token_uri}}</dd>

                                    <dt>Provider Cert URL</dt>
                                    <dd>{{auth_provider_x509_cert_url}}</dd>

                                    <dt>Client Cert URL</dt>
                                    <dd>{{client_x509_cert_url}}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="pull-right">
                <a  class="btn" role="button" href="<%= manageURL %>">Cancel</a>
                <button class="btn btn-primary" data-bind="disable: $parent.formIsInvalid, click: submit">Submit</button>
            </div>
        </form>
    </div>
</div>

<script type="application/javascript">
    (function() {
        var form = {
            displayName: ko.observable(''),
            json: ko.observable()
        };
        WebUtils.VM.form = form;

        WebUtils.VM.example = {
            "type":           "service_account",
            "project_id":     "/* REDACTED */",
            "private_key_id": "/* REDACTED */",
            "private_key":    "/* REDACTED */",
            "client_email":   "/* REDACTED */",
            "client_id":      "/* REDACTED */",
            "auth_uri":       "https://accounts.google.com/o/oauth2/auth",
            "token_uri":      "https://accounts.google.com/o/oauth2/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url":        "/* REDACTED */"
        };

        var jsonClean = ko.pureComputed(function() {
            try {
                return JSON.parse(form.json());
            }
            catch (e) {
                return {};
            }
        });

        WebUtils.VM.parsedValues = {};

        _.keys(WebUtils.VM.example).map(function(val) {
            WebUtils.VM.parsedValues[val] = ko.pureComputed(function() {
                return (val in jsonClean()) ? jsonClean()[val] : '';
            });
        });

        WebUtils.VM.formIsInvalid = ko.computed(function() {
            if (_.isBlank(form.displayName())) {
                return true;
            }

            for (var key in WebUtils.VM.example) {
                if (_.isBlank(WebUtils.VM.parsedValues[key]())) {
                    return true;
                }
            }

            return false;
        });

        WebUtils.VM.form.submit = function() {
            var data = ko.mapping.toJS(WebUtils.VM.parsedValues);
            delete data.type;
            data.displayName = form.displayName();

            WebUtils.API.postJSON("<%= apiURL %>", data).then(function() {
                alert("Success");
                window.location = "<%= manageURL %>";
            }).catch(function(e) {
                console.error(e);
                alert("Failed");
            });
        };
    })();
</script>