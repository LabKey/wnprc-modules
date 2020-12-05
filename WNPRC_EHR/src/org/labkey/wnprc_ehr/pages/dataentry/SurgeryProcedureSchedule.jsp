<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="java.util.List" %>
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
<%@ page import="org.labkey.api.view.template.ClientDependencies" %>
<%@ page import="java.text.DateFormat" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!
    @Override
    public void addClientDependencies(ClientDependencies dependencies) {
        dependencies.add("/webutils/lib/fullcalendar-5.3.2/lib/main.min.css");
        dependencies.add("/webutils/lib/fullcalendar-5.3.2/lib/main.min.js");
    }
%>

<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />

<style type="text/css">
    /* Full Calendar heading */
    #calendar .fc-toolbar h1 {
        font-size: 20px;
        margin: 0;
    }

    .form-control.knockout-bs-form {
        width: 100%;
    }
    .input-group.date {
        display: table;
    }

    .fc-day-grid-event {
        margin: 4px 4px 0;
    }

    .event-text-light {
        color: black !important;
    }

    .event-text-dark {
        color: white !important;
    }

    .event-selected {
        border: 1px solid white;
        border-radius: 3px;
    }

    .event-selected:before {
        border: 3px solid black;
        border-radius: 6px;
        background: none;
        content: "";
        display: block;
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        pointer-events: none;
    }
</style>

<script type="text/javascript">

    function createModalSelectDiv(label, id, selectedOption) {
        let mainDiv = document.createElement("div");
        mainDiv.classList.add("form-group");
        let labelEl = document.createElement("label");
        labelEl.htmlFor = id;
        labelEl.classList.add("col-xs-4");
        labelEl.classList.add("control-label");
        labelEl.innerHTML = label;
        let middleDiv = document.createElement("div");
        middleDiv.classList.add("col-xs-8");
        let inputDiv = document.createElement("div");
        inputDiv.classList.add("input-group");
        let selectEl = document.createElement("select");
        selectEl.classList.add("form-control");
        selectEl.id = id;
        selectEl.name = id;

        let keys = Object.keys(calendarEvents);
        keys.sort();
        for (let i = 0; i < keys.length; i++) {
            if (calendarEvents.hasOwnProperty(keys[i])) {
                if (calendarEvents[keys[i]].roomCalendar) {
                    let optionEl = document.createElement("option");
                    optionEl.value = calendarEvents[keys[i]].id;
                    optionEl.innerHTML = calendarEvents[keys[i]].displayName;
                    if (calendarEvents[keys[i]].id === selectedOption) {
                        optionEl.selected = true;
                    }
                    selectEl.appendChild(optionEl);
                }
            }
        }

        inputDiv.appendChild(selectEl);
        middleDiv.appendChild(inputDiv);
        mainDiv.appendChild(labelEl);
        mainDiv.appendChild(middleDiv);

        return mainDiv;
    }

    function createModalDiv(label, inputType, id, value) {
        let mainDiv = document.createElement("div");
        mainDiv.classList.add("form-group");
        let labelEl = document.createElement("label");
        labelEl.htmlFor = id;
        labelEl.classList.add("col-xs-4");
        labelEl.classList.add("control-label");
        labelEl.innerHTML = label;
        let middleDiv = document.createElement("div");
        middleDiv.classList.add("col-xs-8");
        let inputDiv = document.createElement("div");
        inputDiv.classList.add("input-group");
        let inputEl = document.createElement("input");
        inputEl.type = inputType;
        inputEl.classList.add("form-control");
        inputEl.id = id;
        inputEl.name = id;
        inputEl.value = value;

        inputDiv.appendChild(inputEl);
        middleDiv.appendChild(inputDiv);
        mainDiv.appendChild(labelEl);
        mainDiv.appendChild(middleDiv);

        return mainDiv;
    }

    function dateToDateInputField(date) {
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        let hours = ("0" + date.getHours()).slice(-2);
        let minutes = ("0" + date.getMinutes()).slice(-2);
        let value = year + "-" + month + "-" + day + "T" + hours + ":" + minutes;

        return value;
    }

    //from https://awik.io/determine-color-bright-dark-using-javascript/
    function lightOrDark(color) {

        // Variables for red, green, blue values
        let r, g, b, hsp;

        // Check the format of the color, HEX or RGB?
        if (color.match(/^rgb/)) {

            // If HEX --> store the red, green, blue values in separate variables
            color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

            r = color[1];
            g = color[2];
            b = color[3];
        }
        else {

            // If RGB --> Convert it to HEX: http://gist.github.com/983661
            color = +("0x" + color.slice(1).replace(
                    color.length < 5 && /./g, '$&$&'));

            r = color >> 16;
            g = color >> 8 & 255;
            b = color & 255;
        }

        // HSP equation from http://alienryderflex.com/hsp.html
        hsp = Math.sqrt(
                0.299 * (r * r) +
                0.587 * (g * g) +
                0.114 * (b * b)
        );

        // Using the HSP value, determine whether the color is light or dark
        if (hsp>127.5) {

            return 'light';
        }
        else {

            return 'dark';
        }
    }

    function getEventSubject(form) {
        return form.animalid + ' ' + form.procedurename;
    }

    function createRequestObj(action, calendarIdSuffix) {
        let form = ko.mapping.toJS(WebUtils.VM.form);

        let requestObj;
        if (action === 'addToCalendar') {
            let calendarId;
            if (form.procedurecategory === 'surgery') {
                calendarId = 'surgeries_' + calendarIdSuffix;
            }
            else if (form.procedurecategory === 'imaging' || form.procedurecategory === 'other') {
                calendarId = 'procedures_' + calendarIdSuffix;
            }
            requestObj = {
                requestId: form.requestid,
                start: form.date,
                end: form.enddate,
                subject: getEventSubject(form),
                categories: 'Surgeries',
                assignedTo: form.assignedto,
                calendarId: calendarId
            };
        } else if (action === 'denyRequest') {
            requestObj = {
                requestId: form.requestid,
                QCStateLabel: 'Request: Denied',
                statusChangeReason: form.statuschangereason
            }
        }
        return requestObj;
    }

    function scheduleSurgeryProcedure(apiAction, requestObj) {
        $('#scheduleRequestForm').block({
            message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Processing...',
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

        // Call the WNPRC_EHRController->ScheduleSurgeryProcedureAction method to
        // update the study.surgery_procedure, ehr.request, and ehr.task tables
        let requestId = requestObj.requestId;
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL("wnprc_ehr", apiAction, null, requestObj),
            success: LABKEY.Utils.getCallbackWrapper(function (response)
            {
                if (response.success) {
                    WebUtils.VM.pendingRequestTable.rows.remove(WebUtils.VM.requestRowInForm);
                    pendingRequestsIndex[requestId] = {};

                    //Add the newly added events to the calendarEvents object as well as on the fullcalendar
                    for (let cal in response.events) {
                        if (response.events.hasOwnProperty(cal)) {
                            for (let i = 0; i < response.events[cal].events.length; i++) {
                                let event = response.events[cal].events[i];
                                calendarEvents[cal].events.push(event);
                                let eventSource = calendar.getEventSourceById(cal);
                                calendar.addEvent(event, eventSource);
                            }
                        }
                    }
                } else {
                    alert(response.error);
                }
                // Clear the form
                WebUtils.VM.clearForm();
                $('#scheduleRequestForm').unblock();
            }, this),
            failure: LABKEY.Utils.getCallbackWrapper(function (response)
            {
                alert("Something went wrong: " + JSON.stringify(response));
                $('#scheduleRequestForm').unblock();
            }, this)
        });
    }

    function updateEvent() {
        let mainEvent = selectedEvent;
        if (selectedEvent.extendedProps.parentid) {
            mainEvent = calendar.getEventById(selectedEvent.extendedProps.parentid)
        }

        selectedEvent = {};
        for (let key in WebUtils.VM.taskDetails) {
            if (key != 'animalLink') {
                WebUtils.VM.taskDetails[key](null);
            }
        }

        let roomIds = [];
        if (mainEvent.extendedProps.childids) {
            roomIds = mainEvent.extendedProps.childids;
        }

        let roomNames = [];
        let roomEmails = [];
        let objectIds = [];
        let starts = [];
        let ends = [];

        let roomEvents = [];
        for (let i = 0; i < roomIds.length; i++) {
            roomEvents.push(calendar.getEventById(roomIds[i]));

            let roomEmail = document.getElementById("modalRoomField_" + i).value;
            let roomName = calendarEvents[roomEmail].room;

            roomNames.push(roomName);
            roomEmails.push(roomEmail);
            objectIds.push(roomEvents[i].extendedProps.objectid);
            starts.push(new Date(document.getElementById("modalStartField_" + i).value));
            ends.push(new Date(document.getElementById("modalEndField_" + i).value));
        }

        let requestObj = {};
        requestObj.calendarId = mainEvent.extendedProps.calendarId;
        requestObj.requestId = mainEvent.extendedProps.requestid;
        requestObj.subject = document.getElementById("modalTitleField").value;
        requestObj.roomNames = roomNames;
        requestObj.roomEmails = roomEmails;
        requestObj.objectIds = objectIds;
        requestObj.starts = starts;
        requestObj.ends = ends;

        console.log(requestObj);

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL("wnprc_ehr", "UpdateSurgeryProcedure", null, requestObj),
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                if (response.success) {
                    //First remove the 'old' events from the calendarEvents object as well as on fullcalendar
                    mainEvent.remove();
                    for (let i = 0; i < roomIds.length; i++) {
                        let roomEventToRemove = calendar.getEventById(roomIds[i]);
                        for (let j = calendarEvents[roomEmails[i]].events.length - 1; j >= 0; j--) {
                            if (calendarEvents[roomEmails[i]].events[j].extendedProps.requestid === requestObj.requestId) {
                                calendarEvents[roomEmails[i]].events.splice(j, 1);
                                if (roomEventToRemove) {
                                    roomEventToRemove.remove();
                                }
                            }
                        }
                    }

                    //Then add the updated events back to the calendarEvents object as well as on the fullcalendar
                    for (let cal in response.events) {
                        if (response.events.hasOwnProperty(cal)) {
                            for (let i = 0; i < response.events[cal].events.length; i++) {
                                let event = response.events[cal].events[i];
                                calendarEvents[cal].events.push(event);
                                let eventSource = calendar.getEventSourceById(cal);
                                calendar.addEvent(event, eventSource);
                            }
                        }
                    }
                }
                else {
                    alert("Houston, we have a problem: " + response.error);
                }
                $('#calendar-selection').unblock();
                $('#procedure-calendar').unblock();
            }, this),
            failure: LABKEY.Utils.getCallbackWrapper(function (response) {
                alert("Something went wrong: " + JSON.stringify(response));
                $('#calendar-selection').unblock();
                $('#procedure-calendar').unblock();
            }, this)
        });

        return requestObj;
    }
</script>


<%
    DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm");

    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    SimpleQuery rooms = queryFactory.makeQuery("wnprc", "SurgeryProcedureRoomSchedule", "pending");
    JSONArray jsonRooms = rooms.getResults().getJSONArray("rows");
    System.out.println("Printing out all rooms...");
    System.out.println("Rooms: " + jsonRooms);
    //TODO FINISH THIS SECTION TO SEND ROOMS!!

    SimpleQuery requests = queryFactory.makeQuery("study", "SurgeryProcedureSchedule", "pending");
    JSONArray jsonRequests = requests.getResults().getJSONArray("rows");
    ArrayList<Integer> positionsToRemove = new ArrayList<>();
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
                System.err.println("ERROR: " + pe.getStackTrace());
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
    List<JSONObject> surgeryRooms = JsonUtils.getListFromJSONArray(queryFactory.selectRows("wnprc", "procedure_rooms"));
    Group vetGroup = GroupManager.getGroup(getContainer(), "veterinarians (LDAP)", GroupEnumType.SITE);
    Group spiGroup = GroupManager.getGroup(getContainer(), "spi (LDAP)", GroupEnumType.SITE);
    boolean isVet = getUser().isInGroup(vetGroup.getUserId()) || getUser().isInSiteAdminGroup();
    boolean isSpi = getUser().isInGroup(spiGroup.getUserId()) || getUser().isInSiteAdminGroup();
%>

<div class="col-xs-12 col-xl-10">
    <div class="col-xs-12 col-md-4">
        <div id="calendar-selection" class="panel panel-primary">
            <div class="panel-heading"><a class="btn btn-primary" data-toggle="collapse" href="#calendar-selection-collapsible" aria-controls="calendar-selection-collapsible" aria-expanded="true">Calendar Selection</a></div>
            <div class="panel-body collapse in" id="calendar-selection-collapsible" aria-expanded="true">
                <div id="calendar-checklist"></div>
            </div>
        </div>
        <div class="panel panel-primary">
            <div class="panel-heading"><a class="btn btn-primary" data-toggle="collapse" href="#surgery-details-collapsible" aria-controls="surgery-details-collapsible" aria-expanded="true">Surgery Details</a></div>
            <div class="panel-body collapse in" id="surgery-details-collapsible" aria-expanded="true" data-bind="with: taskDetails">
                <%--<!-- ko ifnot: taskid() != '' -->--%>
                <p><em>Please click on a Surgery in the Calendar to view details for that Surgery.</em></p>
                <%--<!-- /ko -->--%>
                <%--<!-- ko if: taskid() != '' -->--%>
                <dl class="dl-horizontal">
                    <dt>Task ID:            </dt> <dd>{{taskid}}</dd>
                    <dt>Procedure Type:     </dt> <dd>{{procedurecategory}}</dd>
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
                    <dt>Surgery Location(s):</dt> <dd>{{rooms}}</dd>
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
                    <a class="btn btn-default" href="#" onclick="WebUtils.VM.editEvent()" data-bind="css: { disabled: _.isBlank(taskid()) }">Edit</a>
                    <a class="btn btn-danger" href="#" onclick="WebUtils.VM.cancelEvent()" data-bind="css: { disabled: _.isBlank(taskid()) }">Cancel</a>
                </div>
                <%--<a class="btn btn-default" href="{{$parent.cancelEvent}}"         data-bind="css: { disabled: _.isBlank(taskid()) }">Cancel</a>--%>
                <%--<!-- /ko -->--%>
                <%--<a class="btn btn-default" href="{{$parent.viewNecropsyReportURL}}" data-bind="css: { disabled: _.isBlank(taskid()) }">Report</a>--%>
                <%--<a class="btn btn-default" href="{{$parent.viewNecropsyURL}}"       data-bind="css: { disabled: _.isBlank(taskid()) }">View Record</a>--%>
                <%--<a class="btn btn-primary" href="{{$parent.editNecropsyURL}}"       data-bind="css: { disabled: _.isBlank(taskid()) }">Edit Record</a>--%>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-md-8">
        <div id="procedure-calendar" class="panel panel-primary">
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
                        <label class="col-xs-4 control-label">Start Time</label>
                        <div class="col-xs-8">
                            <p class="form-control-static">{{date}}</p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">End Time</label>
                        <div class="col-xs-8">
                            <p class="form-control-static">{{enddate}}</p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-4 control-label">Location(s)</label>
                        <div class="col-xs-8">
                            <p class="form-control-static">{{rooms}}</p>
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

    <div id="eventModal" class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 id="eventModalTitle" class="modal-title"></h4>
                </div>
                <div id="modalBody" class="modal-body">
                    <form id="modalForm" class="form-horizontal" /></form>
                    <button type="button" class="btn btn-primary" onclick="updateEvent()">Update Event</button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    let selectedEvent = {};
    let calendar = {};
    let calendarEvents = {};
    let pendingRequestsIndex = {};

    (function() {
        let calendarEl = document.getElementById('calendar');

        calendarEl.addEventListener("click", function(clickEvent) {
            if (clickEvent.target.type !== "button" && clickEvent.target.parentElement.type !== "button") {
                if (selectedEvent.id) {
                    let event = calendar.getEventById(selectedEvent.id);
                    if (event) {
                        event.setExtendedProp("selected", false);
                    }
                }
                selectedEvent = {};
                for (let key in WebUtils.VM.taskDetails) {
                    if (key != 'animalLink') {
                        WebUtils.VM.taskDetails[key](null);
                    }
                }
            }
        }, true);

        let displayDate = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY');
        };
        let displayDateTime = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY [at] h:mm a');
        };
        let displayDateTimeISO = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('YYYY-MM-DD HH:mm:ss');
        };

        $(document).ready(function() {
            document.getElementById('calendar-checklist').innerHTML = '';

            LABKEY.Query.selectRows({
                schemaName: 'wnprc',
                queryName: 'procedure_calendars_and_rooms',
                columns: 'calendar_id,calendar_type,display_name,api_action,folder_id,show_by_default,default_bg_color',
                scope: this,
                success: function(data){
                    if (data.rows && data.rows.length > 0) {
                        let calendarChecklist = document.getElementById('calendar-checklist');

                        let div = document.createElement('div');
                        let checkbox = document.createElement('input');
                        let label = document.createElement('label');
                        let description = document.createTextNode('Select All');
                        div.id = 'select_all_div';
                        checkbox.type = 'checkbox';
                        checkbox.id = 'select_all_checkbox';
                        checkbox.checked = false;
                        checkbox.value = '';
                        checkbox.addEventListener('change', function() {
                            let isChecked = document.getElementById('select_all_checkbox').checked;
                            if (calendarEvents) {
                                for (let cal in calendarEvents) {
                                    if (calendarEvents.hasOwnProperty(cal)) {
                                        let calCheckbox = document.getElementById(cal);
                                        if (calCheckbox.checked != isChecked) {
                                            calCheckbox.click();
                                        }
                                    }
                                }
                            }
                        });

                        checkbox.style.display = 'inline-block';
                        checkbox.style.cssFloat = 'left';
                        label.for = checkbox.id;
                        label.style.marginTop = '3px';
                        label.appendChild(description);

                        div.appendChild(checkbox);
                        div.appendChild(label);

                        calendarChecklist.appendChild(div);

                        for (let i = 0; i < data.rows.length; i++) {

                            let div = document.createElement('div');
                            let checkbox = document.createElement('input');
                            let label = document.createElement('label');
                            let description = document.createTextNode(data.rows[i].display_name);
                            let legend = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

                            div.id = data.rows[i].calendar_id + '_checkbox';

                            checkbox.type = 'checkbox';
                            checkbox.id = data.rows[i].calendar_id;
                            if (data.rows[i].show_by_default) {
                                checkbox.checked = true;
                            }
                            checkbox.value = '';
                            checkbox.addEventListener('change', function() {
                                if (calendar) {
                                    let events = calendarEvents[this.id].events;
                                    let displayProp = this.checked ? "auto" : "none";
                                    calendar.batchRendering(() => {
                                        for (let i = 0; i < events.length; i++) {
                                            calendar.getEventById(events[i].id).setProp("display", displayProp);
                                        }
                                    });
                                }
                            });

                            checkbox.style.display = 'inline-block';
                            checkbox.style.cssFloat = 'left';

                            label.for = checkbox.id;
                            label.style.marginTop = '3px';
                            label.appendChild(description);

                            legend.setAttribute('width', '25px');
                            legend.setAttribute('height', '15px');
                            legend.style.marginLeft = '5px';
                            legend.style.marginRight = '5px';
                            rect.style.fill = data.rows[i].default_bg_color;
                            rect.setAttribute('width', '25px');
                            rect.setAttribute('height', '15px');
                            legend.appendChild(rect);

                            div.appendChild(checkbox);
                            div.appendChild(legend);
                            div.appendChild(label);

                            calendarChecklist.appendChild(div);
                        }
                    }

                    $('#calendar-selection').block({
                        message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Loading...',
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

                    $('#procedure-calendar').block({
                        message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Loading...',
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

                    calendar = new FullCalendar.Calendar(calendarEl, {
                        themeSystem: 'bootstrap',
                        initialView: 'dayGridMonth',
                        //rerenderDelay: 50,
                        headerToolbar: {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        },
                        eventClassNames: function (arg) {
                            if (arg.event.extendedProps.selected) {
                                return ["event-selected"];
                            } else {
                                return [];
                            }
                        },
                        eventClick: function(info) {
                            //TODO REMOVE LOGGING
                            console.log(info.event.id);
                            if (selectedEvent.id) {
                                let event = calendar.getEventById(selectedEvent.id);
                                if (event) {
                                    event.setExtendedProp("selected", false);
                                }
                            }
                            info.event.setExtendedProp("selected", true);
                            selectedEvent = info.event;
                            if (info.event.extendedProps) {
                                jQuery.each(info.event.extendedProps, function (key, value) {
                                    if (key in WebUtils.VM.taskDetails) {
                                        if (key === "date" || key === "enddate") {
                                            value = displayDateTimeISO(value);
                                        }
                                        WebUtils.VM.taskDetails[key](value);
                                    }
                                });
                            }

                            // $("#eventModalTitle").html(info.event.title);
                            //
                            // let startYear = info.event.start.getFullYear();
                            // let startMonth = ("0" + info.event.start.getMonth() + 1).slice(-2);
                            // let startDay = ("0" + info.event.start.getDate()).slice(-2);
                            // let startHours = ("0" + info.event.start.getHours()).slice(-2);
                            // let startMinutes = ("0" + info.event.start.getMinutes()).slice(-2);
                            // let startValue = startYear + "-" + startMonth + "-" + startDay + "T" + startHours + ":" + startMinutes;
                            //
                            // let endYear = info.event.end.getFullYear();
                            // let endMonth = ("0" + info.event.end.getMonth() + 1).slice(-2);
                            // let endDay = ("0" + info.event.end.getDate()).slice(-2);
                            // let endHours = ("0" + info.event.end.getHours()).slice(-2);
                            // let endMinutes = ("0" + info.event.end.getMinutes()).slice(-2);
                            // let endValue = endYear + "-" + endMonth + "-" + endDay + "T" + endHours + ":" + endMinutes;
                            //
                            // document.getElementById("eventModalTitleField").value = info.event.title;
                            // document.getElementById("eventModalStartField").value = startValue;
                            // document.getElementById("eventModalEndField").value = endValue;
                            // $("#eventModal").modal();
                        }
                    });

                    calendar.render();

                    if (data.rows && data.rows.length > 0) {
                        LABKEY.Ajax.request({
                            url: LABKEY.ActionURL.buildURL("wnprc_ehr", "FetchSurgeryProcedureEvents", null, null),
                            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                                if (response.success) {
                                    for (let cal in response.events) {
                                        if (response.events.hasOwnProperty(cal)) {
                                            calendarEvents[cal] = response.events[cal];
                                            calendar.addEventSource(response.events[cal]);
                                        }
                                    }
                                }
                                else {
                                    alert("Houston, we have a problem: " + response.exception);
                                }
                                $('#calendar-selection').unblock();
                                $('#procedure-calendar').unblock();
                            }, this),
                            failure: LABKEY.Utils.getCallbackWrapper(function (response) {
                                alert("Something went wrong: " + JSON.stringify(response));
                                $('#calendar-selection').unblock();
                                $('#procedure-calendar').unblock();
                            }, this)
                        });
                    }
                }
            });
        });

        // Build a lookup index of requests.
        let pendingRequests = <%= pendingRequests %>;
        jQuery.each(pendingRequests, function(i, request) {
            pendingRequestsIndex[request.requestid] = request;
        });

        let $scheduleForm = $('.scheduleForm');
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
                procedurecategory:    ko.observable(),
                procedurename:        ko.observable(),
                age:                  ko.observable(),
                animalid:             ko.observable(),
                account:              ko.observable(),
                cur_room:             ko.observable(),
                cur_cage:             ko.observable(),
                cur_cond:             ko.observable(),
                rooms:                ko.observable(),
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
                rooms:              '',
                priority:           '',
                date:               '',
                enddate:            '',
                procedurecategory:  '',
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
                        if (key === "date" || key === "enddate") { //TODO modified???
                            value = displayDateTimeISO(value);
                        }
                        WebUtils.VM.form[key](value);
                    }
                });
            },
            submitForm: function() {
                let requestObj = createRequestObj('addToCalendar', 'scheduled');
                scheduleSurgeryProcedure('ScheduleSurgeryProcedure', requestObj);
            },
            holdForm: function() {
                let requestObj = createRequestObj('addToCalendar', 'on_hold');
                scheduleSurgeryProcedure('ScheduleSurgeryProcedure', requestObj);
            },
            denyForm: function() {
                let requestObj = createRequestObj('denyRequest', null);
                scheduleSurgeryProcedure('SurgeryProcedureChangeStatus', requestObj);
            },
            cancelEvent: function() {
                let cancel = confirm("Are you sure you'd like to cancel this surgery? This will move it back into the pending requests.");
                if (cancel === true && selectedEvent.id) {
                    let eventId = (selectedEvent.extendedProps.parentid) ? selectedEvent.extendedProps.parentid : selectedEvent.id;
                    let eventRequestId = selectedEvent.extendedProps.requestid;
                    LABKEY.Ajax.request({
                        url: LABKEY.ActionURL.buildURL("wnprc_ehr", "SurgeryProcedureChangeStatus", null, {
                            requestId: WebUtils.VM.taskDetails.requestid(),
                            QCStateLabel: 'Request: Pending'
                        }),
                        success: LABKEY.Utils.getCallbackWrapper(function (response) {
                            if (response.success) {
                                let eventRooms = response.roomList;
                                let eventToRemove = calendar.getEventById(eventId);
                                if (eventToRemove) {
                                    eventToRemove.remove();
                                }

                                //new code start
                                let removedEventArray = [];
                                for (let i = 0; i < eventRooms.length; i++) {
                                    let eventRoom = eventRooms[i].room_fs_email;
                                    for (let j = calendarEvents[eventRoom].events.length - 1; j >= 0; j--) {
                                        if (calendarEvents[eventRoom].events[j].extendedProps.requestid === eventRequestId) {
                                            let roomEventToRemove = calendar.getEventById(calendarEvents[eventRoom].events[j].id)
                                            removedEventArray = removedEventArray.concat(calendarEvents[eventRoom].events.splice(j, 1));
                                            if (roomEventToRemove) {
                                                roomEventToRemove.remove();
                                            }
                                        }
                                    }
                                }

                                if (eventToRemove) {
                                    let newPendingRequestRow = new WebUtils.Models.TableRow({
                                        data: [
                                            eventToRemove.extendedProps.rowid,
                                            eventToRemove.extendedProps.priority,
                                            eventToRemove.extendedProps.animalid,
                                            eventToRemove.extendedProps.requestor,
                                            displayDate(eventToRemove.extendedProps.created),
                                            displayDateTime(eventToRemove.extendedProps.date),
                                            displayDateTime(eventToRemove.extendedProps.enddate)
                                        ],
                                        otherData: eventToRemove.extendedProps,
                                        warn: (eventToRemove.extendedProps.priority === 'ASAP'),
                                        err: (eventToRemove.extendedProps.priority === 'Stat'),
                                        success: (eventToRemove.extendedProps.priority === 'Routine')
                                    });
                                    WebUtils.VM.pendingRequestTable.rows.push(newPendingRequestRow);
                                    pendingRequestsIndex[eventToRemove.extendedProps.requestid] = eventToRemove.extendedProps;
                                }
                                //new code end

                                selectedEvent = {};
                            }
                            else {
                                alert('There was an error while trying to cancel the event.');
                            }
                        }, this)
                    });
                }
            },
            editEvent: function() {
                $("#eventModalTitle").html(selectedEvent.title);

                let mainEvent = selectedEvent;
                if (selectedEvent.extendedProps.parentid) {
                    mainEvent = calendar.getEventById(selectedEvent.extendedProps.parentid)
                }

                let roomIds = [];
                if (mainEvent.extendedProps.childids) {
                    roomIds = mainEvent.extendedProps.childids;
                }
                
                let formDiv = document.getElementById("modalForm");

                while (formDiv.firstChild) {
                    formDiv.removeChild(formDiv.lastChild);
                }

                let titleDiv = createModalDiv("Title", "text", "modalTitleField", mainEvent.title);
                formDiv.appendChild(titleDiv);
                formDiv.appendChild(document.createElement("hr"));

                for (let i = 0; i < roomIds.length; i++) {
                    let roomEvent = calendar.getEventById(roomIds[i]);

                    let startValue = dateToDateInputField(roomEvent.start);
                    let endValue = dateToDateInputField(roomEvent.end);
                    let calendarId = roomEvent.extendedProps.calendarId;

                    let roomDiv = createModalSelectDiv("Room", "modalRoomField_" + i, calendarId);
                    let startDiv = createModalDiv("Start Time", "datetime-local", "modalStartField_" + i, startValue);
                    let endDiv = createModalDiv("End Time", "datetime-local", "modalEndField_" + i, endValue);

                    if (i > 0) {
                        formDiv.appendChild(document.createElement("hr"));
                    }
                    formDiv.appendChild(roomDiv);
                    formDiv.appendChild(startDiv);
                    formDiv.appendChild(endDiv);
                }

                //document.getElementById("eventModalTitleField").value = selectedEvent.title;
                //document.getElementById("eventModalStartField").value = startValue;
                //document.getElementById("eventModalEndField").value = endValue;
                $("#eventModal").modal();
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
            })
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