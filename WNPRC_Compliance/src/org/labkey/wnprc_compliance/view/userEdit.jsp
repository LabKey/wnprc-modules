<%@ page extends="org.labkey.api.jsp.JspBase" %>

<h1>
    Create new user:
</h1>

<div class="col-xs-12">
    <div class="panel panel-primary" data-bind="with: namePanel">
        <div class="panel-heading">
            <span>Name</span>
        </div>

        <div class="panel-body">
            <div class="col-xs-12">

                <form class="form-horizontal">

                    <div class="form-group col-sm-4">
                        <label class="col-sm-5 control-label">First Name</label>
                        <div class="col-sm-7">
                            <input type="text" class="form-control" data-bind="textInput: firstName">
                        </div>
                    </div>

                    <div class="form-group col-sm-4">
                        <label class="col-sm-5 control-label">Middle Name</label>
                        <div class="col-sm-7">
                            <input type="text" class="form-control" data-bind="textInput: middleName">
                        </div>
                    </div>

                    <div class="form-group col-sm-4">
                        <label class="col-sm-5 control-label">Last Name</label>
                        <div class="col-sm-7">
                            <input type="text" class="form-control" data-bind="textInput: lastName">
                        </div>
                    </div>

                </form>

            </div>

            <div class="col-xs-12">
                <div class="col-xs-4">
                    <div class="panel panel-primary">
                        <div class="panel-heading">Attributes</div>

                        <div class="panel-body">
                            <form>
                                <div class="checkbox">
                                    <label class="control-label">
                                        <input type="checkbox" data-bind="checked: hasNickNames">
                                        This person has nicknames or aliases
                                    </label>
                                </div>

                                <div class="checkbox">
                                    <label class="control-label">
                                        <input type="checkbox" data-bind="checked: hasAlternateLastNames">
                                        This person has previous names
                                    </label>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-xs-4">
                    <div class="panel panel-primary" data-bind="visible: hasAlternateLastNames">
                        <div class="panel-heading">Previous Names</div>

                        <div class="panel-body">
                            Add more here.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="col-xs-12">
    <div class="panel panel-primary">
        <div class="panel-heading">Associated Accounts</div>

        <div class="panel-body">
            <div class="col-xs-6">
                <div class="panel panel-primary">
                    <div class="panel-heading">EHR Accounts</div>
                    <div class="panel-body">
                        TODO
                    </div>
                </div>
            </div>

            <div class="col-xs-6">
                <div class="panel panel-primary">
                    <div class="panel-heading">WISC Card Numbers</div>
                    <div class="panel-body">
                        TODO
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<script type="text/javascript" nonce="<%=getScriptNonce()%>">
    (function() {
        WebUtils.VM.namePanel = {
            firstName:  ko.observable(''),
            middleName: ko.observable(''),
            lastName:   ko.observable(''),
            hasNickNames: ko.observable(false),
            hasAlternateLastNames: ko.observable(false)
        }
    })();
</script>