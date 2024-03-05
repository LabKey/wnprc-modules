<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.api.collections.CaseInsensitiveHashMap" %>
<%@ page import="org.labkey.api.security.Group" %>
<%@ page import="org.labkey.api.security.GroupManager" %>
<%@ page import="org.labkey.api.view.template.ClientDependencies" %>
<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.security.xml.GroupEnumType" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="java.util.List" %>

<%@ page import="static java.lang.Integer.parseInt" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!
    @Override
    public void addClientDependencies(ClientDependencies dependencies)
    {
        dependencies.add("clientapi/ext4");
        dependencies.add("fullcalendar");
        dependencies.add("/webutils/lib/webutils_core/api.js");


        dependencies.add("https://unpkg.com/popper.js/dist/umd/popper.min.js");
        dependencies.add("https://unpkg.com/tooltip.js/dist/umd/tooltip.min.js");
        //dependencies.add("/mypath/mydependency.js");
        //Adding typescript to water monitoring system for a future version.
        // dependencies.add("/gen/waterMonitoringSystem.js");
    }
%>

<%
    String animalIds = request.getParameter("animalIds");
    String numberOfRenders = request.getParameter("numberOfRenders");

    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    SimpleQuery assignedToOptions = queryFactory.makeQuery("ehr_lookups", "husbandry_assigned");
    List<JSONObject> assignedToList= JsonUtils.getSortedListFromJSONArray(assignedToOptions.getResults().getJSONArray("rows"),"title");

    SimpleQuery husbandryFrequency = queryFactory.makeQuery("wnprc", "husbandry_frequency");
    List<JSONObject> husbandryFrequencyList= JsonUtils.getSortedListFromJSONArray(husbandryFrequency.getResults().getJSONArray("rows"),"altmeaning");

    SimpleQuery husbandryFruit = queryFactory.makeQuery("ehr_lookups", "husbandry_fruit");
    List<JSONObject> husbandryFruitList= JsonUtils.getSortedListFromJSONArray(husbandryFruit.getResults().getJSONArray("rows"),"title");

    //TODO: Query WaterCoalesce for all future water for the next 60 days
    SimpleQuery futureWaters = queryFactory.makeQuery("study", "waterScheduleCoalesced");
    List<JSONObject> waterList = JsonUtils.getListFromJSONArray(futureWaters.getResults().getJSONArray("rows"));

    //SimpleQuery waterAccessControlled = queryFactory.selectRows("wnprc", "watermonitoring_access");
    List<JSONObject> waterAccess = JsonUtils.getListFromJSONArray(queryFactory.selectRows("wnprc", "watermonitoring_access"));

    JSONObject userAccessWater = new JSONObject();

    for(JSONObject json : waterAccess){
        CaseInsensitiveHashMap<String> map = new CaseInsensitiveHashMap(json.toMap());

        String allowUser = String.valueOf(map.get("alloweduser"));
        if (userAccessWater.isNull(allowUser)){
            if (map.get("project") != null){
                JSONArray projectList = new JSONArray();
                projectList.put(map.get("project"));
                userAccessWater.put(allowUser, projectList);
            }
        }else {
            if (map.get("project") != null)
            {
                JSONArray projectList = userAccessWater.getJSONArray(allowUser);
                projectList.put(map.get("project"));
            }
        }
    }

    String userid = String.valueOf(getUser().getUserId());
    boolean isAdmin =  getUser().hasSiteAdminPermission();

    JSONObject husbandryAssignmentLookup = new JSONObject();
    List<JSONObject> husbandryAssigned = JsonUtils.getListFromJSONArray(queryFactory.selectRows("ehr_lookups", "husbandry_assigned"));

    for (JSONObject json : husbandryAssigned) {
        CaseInsensitiveHashMap<String> map = new CaseInsensitiveHashMap(json.toMap());
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
    //TODO:use labkey roles instead of hard coding the group names.
    Group vetGroup = GroupManager.getGroup(getContainer(), "veterinarians (LDAP)", GroupEnumType.SITE);
    Group complianceGroup = GroupManager.getGroup(getContainer(), "compliance (LDAP)", GroupEnumType.SITE);
    Group animalCare = GroupManager.getGroup(getContainer(),"animalcare (LDAP)",GroupEnumType.SITE);
    boolean isVet = getUser().isInGroup(vetGroup.getUserId()) || getUser().hasSiteAdminPermission();
    boolean isCompliance = getUser().isInGroup(complianceGroup.getUserId()) || getUser().hasSiteAdminPermission();
    boolean isAnimalCare = getUser().isInGroup(animalCare.getUserId());
    String container = getContainer().getEncodedPath();

    //List<JSONObject> husbandryFrequency = JsonUtils.getListFromJSONArray(queryFactory.selectRows("wnprc", "husbandry_frequency"));

%>

<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />

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
        content: 'Yes';
    }

    .toggle-check-input:checked ~ .toggle-check-text {
        background: #333;
        padding-left: 0.5em;
        padding-right: 2em;
    }

    .toggle-check-input:checked ~ .toggle-check-text:before {
        content: 'No';
    }

    .toggle-check-input:checked ~ .toggle-check-text:after {
        left: 100%;
        margin-left: -1.4em;
    }
    .server-return-message {
        display: none;
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
    <script type="text/javascript" nonce="<%=getScriptNonce()%>">
        function clearSelectedEvent() {
        selectedEvent = {};
        for (let key in WebUtils.VM.taskDetails) {
            if (    key != 'animalLink'  && key != 'displayDate' &&
                    key != 'mlsPerKgCal' && key != 'conditionAtTimeValue' &&
                    key != 'taskLink'   && key != 'calculatedStatusValue') {
                WebUtils.VM.taskDetails[key](null);
            }
        }
    }

    </script>

<%--<div class="col-xs-12 col-xl-8">--%>
<div class="row" >
    <div class="col-md-3">

        <div class="row" id="infoPanels">
            <div class="collapse panel panel-primary" id="waterInformation">
                <div class="panel-heading"><span>Water Details</span></div>
                <div class="panel-body" id="waterInfoPanel" data-bind="with: taskDetails">


                    <dl class="dl-horizontal">
                        <dt>DataSource:         </dt> <dd>{{dataSource}}</dd>
                        <dt>Task ID:            </dt> <dd><a href="{{taskLink}}">{{taskid}}</a></dd>
                        <dt>Animal ID:          </dt> <dd><a href="{{animalLink}}">{{Id}}</a></dd>
                        <dt>Location:           </dt> <dd>{{location}}</dd>
                        <dt>Assigned to:        </dt> <dd>{{assignedToTitleCoalesced}}</dd>
                        <dt>Volume:             </dt> <dd>{{volume}}</dd>
                        <dt>Provide Fruit:      </dt> <dd>{{provideFruitTitle}}</dd>
                        <dt>Project (Account):  </dt> <dd>{{projectCoalesced}}</dd>
                        <dt>Date:               </dt> <dd>{{displayDate}}</dd>
                        <dt>Frequency:          </dt> <dd>{{frequencyMeaningCoalesced}}</dd>
                        <dt>Time of day:        </dt> <dd>{{displaytimeofday}}</dd>
                    </dl>

                    <button class="btn btn-default" data-bind="click: $root.requestTableClickAction" data-toggle="collapse" data-target="#waterExceptionPanel"
                                          id="waterInfo" params="" disabled>Enter Single Day Water</button>

                    <button class="btn btn-default"  data-toggle="modal" data-target="#myModal"
                            id="enterWaterOrder" params="" disabled>Edit Recurring Water Order</button>


                    <!--  Modal Definition -->
                    <div class="modal fade" id="myModal" role="dialog">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" data-bind="click: $root.closeModalWindow">&times;</button>
                                    <h4 class="modal-title">Modify Water Order</h4>
                                </div>
                                <div class="modal-body" id="modal-body">
                                    <div>Select an option from this window:</div>
                                    <div>End Date for Water Order: <b>{{date}}</b></div>
                                    <div>
                                        <input type="checkbox" id="removelastday"  data-bind="checked: $root.removeLastDay()">
                                        <label for="removelastday" id="removelastday_label">Exclude last day</label>
                                    </div>
                                    <hr>
                                    <div class="server-return-message hidden" id = "returnTitle">Return Errors from Server:</div>
                                    <div class="server-return-message" id = "modelServerResponse"></div>

                                </div>
                                <div class="modal-footer">
                                    <button id="proceedButton" type="button" class="btn btn-default hidden" data-bind="click: $root.proceed" >Proceed</button>
                                    <button type="button" class="btn btn-default" data-bind="click: $root.endWaterOrder">End Water Order</button>
                                    <button type="button" class="btn btn-default" data-dismiss="modal" data-bind="click: $root.enterNewWaterOrder">End and Start New Water Order</button>
                                    <button type="button" class="btn btn-default" data-bind="click: $root.closeModalWindow" data-dismiss="modal">Close Window</button>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
            </div>

            <div class="collapse panel panel-primary" id="waterTotalInformation">
                <div class="panel-heading"><span>Water Total Details</span></div>
                <div class="panel-body" id="waterTotalPanel" data-bind="with: taskDetails">


                    <dl class="dl-horizontal">
                        <dt>DataSource:</dt>
                            <dd>{{dataSource}}</dd>
                        <dt>Date:</dt>
                            <dd>{{displayDate}}</dd>
                        <dt>Animal ID:</dt>
                            <dd><a href="{{animalLink}}">{{Id}}</a></dd>
                        <dt>
                            <!-- ko if: calculatedStatusValue() == 'Alive' -->Current Location:  <!-- /ko-->
                            <!-- ko if: calculatedStatusValue() == 'Dead' --> Last Location:  <!-- /ko-->
                        </dt>
                            <dd>{{location}}</dd>
                        <dt>Total Volume:</dt>
                            <dd>
                                <!-- ko if: conditionAtTimeValue() == 'regulated' -->{{volume}} ml<!-- /ko-->
                                <!-- ko if: conditionAtTimeValue() == 'lixit' -->On Lixit<!-- /ko-->
                                <!-- ko if: conditionAtTimeValue() == 'dead' -->Dead<!-- /ko-->
                            </dd>
                        <dt>ml Per Kg:</dt>
                            <dd>{{mlsPerKg}}</dd>
                    </dl>
                    <!-- ko if: mlsPerKgCal() -->
                        <div class="Blockquote">Animal received less than 20 milliliter per kilogram of weight on this day.</div>
                    <!-- /ko -->
                </div>
            </div>
        </div>

        <div class="row">
            <div class="collapse" id="waterExceptionPanel">

                <div class="panel panel-primary" data-bind="with: form">
                    <!-- ko if: dataSourceForm() == 'waterAmount' -->
                    <div class="panel-heading"><span>Edit Single Day Water</span></div>
                    <!-- /ko -->
                    <!-- ko if: dataSourceForm() == 'waterOrders' -->
                    <div class="panel-heading"><span>Enter Single Day Water</span></div>
                    <!-- /ko -->
                    <div class="panel-body" id="waterException" >

                        <form class="form-horizontal scheduleForm">
                            <!-- ko if: lsidForm() != '' -->
                            <div class="form-group">
                                <label class="col-xs-4 control-label">Animal ID:</label>
                                <div class="col-xs-8">
                                    <p class="form-control-static">{{animalIdForm}}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-xs-4 control-label">Date:</label>
                                <div class="col-xs-8">
                                    <p class="form-control-static" type="date"> {{dateForm}} </p>

                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-xs-4 control-label">Project:</label>
                                <div class="col-xs-8">
                                    <p class="form-control-static">{{projectForm}}</p>

                                </div>
                            </div>

                            <div class="form-group" data-bind="volumeForm">
                                <label class="col-xs-4 control-label">{{volumeForm.id}}</label>
                                <div class="col-xs-8">
                                    <%--<input type="hidden" class="hidden-assignedTo-field" data-bind="value: {{volumeCoalesced}}">--%>
                                    <input type="number" class="form-control" data-bind="value: volumeForm.value"/>
                                    <%--<p class="form-control-static">{{volumeCoalesced}}</p>--%>
                                </div>

                            </div>


                            <div class="from-group">
                                <label class="col-xs-4 control-label">{{provideFruitForm.id}}</label>
                                <div class="col-xs-8">
                                    <p>
                                        <select data-bind="value: provideFruitForm.value" class="form-control">
                                            <%--<option value="">{{frequencyMeaningCoalesced}}</option>--%>
                                            <%
                                                for(JSONObject frequency : husbandryFruitList) {
                                                    String value = frequency.getString("value");
                                                    String title = frequency.getString("title");
                                            %>
                                            <option value="<%=h(value)%>"><%=h(title)%></option>
                                            <%
                                                }
                                            %>
                                        </select>
                                    </p>

                                </div>
                            </div>
                            <!-- /ko -->




                            <div class="form-group">
                                <label class="col-xs-4 control-label">{{assignedToForm.id}}</label>
                                <div class="col-xs-8">
                                    <p>
                                        <select data-bind="value: assignedToForm.value" class="form-control">
                                        <%--<option value="">{{assignedToCoalesced}}</option>--%>
                                            <%
                                                for(JSONObject assignedTo : assignedToList) {
                                                    String value = assignedTo.getString("value");
                                                    String title = assignedTo.getString("title");
                                            %>
                                            <option value="<%=h(value)%>"><%=h(title)%></option>
                                            <%
                                                }
                                            %>
                                        </select>
                                    </p>


                                </div>
                            </div>

                            <div class="from-group">
                                <label class="col-xs-4 control-label">{{frequencyForm.id}}</label>
                                <div class="col-xs-8">
                                   <p>
                                       <select data-bind="value: frequencyForm.value" class="form-control">
                                        <%
                                            String rowid = "";
                                            String altmeaning = "";
                                            for(JSONObject frequency : husbandryFrequencyList) {
                                                if ( !frequency.isNull("altmeaning") && !frequency.getString("altmeaning").trim().equals("")) {
                                                     rowid= String.valueOf(frequency.getInt("rowid"));
                                                     altmeaning = frequency.getString("altmeaning");
                                        %>
                                           <option value="<%=h(rowid)%>"><%=h(altmeaning)%></option>
                                        <%
                                                }
                                            }
                                        %>

                                        </select>
                                   </p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-xs-4 control-label">Hide Edit Panel:</label>
                                <div class="col-xs-2 control-label">
                                    <label class="toggle-check">
                                        <input id="multiple" type="checkbox" class="toggle-check-input" data-bind="checked: $root.editMultiple()"  />
                                        <span class="toggle-check-text"></span>
                                    </label>
                                </div>
                            </div>

                            <div style="text-align: right;">
                                <button class="btn btn-default" data-bind="click: $root.collapseSingleWater" data-toggle="collapse" >Cancel</button>
                                <%--<button class="btn btn-default" data-bind="click: $root.clearForm">Cancel</button>--%>
                                <!-- ko if: dataSourceForm() == 'waterAmount' -->
                                <button class="btn btn-primary" data-bind="click: $root.submitForm, enable: WebUtils.VM.form.isDirty">Update Single Day Water</button>
                                <button class="btn btn-primary" data-bind="click: deleteWaterAmount">Delete Single Day Water</button>
                                <!-- /ko -->
                                <!-- ko if: dataSourceForm() == 'waterOrders' -->
                                <button id ="submitNewWater" class="btn btn-primary" data-bind="click: $root.submitForm, enable: WebUtils.VM.form.isDirty">Insert Single Day Water</button>

                                <!-- /ko -->
                            </div>

                        </form>

                    </div>

                </div>
            </div>
        </div>
    </div>

    <div class="col-xs-6 col-md-8">
        <div id= "water-calendar" class="panel panel-primary">
            <div class="panel-heading"><span>Calendar</span></div>
            <div class="panel-body">
                <div id="calendar"></div>

                <div id="calendarLegend" class="pull-right">
                    <!-- ko foreach: _.keys(husbandryAssignmentLookup) -->
                    <span  data-bind="style: {color: $parent.husbandryAssignmentLookup[$data].color }">&#x2589;</span><span>{{$parent.husbandryAssignmentLookup[$data].title}}</span>
                    <!-- /ko -->
                </div>
                <div id="waterTotalLegend" class="pull-left">

                    <span style="color:red">&#x2589;</span><span>Total Water < 10 mL/Kg</span>
                    <span style="color:orange">&#x2589;</span><span>Total Water < 20 mL/Kg or set point</span>
                    <span style="color:white">&#x2589;</span><span>Total Water >= 20 mL/Kg</span>

                </div>


            </div>
        </div>
    </div>

</div>







<script type="text/javascript" nonce="<%=getScriptNonce()%>">

    //TODO: change var to let for all the following variables for better scoop management
    var selectedEvent = {};
    var calendar = {};
    var calendarEvents = {};
    var hideEditPanel = true;
    var allowProjects = "";
    var changeableItems = ko.observableArray();

    ko.dirtyFlag = function(root, isInitiallyDirty) {
        var result = function() {},
                _initialState = ko.observable(ko.toJSON(root)),
                _isInitiallyDirty = ko.observable(isInitiallyDirty);

        result.isDirty = ko.computed(function() {
            return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
        });

        result.reset = function() {
            _initialState(ko.toJSON(root));
            _isInitiallyDirty(false);
        };

        return result;
    };

    function Item(id, value) {
        this.id = ko.observable(id);
        this.value = ko.observable(value);
        this.dirtyFlag = new ko.dirtyFlag(this);
    }

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
                clearSelectedEvent();
            }
        }, true);

        /*let displayDate = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY');
        };*/

        let displayDateTime = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY [at] h:mm a');
        };

        let displayDateTimeISO = function(dateString) {
            return moment(dateString, "YYYY/MM/DD HH:mm:ss").format('YYYY-MM-DD HH:mm:ss');
        };

        var husbandryAssignmentLookup = <%= unsafe(husbandryAssignmentLookup.toString()) %>;
        WebUtils.VM.husbandryAssignmentLookup = husbandryAssignmentLookup;
        var $animalId = "<%= h(animalIds) %>";



        var userId = "<%= h(userid.toString()) %>";
        //This variable allows for specific groups to see all water orders and amounts in the system
        let isSuperUser = false;

        let isAdmin = <%=isAdmin%>;
        let complianceStaff = <%=isCompliance%>;
        let isVet = <%=isVet%>;
        let isAnimalCare = <%=isAnimalCare%>;
        let container = "<%= h(container.toString())%>";

        if (isAdmin || complianceStaff || isVet){
            isSuperUser = true;
        }

        var waterAccessControlled = <%= unsafe(userAccessWater.toString()) %>;
        WebUtils.VM.waterAccessControlled = waterAccessControlled;

        let firstEntry = true;
        jQuery.each(waterAccessControlled, function(key,value){
            if(key in WebUtils.VM.waterAccessControlled){
                if (key == userId){
                    let jsonArray = value;
                    allowProjects = jsonArray.join(';');

                    console.log ("allowed Project " + allowProjects);


                }

            }
        });
        $(document).ready(function(){

            calendar = new FullCalendar.Calendar(calendarEl, {

                themeSystem: 'bootstrap',
                height: 800,
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next,today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },

            eventSources:[
                    {
                        events: function (fetchInfo, successCallback, failureCallback) {
                            console.log(" startStr " + fetchInfo.startStr);
                            console.log(" startStr " + fetchInfo.endStr);

                            console.log("inside eventSource " + allowProjects);

                            if ($animalId === 'undefined' || $animalId === "null" || $animalId === ''){
                                let queryConfig ={};
                                queryConfig = queryConfigFunc(fetchInfo,isSuperUser,isAnimalCare);

                                WebUtils.API.selectRows("study", "waterScheduleWithWeight", queryConfig).then(function (data)
                                {
                                   var events = data.rows;

                                    successCallback(
                                        events.map(function (row) {
                                        var volume;
                                        if (row.volume != null) {
                                            volume = row.volume + 'mL';
                                        }
                                        else {
                                            volume = "On Lixit";
                                        }
                                        var eventObj = {
                                            id : LABKEY.Utils.generateUUID(),
                                            title: row.Id + ' ' + volume,
                                            start: new Date(row.date),
                                            allDay: true,
                                            groupId : groupId(row),
                                            rawRowData: row,
                                            textColor: '#000000',
                                            //editable: true,
                                            description: 'Water for animal ' + row.Id
                                        };

                                        if (row.assignedToCoalesced in husbandryAssignmentLookup) {
                                            eventObj.color = husbandryAssignmentLookup[row.assignedToCoalesced].color;

                                        }
                                        else {
                                            eventObj.color = '#F78181';
                                        }


                                        return eventObj;
                                        })
                                    );
                                    failureCallback((function(data){
                                        console.log ("Error retriving waterScheduleWithWeight");
                                    }));
                                })

                            }
                            //Render calendar for one animal of a group of animals
                            //Display panel in the animal history
                            else{
                                let queryConfig ={};
                                queryConfig = queryConfigFunc(fetchInfo,isSuperUser, isAnimalCare, $animalId);

                                WebUtils.API.selectRows("study", "waterScheduleWithWeight", queryConfig).then(function (data) {
                                    var events = data.rows;

                                    successCallback(events.map(function (row) {
                                        var volume;
                                        if (row.volume != null) {
                                            volume = row.volume+ 'ml';
                                        }
                                        else {
                                            volume = 'On Lixit';
                                        }

                                        var eventObj = {
                                            id : LABKEY.Utils.generateUUID(),
                                            title: row.Id + ' ' + volume,
                                            start: new Date(row.date),
                                            allDay: true,
                                            textColor: '#000000',
                                            groupId : groupId(row),
                                            rawRowData: row,
                                            //editable: true,
                                            description: 'Water for animal ' + row.Id
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
                        },
                        id : 'WaterScheduleCoalesced' //setting source id for full calendar
                },
                {
                    events:function (fetchInfo, successCallback, failureCallback) {
                        if ($animalId === 'undefined' || $animalId === "null" || $animalId === ''){
                        WebUtils.API.selectRows("study", "waterTotalByDateWithWeight", {
                            "date~gte": fetchInfo.start.format('Y-m-d'),
                            "date~lte": fetchInfo.end.format('Y-m-d'),
                            "date~lt":  new Date()
                        }).then(function (data) {
                            debugger;
                            var events = data.rows;

                            successCallback(
                                    events.map(function (row) {
                                        let parsedTotalWater = 0;
                                        let eventTitle = "";
                                        if( row.conditionAtTime === 'regulated' ){
                                            if ( row.TotalWater === null && row['Id/Demographics/calculated_status'] === 'Alive'){
                                                row.TotalWater = 'none';
                                            }else if( row.TotalWater === null && row['Id/Demographics/calculated_status'] === 'Dead'){
                                                row.TotalWater = 'Dead'
                                                eventTitle = row.id + row['Id/Demographics/calculated_status']
                                            }
                                            if (row['Id/Demographics/calculated_status'] === 'Alive'){
                                                parsedTotalWater = row.TotalWater;
                                                eventTitle = row.Id + " Total: " + parsedTotalWater;
                                            }else{
                                                eventTitle = row.Id + row['Id/Demographics/calculated_status']
                                            }

                                        }else{
                                            if (row['Id/Demographics/calculated_status'] === 'Alive'){
                                                row.TotalWater = 'Lixit'
                                                eventTitle = row.Id + " on Lixit";
                                            }else{
                                                row.TotalWater = 'Dead'
                                                eventTitle = row.Id + row['Id/Demographics/calculated_status']
                                            }
                                        }
                                        var eventObj = {
                                            id : LABKEY.Utils.generateUUID(),
                                            title: eventTitle,
                                            start: new Date(row.date),
                                            allDay: true,
                                            groupId : row.Id,
                                            textColor: '#000000',
                                            rawRowData: row
                                        };
                                        if (row.mlsPerKg >= row.InnerMlsPerKg || row.conditionAtTime === 'lixit'){
                                            eventObj.color = '#FFFFFF';
                                        }
                                        else if (row.mlsPerKg >= '10' && row.mlsPerKg < row.InnerMlsPerKg){
                                            eventObj.color = '#FF7F50';
                                        }
                                        else{
                                            eventObj.color = '#EE2020'
                                        }
                                        return eventObj;
                                    })
                            );
                            failureCallback((function (data){
                                console.log("error from waterTotalByDateWithWeight");
                            }))

                        })

                        }else{

                            WebUtils.API.selectRows("study", "waterTotalByDateWithWeight", {
                            "date~gte": fetchInfo.start.format('Y-m-d'),
                            "date~lte": fetchInfo.end.format('Y-m-d'),
                            "date~lt":  new Date(),
                            "Id~in": $animalId
                            }).then(function (data) {
                                var events = data.rows;

                                successCallback(
                                        events.map(function (row) {
                                            let parsedTotalWater = 0;
                                            let eventTitle = "";
                                            debugger;
                                            if(row.conditionAtTime === 'regulated') {
                                                if (row.TotalWater === null && row['Id/Demographics/calculated_status'] === 'Alive') {
                                                    row.TotalWater = 'none';
                                                }else if( row.TotalWater === null && row['Id/Demographics/calculated_status'] === 'Dead'){
                                                    row.TotalWater = 'Dead'
                                                    eventTitle = row.Id + row['Id/Demographics/calculated_status']
                                                }
                                                else if (row['Id/Demographics/calculated_status'] === 'Alive'){
                                                    parsedTotalWater = row.TotalWater;
                                                    eventTitle = row.Id + " Total: " + parsedTotalWater;
                                                }

                                            }else{
                                                if (row['Id/Demographics/calculated_status'] === 'Alive'){
                                                    row.TotalWater = 'Lixit'
                                                    eventTitle = row.Id + " on Lixit";
                                                }else{
                                                    row.TotalWater = 'Dead'
                                                    eventTitle = row.Id + row['Id/Demographics/calculated_status']
                                                }

                                            }
                                            var eventObj = {
                                                id : LABKEY.Utils.generateUUID(),
                                                title: eventTitle,
                                                start: new Date(row.date),
                                                textColor: '#000000',
                                                allDay: true,
                                                groupId : row.Id,
                                                rawRowData: row
                                            };
                                            if (row.mlsPerKg >= row.InnerMlsPerKg || row.conditionAtTime === 'lixit'){
                                                eventObj.color = '#FFFFFF';
                                            }else if (row.mlsPerKg >= '10' && row.mlsPerKg < row.InnerMlsPerKg){
                                                eventObj.color = '#FF7F50';
                                            }
                                            else{
                                                eventObj.color = '#EE2020'
                                            }
                                            return eventObj;
                                        })
                                );
                                failureCallback((function (data){
                                    console.log("error from waterTotalByDateWithWeight");
                                }))
                                })
                            }
                        },
                    id : 'totalWater' //setting source id for full calendar
                }
            ],
            loading: function (isLoading){
                if (isLoading){
                    $('#water-calendar').block({
                        message: '<img src="<%=getWebappURL("/webutils/icons/loading.svg")%>">Updating Calendar...',
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
                    $('#waterInformation').collapse('show');

                }else{
                    $('#water-calendar').unblock();
                }
            },
            //eventContent: function(arg) {
            eventClassNames: function(arg) {
                if (arg.event.extendedProps.selected) {
                    return ["event-selected"];
                } else{
                    return [];
                }
            },
            eventClick: function (info){
                //This updates all the fields that can be change in this form
                //We also have to reset the dirty flag to track any change after the event is loaded into
                //the form to be able to change.
                if (info.event.source.id == "totalWater") {
                    $('#waterInformation').collapse('hide');
                    $('#waterTotalInformation').collapse('show');
                    WebUtils.VM.taskDetails["volume"](info.event.extendedProps.rawRowData.TotalWater.toString());
                    if (info.event.extendedProps.rawRowData["Id/curLocation/location"]){
                        WebUtils.VM.taskDetails["location"](info.event.extendedProps.rawRowData["Id/curLocation/location"].toString());
                    }else{
                        WebUtils.VM.taskDetails["location"](info.event.extendedProps.rawRowData["Id/lastHousing/location"].toString());
                    }


                }else{
                    $('#waterInformation').collapse('show');
                    $('#waterTotalInformation').collapse('hide');
                    WebUtils.VM.form.volumeForm.value(info.event.extendedProps.rawRowData.volume.toString());
                }
                WebUtils.VM.form.volumeForm.dirtyFlag.reset();

                WebUtils.VM.form.provideFruitForm.value(info.event.extendedProps.rawRowData.provideFruit);
                WebUtils.VM.form.provideFruitForm.dirtyFlag.reset();

                WebUtils.VM.form.assignedToForm.value(info.event.extendedProps.rawRowData.assignedToCoalesced);
                WebUtils.VM.form.assignedToForm.dirtyFlag.reset();

                let timeOfDay = '';
                if (info.event.extendedProps.rawRowData.frequencyCoalesced){
                    switch (info.event.extendedProps.rawRowData.frequencyCoalesced){
                        case 1:
                            timeOfDay = 1;
                            break;
                        case 2:
                            timeOfDay = 2;
                            break;
                        case 3:
                            timeOfDay = 2;
                            break;
                        case 4:
                            timeOfDay = 4;
                            break;
                        case 5:
                            timeOfDay = 2;
                            break;
                        case 6:
                            timeOfDay = 2;
                            break;
                        case 7:
                            timeOfDay = 2;
                            break;
                        case 8:
                            timeOfDay = 2;
                            break;
                        case 9:
                            timeOfDay = 2;
                            break;
                        case 10:
                            timeOfDay = 2;
                            break;
                        case 11:
                            timeOfDay = 2;
                            break;
                        default:
                            timeOfDay = 2;
                    }
                }
                WebUtils.VM.form.frequencyForm.value(timeOfDay);
                WebUtils.VM.form.frequencyForm.dirtyFlag.reset();



                $('#waterInfo').attr('disabled','disabled');
                $('#enterWaterOrder').attr('disabled', 'disabled');
                $('#waterInfo').text('Enter Single Day Water');
                document.getElementById("modelServerResponse").innerHTML = "";
                $('#waterInfoPanel').unblock();


                let event;
                if (selectedEvent.id){
                    event = calendar.getEventById(selectedEvent.id);
                    if (event){
                        event.setExtendedProp("selected",false)
                    }

                }
                info.event.setExtendedProp("selected",true);
                selectedEvent = info.event;


                var momentDate;
                var waterTotal = info.event.source.id;
                jQuery.each(info.event.extendedProps.rawRowData, function (key, value) {

                    if (key in WebUtils.VM.taskDetails) {
                        if (key == "date") {
                            momentDate = moment(value, "YYYY/MM/DD HH:mm:ss");
                            value = moment(value, "YYYY/MM/DD HH:mm:ss").format("MM/DD/YYYY");


                            // value = displayDate(value);
                           // webUtils.VM.taskDetails[rawDate](moment(value, "YYYY/MM/DD HH:mm:ss").format("MM/DD/YYYY"));
                            //value = value.toDate();
                        }

                        WebUtils.VM.taskDetails[key](value);
                        if (hideEditPanel){
                            $('#waterExceptionPanel').collapse('hide');
                        }



                        var today = moment();

                        if (waterTotal !== "totalWater" && key =="date" && (momentDate.diff(today, 'days'))>= 0 && (allowProjects !== "" || isSuperUser)){
                            $('#waterInfo').removeAttr('disabled');

                        }

                        if(waterTotal !== "totalWater" && key == "dataSource" && value == "waterOrders" && (momentDate.diff(today, 'days'))>= 0 && (allowProjects !== "" || isSuperUser)){
                            $('#enterWaterOrder').removeAttr('disabled');
                        }

                        if(waterTotal !== "totalWater" && key == "dataSource" && value == "waterAmount" && (momentDate.diff(today, 'days'))>= 0 && (allowProjects !== "" || isSuperUser)){
                            $('#waterInfo').text('Edit Single Day Water');
                        }
                    }
                });
            },

        },);
        calendar.render();
        });





        // For some reason, type-ahead makes this transparent.  In order to allow bootstrap to "disable" it
        // by greying it out, we need to remove that property.
        //$assignedToField.css('background-color', '');

       // var $scheduleForm = $('.scheduleForm');



        _.extend(WebUtils.VM, {

            taskDetails: {
                lsid:                       ko.observable(),
                objectIdCoalesced:          ko.observable(),
                waterOrderObjectId:         ko.observable(),
                taskid:                     ko.observable(),
                projectCoalesced:           ko.observable(),
                Id:                         ko.observable(),
                date:                       ko.observable(),
                location:                   ko.observable(),
                volume:                     ko.observable(),
                provideFruit:               ko.observable(),
                provideFruitTitle:          ko.observable(),
                dataSource:                 ko.observable(),
                assignedToCoalesced:        ko.observable(),
                assignedToTitleCoalesced:   ko.observable(),
                frequencyCoalesced:         ko.observable(),
                frequencyMeaningCoalesced:  ko.observable(),
                displaytimeofday:           ko.observable(),
                rawDate:                    ko.observable(),
                mlsPerKg:                   ko.observable(),
                conditionAtTime:            ko.observable(),
                status:                     ko.observable()
            },
            form: {
                lsidForm:                   ko.observable(),
                taskidForm:                 ko.observable(),
                objectIdForm:               ko.observable(),
                dataSourceForm:             ko.observable(),
                animalIdForm:               ko.pureComputed(function (){return ''}),
                dateForm:                   ko.observable(),
                projectForm:                ko.observable(),
                waterOrderObjectId:         ko.observable(),
                frequencyForm:              new Item("Time of Day:","PM"),
                volumeForm:                 new Item("Volume:", ""),
                provideFruitForm:           new Item("Provide Fruit:","none"),
                assignedToForm:             new Item("Assigned To:","researchstaff")

            },


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

            proceed: function(row){
                WebUtils.VM.requestRowInForm = row;
                var waterOrder = ko.mapping.toJS(row);

                //TODO: escalate permission to close waterorder  older than 60 days or all ongoing water order
                //TODO: should have the QC Status of Started and not complete

                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "CloseWaterOrder", null, {
                        lsid:               waterOrder.lsid,
                        taskId:             waterOrder.taskid,
                        objectId:           waterOrder.objectIdCoalesced,
                        animalId:           waterOrder.Id,
                        endDate:            waterOrder.date,
                        dataSource:         waterOrder.dataSource,
                        skipWaterRegulationCheck:     true

                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success){

                            // Refresh the calendar view.
                            calendar.refetchEvents();

                            $('#waterInfoPanel').unblock();
                            $('#myModal').modal('hide');
                            document.getElementById("modelServerResponse").innerHTML = "";


                        }else if (response.errors){
                            document.getElementById("returnTitle").style.display = "block";
                            document.getElementById("modelServerResponse").style.display = "block";

                            //let jsonArray = response.errors[0].errors;
                            let jsonArray;

                            var returnMessage = "";




                            document.getElementById("modelServerResponse").innerHTML = "<p>"+returnMessage+"</p>";

                            //$('#myModal')
                            //LABKEY.Utils.alert("Update failed", response.errors);
                        }
                        else {
                            alert('Water cannot be closed')
                        }


                    }, this),
                    method: "POST"

                });

            },
            removeLastDay: function(){
                if (document.getElementById('removelastday').checked){
                    var newEndDate =moment(WebUtils.VM.taskDetails.date(), "MM/DD/YYYY");
                    newEndDate = newEndDate.subtract(1, "days");
                    newEndDate = newEndDate.format("MM/DD/YYYY");
                    WebUtils.VM.taskDetails.date(newEndDate);
                }else if (selectedEvent.extendedProps){
                    var originalDate = moment(selectedEvent.extendedProps.rawRowData.date, "YYYY-MM-DD hh:mm:ss.SSS")
                    originalDate = originalDate.format("MM/DD/YYYY")
                    WebUtils.VM.taskDetails.date(originalDate);
                }
            },

            endWaterOrder: function (row){
                document.getElementById("modelServerResponse").innerHTML = "";

                $('#waterInfoPanel').block({
                    message: '<img src="<%=getWebappURL("/webutils/icons/loading.svg")%>">Closing Water Order...',
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
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "CloseWaterOrder", null, {
                        lsid:               waterOrder.lsid,
                        taskId:             waterOrder.taskid,
                        objectId:           waterOrder.objectIdCoalesced,
                        animalId:           waterOrder.Id,
                        endDate:            waterOrder.date,
                        dataSource:         waterOrder.dataSource

                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success){

                            // Refresh the calendar view.
                            calendar.refetchEvents();

                            $('#waterInfoPanel').unblock();
                            $('#myModal').modal('hide');
                            document.getElementById('removelastday').checked = false;


                        }else if (response.errors){

                            document.getElementById("returnTitle").style.display = "block";
                            document.getElementById("returnTitle").classList.remove("hidden");
                            document.getElementById("modelServerResponse").style.display = "block";
                            document.getElementById('removelastday').checked = false;

                            //let jsonArray = response.errors[0].errors;
                            let jsonArray;

                            var returnMessage = "";
                            if (response.extraContext.extraContextArray && response.extraContext.extraContextArray.length>0){
                                jsonArray = response.extraContext.extraContextArray;
                            }
                            else {

                                returnMessage = response.errors[0].exception;
                            }


                            if (jsonArray != null){
                                for (var i = 0; i < jsonArray.length; i++ ){
                                    var errorObject = jsonArray[i];
                                    let clientObjectId = Ext4.util.Format.htmlEncode(errorObject.objectId);
                                    let volume = Ext4.util.Format.htmlEncode(errorObject.volume);
                                    let date = Ext4.util.Format.htmlEncode(errorObject.date);
                                    returnMessage += "<div id='waterException" + i +"'>There is another waterAmount on "+date+" for the volume of "+volume+" " +
                                            " <button onclick=\"updateWaterAmount('"+clientObjectId+"')\">Update</button> " +
                                            "<button onclick=\"deleteWaterAmount(null, null,'"+clientObjectId+"','waterException" + i +"')\">Delete</button><br></div>";

                                }

                            }
                            document.getElementById("modelServerResponse").innerHTML = "<p>"+returnMessage+"</p>";
                            document.getElementById("proceedButton").classList.remove("hidden");

                        }
                        else {
                            alert('Water cannot be closed')
                            document.getElementById('removelastday').checked = false;
                        }


                    },this),

                    method:"POST"
                });

            },

            enterNewWaterOrder: function (row){
                document.getElementById("modelServerResponse").innerHTML = "";

                $('#waterInfoPanel').block({
                    message: '<img src="<%=getWebappURL("/webutils/icons/loading.svg")%>">Closing Water Order...',
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
                //DONE: Add allowDatesInDistantPast: true into the waterOrders.js file

                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("wnprc_ehr", "EnterNewWaterOrder", null, {
                        lsid:                   waterOrder.lsid,
                        taskId:                 waterOrder.taskid,
                        objectId:               waterOrder.objectIdCoalesced,
                        animalId:               waterOrder.Id,
                        endDate:                waterOrder.date,
                        dataSource:             waterOrder.dataSource,
                        project:                waterOrder.projectCoalesced,
                        frequency:              waterOrder.frequencyCoalesced,
                        assignedTo:             waterOrder.assignedToCoalesced,
                        volume:                 waterOrder.volume

                    }),
                    success: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        if (response.success){

                            // Refresh the calendar view.
                            calendar.refetchEvents();

                            $('#waterInfoPanel').unblock();
                            console.log(response.taskId);

                            //('ehr', 'dataEntryForm.view', null, {formType: LABKEY.ActionURL.getParameter('formType')})
                            var newWaterOrder =  LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: 'Enter Water Orders', 'taskid': response.taskId});
                            //schemaName: 'study', 'query.queryName': 'demographicsParentStatus', 'query.Id~eq': this.subjectId})
                            document.getElementById('removelastday').checked = false;

                            window.open(newWaterOrder,'_blank');

                        }
                        else{
                            response.errors;
                            $('#myModal').modal('hide');
                            document.getElementById('removelastday').checked = false;
                        }


                    }, this),
                    failure: LABKEY.Utils.getCallbackWrapper(function (response)
                    {
                        alert('Water cannot be closed')
                        $('#waterInfoPanel').unblock();

                    },this),
                    method:"POST"

                });

            },
            closeModalWindow: function (row){

                $('#waterInfoPanel').unblock();

                var originalDate = moment(selectedEvent.extendedProps.rawRowData.date, "YYYY-MM-DD hh:mm:ss.SSS")
                console.log("original date "+originalDate);
                originalDate = originalDate.format("MM/DD/YYYY")
                WebUtils.VM.taskDetails.date(originalDate);
                document.getElementById('removelastday').checked = false;
                document.getElementById("modelServerResponse").innerHTML = "";
                document.getElementById("proceedButton").classList.add("hidden");
                document.getElementById("returnTitle").classList.add("hidden");

            }
        });

        WebUtils.VM.taskDetails.animalLink = ko.pureComputed(function() {
            var animalId = WebUtils.VM.taskDetails.Id();

            return LABKEY.ActionURL.buildURL('ehr', 'participantView', null, {
                participantId: animalId
            });
        });

        WebUtils.VM.taskDetails.taskLink = ko.pureComputed(function() {
            var taskidValue = WebUtils.VM.taskDetails.taskid();
            var formtype = '';
            if (WebUtils.VM.taskDetails.dataSource == 'waterAmount'){
                formtype = 'Enter Water Amounts'

            }else{
                formtype = 'Enter Water Orders'
            }

            return LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormDetails', null, {
                formtype:   formtype,
                taskid:     taskidValue

            });
        });

        WebUtils.VM.taskDetails.displayDate = ko.pureComputed(function(){
            return WebUtils.VM.taskDetails.date();
        });

        WebUtils.VM.taskDetails.mlsPerKgCal = ko.pureComputed(function(){
            return !(WebUtils.VM.taskDetails.mlsPerKg() >= 20 || WebUtils.VM.taskDetails.conditionAtTime() === 'lixit')
        });

        WebUtils.VM.taskDetails.conditionAtTimeValue = ko.pureComputed(function(){
            if ( WebUtils.VM.taskDetails.conditionAtTime() === 'regulated' && WebUtils.VM.taskDetails.calculatedStatusValue() === 'Alive' ){

            }
            return WebUtils.VM.taskDetails.conditionAtTime();
        });

        WebUtils.VM.taskDetails.calculatedStatusValue = ko.pureComputed(function(){
            return WebUtils.VM.taskDetails.status();
        });

        //Updating all the records of the form with data coming from the taskDeatils panel
        //These records are not supposed to be change by the end users when adding or updating
        //a waterAmount record.
        WebUtils.VM.form.animalIdForm = ko.pureComputed(function(){
            return WebUtils.VM.taskDetails.Id();
        });

        WebUtils.VM.form.dataSourceForm = ko.pureComputed(function(){
            return WebUtils.VM.taskDetails.dataSource();
        });

        WebUtils.VM.form.dateForm = ko.pureComputed(function(){
            return WebUtils.VM.taskDetails.date();
        });

        WebUtils.VM.form.projectForm = ko.pureComputed(function (){
                return WebUtils.VM.taskDetails.projectCoalesced();
        });

        WebUtils.VM.form.objectIdForm = ko.pureComputed(function(){
            return WebUtils.VM.taskDetails.objectIdCoalesced();
        });

        WebUtils.VM.form.waterOrderObjectId = ko.pureComputed(function(){
            //if (WebUtils.VM.form.dataSourceForm === "waterOrders") {
                return WebUtils.VM.taskDetails.objectIdCoalesced();
            /*} else {
                return  WebUtils.VM.taskDetails.waterOrderObjectId();
            }*/
        });

        WebUtils.VM.form.taskidForm = ko.pureComputed(function(){
            return WebUtils.VM.taskDetails.taskid();
        });


        jQuery.each(WebUtils.VM.form, function (key, observable){
            //this.dirtyFlag = new ko.dirtyFlag(observable);
            if (key === "volumeForm"){
                changeableItems.push(observable);
            }if (key === "provideFruitForm"){
                changeableItems.push(observable);
            }if (key === "assignedToForm"){
                changeableItems.push(observable);
            }if (key === "frequencyForm"){
                changeableItems.push(observable);
            }


        });



        WebUtils.VM.form.dirtyItems = ko.computed(function() {
            return ko.utils.arrayFilter(changeableItems(), function(item) {
                return item.dirtyFlag.isDirty();
            });
        },WebUtils.VM.form);

        WebUtils.VM.form.isDirty = ko.computed(function() {
            return WebUtils.VM.form.dirtyItems().length > 0;
        },WebUtils.VM.form);

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

                $('#waterExceptionPanel').block({
                    message: '<img src="<%=getWebappURL("/webutils/icons/loading.svg")%>">Updating Calendar...',
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
                var taskid = LABKEY.Utils.generateUUID();
                var taskInsertSuccess = false;
                //var date = form.date.format("Y-m-d H:i:s");

                var insertDate = new Date(form.dateForm);
                if (form.frequencyForm.value === "AM"){
                    insertDate.setHours(8);
                    insertDate.setMinutes(0);
                }
                else if (form.frequencyForm.value === "PM"){
                    insertDate.setHours(14);
                    insertDate.setMinutes(0);
                }
                else{
                    insertDate.setHours(14);
                    insertDate.setMinutes(0);
                }

                if (form.dataSourceForm === "waterOrders"){
                    LABKEY.Query.saveRows({
                        method: 'POST',
                        containerPath: container,
                        commands:[{
                            command: 'insert',
                            containerPath: container,
                            schemaName: 'study',
                            queryName: 'waterAmount',
                            rows:[{
                                taskid:                 taskid,
                                Id:                     form.animalIdForm,
                                date:                   insertDate.getTime(),
                                project:                form.projectForm,
                                volume:                 form.volumeForm.value,
                                provideFruit:           form.provideFruitForm.value,
                                assignedTo:             form.assignedToForm.value,
                                frequency:              form.frequencyForm.value,
                                waterOrderObjectId:     form.waterOrderObjectId,
                                recordSource:           "WaterCalendar",
                                waterSource:            "regulated",
                                qcstate:                10 //Schedule
                            }]
                        },{
                            command: 'insert',
                            containerPath: container,
                            schemaName: 'ehr',
                            queryName: 'tasks',
                            rows:[{
                                taskid:     taskid,
                                title:      "Enter Water Daily Amount",
                                category:   "task",
                                qcstate:    1, //Complete
                                formType:   "Enter Water Daily Amount"
                            }]
                        }],
                        timeout: 999999,
                        scope: this,
                        failure: function(e){
                            console.log('Error saving water amount and task' + e);
                            // Refresh the calendar view.
                            calendar.refetchEvents();
                            //Unblock calendar
                            $('#water-calendar').unblock();
                        },
                        success: function(){
                            WebUtils.VM.form.volumeForm.dirtyFlag.reset();
                            WebUtils.VM.form.provideFruitForm.dirtyFlag.reset();
                            WebUtils.VM.form.assignedToForm.dirtyFlag.reset();
                            WebUtils.VM.form.frequencyForm.dirtyFlag.reset();
                            $('#waterExceptionPanel').unblock();
                            calendar.refetchEvents();
                        }

                    });
                } else if (form.dataSourceForm === "waterAmount"){

                    LABKEY.Ajax.request({
                        url: LABKEY.ActionURL.buildURL("wnprc_ehr", "UpdateWaterAmount", null, {
                            lsid:               form.lsidForm,
                            taskId:             form.taskidForm,
                            objectId:           form.objectIdForm,
                            animalId:           form.animalIdForm,
                            dateInMillis:       insertDate.getTime(),
                            frequency:          form.frequencyForm.value,
                            assignedTo:         form.assignedToForm.value,
                            volume:             form.volumeForm.value,
                            provideFruit:       form.provideFruitForm.value,
                            dataSource:         form.dataSourceForm,
                            waterSource:        "regulated",
                            action:             "update"

                        }),
                        success: LABKEY.Utils.getCallbackWrapper(function (response)
                        {
                            if (response.success){

                                // Refresh the calendar view.
                                calendar.refetchEvents();
                                //Resetting dirty flags
                                WebUtils.VM.form.volumeForm.dirtyFlag.reset();
                                WebUtils.VM.form.provideFruitForm.dirtyFlag.reset();
                                WebUtils.VM.form.assignedToForm.dirtyFlag.reset();
                                WebUtils.VM.form.frequencyForm.dirtyFlag.reset();

                                $('#waterExceptionPanel').unblock();
                                // Refresh the calendar view.
                                calendar.refetchEvents();
                                //Unblock calendar
                                $('#water-calendar').unblock();

                            } else {
                                alert('Water cannot be closed')
                            }


                        }, this),
                        method:"POST"

                    });


                }

                if (hideEditPanel){
                    $('#waterExceptionPanel').collapse('hide')
                }

            },
            editMultiple: function (){
                if (document.getElementById('multiple').checked){
                    hideEditPanel = false;
                }else {
                    hideEditPanel = true;
                }
                console.log("get Spam");
            },

        });
     /*   document.getElementById('frequencySelect').addEventListener('change', function() {
            document.getElementById('submitNewWater').disabled = true;

        });*/




    })();





    function queryConfigFunc (fetchInfo, isSuperUser, isAnimalCare, animalId){
        let date = new Date();
        let configObject = {
            "date~gte": fetchInfo.start.format('Y-m-d'),
            "date~lte": fetchInfo.end.format('Y-m-d'),
            "parameters": {NumDays: 120, StartDate: date.format(LABKEY.extDefaultDateFormat)},
            "qcstate/label~eq": "Scheduled"
        };


        if (isSuperUser || isAnimalCare){
            if (animalId){
                configObject["Id~in"]= animalId;
            }
        }
        if (allowProjects !== ""){
            configObject["projectCoalesced~in"] = allowProjects;
            if (animalId){
                configObject["Id~in"] = animalId;
            }
        }
        return configObject;
    }

    function deleteWaterAmount(currentModel,event,clientObjectId,divId){
        if (!clientObjectId){
            clientObjectId = selectedEvent.extendedProps.rawRowData.objectIdCoalesced;
        }

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL("wnprc_ehr", "UpdateWaterAmount", null, {
                objectId:           clientObjectId,
                dataSource:         "waterAmount",
                action:             "delete"

            }),
            success: LABKEY.Utils.getCallbackWrapper(function (response)
            {
                if (response.success){


                    // Refresh the calendar view.
                    calendar.refetchEvents();

                    //Clearing error message
                    document.getElementById(divId).innerHTML = "";

                    //$('#waterInfoPanel').unblock();

                } else {
                    alert('Water Amount cannot be deleted')
                }


            }, this),
            method: "POST"

        });

    }
    function updateWaterAmount(objectId){

        var updateWaterOrder =  LABKEY.ActionURL.buildURL('ehr', 'manageRecord', null, {
            schemaName:         'study',
            queryName:          "waterAmount",
            keyField:           "objectId",
            key:                objectId
        });
        //schemaName: 'study', 'query.queryName': 'demographicsParentStatus', 'query.Id~eq': this.subjectId})

        window.open(updateWaterOrder,'_blank');

        //TODO: add a wait for user to update water


        // Refresh the calendar view.
        calendar.refetchEvents();

    }


    function sleep(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
    }
    function groupId(row){

        if (row.dataSource === "waterAmount") {
            if(row.waterOrderObjectId === null){
                return LABKEY.Utils.generateUUID();
            }else {
                return row.waterOrderObjectId
            }

        }else{
            return row.objectIdCoalesced
        }
    }

</script>