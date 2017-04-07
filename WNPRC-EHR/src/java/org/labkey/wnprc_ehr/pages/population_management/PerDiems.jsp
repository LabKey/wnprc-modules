<%@ page import="org.joda.time.LocalDate" %>
<%@ page import="org.labkey.wnprc_ehr.data.ColonyCensus.AssignmentPerDiems" %>
<%@ page import="org.json.JSONObject" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    LocalDate today = (new LocalDate());
    LocalDate startDate = today.minusMonths(1).withDayOfMonth(1);
    LocalDate endDate = today.minusMonths(1).dayOfMonth().withMaximumValue();

    AssignmentPerDiems assignmentPerDiems = new AssignmentPerDiems(getContainer(), getUser(), startDate, endDate);

    JSONObject billableInfo = assignmentPerDiems.getBillableDaysJSON();
%>

<style type="text/css">
    #summary-tab, #details-tab {
        float: left;
        border: 2px solid lightsteelblue;
        border-radius: 5px;
        padding: 10px;
        margin: 10px;
        /*background: rgba(176, 196, 222, 0.3);*/
    }
</style>

<div class="panel panel-primary">
    <div class="panel-heading"><span>Per Diems Report</span></div>

    <div class="panel-body">
        <div class="container">
            <div class="row" style="text-align: center">
                <form class="form-inline" style="margin-bottom: 10px">
                    <div class="form-group">
                        <a style="margin-left: 20px" id="csvDownloadLink" target="_blank" href="{{csvDownloadLink}}">
                            <span class="glyphicon glyphicon-download-alt"></span><span> Download All Data for Date Range</span>
                        </a>
                    </div>
                </form>
                <form class="form-inline">
                    <div class="form-group">
                        <label>Selection Start:</label>
                        <input class="form-control" type="date" data-bind="value: startDate, disable: loading">
                    </div>

                    <div class="form-group">
                        <label>Selection End:</label>
                        <input class="form-control" type="date" data-bind="value: endDate, disable: loading">
                    </div>

                    <button class="btn btn-primary" data-bind="click: loadData">Load Data From Selected Range</button>
                </form>
            </div>
            <br/>
        </div>

        <div class="col-sm-3">
            <div class="panel panel-primary">
                <div class="panel-heading"><span>Summary</span></div>

                <div class="panel-body">
                    <p>Click on a row below to display the individual billable days for that project in the table at the right.</p>
                </div>

                <!-- ko if: loading -->
                <div style="text-align: center">
                    <img src="<%= getContextPath().toString() %>/webutils/icons/loading.svg">
                    <p style="font-size: medium; color: #46A9DC;">Loading...</p>
                </div>
                <!-- /ko -->

                <!-- ko ifnot: loading -->
                <lk-table params="table: summaryTable, rowClickCallback: showDetailsForProject"></lk-table>
                <!-- /ko -->
            </div>
        </div>

        <div class="col-sm-9">
            <div class="panel panel-primary">
                <div class="panel-heading"><span>Details</span></div>

                <div class="panel-body">
                    <div style="text-align: center;">
                        <form class="form-inline">
                            <div class="form-group">
                                <label>Show Details for Project:</label>
                                <input class="form-control" type="text" data-bind="textInput: selectedProject">
                            </div>
                        </form>
                    </div>
                </div>

                <!-- ko if: loading -->
                <div style="text-align: center">
                    <img src="<%= getContextPath().toString() %>/webutils/icons/loading.svg">
                    <p style="font-size: medium; color: #46A9DC;">Loading...</p>
                </div>
                <!-- /ko -->

                <!-- ko ifnot: loading -->
                <lk-table params="table: detailsTable"></lk-table>
                <!-- /ko -->
            </div>
        </div>
    </div>
</div>

<script type="application/javascript">
    (function(){
        $('.csvDownloadLink').button();

        var formatDate = function(date) {
            if (!date) { return ""; }

            date = new moment(date);

            if (date.isValid()) {
                return date.format('YYYY-MM-DD');
            }
            else {
                return "";
            }
        };

        var billableData = <%= billableInfo.toString() %>;


        _.extend(WebUtils.VM, {
            summaryTable:     new WebUtils.Models.Table({}),
            startDate:        ko.observable(formatDate(<%= q(startDate.toString()) %>)),
            endDate:          ko.observable(formatDate(<%= q(endDate.toString())   %>)),
            detailsTable:     new WebUtils.Models.Table({}),
            selectedProject:  ko.observable(),
            loading:          ko.observable(false)
        });

        WebUtils.VM.showDetailsForProject = function(rowData) {
            WebUtils.VM.selectedProject(rowData.rowData[0]);
        };

        var handleBillableData = function(billableData) {
            var billableDaysByProject = _.groupBy(billableData.billableDays, 'project');

            var sumByProject = {};
            $.each(billableDaysByProject, function(project, list) {
                sumByProject[project] = _.reduce(list, function(memo, item) {
                    return memo + parseFloat(item.perDiems);
                }, 0);
            });

            var sumArray = [];
            $.each(sumByProject, function(project, sum) {
                sumArray.push([project, sum]);
            });

            WebUtils.VM.summaryTable.rowHeaders(['Project', 'Billable Days']);
            WebUtils.VM.summaryTable.rows(sumArray.map(function(row) {
                return new WebUtils.Models.TableRow({
                    data: row
                });
            }));
        };

        var handleDataDetails = function(data) {
            var billableDaysByProject = _.groupBy(data.billableDays, 'project');

            var sumByProject = {};
            $.each(billableDaysByProject, function(project, list) {
                sumByProject[project] = _.reduce(list, function(memo, item) {
                    return memo + parseFloat(item.billablePerDiems);
                }, 0);
            });

            var sumArray = [];
            $.each(sumByProject, function(project, sum) {
                sumArray.push([project, sum]);
            });

            var fields = ['animalId', 'perDiems', 'startDate', 'endDate', 'sharedProject'];


            WebUtils.VM.detailsTable.rowHeaders(["Animal ID", "Billable Days", "Start Date", "End Date", "All Projects in Duration", "Number Of Shared Projects"]);
            WebUtils.VM.selectedProject.subscribe(function(value) {
                if (value in billableDaysByProject) {
                    WebUtils.VM.detailsTable.rows(billableDaysByProject[value].map(function(row) {
                        var rowData = fields.map(function(colName) {
                            if (colName == 'sharedProject') {
                                return row[colName].join(", ");
                            }

                            return row[colName];
                        });

                        rowData.push(row['sharedProject'].length);

                        return new WebUtils.Models.TableRow({
                            data: rowData
                        });
                    }));
                }
                else {
                    WebUtils.VM.detailsTable.rows([]);
                }
            });

            WebUtils.VM.selectedProject.valueHasMutated();
        };

        handleBillableData(billableData);
        handleDataDetails(billableData);

        var dateRange = ko.computed(function() {
            var start = WebUtils.VM.startDate();
            var end   = WebUtils.VM.endDate();

            return [start, end];
        });

        WebUtils.VM.csvDownloadLink = ko.computed(function() {
            if (dateRange() !== null) {
                return LABKEY.ActionURL.buildURL('wnprc_ehr', 'billablePerDiemsAsCSV', null, {
                    startDate: formatDate(dateRange()[0]),
                    endDate:   formatDate(dateRange()[1])
                });
            }
            else {
                return "#";
            }
        });

        WebUtils.VM.loadData = function() {
            if (dateRange() !== null) {
                var url = LABKEY.ActionURL.buildURL('wnprc_ehr', 'billablePerDiems', null, {
                    startDate: formatDate(dateRange()[0]),
                    endDate:   formatDate(dateRange()[1])
                });

                WebUtils.VM.loading(true);
                WebUtils.API.getJSON(url).then(function(data) {
                    WebUtils.VM.loading(false);
                    handleBillableData(data);
                    handleDataDetails(data);
                }).catch(function() {
                    WebUtils.VM.loading(false);
                    WebUtils.VM.summaryTable.rows.removeAll();
                    alert("There was an error loading the requested data.");
                });
            }
        };


        /*
        QUnit.test("URL For Download Link Has Correct Day", function(assert) {
            var downloadURL = URI($('#csvDownloadLink').attr('href'));
            var downloadQueryObj = downloadURL.query(true);
            var m$csvStartDate = moment(downloadQueryObj.startDate);
            var m$csvEndDate = moment(downloadQueryObj.endDate);

            assert.ok(m$csvStartDate.isValid(), "CSV Start Date (" + downloadQueryObj.startDate + ") is Valid");
            assert.ok(m$csvEndDate.isValid(),   "CSV End Date ("   + downloadQueryObj.endDate   + ") is Valid");

            assert.ok(m$csvStartDate.isSame( WebUtils.VM.startDate() ), "CSV Start Date Matches Form");
            assert.ok(m$csvEndDate.isSame(   WebUtils.VM.endDate()   ), "CSV End Date Matches Form"  );
        });
        */
    })();
</script>