<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    boolean reportMode = request.getParameter("reportMode") != null && request.getParameter("reportMode").equals("true");
    String startDate = request.getParameter("startDate");
    String endDate = request.getParameter("endDate");
%>

<style type="text/css">

    @media print {
        @page {
            margin: 20px;
        }

        * {
            margin: 0 !important;
            padding: 0 !important;
        }
    }

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

    <%
        if (!reportMode) {
    %>
<div class="panel panel-primary">
    <div class="panel-heading"><span>On Call Schedule</span></div>
    <%
        } else {
    %>
<div>
    <div class="text-center"><span id="printable-schedule-header"></span><br><br></div>
    <%
        }
    %>

    <div class="panel-body">
        <%
            if (!reportMode) {
        %>
        <form class="hidden-print">
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
        <%
            }
        %>
        <div class="row">
            <div class="col-sm-6">
                In the event of an injury or potential exposure occurring on the weekend that requires a trip the UW Hospital Emergency
                Department, contact either the Colony Management Supervisor or the Veterinarian on-call, and they will contact the
                appropriate HR representative.
                <br><br>
            </div>
        </div>
        <%
            if (!reportMode) {
        %>
        <div class="row">
            <div class="col-sm-6">
                <a id="printable-schedule-link" href="#">Printable Schedule</a>
                <br>
            </div>
        </div>
        <%
            }
        %>
        <div class="row">
            <div class="col-sm-6">
                <div id="onCallTable">Loading schedule...</div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <br>
                Use the above contact information for: <strong>AFTER HOURS (weekdays 4pm-6am), WEEKENDS, and HOLIDAYS</strong>. Contact staff using the phone numbers listed above,
                calling the bolded number first.
                <br><br>
                <ul>
                    <li> If the on-call <strong>Veterinarian</strong> cannot be reached after multiple attempts, contact another veterinarian listed or Buddy Capuano (Attending Veterinarian) at 209-6846.</li>
                    <ul>
                        <li>Leaving a voicemail or sending a text message without further follow up is NOT appropriate when contacting the veterinarian for animal concerns.</li>
                    </ul>
                    <br>
                    <li>If the <strong>Supervisor</strong> cannot be reached after multiple attempts, contact another supervisor listed or Bonnie Friscino (Colony Manager) at 209-6522.</li>
                    <ul>
                        <li>For facility in-house emergencies (e.g. water leaks, broken pipes, and temperature problems), contact the Physical Plant at 263-3333 (after hours)
                            or Bruce Pape (209-6808) as well as the supervisor.</li>
                        <li>Night ART/Nursery staff must contact the supervisor to check out.</li>
                    </ul>
                    <br>
                    <li>If the <strong>Pathologist</strong> cannot be reached, leave a message including date and time of the call, your name and phone number, and the age, ID#, and species of the animal.</li>
                </ul>
            </div>
        </div>

    </div>
</div>

<script>
    let startDateOfSchedule;
    let endDateOfSchedule;

    function setReportHeaderText(startDate, endDate) {
        let headerElement = document.getElementById("printable-schedule-header");

        if (headerElement) {
            let headerText = "<strong>Wisconsin National Primate Research Center" +
                "<br>On-call Schedule for:" +
                "<br>" + getReportHeaderDateRange(startDate, endDate) + "</strong>";

            headerElement.innerHTML = headerText;
        }
    }

    function getReportHeaderDateRange(startDate, endDate) {
        let formattedDateRange = "";

        let formattedStartDate = startDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long'
        });
        formattedStartDate += getDateOrdinal(startDate.getDate());

        let formattedEndDate = endDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long'
        });
        formattedEndDate += getDateOrdinal(endDate.getDate());

        if (startDate.getFullYear() === endDate.getFullYear()) {
            formattedDateRange = formattedStartDate + " - " + formattedEndDate + ", " + startDate.getFullYear();
        }
        else {
            formattedDateRange = formattedStartDate + ", " + startDate.getFullYear() + " - " + formattedEndDate + ", " + endDate.getFullYear();
        }

        return formattedDateRange;
    }

    //from https://stackoverflow.com/questions/15397372/javascript-new-date-ordinal-st-nd-rd-th
    function getDateOrdinal(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    function setPrintableScheduleLink() {
        let printableURL = LABKEY.ActionURL.buildURL('wnprc_ehr', 'OnCallCalendarPrintable', null, {
            reportMode: true,
            startDate: getPlaceholderText(document.getElementById("startDate")),
            endDate: getPlaceholderText(document.getElementById("endDate"))
        });
        if (document.getElementById("printable-schedule-link")) {
            document.getElementById("printable-schedule-link").href = printableURL;
        }
    }

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
        let stringDate;
        let returnDate = new Date(startingDate);
        returnDate.setDate(returnDate.getDate() - returnDate.getDay() + dayOfWeek);
        return returnDate;
    }

    function setLoadingMessage() {
        let onCallTableDiv = document.getElementById("onCallTable");
        onCallTableDiv.innerText = "Loading schedule..."
    }


    function initializeDateRange() {
        if (new Date() < getDateForDayOfWeek(5)) {
            startDateOfSchedule = getDateForDayOfWeek(-2);
            endDateOfSchedule = getDateForDayOfWeek(4);
        }
        else {
            startDateOfSchedule = getDateForDayOfWeek(5);
            endDateOfSchedule = getDateForDayOfWeek(11);
        }
        <%
            if (startDate != null && endDate != null) {
        %>
        startDateOfSchedule = new Date("<%= startDate %>");
        endDateOfSchedule = new Date("<%= endDate %>");
        <%
            }
        %>
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
        startDateOfSchedule = placeholderTextToDate(document.getElementById("startDate").placeholder);
        endDateOfSchedule = placeholderTextToDate(document.getElementById("endDate").placeholder);
        setLoadingMessage();
        loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule);
    }

    function getPlaceholderText(element) {
        let dateString = "";
        if (element) {
            let phText = element.placeholder;
            dateString = phText.substring(6, 10) + "-" + phText.substring(0, 2) + "-" + phText.substring(3, 5) + "T12:00:00Z";
        }
        return dateString;
    }

    function placeholderTextToDate(phText) {
        return new Date(phText.substring(6, 10) + "-" + phText.substring(0, 2) + "-" + phText.substring(3, 5) + "T12:00:00Z");
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

        if (startDateEl) {
            startDateEl.value = "";
            startDateEl.placeholder = String(startMonth).padStart(2, "0") + "/" + String(startDay).padStart(2, "0") + "/" + startYear;
            startDateEl.type = "text";
        }
        if (endDateEl) {
            endDateEl.value = "";
            endDateEl.placeholder = String(endMonth).padStart(2, "0") + "/" + String(endDay).padStart(2, "0") + "/" + endYear;
            endDateEl.type = "text";
        }
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
        setPrintableScheduleLink();
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
        initializeDateRange();
        setReportHeaderText(startDateOfSchedule, endDateOfSchedule);
        loadOnCallSchedule(startDateOfSchedule, endDateOfSchedule);
    });
</script>