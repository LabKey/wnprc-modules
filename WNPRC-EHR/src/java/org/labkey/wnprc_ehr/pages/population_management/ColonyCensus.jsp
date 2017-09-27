<%@ page import="org.labkey.wnprc_ehr.data.ColonyCensus.ColonyCensus" %>
<%@ page import="org.labkey.wnprc_ehr.data.ColonyCensus.PopulationInstant" %>
<%@ page import="org.joda.time.LocalDate" %>
<%@ page import="java.util.Map" %>
<%@ page import="org.json.JSONObject" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    ColonyCensus colonyCensus = new ColonyCensus(getContainer(), getUser());
    Map<String, Map<LocalDate, PopulationInstant>> populations = colonyCensus.getPopulationsPerMonthForAllSpecies();
%>

<style>
    /* c3-dashed is used by the c3 graphs on the page to create dashed lines. */
    .c3-dashed {
        stroke-dasharray: 5, 5;
    }
</style>

<div class="panel panel-primary">
    <div class="panel-heading">
        <span>Current Population Counts: </span>
        <span style="float: right">
            <span>Rhesus <span class="badge">{{population.rhesus}}</span></span>
            <strong> | </strong>
            <span>Marmosets <span class="badge">{{population.marm}}</span></span>
            <strong> | </strong>
            <span>Cynos <span class="badge">{{population.cynos}}</span></span>
        </span>
    </div>
</div>

<div class="panel panel-primary">
    <div class="panel-heading"><span>Populations Over All Time</span></div>

    <div class="panel-body">
        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active">
                <a href="#rhesus-tab" role="tab" data-toggle="tab">Rhesus</a>
            </li>
            <li role="presentation">
                <a href="#marm-tab"   role="tab" data-toggle="tab">Marmoset</a>
            </li>
            <li role="presentation">
                <a href="#cynos-tab"  role="tab" data-toggle="tab">Cynos</a>
            </li>
        </ul>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane active" id="rhesus-tab">
                <species-tab params="species: 'Rhesus'"></species-tab>
            </div>
            <div role="tabpanel" class="tab-pane" id="marm-tab">
                <species-tab params="species: 'Marmoset'"></species-tab>
            </div>
            <div role="tabpanel" class="tab-pane" id="cynos-tab">
                <species-tab params="species: 'Cynomolgus'"></species-tab>
            </div>
        </div>
    </div>
</div>

<div class="panel panel-primary">
    <div class="panel-heading"><span>Details for Specific Time Range</span></div>

    <div class="panel-body">
        <div style="text-align: center; margin-bottom: 20px">
            <form class="form-inline">
                <div class="form-group">
                    <label style="font-weight: bold">Selection Start:</label>
                    <input class="dateselection form-control" max="{{dateSelectionEnd}}" type="date" data-bind="value: dateSelectionStart, disable: outstandingRequests() > 0">
                </div>

                <div class="form-group">
                    <label style="font-weight: bold; margin-left: 20px">Selection End:</label>
                    <input class="dateselection form-control" min="{{dateSelectionStart}}" max="{{today}}" type="date" data-bind="value: dateSelectionEnd, disable: outstandingRequests() > 0">
                </div>

                <button class="btn btn-primary" data-bind="click: loadData, disable: outstandingRequests() > 0">Load Data</button>
            </form>
        </div>

        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active">
                <a href="#rhesus-details-tab" role="tab" data-toggle="tab">Rhesus</a>
            </li>
            <li role="presentation">
                <a href="#marm-details-tab"   role="tab" data-toggle="tab">Marmoset</a>
            </li>
            <li role="presentation">
                <a href="#cynos-details-tab"  role="tab" data-toggle="tab">Cynos</a>
            </li>
        </ul>

        <div class="col-xs-12" style="height: 20px"></div>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane active" id="rhesus-details-tab">
                <species-details-tab params="species: 'Rhesus'"></species-details-tab>
            </div>
            <div role="tabpanel" class="tab-pane" id="marm-details-tab">
                <species-details-tab params="species: 'Marmoset'"></species-details-tab>
            </div>
            <div role="tabpanel" class="tab-pane" id="cynos-details-tab">
                <species-details-tab params="species: 'Cynomolgus'"></species-details-tab>
            </div>
        </div>
    </div>
</div>

<template id="species-tab">
    <p style="text-align: right;">** Note that population totals specify the amount of animals at the END of the month.</p>


    <div class="container">
        <div class="chart"></div>
    </div>
</template>

<template id="species-details-tab">
    {{#if: loading}}
    <p style="text-align: center;"><span class="glyphicon glyphicon-refresh spinning"></span><strong> Loading...</strong></p>
    {{/if}}

    <div data-bind="visible: !loading()">
        {{#ifnot: eventsInSelectedDateRange().length > 0 }}
        <p style="text-align: center; color: red"><strong>There are no population changes events in the time range you selected.</strong></p>
        {{/ifnot}}
    </div>


    <%-- Use data-bind with "visible", rather than "if", so that the panels still exist when c3 tries to draw graphs in them --%>
    <div class="container-fluid" data-bind="visible: !loading() && (eventsInSelectedDateRange().length > 0)">
        <div class="row">
            <!-- Left Column -->
            <div class="col-sm-4">
                <div class="panel panel-primary">
                    <div class="panel-heading"><span>Stats</span></div>

                    <div class="panel-body">
                        <p><strong>Average Population:</strong> {{average}}</p>
                        <p><strong>Standard Deviation of Population:</strong> {{standardDeviation}}</p>

                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Category</th>
                                <th>Number</th>
                            </tr>
                            </thead>
                            <tbody>
                            <!-- ko foreach: eventCountsInSelectedDateRange -->
                            <tr>
                                <td>{{type}}s</td>
                                <td>{{count}}</td>
                            </tr>
                            <!-- /ko -->
                            <tr>
                                <td>Sum</td>
                                <td>{{sum}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-sm-8">
                <div class="panel panel-primary">
                    <div class="panel-heading"><span>Graph</span></div>

                    <div class="panel-body">
                        <div class="detail-chart"></div>
                    </div>
                </div>
            </div>

            <!--<br style="clear: both;"/>-->
        </div>


        <div class="row">
            <div class="col-xs-12">
                <div class="panel panel-primary">
                    <div class="panel-heading"><span>Individual Population Change Events</span></div>

                    <div class="panel-body">
                        <lk-table params="table: individualPopulationChangeEvents"></lk-table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{/ifnot}} <!-- loading -->
</template>

<script>
    (function(){
        var populations = <%= (new JSONObject(populations)).toString() %>;

        var getPopulationObject = function(species) {
            var data = populations[species];
            var dates = _.sortBy(_.keys(data), function(d) {
                return new Date(d);
            });
            var pops  = dates.map(function(key) {
                return data[key];
            });

            return {
                dates: dates,
                pops:  pops
            };
        };

        var isValidDate = function(dateString) {
            return !_.isNaN((new Date(dateString)).getTime());
        };

        ko.components.register('species-tab', {
            viewModel: {
                createViewModel: function(params, componentInfo) {
                    var $element = $(componentInfo.element);
                    var species = params.species;

                    // Initialize the datepickers
                    //$('.jquery-ui-datepicker').datepicker();

                    // Get our graph data
                    var populationObject = getPopulationObject(species);
                    var $chartDiv = $element.find('.chart');

                    // Generate the graph.
                    var chart = c3.generate({
                        bindto: $chartDiv.get(0),
                        data: {
                            x: 'date',
                            xFormat: '%Y-%m-%d',
                            columns: [
                                ['date'].concat(populationObject.dates),
                                ['Population'].concat(populationObject.pops)
                            ]
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                tick: {
                                    count: 8,
                                    format: '%b %Y'
                                }
                            }
                        },
                        zoom: {
                            enabled: true
                        }
                    });

                    return {};
                }
            },
            template: {
                element: 'species-tab'
            }
        });

        ko.components.register('species-details-tab', {
            viewModel: {
                createViewModel: function(params, componentInfo) {
                    var $element = $(componentInfo.element);
                    var species = params.species;

                    // Define the ViewModel
                    var VM = {
                        eventsInSelectedDateRange:      ko.observableArray(),
                        average:                        ko.observable(),
                        standardDeviation:              ko.observable(),
                        eventCountsInSelectedDateRange: ko.observableArray(),
                        loading:                        ko.observable(false)
                    };

                    VM.eventsInSelectedDateRange.subscribe(function(value) {
                        var groups = _.groupBy(value, function(eventObj) {
                            return eventObj.type;
                        });

                        var counts = [];
                        $.each(groups, function(key, value) {
                            counts.push({
                                type: _.titleize(key),
                                count: value.length
                            });
                        });

                        VM.eventCountsInSelectedDateRange(counts);
                    });

                    // Finally, determine a sum (net loss/gain)
                    VM.sum = ko.computed(function() {
                        var sum = 0;
                        $.each(VM.eventCountsInSelectedDateRange(), function(index, eventCountObj) {
                            var type  = eventCountObj.type;
                            var count = eventCountObj.count;
                            if (type.match(/Birth|Arrival/i)) {
                                sum += count;
                            }
                            else {
                                sum -= count;
                            }
                        });
                        return sum;
                    });

                    VM.individualPopulationChangeEvents = new WebUtils.Models.Table({
                        rowHeaders: ['Date', 'Animal ID', 'Event Type', 'Description']
                    });


                    $element.on('updatedata', function() {
                        VM.loading(true);

                        var value = WebUtils.VM.dateSelectionRange();
                        var dateRange = value;
                        if ( dateRange == null ) {
                            return null;
                        }

                        var url = WebUtils.API.makeURL('getPopulationChangeEventsOverPeriod', {
                            controller: 'wnprc_ehr'
                        });

                        WebUtils.VM.outstandingRequests(WebUtils.VM.outstandingRequests() + 1);

                        WebUtils.API.postJSON(url, {
                            startdate: dateRange[0],
                            enddate:   dateRange[1],
                            species:   species
                        }).then(function(data) {
                            var populationData = data.pops;

                            var events = populationData["events"].map(function(event) {
                                event.idLink = LABKEY.ActionURL.buildURL('ehr', 'participantView', LABKEY.ActionURL.getContainer(), { participantId: event.id });
                                event.date = (new Date(event.date)).format('Y-m-d');

                                return event;
                            });

                            VM.individualPopulationChangeEvents.rows(populationData["events"].map(function(row) {
                                return new WebUtils.Models.TableRow({
                                    data: [row.date, row.id, row.type, row.description]
                                })
                            }));

                            VM.average(parseFloat(populationData["average"]).toFixed(2));
                            VM.standardDeviation(parseFloat(populationData["stddev"]).toFixed(2));
                            VM.eventsInSelectedDateRange(populationData["events"]);

                            var populations = {};
                            $.each(populationData["populations"], function(i, populationObj) {
                                populations[populationObj.date] = populationObj['population'];
                            });
                            var populationDates = _.sortBy(_.keys(populations), function(obj) {
                                return (new Date(obj)).getTime();
                            });

                            var populationValues = populationDates.map(function(date) {
                                return populations[date];
                            });

                            var average = parseFloat(VM.average());
                            var stdDev  = parseFloat(VM.standardDeviation());
                            var avPlusStdDev  = average + 2*stdDev;
                            var avMinusStdDev = average - 2*stdDev;

                            WebUtils.VM.outstandingRequests(WebUtils.VM.outstandingRequests() - 1);

                            // Generate the graph.
                            var chart = c3.generate({
                                bindto: $element.find('.detail-chart').get(0),
                                data: {
                                    x: 'date',
                                    xFormat: '%Y-%m-%d',
                                    columns: [
                                        ['date'].concat(populationDates),
                                        ['Population'].concat(populationValues)
                                    ]
                                },
                                axis: {
                                    x: {
                                        type: 'timeseries',
                                        tick: {
                                            count: 8,
                                            format: '%b %d, %Y'
                                        }
                                    }
                                },
                                grid: {
                                    y: {
                                        lines: [
                                            {value: avMinusStdDev, text: "\u03BC - 2\u03C3", class: "c3-dashed"},
                                            {value: average,       text: "\u03BC"},
                                            {value: avPlusStdDev,  text: "\u03BC + 2\u03C3", class: "c3-dashed"}
                                        ]
                                    }
                                },
                                type: 'spline'
                            });
                        }).finally(function() {
                            VM.loading(false);
                        });
                    });

                    return VM;
                }
            },
            template: {
                element: 'species-details-tab'
            }
        });

        _.extend(WebUtils.VM, {
            today:               ko.observable(moment().format('YYYY-MM-DD')),
            dateSelectionStart:  ko.observable(moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')),
            dateSelectionEnd:    ko.observable(moment().subtract(1, 'month').endOf(  'month').format('YYYY-MM-DD')),
            outstandingRequests: ko.observable(0),
            loadData: function() {
                $('species-details-tab').trigger('updatedata');
            }
        });

        _.extend(WebUtils.VM, {
            dateSelectionRange: ko.computed(function() {
                var dateStart = WebUtils.VM.dateSelectionStart();
                var dateEnd   = WebUtils.VM.dateSelectionEnd();

                if (isValidDate(dateStart) && isValidDate(dateEnd)) {
                    return [dateStart, dateEnd];
                }
                else {
                    return null;
                }
            })
        });

        // Trigger a resize when revealing tabs to resize any d3 graphs, since they couldn't be sized correctly when
        // hidden.
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var activeTab = e.target; // newly activated tab
            var prevActiveTab = e.relatedTarget; // previous active tab

            $(window).trigger('resize');

            // For some reason (I'm guessing transitions), when you trigger the event right away, it only scales the
            // graph within about 10% of where it needs to be, so we wait and do it again to fully fix the size of
            // d3 graphs.
            setTimeout(function() {
                $(window).trigger('resize');
            }, 500);
        });

        WebUtils.VM.population = {
            rhesus: getPopulationObject('Rhesus').pops.pop(),
            marm:   getPopulationObject('Marmoset').pops.pop(),
            cynos:  getPopulationObject('Cynomolgus').pops.pop()
        }
    })();
</script>

