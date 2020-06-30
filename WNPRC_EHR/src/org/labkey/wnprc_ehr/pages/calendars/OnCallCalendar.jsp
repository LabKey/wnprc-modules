<%@ page import="org.labkey.wnprc_ehr.data.ColonyCensus.ColonyCensus" %>
<%@ page import="org.labkey.wnprc_ehr.data.ColonyCensus.PopulationInstant" %>
<%@ page import="org.joda.time.LocalDate" %>
<%@ page import="java.util.Map" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.wnprc_ehr.calendar.OnCallCalendar" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<style type="text/css">

    .thin-bordered-table {
        border: 1px solid black;
        padding: 1em;
    }

    .centered-text-table {
        text-align: center;
        vertical-align: middle;
    }

    .schedule-nav-link {
        text-decoration: none;
        display: inline-block;
        padding: 8px 16px;
        background-color: #116596;
        color: white;
    }

    .schedule-nav-link:hover {
        background-color: #116596;
        color: black;
    }

    .error-text {
        color: red;
    }

</style>

<div class="panel panel-primary">
    <div class="panel-heading"><span>On Call Schedule</span></div>

    <div class="panel-body">
        <form>
            <div class="form-group">
                <div class="row">
                    <div class="col-sm-2">
                        <label for="startDate">Start Date</label>
                        <input type="text" onfocus="setDateOnFocus(this)" onblur="setPlaceholderOnBlur(this)" class="form-control" id="startDate" placeholder="">
                    </div>
                    <div class="col-sm-2">
                        <label for="endDate">End Date</label>
                        <input type="text" onfocus="setDateOnFocus(this)" onblur="setPlaceholderOnBlur(this)" class="form-control" id="endDate" placeholder="Password">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <div class="row">
                    <div class="col-sm-2">
                        <button onclick="loadRequestedWeek()" type="button" class="btn btn-primary">Fetch Schedule</button>
                    </div>
                </div>
            </div>
        </form>

        <div class="row">
            <div class="col-sm-6">
                <div id="navigateByWeek">
                    <br><br>
                    <a class="schedule-nav-link" href="javascript:changeWeek(-1)">&laquo; Previous</a>
                    <a class="schedule-nav-link" href="javascript:loadCurrentWeek()">Current Week</a>
                    <a class="schedule-nav-link" href="javascript:changeWeek(1)">Next &raquo;</a>
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
        let startDatePh = document.getElementById("startDate").placeholder;
        let endDatePh = document.getElementById("endDate").placeholder;
        let startDateString = startDatePh.substring(6, 10) + "-" + startDatePh.substring(0, 2) + "-" + startDatePh.substring(3, 5) + "T12:00:00Z";
        let endDateString = endDatePh.substring(6, 10) + "-" + endDatePh.substring(0, 2) + "-" + endDatePh.substring(3, 5) + "T12:00:00Z";

        startDateOfSchedule = new Date(startDateString);
        endDateOfSchedule = new Date(endDateString);
        setLoadingMessage();
        loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule);
    }

    function setPlaceholderDates(startDate, endDate) {
        let startDateEl = document.getElementById("startDate");
        let endDateEl = document.getElementById("endDate");

        let startYear = startDate.getFullYear();
        let startMonth = startDate.getMonth() + 1;
        let startDay = startDate.getDate();
        let endYear = endDate.getFullYear();
        let endMonth = endDate.getMonth() + 1;
        let endDay = endDate.getDate();

        startDateEl.value = "";
        startDateEl.placeholder = String(startMonth).padStart(2, "0") + "/" + String(startDay).padStart(2, "0") + "/" + startYear;
        startDateEl.type = "text";
        endDateEl.value = "";
        endDateEl.placeholder = String(endMonth).padStart(2, "0") + "/" + String(endDay).padStart(2, "0") + "/" + endYear;
        endDateEl.type = "text";
    }

    function setPlaceholderOnBlur(dateEl) {
        let dateString = dateEl.value;
        if (dateString) {
            let year = dateString.substring(0, 4);
            let month = dateString.substring(5, 7);
            let day = dateString.substring(8, 10);
            dateEl.value = "";
            dateEl.placeholder = month + "/" + day + "/" + year;
        } else {
            dateEl.placeholder = "";
        }
        dateEl.type = "text";
    }

    function setDateOnFocus(dateEl) {
        let year = dateEl.placeholder.substring(6, 10);
        let month = dateEl.placeholder.substring(0, 2);
        let day = dateEl.placeholder.substring(3, 5);
        dateEl.value = year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
        dateEl.type = "date";
    }

    function createOnCallTable(onCallSchedule) {
        let onCallTableDiv = document.getElementById("onCallTable");
        let table = document.createElement("table");
        table.classList.add("thin-bordered-table");
        let headerRow = document.createElement("tr");
        for (let i = 0; i < onCallSchedule[0].length; i++) {
            let th = document.createElement("th");
            th.classList.add("thin-bordered-table");
            th.classList.add("centered-text-table");
            th.innerHTML = (onCallSchedule[0][i]) ? onCallSchedule[0][i].html : "<strong>NO DATA</strong>";
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
        for (let i = 1; i < onCallSchedule.length; i++) {
            let tr = document.createElement("tr");
            for (let j = 0; j < onCallSchedule[i].length; j++) {
                let td = document.createElement("td");
                td.classList.add("thin-bordered-table");
                td.classList.add("centered-text-table");
                td.innerHTML = (onCallSchedule[i][j]) ? onCallSchedule[i][j].html : "<strong>NO DATA</strong>";
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        onCallTableDiv.innerHTML = "";
        onCallTableDiv.appendChild(table);
    }

    function loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule) {
        setPlaceholderDates(startDateOfSchedule, endDateOfSchedule);
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