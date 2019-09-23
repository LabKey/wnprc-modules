<%@ page import="org.labkey.wnprc_ehr.calendar.GoogleCalendar" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.wnprc_ehr.calendar.Office365Calendar" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="java.util.UUID" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Comparator" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.text.ParseException" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_ehr.WNPRC_EHRController" %>
<%@ page import="org.labkey.api.security.Group" %>
<%@ page import="org.labkey.api.security.GroupManager" %>
<%@ page import="org.labkey.security.xml.GroupEnumType" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/core/main.min.css' />
<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/daygrid/main.min.css' />
<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/timegrid/main.min.css' />
<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/bootstrap/main.min.css' />
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/core/main.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/daygrid/main.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/timegrid/main.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/4.2.0/bootstrap/main.min.js'></script>

<style type="text/css">
    /* Full Calendar heading */
    #calendar .fc-toolbar h1 {
        font-size: 20px;
        margin: 0;
    }
</style>


<%
    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());
    SimpleQuery requests = queryFactory.makeQuery("study", "SurgeryProcedureRequests", "pending");
    System.out.println("Requests: " + requests);
    JSONArray jsonRequests = requests.getResults().getJSONArray("rows");
    ArrayList<Integer> positionsToRemove = new ArrayList<>();
    System.out.println("JSON Requests: " + jsonRequests);
    for(int i = 0; i < jsonRequests.length(); i++)
    {
        JSONObject row1 = jsonRequests.getJSONObject(i);
        for (int j = i + 1; j < jsonRequests.length(); j++)
        {
            JSONObject row2 = jsonRequests.getJSONObject(j);
            UUID row1id = UUID.fromString(row1.getString("requestid"));
            UUID row2id = UUID.fromString(row2.getString("requestid"));
            if (row1id.equals(row2id))
            {
                positionsToRemove.add(j);
                row1.put("animalid", row1.get("animalid") + "," + row2.get("animalid"));
            }
        }
    }
    List<JSONObject> statRequests = new ArrayList<>();
    List<JSONObject> asapRequests = new ArrayList<>();
    List<JSONObject> routineRequests = new ArrayList<>();
    //Remove linked requests and separate by request priority
    for(int i = 0; i < jsonRequests.length(); i++) {
        if (!positionsToRemove.contains(i)) {
            String priority = (jsonRequests.getJSONObject(i)).getString("priority");
            switch (priority) {
                case "Stat": statRequests.add(jsonRequests.getJSONObject(i));
                    break;
                case "ASAP": asapRequests.add(jsonRequests.getJSONObject(i));
                    break;
                case "Routine": routineRequests.add(jsonRequests.getJSONObject(i));
                    break;
            }
        }
    }
    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    Comparator<JSONObject> dateComparator = new Comparator<JSONObject>() {
        @Override
        public int compare(JSONObject o1, JSONObject o2) {
            int result = 0;
            try {
                result = formatter.parse(o1.getString("date")).compareTo(formatter.parse(o2.getString("date")));
            } catch (ParseException pe) {
                System.out.println("ERROR: " + pe.getStackTrace());
                //Silently fail.... (not a big deal, they just won't be sorted)
            }
            return result;
        }
    };
    statRequests.sort(dateComparator);
    asapRequests.sort(dateComparator);
    routineRequests.sort(dateComparator);
    //Add all requests back into one list that's now ordered by priority followed by start time
    JSONArray pendingRequests = new JSONArray();
    for(JSONObject statRequest : statRequests) {
        pendingRequests.put(statRequest);
    }
    for(JSONObject asapRequest : asapRequests) {
        pendingRequests.put(asapRequest);
    }
    for(JSONObject routineRequest : routineRequests) {
        pendingRequests.put(routineRequest);
    }
    List<JSONObject> surgeryRooms = JsonUtils.getListFromJSONArray(queryFactory.selectRows("wnprc", "surgery_procedure_rooms"));
    Group vetGroup = GroupManager.getGroup(getContainer(), "veterinarians (LDAP)", GroupEnumType.SITE);
    Group spiGroup = GroupManager.getGroup(getContainer(), "spi (LDAP)", GroupEnumType.SITE);
    boolean isVet = getUser().isInGroup(vetGroup.getUserId()) || getUser().isInSiteAdminGroup();
    boolean isSpi = getUser().isInGroup(spiGroup.getUserId()) || getUser().isInSiteAdminGroup();
%>

<div class="col-xs-12 col-xl-10">
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
                    <dt>Procedure Type:     </dt> <dd>{{proceduretype}}</dd>
                    <dt>Procedure Name:     </dt> <dd>{{procedurename}}</dd>
                    <dt>Animal ID:          </dt> <dd><a href="{{animalLink}}">{{animalid}}</a></dd>
                    <dt>Sex:                </dt> <dd>{{sex}}</dd>
                    <dt>Age:                </dt> <dd>{{age}}</dd>
                    <dt>Weight:             </dt> <dd>{{weight}}</dd>
                    <dt>Medical:            </dt> <dd>{{medical}}</dd>
                    <dt>Project (Account):  </dt> <dd>{{project}} ({{account}})</dd>
                    <dt>Protocol:           </dt> <dd>{{protocol}}</dd>
                    <dt>Surgery Start:      </dt> <dd>{{date}}</dd>
                    <dt>Surgery End:        </dt> <dd>{{enddate}}</dd>
                    <dt>Surgery Location:   </dt> <dd>{{location}}</dd>
                    <dt>Comments:           </dt> <dd>{{comments}}</dd>

                    <%--<!-- ko if: !_.isBlank(cur_room()) && !_.isBlank(cur_cage()) -->--%>
                    <dt>Current Room:       </dt> <dd>{{cur_room}}</dd>
                    <dt>Current Cage:       </dt> <dd>{{cur_cage}}</dd>
                    <dt>Housing Type:       </dt> <dd>{{cur_cond}}</dd>
                    <%--<!-- /ko -->--%>

                </dl>
                <%--<!-- /ko -->--%>
                <%--<!-- ko if: hold() -->--%>
                <div style="text-align: right;">
                    <button class="btn btn-danger" data-bind="click: $root.cancelHeldEvent">Cancel</button>
                </div>
                <%--<a class="btn btn-default" href="{{$parent.cancelHeldEvent}}"         data-bind="css: { disabled: _.isBlank(taskid()) }">Cancel</a>--%>
                <%--<!-- /ko -->--%>
                <%--<a class="btn btn-default" href="{{$parent.viewNecropsyReportURL}}" data-bind="css: { disabled: _.isBlank(taskid()) }">Report</a>--%>
                <%--<a class="btn btn-default" href="{{$parent.viewNecropsyURL}}"       data-bind="css: { disabled: _.isBlank(taskid()) }">View Record</a>--%>
                <%--<a class="btn btn-primary" href="{{$parent.editNecropsyURL}}"       data-bind="css: { disabled: _.isBlank(taskid()) }">Edit Record</a>--%>
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

<div class="col-xs-12 col-xl-10">
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
                <!-- ko if: requestid() == '' -->
                <p style="text-align: center">
                    <em>Please click on a pending request to schedule it.</em>
                </p>
                <!-- /ko -->

                <form class="form-horizontal scheduleForm">
                    <!-- ko if: requestid() != '' -->
                    <div class="form-group">
                        <label class="col-xs-4 control-label">Request ID</label>
                        <div class="col-xs-8">
                            <p class="form-control-static">
                                <a href="{{href}}">
                                    {{ requestid | lookup:$root.RequestIdLookup }}
                                </a>
                                <span> ({{ requestid | lookup:$root.PriorityLookup }})</span>
                            </p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Animal ID(s)</label>
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
                                <%
                                    for(JSONObject surgeryRoom : surgeryRooms) {
                                        String roomName = surgeryRoom.getString("room");
                                %>
                                <option value="<%=roomName%>"><%=h(roomName)%></option>
                                <%
                                    }
                                %>
                            </select>
                        </div>
                    </div>

                    <%--<div class="form-group">--%>
                    <%--<label class="col-xs-4 control-label">Pathologist</label>--%>
                    <%--<div class="col-xs-8">--%>
                    <%--&lt;%&ndash;<select data-bind="value: pathologist" class="form-control">&ndash;%&gt;--%>
                    <%--&lt;%&ndash;<option value=""></option>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;&lt;%&ndash;%>--%>
                    <%--&lt;%&ndash;for(JSONObject pathologist : pathologistList) {&ndash;%&gt;--%>
                    <%--&lt;%&ndash;String userid = pathologist.getString("userid");&ndash;%&gt;--%>
                    <%--&lt;%&ndash;String internaluserid = pathologist.getString("internaluserid");&ndash;%&gt;--%>
                    <%--&lt;%&ndash;%>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;<option value="<%=internaluserid%>"><%=h(userid)%></option>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;&lt;%&ndash;%>--%>
                    <%--&lt;%&ndash;}&ndash;%&gt;--%>
                    <%--&lt;%&ndash;%>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;</select>&ndash;%&gt;--%>
                    <%--</div>--%>
                    <%--</div>--%>

                    <%--<div class="form-group">--%>
                    <%--<label class="col-xs-4 control-label">Prosector</label>--%>
                    <%--<div class="col-xs-8">--%>
                    <%--&lt;%&ndash;<select data-bind="value: assistant" class="form-control">&ndash;%&gt;--%>
                    <%--&lt;%&ndash;<option value=""></option>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;&lt;%&ndash;%>--%>
                    <%--&lt;%&ndash;for(JSONObject pathologist : pathologistList) {&ndash;%&gt;--%>
                    <%--&lt;%&ndash;String userid = pathologist.getString("userid");&ndash;%&gt;--%>
                    <%--&lt;%&ndash;String internaluserid = pathologist.getString("internaluserid");&ndash;%&gt;--%>
                    <%--&lt;%&ndash;%>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;<option value="<%=internaluserid%>"><%=h(userid)%></option>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;&lt;%&ndash;%>--%>
                    <%--&lt;%&ndash;}&ndash;%&gt;--%>
                    <%--&lt;%&ndash;%>&ndash;%&gt;--%>
                    <%--&lt;%&ndash;</select>&ndash;%&gt;--%>
                    <%--</div>--%>
                    <%--</div>--%>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Hold/Deny Reason</label>
                        <div class="col-xs-8">
                            <div class='input-group' id='holddenyreason'>
                                <input type='text' class="form-control" data-bind="value: statuschangereason">
                            </div>
                        </div>


                        <%--<div class="col-xs-8">--%>
                        <%--<p class="form-control">{{statuschangereason}}</p>--%>
                        <%--&lt;%&ndash;<input type="hidden" class="hidden-assignedTo-field" data-bind="value: assignedTo">&ndash;%&gt;--%>
                        <%--&lt;%&ndash;<input type="text" class="form-control assignedTo-field">&ndash;%&gt;--%>
                        <%--</div>--%>
                    </div>

                    <div style="text-align: right;">
                        <button class="btn btn-default" data-bind="click: $root.clearForm">Cancel</button>
                        <button class="btn btn-danger" data-bind="click: $root.denyForm">Deny</button>
                        <button class="btn btn-warning" data-bind="click: $root.holdForm">Hold</button>
                        <button class="btn btn-success" data-bind="click: $root.submitForm">Schedule</button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</div>

<script>
    var previousCalendarEvent;
    //debugger
    (function() {
        var calendarEl = document.getElementById('calendar');
        $(document).ready(function() {
            var calendar = new FullCalendar.Calendar(calendarEl, {
                plugins: ['dayGrid', 'timeGrid', 'bootstrap'],
                themeSystem: 'bootstrap',
                defaultView: 'dayGridMonth',
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                eventClick: function(calEvent) {
                    if (previousCalendarEvent) {
                        previousCalendarEvent.setProp('backgroundColor', previousCalendarEvent.extendedProps.defaultBgColor);
                    }
                    previousCalendarEvent = calEvent.event;
                    calEvent.event.setProp('backgroundColor', calEvent.event.extendedProps.selectedBgColor);
                    jQuery.each(calEvent.event.extendedProps.rawRowData, function(key, value) {
                        if (key in WebUtils.VM.taskDetails) {
                            if (key == "date" || key == "enddate") { //TODO modified???
                                value = displayDate(value);
                            }
                            WebUtils.VM.taskDetails[key](value);
                        }
                    });
                }
            });

            LABKEY.Query.selectRows({
                schemaName: 'wnprc',
                queryName: 'surgery_procedure_calendars',
                columns: 'calendar_id,calendar_type,display_name,api_action,show_by_default,folder_id',
                scope: this,
                success: function(data){
                    if (data.rows && data.rows.length > 0) {
                        for (let i = 0; i < data.rows.length; i++) {
                            calendar.addEventSource(function(fetchInfo, successCallback, failureCallback) {
                                LABKEY.Ajax.request({
                                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", data.rows[i].api_action, null, {
                                        calendarId: data.rows[i].calendar_id,
                                        folderId:   data.rows[i].folder_id
                                    }),
                                    success: LABKEY.Utils.getCallbackWrapper(function (response) {
                                        successCallback(JSON.parse(response.events).map(function (event) {
                                            return {
                                                title: event.title,
                                                start: event.start,
                                                end: event.end,
                                                backgroundColor: event.defaultBgColor,
                                                defaultBgColor: event.defaultBgColor,
                                                selectedBgColor: event.selectedBgColor,
                                                rawRowData: event.rawRowData
                                            }
                                        }));
                                    }, this)
                                });
                            });
                        }
                        calendar.render();
                    }
                }
            });

            calendar.render();
        });
        //debugger
        // Build a lookup index of requests.
        var pendingRequestsIndex = {};
        var pendingRequests = <%= pendingRequests %>;
        jQuery.each(pendingRequests, function(i, request) {
            pendingRequestsIndex[request.requestid] = request;
        });
        var displayDate = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY');
        };
        var displayDateTime = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY [at] h:mm a');
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
                requestid:            ko.observable(),
                taskid:               ko.observable(''),
                proceduretype:        ko.observable(),
                procedurename:        ko.observable(),
                age:                  ko.observable(),
                animalid:             ko.observable(),
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
                date:                 ko.observable(),
                enddate:              ko.observable(),
                comments:             ko.observable(),
                hold:                 ko.observable()
            },
            form: ko.mapping.fromJS({
                lsid:               '',
                objectid:           '',
                requestid:          '',
                taskid:             '',
                animalid:           '',
                location:           '',
                priority:           '',
                date:               '',
                enddate:            '',
                proceduretype:      '',
                procedurename:      '',
                comments:           '',
                statuschangereason: ''
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
                rowHeaders: ["Request ID", "Priority", "Animal ID(s)", "Requested By", "Requested On", "Requested Start", "Requested End"],
                rows: pendingRequests.map(function(row) {
                    return new WebUtils.Models.TableRow({
                        data: [
                            row.rowid,
                            row.priority,
                            row.animalid,
                            row.requestor,
                            displayDate(row.created),
                            displayDateTime(row.date),
                            displayDateTime(row.enddate)
                        ],
                        otherData: row,
                        warn: (row.priority == 'ASAP'),
                        err:  (row.priority == 'Stat'),
                        success: (row.priority == 'Routine')
                    });
                })
            }),
            requestTableClickAction: function(row) {
                WebUtils.VM.requestRowInForm = row;
                WebUtils.VM.updateForm(row.otherData.requestid);
            }
        });
        WebUtils.VM.taskDetails.animalLink = ko.pureComputed(function() {
            var animalId = WebUtils.VM.taskDetails.animalid();
            return LABKEY.ActionURL.buildURL('ehr', 'participantView', null, {
                participantId: animalId
            });
        });
        WebUtils.VM.form.href = ko.computed(function() {
            var requestid = WebUtils.VM.form.requestid();
            if (requestid == '') {
                return '#';
            }
            return LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormDetails', null, {
                formType: 'SurgeryProcedureRequest',
                returnURL: window.location,
                requestId: requestid
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
            updateForm: function(requestid) {
                var request = pendingRequestsIndex[requestid];
                if (!_.isObject(request)) {
                    return;
                }
                jQuery.each(request, function(key, value) {
                    if (key in WebUtils.VM.form) {
                        if (key == "date" || key == "enddate") { //TODO modified???
                            value = new Date(value);
                        }
                        WebUtils.VM.form[key](value);
                    }
                });
            },
            holdForm: function() {
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
                var form = ko.mapping.toJS(WebUtils.VM.form);
                // Call the WNPRC_EHRController->ScheduleSurgeryProcedureAction method to
                // update the study.surgery_procedure, ehr.request, and ehr.task tables
                let calendarId;
                if (form.proceduretype === 'surgery') {
                    calendarId = 'surgeries_on_hold';
                } else if (form.proceduretype === 'procedure' || form.proceduretype === 'other') {
                    calendarId = 'procedures_on_hold';
                } else {
                    //TODO handle the error!
                }
                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "ScheduleSurgeryProcedure", null, {
                        requestId: form.requestid,
                        start: form.date,
                        end: form.enddate,
                        room: form.location,
                        subject: form.animalid + ' ' + form.procedurename,
                        categories: 'Surgeries',
                        assignedTo: form.assignedto,
                        calendarId: calendarId
                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success) {
                            WebUtils.VM.pendingRequestTable.rows.remove(WebUtils.VM.requestRowInForm);
                            location.reload(true);
                        } else {
                            alert('There is already a surgery or procedure scheduled in room ' + form.location + ' during the selected time.');
                        }
                        // Clear the form
                        WebUtils.VM.clearForm();
                        $('#scheduleRequestForm').unblock();
                    }, this),
                    failure: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        $('#scheduleRequestForm').unblock();
                    }, this)
                });
            },
            denyForm: function() {
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
                var form = ko.mapping.toJS(WebUtils.VM.form);
                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "SurgeryProcedureChangeStatus", null, {
                        requestId: form.requestid,
                        QCStateLabel: 'Request: Denied',
                        statusChangeReason: form.statuschangereason
                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success) {
                            WebUtils.VM.pendingRequestTable.rows.remove(WebUtils.VM.requestRowInForm);
                            location.reload(true);
                        } else {
                            alert('There was an error denying the request.');
                        }
                        // Clear the form
                        WebUtils.VM.clearForm();
                        $('#scheduleRequestForm').unblock();
                    }, this),
                    failure: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        $('#scheduleRequestForm').unblock();
                    }, this)
                });
            },
            cancelHeldEvent: function() {
                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "SurgeryProcedureChangeStatus", null, {
                        requestId: WebUtils.VM.taskDetails.requestid(),
                        taskId: WebUtils.VM.taskDetails.taskid(),
                        QCStateLabel: 'Request: Pending'
                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success) {

                            //location.reload(true);
                        } else {
                            alert('There was an error while trying to cancel the event.');
                        }
                    }, this)
                });
            },
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
                var form = ko.mapping.toJS(WebUtils.VM.form);
                // Call the WNPRC_EHRController->ScheduleSurgeryProcedureAction method to
                // update the study.surgery_procedure, ehr.request, and ehr.task tables
                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "ScheduleSurgeryProcedure", null, {
                        requestId: form.requestid,
                        start: form.date,
                        end: form.enddate,
                        room: form.location,
                        subject: form.animalid + ' ' + form.procedurename,
                        categories: 'Surgeries',
                        assignedTo: form.assignedto,
                        hold: false
                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success) {
                            WebUtils.VM.pendingRequestTable.rows.remove(WebUtils.VM.requestRowInForm);
                            location.reload(true);
                        } else {
                            alert('There is already a surgery or procedure scheduled in room ' + form.location + ' during the selected time.');
                        }
                        // Clear the form
                        WebUtils.VM.clearForm();
                        $('#scheduleRequestForm').unblock();
                    }, this),
                    failure: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        $('#scheduleRequestForm').unblock();
                    }, this)
                });
            }
        });
        WebUtils.VM.disableForm();
        WebUtils.VM.form.requestid.subscribe(function(val) {
            if (val == '') {
                WebUtils.VM.disableForm();
            }
            else {
                WebUtils.VM.enableForm();
            }
        })
    })();
</script>