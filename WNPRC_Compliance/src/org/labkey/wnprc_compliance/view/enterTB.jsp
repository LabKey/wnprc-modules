<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceController" %>
<%@ page import="org.labkey.api.action.Action" %>
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
                                        <div class="form-group col-sm-4">
                                            <label class="col-sm-5 control-label">DOB </label>
                                                <input type="text" class="form-control" data-bind="dateTimePicker: dateOfBirth, dateTimePickerOptions: {format: 'MM/DD/YYYY'}">
                                            </label>
                                        </div>
                                        <div class="checkbox">
                                            <label class="control-label">
                                                <input type="checkbox" data-bind="checked: isEmployee">
                                                This person is an employee
                                            </label>
                                        </div>
                                        <div class="checkbox">
                                            <label class="control-label">
                                                <input type="checkbox" data-bind="checked: hold">
                                                Hold for barrier access
                                            </label>
                                        </div>
                                        <div class="checkbox">
                                            <label class="control-label">
                                                <input type="checkbox" data-bind="checked: measles_required">
                                                Measles required
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
                        <div class="col-sm-6">
                        <form class="form-horizontal">
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Clearance Date</label>
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

            <div class="col-xs-12">
                <div class="btn-toolbar">
                    <button class="btn btn-primary pull-right" title="{{submitDisabledReason}}" data-bind="disable: submitDisabled, click: submit">Submit</button>
                    <button class="btn btn-default pull-right" data-bind="click: clearForm">Clear Form</button>
                </div>
            </div>


        </div>
    </div>
</div>

<script>
    (function() {
        ko.bindingHandlers.bsChecked = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var value = valueAccessor();
                var newValueAccessor = function () {
                    return {
                        change: function () {
                            value(element.value);
                        }
                    }
                };
                ko.bindingHandlers.event.init(element, newValueAccessor, allBindingsAccessor, viewModel, bindingContext);
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                if ($(element).val() == ko.unwrap(valueAccessor())) {
                    setTimeout(function () {
                        $(element).closest('.btn').button('toggle');
                    }, 1);
                }
            }
        };

        var VM = {
            createNewUser: ko.observable("no"),
            searchTerm:    ko.observable(''),
            searchResults: ko.observableArray(),
            selectedPerson: ko.observable()
        };

        VM.createNewUser.subscribe(function(val) {
            if (val == "no") {
                VM.clearForm();
            }
        });

        VM.submitDisabledReason = ko.computed(function() {
            if (VM.createNewUser() !== "yes") {
                if (_.isBlank(VM.selectedPerson())) {
                    return "You must either specify a person or create a new person.";
                }

                if (measlesForm.disabled() && tbForm.disabled()) {
                    return "You must enter either a TB Clearance or a Measles Clearance.";
                }

                return "";
            }

            if (_.isBlank(VM.newUserForm.firstName()) || _.isBlank(VM.newUserForm.lastName())) {
                return "First and last names are required for new persons."
            }

            return "";
        });

        VM.submitDisabled = ko.computed(function() {
            return !_.isBlank(VM.submitDisabledReason());
        });

        VM.newUserForm = {
            firstName:  ko.observable(''),
            middleName: ko.observable(''),
            lastName:   ko.observable(''),
            dateOfBirth: ko.observable(''),
            notes:      ko.observable(''),
            isEmployee: ko.observable(false),
            hold: ko.observable(false),
            measles_required: ko.observable(false),
            userMatches: ko.observableArray([]),
            cardMatches: ko.observableArray([]),
            selectedUsers: ko.observableArray([]),
            selectedCards: ko.observableArray([])
        };

        <%
            ActionURL searchQuery = new ActionURL(WNPRC_ComplianceController.SearchUserAPI.class, getContainer());
        %>

        VM.searchTerm.subscribe(function(query) {
            if (query.length < 3) {
                VM.newUserForm.userMatches([]);
                VM.newUserForm.cardMatches([]);
                return;
            }

            var url = LABKEY.ActionURL.buildURL('<%= searchQuery.getController() %>', '<%= searchQuery.getAction()%>', null, {
                query: query
            });

            WebUtils.API.getJSON(url).then(function (data) {
                if (query != VM.searchTerm()) {
                    return;
                }
                var results = data.results;

                var LABKEY_USER = 'LABKEY USER';
                var UW_CARD = 'UW CARD';
                var PERSON = "PERSONS";

                VM.newUserForm.userMatches((LABKEY_USER in results) ? results[LABKEY_USER] : []);
                VM.newUserForm.cardMatches((UW_CARD in results)     ? results[UW_CARD]     : []);

                VM.searchResults((PERSON in results) ? results[PERSON] : []);
            });
        });

        var tbForm = {
            disabled: ko.observable(),
            $element: $('#tb-form-body'),
            notes: ko.observable(''),
            date: ko.observable(moment()),
            pending : ko.observable(false)
        };
        VM.tbForm = tbForm;

        (function() {
            tbForm.clear = function() {
                tbForm.notes('');
                tbForm.date(moment());
                tbForm.disabled(true);
            };
            tbForm.$element.collapse({toggle: true});
            tbForm.disabled.subscribe(function(val) {
                if (val) {
                    tbForm.notes('');
                    tbForm.date(moment());
                }
                tbForm.$element.collapse(val ? 'hide' : 'show');
            });
            tbForm.disabled(true)
        })();

        var measlesForm = {
            $element: $('#measles-form-body'),
            disabled: ko.observable(),
            notes: ko.observable(''),
            date: ko.observable(''),
            required: ko.observable(false)
        };
        VM.measlesForm = measlesForm;

        (function() {
            measlesForm.clear = function() {
                measlesForm.notes('');
                measlesForm.date('');
                measlesForm.disabled(true);
            };
            measlesForm.$element.collapse({toggle: true});
            measlesForm.disabled.subscribe(function(val) {
                if (val) {
                    measlesForm.notes('');
                    measlesForm.date('');
                }
                measlesForm.$element.collapse(val ? 'hide' : 'show');
            });
            measlesForm.disabled(true);
        })();



        VM.clearForm = function() {
            VM.createNewUser('no');
            VM.searchTerm('');
            VM.newUserForm.firstName('');
            VM.newUserForm.middleName('');
            VM.newUserForm.lastName('');
            VM.newUserForm.dateOfBirth('');
            VM.newUserForm.notes('');
            VM.newUserForm.isEmployee(false);
            VM.newUserForm.hold(false);
            VM.newUserForm.measles_required(false);
            VM.newUserForm.userMatches([]);
            VM.newUserForm.cardMatches([]);
            VM.newUserForm.selectedUsers([]);
            VM.newUserForm.selectedCards([]);
            measlesForm.clear();
            tbForm.clear();
        };

        var $mainFormBody = $('#mainFormBody');
        VM.submit = function() {
            var submission = {
                url: undefined,
                data: undefined
            };

            var form = ko.mapping.toJS(VM.newUserForm);

            if (VM.createNewUser() == 'yes') {
                submission.url = "<%= new ActionURL(WNPRC_ComplianceController.NewUserAPI.class, getContainer()) %>";

                submission.data = {
                    firstName:   form.firstName,
                    middleName:  form.middleName,
                    lastName:    form.lastName,
                    dateOfBirth: form.dateOfBirth,
                    description: form.notes,
                    hold: form.hold,
                    measles_required: form.measles_required,
                    cardNumbers: _.map(form.selectedCards, function(card) { return card.id }),
                    userIds:     _.map(form.selectedUsers, function(user) { return user.id })
                };

                if (!measlesForm.disabled()) {
                    // Enter a blank date if it is blank
                    if (measlesForm.date() != ''){
                        var dateCompleted = moment(measlesForm.date()).format();
                    } else {
                        var dateCompleted = '';
                    }
                    submission.data.measlesInfo = {
                        notes: measlesForm.notes(),
                        dateCompleted: dateCompleted,
                        required: measlesForm.required()
                    };
                }

                if (!tbForm.disabled()) {
                    submission.data.tbInfo = {
                        dateCompleted: moment(tbForm.date()).format(),
                        notes: tbForm.notes(),
                        pending: tbForm.pending()
                    }
                }
            }
            else {
                submission.url = "<%= new ActionURL(WNPRC_ComplianceController.UpdatePersonClearanceAPI.class, getContainer()) %>";

                submission.data = {
                    personid: VM.selectedPerson(),
                    hold: form.hold,
                    measles_required: form.measles_required
                };

                if (!measlesForm.disabled()) {
                    // Enter a blank date if it is blank
                    if (measlesForm.date() != ''){
                        var dateCompleted = moment(measlesForm.date()).format();
                    } else {
                        var dateCompleted = '';
                    }
                    submission.data.measlesInfo = {
                        notes: measlesForm.notes(),
                        dateCompleted: dateCompleted,
                        required: measlesForm.required()
                    };
                }

                if (!tbForm.disabled()) {
                    submission.data.tbInfo = {
                        dateCompleted: moment(tbForm.date()).format(),
                        notes: tbForm.notes(),
                        pending: tbForm.pending()
                    }
                }
            }

            $mainFormBody.block();

            WebUtils.API.postJSON(submission.url, submission.data).then(function() {
                toastr.success("Success");
                VM.clearForm();
            }).catch(function(e) {
                toastr.error("An error occurred: " + e.message || message)
            }).finally(function() {
                $mainFormBody.unblock();
            });
        };

        WebUtils.VM = _.extend(WebUtils.VM, VM);
    })();
</script>