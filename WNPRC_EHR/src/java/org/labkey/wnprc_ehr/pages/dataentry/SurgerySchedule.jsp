<%@ page import="org.labkey.wnprc_ehr.GoogleCalendar" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.wnprc_ehr.Office365Calendar" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.css' />
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.js'></script>

<style type="text/css">
    /* Full Calendar heading */
    #calendar .fc-toolbar h1 {
        font-size: 20px;
        margin: 0;
    }
</style>


<%
    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());
    SimpleQuery requests = queryFactory.makeQuery("study", "SurgeryRequests", "pending");
//    String testString = requests.toString();
//    List<JSONObject> requestList = JsonUtils.getListFromJSONArray(requests.getResults().getJSONArray("rows"));

    //List<Event> items = GoogleCalendarTest.testMethod();
    GoogleCalendar ct = new GoogleCalendar();
    ct.setUser(getUser());
    ct.setContainer(getContainer());
    String eventsString = ct.getCalendarEventsAsJson();

    Office365Calendar oct = new Office365Calendar();
    oct.setUser(getUser());
    oct.setContainer(getContainer());
    String outlookEventsString = oct.getCalendarEventsAsJson();
%>

<div class="col-xs-12 col-xl-8">
    <div class="col-xs-12 col-md-4">
        <div class="panel panel-primary">
            <div class="panel-heading"><span>Surgery Details</span></div>
            <div class="panel-body" data-bind="with: taskDetails">
                <%--<!-- ko ifnot: taskid() != '' -->--%>
                <p><em>Please click on a Surgery in the Calendar to view details for that Surgery.</em></p>
                <%--<!-- /ko -->--%>
                <%--<!-- ko if: taskid() != '' -->--%>
                <dl class="dl-horizontal">
                    <dt>Task ID:            </dt> <dd>{{taskid}}</dd>
                    <dt>Procedure:          </dt> <dd>{{procedure}}</dd>
                    <dt>Animal ID:          </dt> <dd><a href="{{animalLink}}">{{animalid}}</a></dd>
                    <dt>Sex:                </dt> <dd>{{sex}}</dd>
                    <dt>Age:                </dt> <dd>{{age}}</dd>
                    <dt>Weight:             </dt> <dd>{{weight}}</dd>
                    <dt>Medical:            </dt> <dd>{{medical}}</dd>
                    <dt>Project (Account):  </dt> <dd>{{project}} ({{account}})</dd>
                    <dt>Protocol:           </dt> <dd>{{protocol}}</dd>
                    <dt>Surgery Start:      </dt> <dd>{{surgerystart}}</dd>
                    <dt>Comments:           </dt> <dd>{{comments}}</dd>

                    <%--<!-- ko if: !_.isBlank(cur_room()) && !_.isBlank(cur_cage()) -->--%>
                    <dt>Current Room:       </dt> <dd>{{cur_room}}</dd>
                    <dt>Current Cage:       </dt> <dd>{{cur_cage}}</dd>
                    <dt>Housing Type:       </dt> <dd>{{cur_cond}}</dd>
                    <%--<!-- /ko -->--%>

                </dl>
                <%--<!-- /ko -->--%>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-md-8">
        <div class="panel panel-primary">
            <div class="panel-heading"><span>Calendar</span></div>
            <div class="panel-body">
                <div id="calendar"></div>
            </div>
        </div>
    </div>
</div>

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
                <p><em>There are no pending Surgery requests.</em></p>
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
                            <select data-bind="value: location" class="form-control">
                                <option value=""></option>
                                <%--<%--%>
                                    <%--for(JSONObject necropsySuite : necropsySuites) {--%>
                                        <%--String suiteName = necropsySuite.getString("room");--%>
                                <%--%>--%>
                                <%--<option value="<%=suiteName%>"><%=h(suiteName)%></option>--%>
                                <%--<%--%>
                                    <%--}--%>
                                <%--%>--%>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Pathologist</label>
                        <div class="col-xs-8">
                            <%--<select data-bind="value: pathologist" class="form-control">--%>
                                <%--<option value=""></option>--%>
                                <%--<%--%>
                                    <%--for(JSONObject pathologist : pathologistList) {--%>
                                        <%--String userid = pathologist.getString("userid");--%>
                                        <%--String internaluserid = pathologist.getString("internaluserid");--%>
                                <%--%>--%>
                                <%--<option value="<%=internaluserid%>"><%=h(userid)%></option>--%>
                                <%--<%--%>
                                    <%--}--%>
                                <%--%>--%>
                            <%--</select>--%>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Prosector</label>
                        <div class="col-xs-8">
                            <%--<select data-bind="value: assistant" class="form-control">--%>
                                <%--<option value=""></option>--%>
                                <%--<%--%>
                                    <%--for(JSONObject pathologist : pathologistList) {--%>
                                        <%--String userid = pathologist.getString("userid");--%>
                                        <%--String internaluserid = pathologist.getString("internaluserid");--%>
                                <%--%>--%>
                                <%--<option value="<%=internaluserid%>"><%=h(userid)%></option>--%>
                                <%--<%--%>
                                    <%--}--%>
                                <%--%>--%>
                            <%--</select>--%>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Assigned To</label>
                        <div class="col-xs-8">
                            <%--<input type="hidden" class="hidden-assignedTo-field" data-bind="value: assignedTo">--%>
                            <%--<input type="text" class="form-control assignedTo-field">--%>
                        </div>
                    </div>

                    <div style="text-align: right;">
                        <button class="btn btn-default" data-bind="click: $root.clearForm">Cancel</button>
                        <button class="btn btn-primary" data-bind="click: $root.submitForm">Schedule Surgery</button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</div>

<%--<div class="col-xs-12 col-xl-8">--%>
    <%--<div class="col-xs-12 col-md-8">--%>
        <%--<div class="panel panel-primary">--%>
            <%--<div class="panel-heading"><span>Test</span></div>--%>
            <%--<div class="panel-body">--%>
                <%--<div id="test"></div>--%>
                <%--<%=requestList.toString()%>--%>
            <%--</div>--%>
        <%--</div>--%>
    <%--</div>--%>
<%--</div>--%>

<script>
    //debugger
    (function() {
        var $calendar = $('#calendar');
        $(document).ready(function() {
            $calendar.fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },

                eventSources: [
                    {
                        events: <%=eventsString%>,
                        color: 'red',
                        eventTextColor: 'black',
                        className: 'testClass'
                    },
                    {
                        events: <%=outlookEventsString%>,
                        color: 'orange',
                        eventTextColor: 'black',
                        className: 'testClass'
                    },
                    {
                        events: [
                            {
                                title: 'Test123 this is a really long string to see what happens!',
                                start: '2018-03-22',
                                end:   '2018-03-23'
                            }
                        ],
                        color: 'yellow',
                        eventTextColor: 'red'
                    }
                ],
//                eventClick: function(event) {
//                    window.open(event.htmlLink, 'gcalevent', 'width=900,height=600');
//                    return false;
//                }
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

        //debugger

        // Build a lookup index of requests.
        var pendingRequests = <%= requests.getResults().getJSONArray("rows") %>;
        var pendingRequestsIndex = {};
        jQuery.each(pendingRequests, function(i, request) {
            pendingRequestsIndex[request.lsid] = request;
        });

        var displayDate = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").calendar(null, {
                sameElse: 'MMM D[,] YYYY'
            })
        };

        var displayDateTime = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").calendar(null, {
                sameElse: 'MMM D[,] YYYY [at] h:mm a'
            })
        };

        var triggerChange = function($el) {
            $el.change();
        };

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
                objectid:             ko.observable(),
                taskid:               ko.observable(''),
                procedure:            ko.observable(),
                age:                  ko.observable(),
                animalid:             ko.observable(),
                date:                 ko.observable(),
                account:              ko.observable(),
                cur_room:             ko.observable(),
                cur_cage:             ko.observable(),
                cur_cond:             ko.observable(),
                location:             ko.observable(), // Surgery location
                medical:              ko.observable(),
                project:              ko.observable(),
                protocol:             ko.observable(),
                sex:                  ko.observable(),
                weight:               ko.observable(),
                surgerystart:         ko.observable(),
                surgeryend:           ko.observable(),
                comments:             ko.observable()
            },
            form: ko.mapping.fromJS({
                lsid:           '',
                objectid:       '',
                animalid:       '',
                date:           new Date(),
                location:       '',
                priority:       '',
                surgerystart:   '',
                surgeryend:     '',
                procedure:      '',
                comments:       ''
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
                rowHeaders: ["Request ID", "Priority", "Animal ID", "Requested By", "Requested On", "Requested Start", "Requested End"],
                rows: pendingRequests.map(function(row) {
                    return new WebUtils.Models.TableRow({
                        data: [
                            row.requestid,
                            row.priority,
                            row.animalid,
                            row.requestor,
                            displayDate(row.created),
                            displayDateTime(row.surgerystart),
                            displayDateTime(row.surgeryend)
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

        WebUtils.VM.form.href = ko.computed(function() {
            var lsid = WebUtils.VM.form.lsid();

            if (lsid == '') {
                return '#';
            }

            return LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormDetails', null, {
                formType: 'SurgeryRequest',
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

                console.log('START: ' + form.surgerystart);
                console.log('END: ' + form.surgeryend);

                var filterConfig = {
                    'requestid~eq': form.lsid,
                    columns: ['lsid', 'requestid', 'taskid']
                };

                console.log('before AJAX request');

                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "AddSurgeryToCalendar", null, {
                        start: form.surgerystart,
                        end: form.surgeryend,
                        subject: form.animalid + ' ' + form.procedure,
                        body: form.objectid,
                        categories: 'Surgeries'
                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success)
                            console.log('it worked!?');
                    }, this)
                });

                console.log('after AJAX request');

                WebUtils.API.insertRows('ehr','tasks', [{
                    taskid:     taskid,
                    title:      'Surgery',
                    category:   'task',
                    assignedto: form.assignedTo,
                    QCState:    10, // Scheduled
                    duedate:    moment(date).hour(17).minute(0).format('YYYY-MM-DD HH:mm:ss'), // 5pm
                    formtype:   "Surgery"
                }]).then(function(data) {
                    taskInsertSuccess = true;
                    return Promise.all([
                        WebUtils.API.selectRows('study', 'surgery',       filterConfig),
                        WebUtils.API.selectRows('ehr',   'requests',        filterConfig)
                    ]);
                }).then(function(dataArray) {
                    // Update the regular study rows.
                    var rowsToUpdate = dataArray.slice(0,1).map(function(returnData) {
                        var rows = returnData.rows;

                        return rows.map(function(row) {
                            row.taskid = taskid;
                            row.QCState = 10; // Scheduled
                            row.date = date;
                            return row;
                        });
                    });

                    // Handle the requests rows.
                    rowsToUpdate.push(dataArray[1].rows.map(function(row) {
                        row.QCState = 8; // Request: Approved
                        return row;
                    }));

                    console.log('before updateRows');
                    return Promise.all([
                        (rowsToUpdate[0].length > 0) ? WebUtils.API.updateRows('study', 'surgery',  rowsToUpdate[0]) : Promise.resolve(),
                        (rowsToUpdate[1].length > 0) ? WebUtils.API.updateRows('ehr',   'requests', rowsToUpdate[1]) : Promise.resolve()
                    ]);
                    console.log('after updateRows');
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
            }
        })
    })();
</script>