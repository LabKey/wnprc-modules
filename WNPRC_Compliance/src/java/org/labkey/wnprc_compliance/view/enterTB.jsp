<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceController" %>
<%@ page import="org.labkey.api.action.Action" %>
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

<div class="col-xs-12">
    <div class="panel panel-primary">
        <div class="panel-heading text-center">
            <h4>Enter Results</h4>
        </div>

        <div class="panel-body" id="mainFormBody">

            <div class="col-xs-12">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <span>Search</span>
                    </div>

                    <div class="panel-body">
                        <div class="col-xs-12">
                            <form class="form-horizontal">
                                <div class="form-group col-sm-12">
                                    <label class="col-sm-3 control-label">Name:</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" data-bind="textInput: searchTerm, disable: createNewUser() == 'yes'">
                                    </div>
                                </div>
                            </form>

                        </div>

                        <div class="col-xs-12 text-center" data-bind="visible: _.isBlank(searchTerm()) || searchTerm().length < 3">
                            <p>Enter at least 3 characters of a name into the search bar to begin...</p>
                        </div>

                        <div class="col-xs-12 text-center" data-bind="visible: (!_.isBlank(searchTerm()) && searchTerm().length >= 3 ) && searchResults().length == 0">
                            <p>No persons matched your query.  Would you like to create a new one?</p>

                            <div class="btn-group" data-toggle="buttons">
                                <label class="btn btn-primary active">
                                    <input type="radio" name="createNewUser" value="no" autocomplete="off" data-bind="bsChecked: createNewUser"> No
                                </label>
                                <label class="btn btn-primary">
                                    <input type="radio" name="createNewUser" value="yes" autocomplete="off" data-bind="bsChecked: createNewUser"> Yes
                                </label>
                            </div>
                        </div>

                        <div class="col-xs-12 text-center" data-bind="visible: (!_.isBlank(searchTerm()) && searchTerm().length >= 3 ) && searchResults().length > 0">
                            <p>Choose a person to enter data for:</p>

                            <div data-bind="foreach: searchResults">
                                <div>
                                    <label>
                                        <input type="radio" name="selectedUser" value="{{id}}" data-bind="checked: $parent.selectedPerson"> {{display}}
                                    </label>
                                </div>
                            </div>

                            <p>Or, would you like to create a new person?</p>

                            <div class="btn-group" data-toggle="buttons">
                                <label class="btn btn-primary active">
                                    <input type="radio" name="createNewUser" value="no" autocomplete="off" data-bind="bsChecked: createNewUser"> No
                                </label>
                                <label class="btn btn-primary">
                                    <input type="radio" name="createNewUser" value="yes" autocomplete="off" data-bind="bsChecked: createNewUser"> Yes
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xs-12" data-bind="visible: createNewUser() === 'yes', with: newUserForm">
                <div class="panel panel-primary">
                    <div class="panel-heading">Create User</div>

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

                        <div class="col-xs-12" style="margin-bottom: 15px">
                            <form class="form">
                                <textarea class="form-control" rows="4" data-bind="textInput: notes" placeholder="Notes"></textarea>
                            </form>
                        </div>


                        <div class="col-xs-4">
                            <div class="panel panel-primary">
                                <div class="panel-heading">Attributes</div>

                                <div class="panel-body">
                                    <form>
                                        <div class="checkbox">
                                            <label class="control-label">
                                                <input type="checkbox" data-bind="checked: isEmployee">
                                                This person is an employee
                                            </label>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-4">
                            <div class="panel panel-primary">
                                <div class="panel-heading">EHR Accounts</div>
                                <div class="panel-body">
                                    <!-- ko foreach: selectedUsers -->
                                    <label>
                                        <input type="checkbox" data-bind="checked: $parent.selectedUsers, checkedValue: $data"> {{display}}
                                    </label>
                                    <!-- /ko -->

                                    <hr/>

                                    <!-- ko foreach: userMatches -->
                                    <div>
                                        <label>
                                            <input type="checkbox" data-bind="checked: $parent.selectedUsers, checkedValue: $data"> {{display}}
                                        </label>
                                    </div>
                                    <!-- /ko -->
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-4">
                            <div class="panel panel-primary">
                                <div class="panel-heading">WISC Card Numbers</div>
                                <div class="panel-body">
                                    <!-- ko foreach: selectedCards -->
                                    <label>
                                        <input type="checkbox" data-bind="checked: $parent.selectedCards, checkedValue: $data"> {{display}}
                                    </label>
                                    <!-- /ko -->

                                    <hr/>

                                    <!-- ko foreach: cardMatches -->
                                    <div>
                                        <label>
                                            <input type="checkbox" data-bind="checked: $parent.selectedCards, checkedValue: $data"> {{display}}
                                        </label>
                                    </div>
                                    <!-- /ko -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="col-xs-12" data-bind="with: tbForm">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <h4 class="panel-title pull-left">TB Clearance</h4>

                        <button class="btn btn-danger pull-right" data-bind="click: function() {disabled(true)}, visible: !disabled()">
                            <span class="glyphicon glyphicon-remove"></span> Remove
                        </button>

                        <button class="btn btn-success pull-right" data-bind="click: function() {disabled(false)}, visible: disabled">
                            <span class="glyphicon glyphicon-plus"></span> Add
                        </button>

                        <div class="clearfix"></div>
                    </div>

                    <div class="panel-body" id="tb-form-body">
                        <div class="col-sm-6">
                            <form class="form-horizontal">
                                <div class="form-group">
                                    <div class="col-sm-offset-4 col-sm-8">
                                        <div class="checkbox">
                                            <label class="control-label">
                                                <input type="checkbox" data-bind="checked: pending"> Pending
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-4 control-label">Clearance Date</label>
                                    <div class="col-sm-8">
                                        <input type="text" class="form-control" data-bind="dateTimePicker: date, dateTimePickerOptions: {format: 'MM/DD/YYYY'}">
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div class="col-sm-6">
                            <form class="form">
                                <div class="form-group">
                                    <label class="control-label">Notes</label>
                                    <textarea rows="4" class="form-control" data-bind="textInput: notes"></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xs-12" data-bind="with: measlesForm">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <h4 class="panel-title pull-left">Measles Clearance</h4>

                        <button class="btn btn-danger pull-right" data-bind="click: function() {disabled(true)}, visible: !disabled()">
                            <span class="glyphicon glyphicon-remove"></span> Remove
                        </button>

                        <button class="btn btn-success pull-right" data-bind="click: function() {disabled(false)}, visible: disabled">
                            <span class="glyphicon glyphicon-plus"></span> Add
                        </button>

                        <div class="clearfix"></div>
                    </div>

                    <div class="panel-body" id="measles-form-body">
                        <form class="form-horizontal">
                            <div class="form-group col-sm-6">
                                <label class="col-sm-3 control-label">Clearance Date</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" data-bind="dateTimePicker: date, dateTimePickerOptions: {format: 'MM/DD/YYYY'}">
                                </div>
                            </div>

                            <div class="form-group col-sm-6">
                                <label class="col-sm-3 control-label">Notes</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" data-bind="textInput: notes">
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-xs-12">
                <div class="btn-toolbar">
                    <button class="btn btn-primary pull-right" title="{{submitDisabledReason}}" data-bind="disable: submitDisabled, click: submit">Submit</button>
                    <button class="btn btn-default pull-right" data-bind="click: clearForm">Clear Form</button>
                </div>
            </div>


        </div>
    </div>
</div>

<%
    ActionURL searchQuery = new ActionURL(WNPRC_ComplianceController.SearchUserAPI.class, getContainer());
    String controller = searchQuery.getController();
    String action     = searchQuery.getAction();

    String createUrl  = new ActionURL(WNPRC_ComplianceController.NewUserAPI.class, getContainer()).toString();
    String updateUrl  = new ActionURL(WNPRC_ComplianceController.UpdatePersonClearanceAPI.class, getContainer()).toString();
%>
<script type="application/javascript" src="<%= getContextPath() %>/wnprc_compliance/enterTB.js"></script>
<script>
    (function(){
        applyKnockoutBindings('<%= controller %>', '<%= action %>', '<%= createUrl %>', '<%= updateUrl %>');
    })();
</script>
