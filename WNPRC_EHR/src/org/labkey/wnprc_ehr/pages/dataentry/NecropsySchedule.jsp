<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.Map" %>
<%@ page import="org.labkey.api.collections.CaseInsensitiveHashMap" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="org.labkey.api.security.GroupManager" %>
<%@ page import="org.labkey.security.xml.GroupEnumType" %>
<%@ page import="org.labkey.api.security.Group" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_ehr.WNPRC_EHRController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.6.0/fullcalendar.css' />
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.6.0/fullcalendar.min.js'></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">

<%
    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    SimpleQuery requests = queryFactory.makeQuery("study", "Necropsy Requests", "Pending");
    List<JSONObject> requestList = JsonUtils.getListFromJSONArray(requests.getResults().getJSONArray("rows"));

    SimpleQuery pathologists = queryFactory.makeQuery("ehr_lookups", "pathologists");
    List<JSONObject> pathologistList = JsonUtils.getSortedListFromJSONArray(pathologists.getResults().getJSONArray("rows"), "userid");

    JSONArray defaultGroup = queryFactory.selectRows("core", "PrincipalsWithoutAdmin", new SimplerFilter("DisplayName", CompareType.EQUAL, "pathology (LDAP)"));
    String defaultAssignedUserID = "";
    String defaultAssignedDisplayName = "";
    if (defaultGroup.length() == 1) {
        defaultAssignedUserID = defaultGroup.getJSONObject(0).getString("userid");
        defaultAssignedDisplayName = defaultGroup.getJSONObject(0).getString("displayname");
    }

    JSONObject necropsySuiteLookup = new JSONObject();
    List<JSONObject> necropsySuites = JsonUtils.getListFromJSONArray(queryFactory.selectRows("wnprc", "necropsy_suite"));
    for (JSONObject json : necropsySuites) {
        CaseInsensitiveHashMap<String> map = new CaseInsensitiveHashMap(json);
        JSONObject suiteInfo = new JSONObject();

        if (map.get("display_color") != null) {
            suiteInfo.put("color", map.get("display_color"));
        }

        String displayName = map.get("displayName");
        suiteInfo.put("displayName", (displayName != null) ? displayName : map.get("room"));

        necropsySuiteLookup.put(map.get("room"), suiteInfo);
    }

    Group pathologyGroup = GroupManager.getGroup(getContainer(), "pathology (LDAP)", GroupEnumType.SITE);
    boolean isPathologist = getUser().isInGroup(pathologyGroup.getUserId()) || getUser().isSiteAdmin();
%>

<style type="text/css">
    /* Full Calendar heading */
    #calendar .fc-toolbar h2 {
        font-size: 20px;
        margin: 0;
    }

    /* Override LK bootstrap */
    .form-control.knockout-bs-form {
        width: 100%;
    }
    .input-group.date {
        display: table;
    }

</style>

<div class="col-xs-12 col-xl-8">
    <div class="col-xs-12 col-md-4">
        <div class="panel panel-primary">
            <div class="panel-heading"><span>Necropsy Details</span></div>
            <div class="panel-body" data-bind="with: taskDetails">
                <!-- ko if: has_tissues_for_avrl -->
                <div class="alert alert-warning" role="alert">
                    <span class="glyphicon glyphicon-alert"></span>
                    This animal has tissue samples that need to be couried to AVRL.
                </div>
                <!-- /ko -->


                <!-- ko ifnot: taskid() != '' -->
                <p><em>Please click on a Necropsy in the Calendar to view details for that Necropsy.</em></p>
                <!-- /ko -->
                <!-- ko if: taskid() != '' -->
                <dl class="dl-horizontal">
                    <dt>Task ID:            </dt> <dd>{{taskid}}</dd>
                    <dt>Animal ID:          </dt> <dd><a href="{{animalLink}}">{{animalid}}</a></dd>
                    <dt>Sex:                </dt> <dd>{{sex}}</dd>
                    <dt>Age:                </dt> <dd>{{age}}</dd>
                    <dt>Weight:             </dt> <dd>{{weight}}</dd>
                    <dt>Medical:            </dt> <dd>{{medical}}</dd>
                    <dt>Type of Death:      </dt> <dd>{{death_type}}</dd>
                    <dt>Project (Account):  </dt> <dd>{{project}} ({{account}})</dd>
                    <dt>Protocol:           </dt> <dd>{{protocol}}</dd>
                    <dt>Necropsy Date:      </dt> <dd>{{date}}</dd>
                    <dt>Nx Location:        </dt> <dd>{{displayLocation}}</dd>
                    <dt>Who Delivers to Nx: </dt> <dd>{{who_delivers}}</dd>
                    <dt>Delivery Comment:   </dt> <dd>{{delivery_comment}}</dd>
                    <dt>Pathology Notes:   </dt> <dd>{{remark}}</dd>

                    <!-- ko if: !_.isBlank(cur_room()) && !_.isBlank(cur_cage()) -->
                    <dt>Current Room:       </dt> <dd>{{cur_room}}</dd>
                    <dt>Current Cage:       </dt> <dd>{{cur_cage}}</dd>
                    <dt>Housing Type:       </dt> <dd>{{cur_cond}}</dd>
                    <!-- /ko -->

                </dl>
                <!-- /ko -->
                <a class="btn btn-default" href="{{$parent.viewCollectionListURL}}" data-bind="css: { disabled: _.isBlank(taskid()) }">Collection List</a>
                <a class="btn btn-default" href="{{$parent.viewNecropsyReportURL}}" data-bind="css: { disabled: _.isBlank(taskid()) }">Report</a>
                <a class="btn btn-default" href="{{$parent.viewNecropsyURL}}"       data-bind="css: { disabled: _.isBlank(taskid()) }">View Record</a>
                <% if (isPathologist) { %>
                <a class="btn btn-primary" href="{{$parent.editNecropsyURL}}"       data-bind="css: { disabled: _.isBlank(taskid()) }">Edit Record</a>
                <% } %>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-md-8">
        <div class="panel panel-primary">
            <div class="panel-heading"><span>Calendar</span></div>
            <div class="panel-body">
                <div id="calendar"></div>

                <div class="pull-right">
                    <!-- ko foreach: _.keys(necropsySuiteLookup) -->
                    <span data-bind="style: {color: $root.necropsySuiteLookup[$data].color }">&#x2589;</span><span>{{$root.necropsySuiteLookup[$data].displayName}}</span>
                    <!-- /ko -->
                </div>
            </div>
        </div>
    </div>
</div>

<%
    if (isPathologist) {
%>

<div class="col-xs-12 col-xl-8">
    <div class="col-xs-12 col-md-8">
        <div class="panel panel-primary">
            <div class="panel-heading"><span>Pending Requests</span></div>
            <div class="panel-body">
                <p>
                    Requests are color-coded based on priority.  <span class="bg-danger">Stat</span> requests are
                    highlighted in <span class="bg-danger">red</span> and <span class="bg-warning">ASAP</span> requests
                    are highlighted in <span class="bg-warning">yellow</span>.
                </p>
                <!-- ko if: pendingRequestTable.rows().length == 0 -->
                <p><em>There are no pending Necropsy requests.</em></p>
                <!-- /ko -->
            </div>

            <!-- ko if: pendingRequestTable.rows().length > 0 -->
            <lk-table params="table: pendingRequestTable, rowClickCallback: requestTableClickAction"></lk-table>
            <!-- /ko -->
        </div>
    </div>

    <div class="col-xs-12 col-md-4">
        <div class="panel panel-primary">
            <div class="panel-heading"><span>Schedule Request</span></div>
            <div class="panel-body" id="scheduleRequestForm" data-bind="with: form">
                <!-- ko if: lsid() == '' -->
                <p style="text-align: center">
                    <em>Please click on a pending request to schedule it.</em>
                </p>
                <!-- /ko -->

                <form class="form-horizontal scheduleForm">
                    <!-- ko if: lsid() != '' -->
                    <div class="form-group">
                        <label class="col-xs-4 control-label">Request ID</label>
                        <div class="col-xs-8">
                            <p class="form-control-static">
                                <a href="{{href}}">
                                    {{ lsid | lookup:$root.RequestIdLookup }}
                                </a>
                                <span> ({{ lsid | lookup:$root.PriorityLookup }})</span>
                            </p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Animal ID</label>
                        <div class="col-xs-8">
                            <p class="form-control-static">{{animalid}}</p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Comments</label>
                        <div class="col-xs-8">
                            <p class="form-control-static">{{comments}}</p>
                        </div>
                    </div>
                    <!-- /ko -->

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Date</label>
                        <div class="col-xs-8">
                            <div class='input-group date' id='datetimepicker1'>
                                <input type='text' class="form-control" data-bind="dateTimePicker: date"/>
                                <span class="input-group-addon">
                                    <span class="glyphicon glyphicon-calendar"></span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Location</label>
                        <div class="col-xs-8">
                            <select data-bind="value: location" class="form-control knockout-bs-form">
                                <option value=""></option>
                                <%
                                    for(JSONObject necropsySuite : necropsySuites) {
                                        String suiteName = necropsySuite.getString("room");
                                %>
                                <option value="<%=suiteName%>"><%=h(suiteName)%></option>
                                <%
                                    }
                                %>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Pathologist</label>
                        <div class="col-xs-8">
                            <select data-bind="value: pathologist" class="form-control knockout-bs-form">
                                <option value=""></option>
                                <%
                                    for(JSONObject pathologist : pathologistList) {
                                        String userid = pathologist.getString("userid");
                                        String internaluserid = pathologist.getString("internaluserid");
                                %>
                                <option value="<%=internaluserid%>"><%=h(userid)%></option>
                                <%
                                    }
                                %>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Prosector</label>
                        <div class="col-xs-8">
                            <select data-bind="value: assistant" class="form-control knockout-bs-form">
                                <option value=""></option>
                                <%
                                    for(JSONObject pathologist : pathologistList) {
                                        String userid = pathologist.getString("userid");
                                        String internaluserid = pathologist.getString("internaluserid");
                                %>
                                <option value="<%=internaluserid%>"><%=h(userid)%></option>
                                <%
                                    }
                                %>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Assigned To</label>
                        <div class="col-xs-8">
                            <input type="hidden" class="hidden-assignedTo-field" data-bind="value: assignedTo">
                            <input type="text" class="form-control assignedTo-field">
                        </div>
                    </div>

                    <div style="text-align: right;">
                        <button class="btn btn-default" data-bind="click: $root.clearForm">Cancel</button>
                        <button class="btn btn-primary" data-bind="click: $root.submitForm">Schedule Necropsy</button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</div>

<%
    }
%>

<script>
    (function() {
        var necropsySuiteLookup = <%= necropsySuiteLookup.toString() %>;
        WebUtils.VM.necropsySuiteLookup = necropsySuiteLookup;

        var $calendar = $('#calendar');
        $(document).ready(function() {
            $calendar.fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek'
                },
                events: function(startMoment, endMoment, timezone, callback) {
                    WebUtils.API.selectRows("study", "Necropsy Schedule", {
                        "date~gte": startMoment.format('Y-MM-DD'),
                        "date~lte": endMoment.format('Y-MM-DD')
                    }).then(function(data) {
                        var events = data.rows;

                        callback(events.map(function(row) {
                            var eventObj = {
                                title: row.animalid,
                                start: row.date,
                                rawRowData: row
                            };

                            if (row.location in necropsySuiteLookup) {
                                eventObj.color = necropsySuiteLookup[row.location].color;
                            }

                            return eventObj;
                        }))
                    })
                },
                eventClick: function(calEvent, jsEvent, view) {
                    jQuery.each(calEvent.rawRowData, function(key, value) {
                        if (key in WebUtils.VM.taskDetails) {
                            if (key == "date") {
                                value = displayDate(value);
                            }
                            WebUtils.VM.taskDetails[key](value);
                        }
                    });
                }
            })
        });


        // Build a lookup index of requests.
        var pendingRequests = <%= requests.getResults().getJSONArray("rows") %>;
        var pendingRequestsIndex = {};
        jQuery.each(pendingRequests, function(i, request) {
            pendingRequestsIndex[request.lsid] = request;
        });

        // Build a lookup of pathologists
        var pathologists = <%= pathologists.getResults().getJSONArray("rows") %>;
        var pathologistLookup = {};
        jQuery.each(pathologists, function(i, pathologist) {
            pathologistLookup[pathologist.internaluserid] = pathologist.userid;
        });

        var displayDate = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").calendar(null, {
                sameElse: 'MMM D[,] YYYY'
            })
        };

        var $hiddenAssignedToField = $('hidden-assignedTo-field');
        var $assignedToField = $('.assignedTo-field').typeahead({ minLength: 4 }, {
            name: 'principals',
            source: function(q, syncCallback, cb) {
                var core = "core";
                WebUtils.API.executeSql(core, "SELECT * FROM core.PrincipalsWithoutAdmin WHERE DisplayName LIKE '%" + q + "%'").then(function(data) {
                    cb(data.rows);
                })
            },
            display: function(record) {
                return record.DisplayName;
            },
            templates: {
                suggestion: function(record) {
                    var name = record.DisplayName;

                    if (!_.isBlank(record.FirstName) && !_.isBlank(record.LastName)) {
                        name = name + " (" + record.FirstName + " " + record.LastName + ")";
                    }

                    return '<p>' + name + '</p>';
                }
            }
        });

        var triggerChange = function($el) {
            $el.change();
        };

        $assignedToField.on("typeahead:selected",      function() { triggerChange($assignedToField); });
        $assignedToField.on("typeahead:autocompleted", function() { triggerChange($assignedToField); });
        $assignedToField.on("typeahead:select", function(ev, suggestion) {
            $hiddenAssignedToField.val(suggestion.UserId);
        });

        // For some reason, type-ahead makes this transparent.  In order to allow bootstrap to "disable" it
        // by greying it out, we need to remove that property.
        $assignedToField.css('background-color', '');

        var $scheduleForm = $('.scheduleForm');

        _.extend(WebUtils.VM, {
            disableForm: function() {
                $scheduleForm.find(":input").attr("disabled", true);
            },
            enableForm: function() {
                $scheduleForm.find(":input").attr("disabled", false);
            },
            taskDetails: {
                lsid:                 ko.observable(),
                taskid:               ko.observable(''),
                age:                  ko.observable(),
                animalid:             ko.observable(),
                date:                 ko.observable(),
                account:              ko.observable(),
                cur_room:             ko.observable(),
                cur_cage:             ko.observable(),
                cur_cond:             ko.observable(),
                death_type:           ko.observable(),
                location:             ko.observable(), // Necropsy location
                medical:              ko.observable(),
                who_delivers:         ko.observable(),
                delivery_comment:     ko.observable(),
                has_tissues_for_avrl: ko.observable(),
                project:              ko.observable(),
                protocol:             ko.observable(),
                sex:                  ko.observable(),
                weight:               ko.observable(),
                remark:                ko.observable()
            },
            form: ko.mapping.fromJS({
                lsid:        '',
                animalid:    '',
                date:        new Date(),
                location:    '',
                pathologist: '',
                assistant:   '',
                comments:    '',
                assignedTo:  '',
                priority:    ''
            }),
            PriorityLookup: new WebUtils.utils.Lookup({
                schemaName: 'ehr',
                queryName:  'requests',
                columns:    ['requestid', 'priority'],
                keyColumn:  'requestid',
                valueAccessor: function(obj) {
                    return obj.priority;
                }
            }),
            RequestIdLookup: new WebUtils.utils.Lookup({
                schemaName: 'ehr',
                queryName:  'requests',
                columns:    ['requestid', 'rowid'],
                keyColumn:  'requestid',
                valueAccessor: function(obj) {
                    return obj.rowid;
                }
            }),
            pendingRequestTable: new WebUtils.Models.Table({
                rowHeaders: ["Request ID", "Priority", "Animal ID", "Requested By", "Requested On", "Requested For"],
                rows: pendingRequests.map(function(row) {
                    return new WebUtils.Models.TableRow({
                        data: [
                            row.requestid,
                            row.priority,
                            row.animalid,
                            row.requestor,
                            displayDate(row.created),
                            displayDate(row.date)
                        ],
                        otherData: row,
                        warn: (row.priority == 'ASAP'),
                        err:  (row.priority == 'Stat')
                    });
                })
            }),
            requestTableClickAction: function(row) {
                WebUtils.VM.requestRowInForm = row;
                WebUtils.VM.updateForm(row.otherData.lsid);
            }
        });

        WebUtils.VM.taskDetails.animalLink = ko.pureComputed(function() {
            var animalId = WebUtils.VM.taskDetails.animalid();

            return LABKEY.ActionURL.buildURL('ehr', 'participantView', null, {
                participantId: animalId
            });
        });

        WebUtils.VM.taskDetails.displayLocation = ko.pureComputed(function() {
            var location_code = WebUtils.VM.taskDetails.location();

            if (location_code in necropsySuiteLookup) {
                return necropsySuiteLookup[location_code].displayName;
            }

            else {
                return "";
            }
        });

        WebUtils.VM.form.href = ko.computed(function() {
            var lsid = WebUtils.VM.form.lsid();

            if (lsid == '') {
                return '#';
            }

            return LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormDetails', null, {
                formType: 'NecropsyRequest',
                returnURL: window.location,
                requestId: lsid
            });
        });

        _.extend(WebUtils.VM, {
            clearForm: function() {
                jQuery.each(WebUtils.VM.form, function(key, observable) {
                    if (ko.isObservable(observable) && !ko.isComputed(observable)) {
                        observable('');
                    }
                });

                $assignedToField.val('');
            },
            updateForm: function(lsid) {
                var request = pendingRequestsIndex[lsid];

                if (!_.isObject(request)) {
                    return;
                }

                jQuery.each(request, function(key, value) {
                    if (key in WebUtils.VM.form) {
                        if (key == "date") {
                            value = new Date(value);
                        }
                        WebUtils.VM.form[key](value);
                    }
                });
            },
            viewCollectionListURL: ko.pureComputed(function() {
                <% ActionURL collectionListURL = new ActionURL(WNPRC_EHRController.NecropsyCollectionListAction.class, getContainer()); %>

                return LABKEY.ActionURL.buildURL('<%= collectionListURL.getController() %>', '<%= collectionListURL.getAction() %>', null, {
                    reportMode: true,
                    taskid: WebUtils.VM.taskDetails.lsid()
                });
            }),
            viewNecropsyReportURL: ko.pureComputed(function() {
                <% ActionURL necropsyReportURL = new ActionURL(WNPRC_EHRController.NecropsyReportAction.class, getContainer()); %>

                return LABKEY.ActionURL.buildURL('<%= necropsyReportURL.getController() %>', '<%= necropsyReportURL.getAction() %>', null, {
                    reportMode: true,
                    taskid: WebUtils.VM.taskDetails.lsid()
                });
            }),
            editNecropsyURL: ko.pureComputed(function() {
                return LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {
                    formType: 'Necropsy',
                    taskid: WebUtils.VM.taskDetails.lsid()
                });
            }),
            viewNecropsyURL: ko.pureComputed(function() {
                return LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormDetails', null, {
                    formType: 'Necropsy',
                    taskid: WebUtils.VM.taskDetails.lsid()
                });
            }),
            submitForm: function() {
                $('#scheduleRequestForm').block({
                    message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Scheduling...',
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

                var taskid = LABKEY.Utils.generateUUID();
                var form = ko.mapping.toJS(WebUtils.VM.form);
                var date = form.date.format("Y-m-d H:i:s");
                var taskInsertSuccess = false;

                var filterConfig = {
                    'requestid~eq': form.lsid,
                    columns: ['lsid', 'requestid', 'taskid']
                };

                WebUtils.API.insertRows('ehr','tasks', [{
                    taskid:     taskid,
                    title:      'Necropsy',
                    category:   'task',
                    assignedto: form.assignedTo,
                    QCState:    10, // Scheduled
                    duedate:    moment(date).hour(17).minute(0).format('YYYY-MM-DD HH:mm:ss'), // 5pm
                    formtype:   "Necropsy"
                }]).then(function(data) {
                    taskInsertSuccess = true;
                    return Promise.all([
                        WebUtils.API.selectRows('study', 'necropsies',     filterConfig),
                        WebUtils.API.selectRows('study', 'organ_weights',  filterConfig),
                        WebUtils.API.selectRows('study', 'tissue_samples', filterConfig),
                        WebUtils.API.selectRows('ehr',   'requests',       filterConfig)
                    ]);
                }).then(function(dataArray) {
                    // Update the regular study rows.
                    var rowsToUpdate = dataArray.slice(0,3).map(function(returnData) {
                        var rows = returnData.rows;

                        return rows.map(function(row) {
                            row.taskid = taskid;
                            row.QCState = 10; // Scheduled
                            row.date = date;
                            return row;
                        });
                    });

                    // Handle the requests rows.
                    rowsToUpdate.push(dataArray[3].rows.map(function(row) {
                        row.QCState = 8; // Request: Approved
                        return row;
                    }));

                    // For the necropsy table, additionally update the pathologist and assistant.
                    rowsToUpdate[0] = rowsToUpdate[0].map(function(row) {
                        row.performedby = pathologistLookup[form.pathologist];
                        row.assistant   = pathologistLookup[form.assistant];

                        return row;
                    });

                    return Promise.all([
                        (rowsToUpdate[0].length > 0) ? WebUtils.API.updateRows('study', 'necropsies',     rowsToUpdate[0]) : Promise.resolve(),
                        (rowsToUpdate[1].length > 0) ? WebUtils.API.updateRows('study', 'organ_weights',  rowsToUpdate[1]) : Promise.resolve(),
                        (rowsToUpdate[2].length > 0) ? WebUtils.API.updateRows('study', 'tissue_samples', rowsToUpdate[2]) : Promise.resolve(),
                        (rowsToUpdate[3].length > 0) ? WebUtils.API.updateRows('ehr',   'requests',       rowsToUpdate[3]) : Promise.resolve()
                    ]);
                }).then(function() {
                    // Refresh the calendar view.
                    $calendar.fullCalendar('refetchEvents');

                    WebUtils.VM.pendingRequestTable.rows.remove(WebUtils.VM.requestRowInForm);

                    // Clear the form
                    WebUtils.VM.clearForm();
                }).catch(function(e) {
                    if (taskInsertSuccess) {
                        alert("Failed to assign necropsy to newly created task.");
                    }
                    else {
                        alert("Failed to create new task.");
                    }
                    return WebUtils.API.selectRows('ehr', 'tasks', {
                        'taskid~eq': taskid
                    }).then(function(data) {
                        return WebUtils.API.deleteRows('ehr', 'tasks', data.rows);
                    }).catch(function() {
                        alert("Unable to remove created task after failing to assign necropsy to it.  You may need to manually delete" +
                                "the empty task.");
                    }).then(function() {
                        return WebUtils.API.selectRows('ehr', 'requests', filterConfig);
                    }).then(function(data) {
                        if ('rows' in data && data.rows.length === 0) {
                            data.rows[0].QCState = 5;
                            return WebUtils.API.updateRows('ehr', 'requests', data.rows)
                        }
                        else {
                            throw new Error("Expected exactly one row")
                        }
                    }).catch(function() {
                        alert("Unable to revert the request to Pending status.  Please contact your administrator to fix this.")
                    });
                }).finally(function() {
                    $('#scheduleRequestForm').unblock();
                });
            }
        });

        WebUtils.VM.disableForm();
        WebUtils.VM.form.lsid.subscribe(function(val) {
            if (val == '') {
                WebUtils.VM.disableForm();
            }
            else {
                WebUtils.VM.enableForm();
                WebUtils.VM.form.assignedTo('<%= defaultAssignedUserID %>');
                $assignedToField.val('<%= defaultAssignedDisplayName %>');
            }
        })
    })();
</script>