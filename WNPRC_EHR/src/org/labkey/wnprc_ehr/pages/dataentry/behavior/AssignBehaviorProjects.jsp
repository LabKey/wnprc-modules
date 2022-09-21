<%@ page import="com.google.common.base.Joiner" %>
<%@ page import="org.json.old.JSONArray" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.dbutils.api.exception.MissingPermissionsException" %>
<%@ page import="org.labkey.wnprc_ehr.WNPRC_EHRController" %>
<%@ page import="org.labkey.wnprc_ehr.service.dataentry.BehaviorDataEntryService" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.List" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    List<String> behaviorAvailabilityCodes = new ArrayList<>(BehaviorDataEntryService.BEHAVIOR_PROJECT_CODES);

    // This page uses actions on the backend through the BehaviorDataEntryService, so make sure our user can
    // use that service.
    boolean hasPermission = false;
    try {
        BehaviorDataEntryService.get(getUser(), getContainer());
        hasPermission = true;
    }
    catch (MissingPermissionsException e) {
        hasPermission = false;
    }

    SimplerFilter behaviorCodeFilter = new SimplerFilter("avail", CompareType.IN, behaviorAvailabilityCodes);
    JSONArray behaviorProjects = queryFactory.selectRows("ehr", "project", behaviorCodeFilter);

    JSONArray currentAssignments = queryFactory.selectRows("study", "CurrentBehaviorAssignments");

    ActionURL addBehaviorURL   = new ActionURL(WNPRC_EHRController.AddBehaviorAssignmentAction.class, getContainer());
    ActionURL releaseAnimalURL = new ActionURL(WNPRC_EHRController.ReleaseAnimalFromBehaviorAssignmentAction.class, getContainer());
%>

<div class="panel panel-primary">
    <div class="panel-heading">
        <span>Info</span>
    </div>

    <div class="panel-body">
        <p>
            Use this page to manage animal assignments for projects with the folowing availability
            codes: <%=h(Joiner.on(", ").join(behaviorAvailabilityCodes))%>.
        </p>
    </div>
</div>

<div class="panel panel-primary">
    <div class="panel-heading">
        <span>Assign New Behavior Projects</span>
    </div>

    <div class="panel-body" id="assign-form-panel-body">
        <%
            if (hasPermission) {
        %>
        <form class="form-horizontal" data-bind="with: form">

            <div class="form-group">

                <!-- Animal ID -->
                <div class="form-group col-sm-6 col-lg-3" >
                    <label for="animalId" class="col-sm-4 control-label">Animal ID</label>
                    <div class="col-sm-8 has-feedback" data-bind="css: { 'has-success': data.Id.isValid, 'has-error': data.Id.isInvalid }">
                        <input type="text" class="form-control" id="animalId" placeholder="Ex: r16XXX..." data-bind="textInput: data.Id">
                        <!-- ko if: data.Id.activeValidations() > 0 -->
                        <span class="glyphicon glyphicon-refresh spinning form-control-feedback"></span>
                        <!-- /ko -->
                        <!-- ko ifnot: data.Id.activeValidations() > 0 -->
                            <!-- ko if: data.Id.isValid -->
                            <span class="glyphicon glyphicon-ok form-control-feedback"></span>
                            <!-- /ko -->
                            <!-- ko if: data.Id.isInvalid -->
                            <span class="glyphicon glyphicon-remove form-control-feedback"></span>
                            <!-- /ko -->
                            <div class="help-block with-errors">{{data.Id.errorMessage}}</div>
                        <!-- /ko -->
                    </div>
                </div>

                <!-- Project -->
                <div class="form-group col-sm-6 col-lg-3">
                    <label for="project" class="col-sm-4 control-label">Project #</label>
                    <div class="col-sm-8 has-feedback" data-bind="css: { 'has-success': data.project.isValid, 'has-error': data.project.isInvalid }">
                        <select class="form-control" id="project" data-bind="options: availableProjects,
                                                                         value:   data.project,
                                                                         optionsText: 'display',
                                                                         optionsValue: 'value',
                                                                         optionsCaption: 'Select a project...'">
                        </select>
                        <div class="help-block with-errors">{{data.project.errorMessage}}</div>
                    </div>
                </div>

                <!-- Start Date -->
                <div class="form-group col-sm-6 col-lg-3">
                    <label for="startDate" class="col-sm-4 control-label">Assign Date</label>
                    <div class="col-sm-8 has-feedback" data-bind="css: { 'has-success': data.date.isValid, 'has-error': data.date.isInvalid }">
                        <div class="input-group date">
                            <input type="text" class="form-control" id="startDate" data-bind="dateTimePicker: data.date, dateTimePickerOptions: {format: 'MM/DD/YYYY'}">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>
                        </div>
                        <div class="help-block with-errors">{{data.date.errorMessage}}</div>
                    </div>
                </div>

                <!-- Estimated End Date -->
                <div class="form-group col-sm-6 col-lg-3">
                    <label for="endDate" class="col-sm-4 control-label">Est. Release</label>
                    <div class="col-sm-8">
                        <div class="input-group date">
                            <input type="text" class="form-control" id="endDate" data-bind="dateTimePicker: data.endDate, dateTimePickerOptions: {format: 'MM/DD/YYYY'}">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Remark -->
            <div class="form-group">
                <label for="remark" class="col-sm-1 control-label">Remark</label>
                <div class="col-sm-11">
                    <textarea class="form-control" id="remark" rows="5" data-bind="value: data.remark"></textarea>
                </div>
            </div>

            <div class="pull-right">
                <button class="btn btn-default" data-bind="click: clearForm">Clear Form</button>
                <button class="btn btn-primary" data-bind="disable: !assignButtonEnabled(), click: assign">Assign</button>
            </div>
        </form>
        <%
            } else {
        %>
        <div class="alert alert-danger">
            <span class="glyphicon glyphicon-exclamation-sign"></span> <strong>You do not have access to assign new behavior projects.</strong>
        </div>
        <%
            }
        %>
    </div>
</div>

<div class="panel panel-primary">
    <div class="panel-heading">
        <span>Current Behavioral Assignments</span>
    </div>

    <div class="panel-body">
        <lk-table params="table: AssignmentTable, caseInsensitiveFilter: true"></lk-table>
    </div>
</div>

<!--
    Dialog to display error messages.
-->
<div class="modal fade" id="errorDialog" tabindex="-1" role="dialog" style="background: rgba(0,0,0,.5);">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <span class="modal-title"><strong>Error Saving Data</strong></span>
            </div>
            <div class="modal-body">
                <p>{{errorMessage}}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<!--
    Dialog to release animals from their behavior projects.
-->
<div class="modal fade" id="releaseAnimalDialog" tabindex="-1" role="dialog" style="background: rgba(0,0,0,.5);">
    <div class="modal-dialog" role="document" data-bind="with: releaseAnimalDialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <span class="modal-title"><strong>Releasing {{animalId}} from Behavior Project {{project}}</strong></span>
            </div>
            <div class="modal-body">
                <p>Please select a date to release the animal on.  This defaults to today.</p>
                <input type="text" class="form-control" data-bind="dateTimePicker: releaseDate, dateTimePickerOptions: {format: 'MM/DD/YYYY'}">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" data-bind="click: release">Release</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script type="application/javascript">
    (function() {
        ko.extenders.validator = function(target, validatorFunction) {
            // Add sub-observables:
            target.errorMessage = ko.observable("\xa0"); // non-breaking space holds the vertical space when there is no message
            var validationCode = ko.observable(0);
            var activeValidations = ko.observable(0);
            target.activeValidations = activeValidations;


            var validate = function(newValue) {
                activeValidations(activeValidations() + 1);
                var retval = Promise.resolve(0);

                try {
                    if (_.isFunction(validatorFunction)) {
                        var validatorReturnVal = validatorFunction(target());

                        // If retVal wasn't a promise, make it one
                        if (validatorReturnVal && validatorReturnVal.then ) {
                            retval = validatorReturnVal;
                        }
                        else {
                            retval = new Promise(function(resolve, reject) {
                                if (validatorReturnVal == null || validatorReturnVal == 0) {
                                    resolve(0);
                                }
                                else if (validatorReturnVal < 0) {
                                    reject('An Unknown Error Occurred');
                                }
                                else if (validatorReturnVal) {
                                    return resolve(1);
                                }
                                else {
                                    reject('An Unknown Error Occurred');
                                }
                            });
                        }
                    }
                }
                catch(e) {
                    retval = Promise.reject(e.message);
                }

                retval.then(function(val) {
                    // If the value is no longer the one we were trying to validate (such as when async validators
                    // return in a different order from their execution), don't update anything.
                    if (target() !== newValue) { return; }

                    var code = (val == 0 || val == null) ? 0 : 1;
                    validationCode(code);
                    target.errorMessage("\xa0"); // Non-breaking space holds the vertical space
                }).catch(function(message) {
                    // If the value is no longer the one we were trying to validate (such as when async validators
                    // return in a different order from their execution), don't update anything.
                    if (target() !== newValue) { return; }

                    validationCode(-1);
                    target.errorMessage(message);
                }).finally(function() {
                    activeValidations(activeValidations() - 1);
                });
            };

            // Main validator
            validate(target());
            target.subscribe(validate);


            // Add some public views on the validation
            target.isValid = ko.pureComputed(function() {
                return (activeValidations() == 0) && (validationCode() == 1);
            });
            target.isInvalid = ko.pureComputed(function() {
                return validationCode() == -1;
            });

            // Return the original observable
            return target;
        };

        var behaviorProjects = <%=behaviorProjects%>;

        WebUtils.VM.form = {
            data: {
                Id: ko.observable().extend({
                    validator: function(value) {
                        if (value == null || value == '') {
                            throw new Error('Animal ID is required.')
                        }

                        return WebUtils.API.getJSON(LABKEY.ActionURL.buildURL('wnprc_ehr', 'validateAnimalId', null, {
                            animalid: value,
                            isAliveAndAtCenter: true
                        })).then(function(data) {
                            if ('isValid' in data && data.isValid) {
                                return true;
                            }

                            var message = ('reason' in data) ? data.reason : value + " is invalid.";
                            throw new Error(message);
                        });
                    }
                }),
                project: ko.observable().extend({
                    validator: function(value) {
                        if (value == null || value == '') {
                            throw new Error('Project is required.')
                        }
                        else {
                            if ('data' in WebUtils.VM.form) {
                                var animalid = WebUtils.VM.form.data.Id();
                                var date     = WebUtils.VM.form.data.date();

                                return WebUtils.API.getJSON(LABKEY.ActionURL.buildURL('wnprc_ehr', 'checkIfAnimalIsAssigned', null, {
                                    projectid: value,
                                    animalid:  animalid,
                                    date:      moment(date).format()
                                })).then(function(data) {
                                    if ('assigned' in data && data.assigned == true) {
                                        var displayDate = moment(date).calendar(null, {
                                            sameDay:  '[today]',
                                            nextDay:  '[tomorrow]',
                                            lastDay:  '[yesterday]',
                                            nextWeek: 'dddd',
                                            sameElse: 'MMMM D, YYYY'
                                        });

                                        throw new Error(animalid + " is already assigned to " + value + " for " + displayDate);
                                    }
                                    else {
                                        return true;
                                    }
                                });
                            }
                            else {
                                return true;
                            }
                        }
                    }
                }),
                date:    ko.observable(moment()).extend({
                    validator: function(value) {
                        if (value == null) {
                            throw new Error('You must specify an assign date.')
                        }
                        else {
                            return true;
                        }
                    }
                }),
                endDate: ko.observable(null),
                remark:  ko.observable()
            },
            availableProjects: ko.observableArray(behaviorProjects.map(function(project) {
                return {
                    value: project.project,
                    display: project.displayname + " - " + project.title + " (" + project.avail + " ) "
                };
            }))
        };

        WebUtils.VM.form.assignButtonEnabled = ko.pureComputed(function() {
            var data = WebUtils.VM.form.data;
            return data.Id.isValid() && data.project.isValid() && data.date.isValid();
        });

        WebUtils.VM.form.clearForm = function() {
            WebUtils.VM.form.data.Id('');
            WebUtils.VM.form.data.project(null);
            WebUtils.VM.form.data.date(moment());
            WebUtils.VM.form.data.endDate(null);
            WebUtils.VM.form.data.remark('');
        };

        WebUtils.VM.errorMessage = ko.observable();
        var $errorDialog = $('#errorDialog').modal({
            show: false
        });

        var releaseAnimalDialogVM = {
            animalId: ko.observable(),
            project: ko.observable(),
            releaseDate: ko.observable(moment()),
            release: function() {
                var data = {
                    animalId:    releaseAnimalDialogVM.animalId(),
                    project:     releaseAnimalDialogVM.project(),
                    releaseDate: moment(releaseAnimalDialogVM.releaseDate()).format()
                };

                console.log(data);

                var $modalContent = $('#releaseAnimalDialog').find('.modal-content');
                $modalContent.block({
                    message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Saving...',
                    css: {
                        border: 'none',
                        padding: '5px',
                        backgroundColor: '#000',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        opacity: .5,
                        color: '#fff'
                    }
                });

                WebUtils.API.post(<%=q(releaseAnimalURL)%>, data).then(function() {
                    WebUtils.VM.refreshCurrentAssignmentsTable();
                    toastr.success(data.animalId + " successfully released from behavior project.");
                }).catch(function(e) {
                    console.error(e);

                    var when$gotMessage = new Promise(function(resolve, reject) {
                        if (e.response && !e.response.bodyUsed) {
                            return e.response.json().then(function(data) {
                                resolve(data.exception);
                            });
                        }
                        else {
                            resolve(e.message);
                        }
                    });

                    when$gotMessage.then(function(message) {
                        WebUtils.VM.errorMessage(message);

                        return new Promise(function(resolve, reject) {
                            $errorDialog.modal('show');

                            $errorDialog.on('hidden.bs.modal', function() {
                                resolve();
                            });
                        });
                    });
                }).finally(function() {
                    $releaseAnimalDialog.modal('hide');
                    $modalContent.unblock();
                });
            }
        };
        var $releaseAnimalDialog = $('#releaseAnimalDialog').modal({
            show: false
        });

        WebUtils.VM.releaseAnimalDialog = releaseAnimalDialogVM;

        $releaseAnimalDialog.on('show.bs.modal', function(event) {
            var button = $(event.relatedTarget);    // Button that triggered the modal.
            var animalId = button.data('animalid'); // Extract info from 'data-animalid' attribute.
            var project = button.data('project');  // Extract info from 'data-project' attribute.

            WebUtils.VM.releaseAnimalDialog.project(project);
            WebUtils.VM.releaseAnimalDialog.animalId(animalId);
            WebUtils.VM.releaseAnimalDialog.releaseDate(moment());
        });

        toastr.options.closeButton = true;
        toastr.options.progressBar = true;

        var curAssignmentTable = new WebUtils.Models.Table({
            rowHeaders: ['Id', 'Gender', 'Code', 'Assign Date', 'Est. Release Date', 'Release Date', 'Remark', {display: "Actions", hideFilter: true}]
        });
        WebUtils.VM.AssignmentTable = curAssignmentTable;

        var formatDate = function(d) {
            var m = moment(d, 'YYYY/MM/DD HH:mm:ss');

            if (!m.isValid()) {
                return "";
            }

            return {
                display: m.calendar(null, {
                    sameDay: '[Today]',
                    nextDay: '[Tomorrow]',
                    nextWeek: 'dddd',
                    lastDay: '[Yesterday]',
                    lastWeek: '[Last] dddd',
                    sameElse: 'YYYY/MM/DD'
                }),
                value:   m.format()
            };
        };

        var processCurrentAssignments = function(assignments) {
            curAssignmentTable.isLoading(true);

            curAssignmentTable.rows(assignments.map(function(assignment) {
                //                   From Java                         From HTTP API
                var id             = assignment['id']               || assignment["Id"];
                var assignDate     = assignment['date'];
                var estReleaseDate = assignment['projectedrelease'] || assignment['projectedRelease'];
                var releaseDate    = assignment['enddate']          || assignment['endDate'];

                var btnHtml = '<button ' +
                        'class="btn btn-primary" ' +
                        'data-toggle="modal" ' +
                        'data-target="#releaseAnimalDialog" ' +
                        'data-animalid="' + id + '" ' +
                        'data-project="' + assignment['project'] + '" ' +
                                <% if (!hasPermission) { %>
                                'disabled ' +
                                'title="You do not have permission to release animals from behavior projects."' +
                                <% } %>
                        '>Release Animal</button>';

                return new WebUtils.Models.TableRow({
                    data: [
                        // From Java                        From HTTP API
                        id,
                        assignment['gender_fs_meaning']  || assignment['gender'],
                        assignment['avail_fs_value']     || assignment['avail'],
                        formatDate(assignDate),
                        formatDate(estReleaseDate),
                        formatDate(releaseDate),
                        assignment['remark']             || "",
                        btnHtml
                    ]
                })
            }));

            curAssignmentTable.isLoading(false);
        };
        processCurrentAssignments(<%=currentAssignments%>);

        WebUtils.VM.refreshCurrentAssignmentsTable = function() {
            curAssignmentTable.isLoading(true);
            curAssignmentTable.rows.removeAll();
            WebUtils.API.selectRows('study', 'CurrentBehaviorAssignments').then(function(data) {
                processCurrentAssignments(data.rows);
            });
        };

        WebUtils.VM.form.assign = function() {
            //Block further ui
            $('#assign-form-panel-body').block({
                message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Saving...',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                }
            });

            var data = ko.mapping.toJS(WebUtils.VM.form.data);

            ['date', 'endDate'].forEach(function(key) {
                val = data[key];

                if (_.isDate(val)) {
                    val = moment(val);
                }

                if (moment.isMoment(val)) {
                    val = val.format();
                }

                data[key] = val;
            });

            var dataToSubmit = {
                animalId: data.Id,
                project: data.project,
                assignDate: data.date,
                estimatedReleaseDate: data.endDate,
                remark: data.remark
            };

            console.log("Submitting data: ", dataToSubmit);
            WebUtils.API.postJSON(<%=q(addBehaviorURL)%>, dataToSubmit).then(function() {
                WebUtils.VM.refreshCurrentAssignmentsTable();
                WebUtils.VM.form.clearForm();
                toastr.success("Assignment successfully added.");
            }).catch(function(e) {
                console.error(e);

                var when$gotMessage = new Promise(function(resolve, reject) {
                    if (e.response && !e.response.bodyUsed) {
                        return e.response.json().then(function(data) {
                            resolve(data.exception);
                        });
                    }
                    else {
                        resolve(e.message || e.exception);
                    }
                });

                when$gotMessage.then(function(message) {
                    WebUtils.VM.errorMessage(message);

                    return new Promise(function(resolve, reject) {
                        $errorDialog.modal('show');

                        $errorDialog.on('hidden.bs.modal', function() {
                            resolve();
                        });
                    });
                });
            }).finally(function() {
                $('#assign-form-panel-body').unblock();
            });

        }
    })();
</script>