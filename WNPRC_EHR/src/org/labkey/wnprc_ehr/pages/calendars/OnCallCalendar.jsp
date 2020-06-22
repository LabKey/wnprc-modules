<%@ page import="org.labkey.wnprc_ehr.data.ColonyCensus.ColonyCensus" %>
<%@ page import="org.labkey.wnprc_ehr.data.ColonyCensus.PopulationInstant" %>
<%@ page import="org.joda.time.LocalDate" %>
<%@ page import="java.util.Map" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.wnprc_ehr.calendar.OnCallCalendar" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<style type="text/css">

    table, th, td {
        border: 1px solid black;
        padding: 1em;
    }

    th, td {
        text-align: center;
        vertical-align: middle;
    }

    a {
        text-decoration: none;
        display: inline-block;
        padding: 8px 16px;
    }

    a:hover {
        background-color: #116596;
        color: black;
    }

    .next, .previous {
        background-color: #116596;
        color: white;
    }

</style>

<div class="panel panel-primary">
    <div class="panel-heading"><span>On Call Schedule</span></div>

    <div class="panel-body">
        <form onsubmit="loadRequestedWeek()">
            <div class="form-group">
                <div class="row">
                    <div class="col-sm-2">
                        <label for="startDate">Start Date</label>
                        <input type="date" class="form-control" id="startDate" placeholder="">
                    </div>
                    <div class="col-sm-2">
                        <label for="endDate">End Date</label>
                        <input type="date" class="form-control" id="endDate" placeholder="Password">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <div class="row">
                    <div class="col-sm-2">
                        <button type="submit" class="btn btn-primary">Fetch Schedule</button>
                    </div>
                </div>
            </div>
        </form>

        <div class="row">
            <div class="col-sm-6">
                <div id="navigateByWeek">
                    <br><br>
                    <a href="javascript:changeWeek(-1)" class="previous">&laquo; Previous</a>
                    <a href="javascript:loadCurrentWeek()" class="previous">Current Week</a>
                    <a href="javascript:changeWeek(1)" class="next">Next &raquo;</a>
                    <br><br>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <div id="onCallTable">Loading schedule...</div>
            </div>
        </div>
    </div>
</div>

<script>

    function getFirstDayOfWeek(startingDate) {
        return getDateForDayOfWeek(0, startingDate);
    }

    function getLastDayOfWeek(startingDate) {
        return getDateForDayOfWeek(6, startingDate);
    }

    // This function returns a date object for the day of the week that is given that is in the same
    // week as the startingDate that is given. If no startingDate is given it will default to today.
    //
    // For example, if dayOfWeek = 1 (Monday) and startingDate = 2020-02-13 (a Thursday), then this
    // function will return a date object with the date set to 2020-02-10 (the Monday of that same week).
    //
    // -startingDate is the date you want to start calculating from
    // -dayOfWeek is the day of that week (the week that startingDate
    //   is in) that you want returned (Sun = 0, Sat = 6)
    // Modified from https://stackoverflow.com/questions/12791378/get-the-most-recently-occurring-sunday
    function getDateForDayOfWeek(dayOfWeek, startingDate) {
        if (!startingDate) {
            startingDate = new Date();
        }
        let returnDate = new Date(startingDate);
        returnDate.setDate(returnDate.getDate() - returnDate.getDay() + dayOfWeek);
        return returnDate;
    }

    function setLoadingMessage() {
        let onCallTableDiv = document.getElementById("onCallTable");
        onCallTableDiv.innerText = "Loading schedule..."
    }

    let startDateOfSchedule;
    let endDateOfSchedule;
    if (new Date() < getDateForDayOfWeek(5)) {
        startDateOfSchedule = getDateForDayOfWeek(-2);
        endDateOfSchedule = getDateForDayOfWeek(4);
    }
    else {
        startDateOfSchedule = getDateForDayOfWeek(5);
        endDateOfSchedule = getDateForDayOfWeek(11);
    }

    function changeWeek(direction) {
        let daysToChangeBy = 7 * direction;
        startDateOfSchedule.setDate(startDateOfSchedule.getDate() + daysToChangeBy);
        endDateOfSchedule.setDate(endDateOfSchedule.getDate() + daysToChangeBy);
        setLoadingMessage();
        loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule);
    }

    function loadCurrentWeek() {
        if (new Date() < getDateForDayOfWeek(5)) {
            startDateOfSchedule = getDateForDayOfWeek(-2);
            endDateOfSchedule = getDateForDayOfWeek(4);
        } else {
            startDateOfSchedule = getDateForDayOfWeek(5);
            endDateOfSchedule = getDateForDayOfWeek(11);
        }
        setLoadingMessage();
        loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule);
    }

    function loadRequestedWeek() {
        let start = new Date(document.getElementById("startDate").value + "T12:00:00Z");
        let end = new Date(document.getElementById("endDate").value + "T12:00:00Z");
        setLoadingMessage();
        loadOnCallSchedule(start, end);
    }

    function createOnCallTable(onCallSchedule) {
        let onCallTableDiv = document.getElementById("onCallTable");
        let table = document.createElement("table");
        let headerRow = document.createElement("tr");
        for (let i = 0; i < onCallSchedule[0].length; i++) {
            let th = document.createElement("th");
            th.innerHTML = (onCallSchedule[0][i]) ? onCallSchedule[0][i].html : "NO DATA";
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
        for (let i = 1; i < onCallSchedule.length; i++) {
            let tr = document.createElement("tr");
            for (let j = 0; j < onCallSchedule[i].length; j++) {
                let td = document.createElement("td");
                td.innerHTML = (onCallSchedule[i][j]) ? onCallSchedule[i][j].html : "NO DATA";
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        onCallTableDiv.innerHTML = "";
        onCallTableDiv.appendChild(table);
    }

    function loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule) {
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL("wnprc_ehr", "FetchOnCallScheduleGoogleEvents", null, {
                startDate: startDateOfSchedule,
                endDate: endDateOfSchedule,
            }),
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                if (response.success) {
                    let onCallSchedule = response.onCallSchedule;
                    createOnCallTable(onCallSchedule);
                }
                else {
                    let onCallTableDiv = document.getElementById("onCallTable");
                    onCallTableDiv.innerText = "Schedule failed to load."
                }
            }, this)
        });
    }

    $(document).ready(function() {
        loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule);
    });
</script>