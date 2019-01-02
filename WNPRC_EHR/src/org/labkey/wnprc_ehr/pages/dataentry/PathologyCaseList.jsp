<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="org.labkey.api.data.SimpleFilter" %>
<%@ page import="org.labkey.api.query.FieldKey" %>
<%@ page import="java.util.Date" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="java.util.Calendar" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_ehr.WNPRC_EHRController" %>
<%@ page import="org.labkey.api.action.Action" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    Integer year = Calendar.getInstance().get(Calendar.YEAR);

    Calendar cal = Calendar.getInstance();
    cal.set(Calendar.YEAR, year);
    cal.set(Calendar.DAY_OF_YEAR, 1);
    Date startOfYear = cal.getTime();

    cal.set(Calendar.YEAR, year + 1);
    Date startOfNextYear = cal.getTime();

    SimpleFilter dateFilter = new SimpleFilter();
    dateFilter.addCondition(FieldKey.fromString("date"), startOfYear,    CompareType.DATE_GTE);
    dateFilter.addCondition(FieldKey.fromString("date"), startOfNextYear, CompareType.DATE_LT);

    SimpleQuery biopsyQuery = new SimpleQuery("study", "biopsy", getUser(), getContainer());
    List<JSONObject> biopsies = JsonUtils.getListFromJSONArray(biopsyQuery.getResults(dateFilter).getJSONArray("rows"));

    SimpleQuery necropsyQuery = new SimpleQuery("study", "necropsy", getUser(), getContainer());
    List<JSONObject> necropsies = JsonUtils.getListFromJSONArray(necropsyQuery.getResults(dateFilter).getJSONArray("rows"));
%>

<div class="panel panel-primary">
    <div class="panel-heading"><span>List of Biopsies and Necropsy Cases</span></div>

    <div class="panel-body">
        <form class="form-horizontal">
            <div class="form-group">
                <label class="col-xs-3 control-label">Year: </label>
                <div class="col-xs-9">
                    <div class='input-group date'>
                        <input type='text' class="form-control" data-bind="dateTimePicker: choosenYear, dateTimePickerOptions: yearPickerOptions, css: dateTimeClass"/>
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-calendar"></span>
                        </span>
                    </div>
                </div>
            </div>
        </form>

        <!-- ko if: errors().length > 0 -->
        <div style="color: red">
            <p>The following errors were detected with the case number sequence:</p>
            <ul>
                <!-- ko foreach: errors -->
                <li>{{{$data}}}</li>
                <!-- /ko -->
            </ul>
        </div>
        <!-- /ko -->
        <!-- ko ifnot: errors().length > 0 -->
        <div style="color: green">
            <p>No errors were detected with the case number sequence. That means:</p>
            <ul>
                <li>Each case number is used only once (although case prior to 2016 may have both and necropsy and biopsy).</li>
                <li>No numbers are skipped.</li>
            </ul>
        </div>
        <!-- /ko -->
    </div>

    <lk-table params="table: pathologyTable"></lk-table>
</div>


<script type="application/javascript">
    (function() {
        var biopsies = <%= biopsies.toString() %>;
        var necropsies = <%= necropsies.toString() %>;

        var makeRowMapFn = function(type) {

            return function(biopsyRow) {
                var order = '';
                if (_.isString(biopsyRow.caseno)) {
                    var matches = biopsyRow.caseno.match(/\d+[a-zA-Z](\d+)/);

                    if (_.isArray(matches)) {
                        order = matches[1];
                    }
                }

                var biopsy = {
                    status:   biopsyRow['QCState/label'] || biopsyRow['QCState/label'.toLowerCase().replace(/\//, "_fs_")],
                    date:     biopsyRow.date,
                    type:     type,
                    caseno:   biopsyRow.caseno,
                    order:    order,
                    taskid:   _.isString(biopsyRow.taskid) ? biopsyRow.taskid : '',
                    animalid: biopsyRow.Id || biopsyRow.id
                };

                var url = LABKEY.ActionURL.buildURL('ehr', 'taskDetails', null, {
                    formtype: biopsy.type,
                    taskid:   biopsy.taskid
                });
                var errorMessage = '';

                if (biopsy.taskid === '') {
                    url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
                        schemaName: 'study',
                        'query.queryName': (biopsy.type == "Necropsy") ? 'Necropsies' : "Biopsies",
                        'query.caseno~in': biopsy.caseno
                    });
                    
                    errorMessage = "<p style='color: red;'> ! No Task Assigned to Record<p>"
                }

                <% ActionURL necropsyReportURL = new ActionURL(WNPRC_EHRController.NecropsyReportAction.class, getContainer()); %>
                var reportURL = (biopsy.type != "Necropsy") ? "" : LABKEY.ActionURL.buildURL('<%= necropsyReportURL.getController() %>', '<%= necropsyReportURL.getAction()%>', null, {
                    taskid: biopsyRow['taskid'],
                    reportMode: true
                });

                <% ActionURL collectionListURL = new ActionURL(WNPRC_EHRController.NecropsyCollectionListAction.class, getContainer()); %>
                var collectionListURL = (biopsy.type != "Necropsy") ? "" : LABKEY.ActionURL.buildURL('<%= collectionListURL.getController() %>', '<%= collectionListURL.getAction() %>', null, {
                    taskid: biopsyRow['taskid'],
                    reportMode: true
                });

                return new WebUtils.Models.TableRow({
                    otherData: biopsy,
                    data: [
                        biopsy.order,
                        biopsy.date,
                        '<a href="' + url + '">' + biopsy.type + '</a>' + errorMessage,
                        biopsy.caseno,
                        '<a href="' + biopsyRow['_labkeyurl_Id'] + '">' + biopsy.animalid + '</a>',
                        biopsy.status,
                        ((reportURL == "") ? "" : '<a href="' + reportURL + '">View Report</a>')
                            + ((collectionListURL == "") ? "" : '<br/><a href="' + collectionListURL + '">Collection List</a>')
                    ]
                });
            }
        };

        _.extend(WebUtils.VM, {
            pathologyTable: new WebUtils.Models.Table({
                rowHeaders: ['Order', 'Date', "Type", "Case Number", "Animal Id", "Status", "View Report"],
                rows: _.sortBy(biopsies.map(makeRowMapFn("Biopsy")).concat(necropsies.map(makeRowMapFn("Necropsy"))), function(val) {
                    var order = val.otherData.order;
                    return (_.isString(order) && order.match(/\d\d\d/)) ? -parseInt(order) : -1000;
                })
            }),
            choosenYear: ko.observable(moment().startOf('year')), //today
            yearPickerOptions: {
                format: " YYYY", // Notice the Extra space at the beginning
                viewMode: "years"
            },
            dateTimeClass: ko.observable(''),
            errors: ko.observableArray()
        });

        WebUtils.VM.choosenYear.subscribe(function(value) {
            value = moment(value);

            if (moment.isMoment(value)) {
                var startOfYear = value;
                var endOfYear = moment(value).endOf('year');

                WebUtils.VM.dateTimeClass('disabled');

                var config = {
                    'date~gte': startOfYear.format("YYYY-MM-DD"),
                    'date~lte': endOfYear.format("YYYY-MM-DD HH:mm:ss"),
                    columns: ['Id', 'date', 'taskid', 'caseno', 'QCState/label']
                };

                return Promise.all([
                    WebUtils.API.selectRows('study', 'biopsy',   config),
                    WebUtils.API.selectRows('study', 'necropsy', config)
                ]).then(function(resultsArray) {
                    var biopsies = resultsArray[0].rows;
                    var necropsies = resultsArray[1].rows;

                    var pathologyCases = biopsies.map(makeRowMapFn("Biopsy")).concat(necropsies.map(makeRowMapFn("Necropsy")));

                    pathologyCases = _.sortBy(pathologyCases, function(val) {
                        var order = val.otherData.order;
                        return (_.isString(order) && order.match(/\d\d\d/)) ? -parseInt(order) : -1000;
                    });

                    var maxIndex = 1;
                    var caseIndex = {};
                    _.each(pathologyCases, function(pathologyCase) {
                        var order = parseInt(pathologyCase.otherData.order);

                        if (order in caseIndex) {
                            caseIndex[order].push(pathologyCase.otherData);
                        }
                        else {
                            caseIndex[order] = [pathologyCase.otherData];
                        }

                        if (order > maxIndex) {
                            maxIndex = order;
                        }
                    });

                    var errors = [];
                    for(var i = 1; i <= maxIndex; i++) {
                        if (i in caseIndex) {
                            var entries = caseIndex[i];
                            var entryTypes = entries.map(function(entry) {
                                return entry.type;
                            });

                            // Get a moment for 2016
                            var y2016 = moment().year('2016').startOf('year');


                            if (entries.length > 1) {
                                if (entries.length == 2
                                        && (moment(entries[0].date).isBefore(y2016))
                                        && (moment(entries[1].date).isBefore(y2016))
                                        && (_.isEqual(entryTypes, ['Necropsy', 'Biopsy']) || _.isEqual(entryTypes, ['Biopsy', 'Necropsy']))
                                   )
                                {
                                    // There's a special exception before 2016, since we numbered Necropsies and Biopsies separately.
                                }
                                else {
                                    errors.push('There are ' + caseIndex[i].length + ' cases with the case number of ' + i);
                                }
                            }
                        }
                        else {
                            errors.push(i + ' is missing from the list.');
                        }
                    }
                    WebUtils.VM.errors(errors);

                    WebUtils.VM.pathologyTable.rows(pathologyCases);
                });
            }
        })


    })();
</script>