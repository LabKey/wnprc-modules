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
<%@ page import="org.labkey.api.view.HttpView" %>

<%@ page import="org.labkey.api.query.QueryAction"%>
<%@ page import="org.labkey.api.query.QueryDefinition"%>
<%@ page import="org.labkey.api.view.template.ClientDependencies" %>

<%@ page import="org.labkey.wnprc_ehr.WNPRC_EHRController" %>
<%@ page import="org.labkey.api.security.Group" %>
<%@ page import="org.labkey.api.security.GroupManager" %>
<%@ page import="org.labkey.security.xml.GroupEnumType" %>
<%@ page import="org.labkey.api.collections.CaseInsensitiveHashMap" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!
    @Override
    public void addClientDependencies(ClientDependencies dependencies)
    {
        dependencies.add("clientapi/ext4");
        dependencies.add("/webutils/lib/fullcalendar-3.10.0/fullcalendar.min.js");
        //dependencies.add("/mypath/mydependency.js");
    }
%>



<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.css' />
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.js'></script>
<script src= 'https://unpkg.com/popper.js/dist/umd/popper.min.js'></script>
<script src= 'https://unpkg.com/tooltip.js/dist/umd/tooltip.min.js'></script>
<%--<script src= '/labkey/webutils/lib/ko/core/knockout-3.4.0.js' type="text/javascript"></script>--%>
<script src= '/labkey/webutils/lib/webutils_core/api.js' type="text/javascript"></script>
<%--<script src= '/WebUtils/src/org/labkey/webutils/view/JspPage.jsp' type="text/jsp"></script>--%>



<%
    String animalIds = request.getParameter("animalIds");

    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    SimpleQuery assignedToOptions = queryFactory.makeQuery("ehr_lookups", "husbandry_assigned");
    List<JSONObject> assignedToList= JsonUtils.getSortedListFromJSONArray(assignedToOptions.getResults().getJSONArray("rows"),"title");

    SimpleQuery husbandryFrequency = queryFactory.makeQuery("ehr_lookups", "husbandry_frequency");
    List<JSONObject> husbandryFrequencyList= JsonUtils.getSortedListFromJSONArray(husbandryFrequency.getResults().getJSONArray("rows"),"meaning");

    //TODO: Query WaterCoalesce for all future water for the next 60 days
    SimpleQuery futureWaters = queryFactory.makeQuery("study", "waterScheduleCoalesced");
    List<JSONObject> waterList = JsonUtils.getListFromJSONArray(futureWaters.getResults().getJSONArray("rows"));

    JSONObject husbandryAssignmentLookup = new JSONObject();
    List<JSONObject> husbandryAssigned = JsonUtils.getListFromJSONArray(queryFactory.selectRows("ehr_lookups", "husbandry_assigned"));

    for (JSONObject json : husbandryAssigned) {
        CaseInsensitiveHashMap<String> map = new CaseInsensitiveHashMap(json);
        JSONObject waterInfo = new JSONObject();

        if (map.get("category") != null) {
            waterInfo.put("color", map.get("category"));
        } else {
            waterInfo.put("color", "#F78181");
        }

        String title = map.get("title");
        waterInfo.put("title", (title != null) ? title : map.get("value"));

        husbandryAssignmentLookup.put(map.get("value"), waterInfo);
    }

    //List<JSONObject> husbandryFrequency = JsonUtils.getListFromJSONArray(queryFactory.selectRows("ehr_lookups", "husbandry_frequency"));



%>

<style type="text/css">
    /* Full Calendar heading */
    #calendar .fc-toolbar h1 {
        font-size: 20px;
        margin: 0;
    }
    #rapperDiv {
        max-width: 25%;
        float: left;
    }

    .toggle-check-input {
        width: 1px;
        height: 1px;
        position: absolute;
    }

    .toggle-check-text {
        display: inline-block;
        position: relative;
        text-transform: uppercase;
        background: #CCC;
        padding: 0.25em 0.5em 0.25em 2em;
        border-radius: 1em;
        min-width: 2em;
        color: #FFF;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .toggle-check-text:after {
        content: ' ';
        display: block;
        background: #FFF;
        width: 1.1em;
        height: 1.1em;
        border-radius: 1em;
        position: absolute;
        left: 0.3em;
        top: 0.25em;
        transition: left 0.15s, margin-left 0.15s;
    }

    .toggle-check-text:before {
        content: 'No';
    }

    .toggle-check-input:checked ~ .toggle-check-text {
        background: #333;
        padding-left: 0.5em;
        padding-right: 2em;
    }

    .toggle-check-input:checked ~ .toggle-check-text:before {
        content: 'Yes';
    }

    .toggle-check-input:checked ~ .toggle-check-text:after {
        left: 100%;
        margin-left: -1.4em;
    }
</style>

<%--<div class="col-xs-12 col-xl-8">--%>
<div class="row" >
    <div class="col-md-4">

        <div class="row">
            <div class="panel panel-primary">
                <div class="panel-heading"><span>Water Details</span></div>
                <div class="panel-body" id="waterInfoPanel" data-bind="with: taskDetails">


                    <dl class="dl-horizontal">
                        <dt>DataSource:         </dt> <dd>{{dataSource}}</dd>
                        <dt>Task ID:            </dt> <dd>{{taskid}}</dd>
                        <dt>Animal ID:          </dt> <dd><a href="{{animalLink}}">{{animalId}}</a></dd>
                        <dt>Assigned to:        </dt> <dd>{{assignedToTitleCoalesced}}</dd>
                        <dt>Volume:             </dt> <dd>{{volume}}</dd>
                        <dt>Project (Account):  </dt> <dd>{{projectCoalesced}}</dd>
                        <dt>Date:               </dt> <dd>{{displayDate}}</dd>
                        <dt>Frequency:          </dt> <dd>{{frequencyMeaningCoalesced}}</dd>
                    </dl>

                    <button class="btn btn-default" data-bind="click: $root.requestTableClickAction" data-toggle="collapse" data-target="#waterExceptionPanel"
                                          id="waterInfo" params="" disabled>Enter Single Day Water</button>

                    <button class="btn btn-default"  data-toggle="modal" data-target="#myModal"
                            id="enterWaterOrder" params="" disabled>Edit Recurring Water Order</button>

                    <div class="modal fade" id="myModal" role="dialog">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    <h4 class="modal-title">Modify Water Order</h4>
                                </div>
                                <div class="modal-body">
                                    <p>Select an option from this window:</p>
                                    <p>End Date for Water Order: <b>{{date}}</b></p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-default" data-dismiss="modal" data-bind="click: $root.endWaterOrder">End Water Order</button>
                                    <button type="button" class="btn btn-default" data-dismiss="modal" data-bind="click: $root.enterNewWaterOrder">End and Start New Water Order</button>
                                    <button type="button" class="btn btn-default" data-dismiss="modal">Close Window</button>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </div>

        <div class="row">
            <div class="collapse" id="waterExceptionPanel">

                <div class="panel panel-primary" data-bind="with: taskDetails">
                    <!-- ko if: dataSource() == 'waterAmount' -->
                    <div class="panel-heading"><span>Edit Single Day Water</span></div>
                    <!-- /ko -->
                    <!-- ko if: dataSource() == 'waterOrders' -->
                    <div class="panel-heading"><span>Enter Single Day Water</span></div>
                    <!-- /ko -->
                    <div class="panel-body" id="waterException" >




                        <form class="form-horizontal scheduleForm">
                            <!-- ko if: lsid() != '' -->
                            <div class="form-group">
                                <label class="col-xs-4 control-label">Animal ID:</label>
                                <div class="col-xs-8">
                                    <p class="form-control-static">{{animalId}}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-xs-4 control-label">Date:</label>
                                <div class="col-xs-8">
                                    <p class="form-control-static" type="date"> {{date}} </p>

                                </div>
                            </div>
                            <div class="from-group">
                                <label class="col-xs-4 control-label">Frequency:</label>
                                <div class="col-xs-8">
                                   <p>
                                       <select data-bind="value: frequencyCoalesced" class="form-control">
                                        <%--<option value="">{{frequencyMeaningCoalesced}}</option>--%>
                                        <%
                                            for(JSONObject frequency : husbandryFrequencyList) {
                                                String rowid = frequency.getString("rowid");
                                                String meaning = frequency.getString("meaning");
                                        %>
                                        <option value="<%=rowid%>"><%=h(meaning)%></option>
                                        <%
                                            }
                                        %>
                                        </select>
                                   </p>
                                    <%--<p class="form-control-static" type="date">  </p>--%>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-xs-4 control-label">Volume:</label>
                                <div class="col-xs-8">
                                    <%--<input type="hidden" class="hidden-assignedTo-field" data-bind="value: {{volumeCoalesced}}">--%>
                                    <input type="text" class="form-control" data-bind="value: volume"/>
                                    <%--<p class="form-control-static">{{volumeCoalesced}}</p>--%>
                                </div>

                            </div>
                            <!-- /ko -->

                            <div class="form-group">
                                <label class="col-xs-4 control-label">Project:</label>
                                <div class="col-xs-8">
                                    <p class="form-control-static">{{projectCoalesced}}</p>

                                </div>
                            </div>


                            <div class="form-group">
                                <label class="col-xs-4 control-label">Assigned To:</label>
                                <div class="col-xs-8">
                                    <select data-bind="value: assignedToCoalesced" class="form-control">
<%--                                        <option value="">{{assignedToCoalesced}}</option>--%>
                                        <%
                                            for(JSONObject assignedTo : assignedToList) {
                                                String value = assignedTo.getString("value");
                                                String title = assignedTo.getString("title");
                                        %>
                                        <option value="<%=value%>"><%=h(title)%></option>
                                        <%
                                            }
                                        %>
                                    </select>

                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-xs-4 control-label">Edit Multiple:</div>
                                <div class="col-xs-2 control-label">
                                    <label class="toggle-check">
                                        <input type="checkbox" class="toggle-check-input" data-bind="checked: $root.wantsSpam"  />
                                        <span class="toggle-check-text"></span>
                                    </label>
                                </div>
                            </div>

                            <div style="text-align: right;">
                                <button class="btn btn-default" data-bind="click: $root.collapseSingleWater" data-toggle="collapse" >Cancel</button>
                                <%--<button class="btn btn-default" data-bind="click: $root.clearForm">Cancel</button>--%>
                                <!-- ko if: dataSource() == 'waterAmount' -->
                                <button class="btn btn-primary" data-bind="click: $root.submitForm">Update Single Day Water</button>
                                <!-- /ko -->
                                <!-- ko if: dataSource() == 'waterOrders' -->
                                <button class="btn btn-primary" data-bind="click: $root.submitForm">Insert Single Day Water</button>

                                <!-- /ko -->


                            </div>
                        </form>

                    </div>

                </div>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-md-8">
        <div class="panel panel-primary">
            <div class="panel-heading"><span>Calendar</span></div>
            <div class="panel-body">
                <div id="calendar"></div>

                <div class="pull-right">
                    <!-- ko foreach: _.keys(husbandryAssignmentLookup) -->
                    <span data-bind="style: {color: $root.husbandryAssignmentLookup[$data].color }">&#x2589;</span><span>{{$root.husbandryAssignmentLookup[$data].title}}</span>
                    <!-- /ko -->
                </div>


            </div>
        </div>
    </div>

</div>







<script>
    (function() {
        var previousCalendarEvent;
        var previousCalendarColor;

        var husbandryAssignmentLookup = <%= husbandryAssignmentLookup.toString() %>;
        WebUtils.VM.husbandryAssignmentLookup = husbandryAssignmentLookup;
        var $animalId = "<%= animalIds %>";

        debugger;
        var $calendar = $('#calendar');
        $(document).ready(function () {
            $calendar.fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay'
                },
                eventSources:[
                    {events: function (startMoment, endMoment, timezone, callback) {
                            var date = new Date();
                           // date.setDate(date.getDate() - 60);
                        debugger;

                            if ($animalId == 'undefined' || $animalId == "null"){

                                WebUtils.API.selectRows("study", "waterScheduleWithWeight", {
                                    "date~gte": startMoment.format('Y-MM-DD'),
                                    "date~lte": endMoment.format('Y-MM-DD'),
                                    "parameters": {NumDays: 180, StartDate: date.format(LABKEY.extDefaultDateFormat)}
                                }).then(function (data) {
                                    var events = data.rows;

                                    callback(events.map(function (row) {
                                        var volume;
                                        if (row.volume) {
                                            volume = row.volume;
                                        }
                                        else {
                                            volume = 0;
                                        }

                                        var eventObj = {
                                            title: row.animalId + ' ' + volume + 'ml',
                                            start: row.date,
                                            allDay: true,
                                            // vol: row.volume,
                                            rawRowData: row,
                                            //editable: true,
                                            description: 'Water for animal ' + row.animalId
                                        };

                                        if (row.assignedToCoalesced in husbandryAssignmentLookup) {
                                            eventObj.color = husbandryAssignmentLookup[row.assignedToCoalesced].color;

                                        }
                                        else {
                                            eventObj.color = '#F78181';
                                        }


                                        return eventObj;
                                    }))
                                })
                            }else{
                                WebUtils.API.selectRows("study", "waterScheduleWithWeight", {
                                    "date~gte": startMoment.format('Y-MM-DD'),
                                    "date~lte": endMoment.format('Y-MM-DD'),
                                    "parameters": {NumDays: 180, StartDate: date.format(LABKEY.extDefaultDateFormat)},
                                    "animalid~in": $animalId
                                }).then(function (data) {
                                    var events = data.rows;

                                    callback(events.map(function (row) {
                                        var volume;
                                        if (row.volume) {
                                            volume = row.volume;
                                        }
                                        else {
                                            volume = 0;
                                        }

                                        var eventObj = {
                                            title: row.animalId + ' ' + volume + 'ml',
                                            start: row.date,
                                            allDay: true,
                                            // vol: row.volume,
                                            rawRowData: row,
                                            //editable: true,
                                            description: 'Water for animal ' + row.animalId
                                        };

                                        if (row.assignedToCoalesced in husbandryAssignmentLookup) {
                                            eventObj.color = husbandryAssignmentLookup[row.assignedToCoalesced].color;

                                        }
                                        else {
                                            eventObj.color = '#F78181';
                                        }


                                        return eventObj;
                                    }))
                                })

                            }
                        }
                    },
                    {
                        events:function (startMoment, endMoment, timezone, callback) {
                            if ($animalId == 'undefined' || $animalId == "null"){
                                WebUtils.API.selectRows("study", "waterPrePivot", {
                                    "date~gte": startMoment.format('Y-MM-DD'),
                                    "date~lte": endMoment.format('Y-MM-DD')
                                }).then(function (data) {
                                    var events = data.rows;

                                    callback(events.map(function (row) {
                                        var eventObj = {
                                            title: row.animalId + " Total: " + row.TotalWater,
                                            start: row.Date,
                                            allDay: true,
                                            rawRowData: row
                                        };

                                        if (row.mlsPerKg >= 20){
                                            eventObj.color = '#000CFF';
                                        }else{
                                            eventObj.color = '#EE2020'
                                        }
                                        return eventObj;
                                    }))

                                })

                            }else{

                                WebUtils.API.selectRows("study", "waterPrePivot", {
                                    "date~gte": startMoment.format('Y-MM-DD'),
                                    "date~lte": endMoment.format('Y-MM-DD'),
                                    "animalId~in": $animalId
                                }).then(function (data) {
                                    var events = data.rows;

                                    callback(events.map(function (row) {
                                        var eventObj = {
                                            title: row.animalId + " Total: " + row.TotalWater,
                                            start: row.Date,
                                            allDay: true,
                                            rawRowData: row
                                        };
                                        return eventObj;
                                    }))

                                })
                            }
                        }
                    },
                    {
                        events:[
                        {
                            title: 'Test123 this is a really long string to see what happens!',
                            start: '2019-11-22',
                            end:   '2019-11-23'
                        }
                            ],
                            color: 'yellow',
                            eventTextColor: 'red'
                        }
                ],
                eventClick: function (calEvent, jsEvent, view) {
                    $('#waterInfo').attr('disabled', 'disabled');
                    $('#enterWaterOrder').attr('disabled', 'disabled');
                    $('#waterInfo').text('Enter Single Day Water');

                    if (previousCalendarEvent){
                        previousCalendarEvent.color = previousCalendarColor;
                        $calendar.fullCalendar('updateEvent', previousCalendarEvent )
                    }
                    previousCalendarEvent = calEvent;
                    previousCalendarColor = calEvent.color;
                    calEvent.color = '#848484';
                    $calendar.fullCalendar('updateEvent', calEvent )


                    var momentDate;
                    jQuery.each(calEvent.rawRowData, function (key, value) {

                        if (key in WebUtils.VM.taskDetails) {
                            if (key == "date") {
                                momentDate = moment(value, "YYYY/MM/DD HH:mm:ss");
                                value = moment(value, "YYYY/MM/DD HH:mm:ss").format("MM/DD/YYYY");


                                // value = displayDate(value);
                               // webUtils.VM.taskDetails[rawDate](moment(value, "YYYY/MM/DD HH:mm:ss").format("MM/DD/YYYY"));
                                //value = value.toDate();
                            }

                            WebUtils.VM.taskDetails[key](value);
                         //   debugger;




                            $('#waterExceptionPanel').collapse('hide');

                            var today = moment();

                            if (key =="date" && (momentDate.diff(today, 'days'))>= 0){
                                $('#waterInfo').removeAttr('disabled');

                            }

                            if(key == "dataSource" && value == "waterOrders" && (momentDate.diff(today, 'days'))>= 0){
                                $('#enterWaterOrder').removeAttr('disabled');
                            }

                            if(key == "dataSource" && value == "waterAmount" && (momentDate.diff(today, 'days'))>= 0){
                               // $('#enterWaterOrder').removeAttr('disabled');
                                $('#waterInfo').text('Edit Single Day Water');
                            }


                        }
                    });






                }

            })
        });


        var displayDate = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").calendar(null, {
                sameElse: 'MMM D[,] YYYY'
            })
        };

        // For some reason, type-ahead makes this transparent.  In order to allow bootstrap to "disable" it
        // by greying it out, we need to remove that property.
        //$assignedToField.css('background-color', '');

       // var $scheduleForm = $('.scheduleForm');

        _.extend(WebUtils.VM, {

            taskDetails: {
                lsid:                       ko.observable(),
                objectIdCoalesced:          ko.observable(),
                taskid:                     ko.observable(),
                projectCoalesced:           ko.observable(),
                animalId:                   ko.observable(),
                date:                       ko.observable(),
                volume:                     ko.observable(),
                dataSource:                 ko.observable(),
                assignedToCoalesced:        ko.observable(),
                assignedToTitleCoalesced:   ko.observable(),
                frequencyCoalesced:         ko.observable(),
                frequencyMeaningCoalesced:  ko.observable(),
                rawDate:                    ko.observable(),
                wantsSpam:                  ko.observable(),

            },
            form: ko.mapping.fromJS({
                lsid:           '',
                animalId:       '',
                date:           new Date(),
                volume:         '',
                dataSource:     '',
                object:         '',
                assignedTo:     '',
                frequency:      ''

            }),


            requestTableClickAction: function(row) {
                /*$('#waterExceptionPanel').block({
                    css: {
                        visibility: visible
                    }
                });*/
                WebUtils.VM.requestRowInForm = row;
                //WebUtils.VM.updateForm(row.animalId);

            },
            collapseSingleWater: function(){
                $('#waterExceptionPanel').collapse('hide');

            },

            endWaterOrder: function (row){

                $('#waterInfoPanel').block({
                    message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Closing Water Order...',
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

                WebUtils.VM.requestRowInForm = row;
                debugger;
                var waterOrder = ko.mapping.toJS(row);

                //TODO: escalate permission to close waterorder  older than 60 days or all ongoing water order
                //TODO: should have the QC Status of Started and not complete

                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "CloseWaterOrder", null, {
                        lsid:               waterOrder.lsid,
                        taskId:             waterOrder.taskid,
                        objectId:           waterOrder.objectIdCoalesced,
                        animalId:           waterOrder.animalId,
                        endDate:            waterOrder.date,
                        dataSource:         waterOrder.dataSource

                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success){

                            // Refresh the calendar view.
                            $calendar.fullCalendar('refetchEvents');

                            $('#waterInfoPanel').unblock();

                        } else {
                            alert('Water cannot be closed')
                        }


                    }, this)

                });

            },

            enterNewWaterOrder: function (row){

                $('#waterInfoPanel').block({
                    message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Closing Water Order...',
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

                WebUtils.VM.requestRowInForm = row;
                var waterOrder = ko.mapping.toJS(row);

                //TODO: escalate permission to close waterorder  older than 60 days or all ongoing water order
                //TODO: should have the QC Status of Started and not complete

                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "EnterNewWaterOrder", null, {
                        lsid:                   waterOrder.lsid,
                        taskId:                 waterOrder.taskid,
                        objectId:               waterOrder.objectIdCoalesced,
                        animalId:               waterOrder.animalId,
                        endDate:                waterOrder.date,
                        dataSource:             waterOrder.dataSource,
                        project:                waterOrder.projectCoalesced,
                        frequency:              waterOrder.frequency,
                        assignedTo:             waterOrder.assignedToCoalesced,
                        volume:                 waterOrder.volume

                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success){

                            // Refresh the calendar view.
                            $calendar.fullCalendar('refetchEvents');
                            debugger;

                            $('#waterInfoPanel').unblock();
                            console.log(response.taskId);

                                                                            //('ehr', 'dataEntryForm.view', null, {formType: LABKEY.ActionURL.getParameter('formType')})
                            var newWaterOrder =  LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: 'Enter Water Daily Amount', 'taskid': response.taskId});
                                                                            //schemaName: 'study', 'query.queryName': 'demographicsParentStatus', 'query.Id~eq': this.subjectId})

                            window.open(newWaterOrder,'_blank');

                        } else {
                            alert('Water cannot be closed')
                            $('#waterInfoPanel').unblock();
                        }


                    }, this)

                });

            },




        });

        WebUtils.VM.taskDetails.animalLink = ko.pureComputed(function() {
            var animalId = WebUtils.VM.taskDetails.animalId();

            return LABKEY.ActionURL.buildURL('ehr', 'participantView', null, {
                participantId: animalId
            });
        });

        WebUtils.VM.taskDetails.displayDate = ko.pureComputed(function(){
            var dateString = WebUtils.VM.taskDetails.date();

            if (dateString){
                return (moment(dateString, "MM/DD/YYYY").calendar(null, {
                    sameElse: 'MMM D[,] YYYY'
                }).split(" at"))[0]

            }else {
                return " ";
            }




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
           /* updateForm: function(animalId) {
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
            },*/
            submitForm: function(){

                $('#calendar').block({
                    message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Updating Calendar...',
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

                var form = ko.mapping.toJS(WebUtils.VM.taskDetails);
                var taskid = LABKEY.Utils.generateUUID();
                debugger;
                //var date = form.date.format("Y-m-d H:i:s");

                if (form.dataSource == "waterOrders"){
                    WebUtils.API.insertRows('study', 'waterAmount', [{
                        taskid:     taskid,
                        Id:         form.animalId,
                        date:       form.date,
                        assignedTo: form.assignedToCoalesced,
                        project:    form.projectCoalesced,
                        volume:     form.volume,
                        frequency:  form.frequencyCoalesced
                    }]);
                    WebUtils.API.insertRows('ehr', 'tasks', [{
                        taskid:     taskid,
                        title:      "Enter Water Daily Amount",
                        category:   "task",
                        qcstate:    1,
                        formType:   "Enter Water Daily Amount"
                       // assignedTo:
                    }])


                } else if (form.dataSource == "waterAmount"){

                    LABKEY.Ajax.request({
                        url: LABKEY.ActionURL.buildURL("wnprc_ehr", "UpdateWaterAmount", null, {
                            lsid:               form.lsid,
                            taskId:             form.taskid,
                            objectId:           form.objectIdCoalesced,
                            date:               form.date,
                            frequency:          form.frequency,
                            animalId:           form.animalId,
                            assignedTo:         form.assignedTo,
                            volume:             form.volume,
                            dataSource:         form.dataSource


                        }),
                        success: LABKEY.Utils.getCallbackWrapper(function (response)
                        {
                            if (response.success){

                                // Refresh the calendar view.
                                $calendar.fullCalendar('refetchEvents');

                                //$('#waterInfoPanel').unblock();

                            } else {
                                alert('Water cannot be closed')
                            }


                        }, this)

                    });


                }


                $('#waterExceptionPanel').collapse('hide')

                // Refresh the calendar view.
                $calendar.fullCalendar('refetchEvents');

                //Unblock
                $('#calendar').unblock();

            },
            ViewModel: function (){
                var self = this;
                self.wantsSpam = ko.observable(false);
                self.wantsSpam.subscribe(function(){
                    self.thealertIwantTosend();
                })
                self.thealertIwantTosend = function(){
                    if(self.wantsSpam() == true){
                        alert('I want Spam!')}
                    else{
                        alert('I dont want Spam!')
                    }
                }

            },
        });


    })();

    function ViewModel(){
        var self = this;
        self.wantsSpam = ko.observable(false);
        self.wantsSpam.subscribe(function(){
            self.thealertIwantTosend();
        })
        self.thealertIwantTosend = function(){
            if(self.wantsSpam() == true){
                alert('I want Spam!')}
            else{
                alert('I dont want Spam!')
            }
        }

    }

    function sleep(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
    }





</script>