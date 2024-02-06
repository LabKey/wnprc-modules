<%@ page import="org.json.JSONArray" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    String animalId = getViewContext().getRequest().getParameter("id");

    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    JSONArray diarrheaCounts = queryFactory.selectRows("study", "DiarrheaCountByMonth", new SimplerFilter("id", CompareType.EQUAL, animalId));
    JSONArray diarrheaDetails = queryFactory.selectRows("study", "DiarrheaDetailsByMonth", new SimplerFilter("id", CompareType.EQUAL, animalId));
    JSONArray diarrheaCodes = queryFactory.selectRows("ehr_lookups", "obs_feces");
%>

<div class="text-center">
    <h3>Diarrhea Analysis for <%=h(animalId)%></h3>
</div>


<div class="panel panel-primary">
    <div class="panel-heading">Number of Occurrences of Diarrhea Per Month</div>

    <div class="panel-body container-fluid" >
        <div id="diarrhea-histogram"></div>
    </div>
</div>

<div class="panel panel-primary">
    <div class="panel-heading">Occurrences of Specific Types of Diarrhea Per Month</div>

    <div class="panel-body container-fluid" >
        <div id="diarrhea-details-graph"></div>
    </div>
</div>

<script type="application/javascript">
    (function() {
        var diarrheaCounts = <%=diarrheaCounts%>;

        var index = {};
        _.each(diarrheaCounts, function(obj) {
            index[obj.year + '-' + s.lpad(obj.month, 2, '0')] = obj.numtimes;
        });

        var dates = _.keys(index).sort();
        var values = dates.map(function(date) {
            return index[date];
        });

        var chart = c3.generate({
            bindto: '#diarrhea-histogram',
            data: {
                x: 'date',
                xFormat: '%Y-%m',
                columns: [
                        ['date'].concat(dates),
                        ['Occurrences'].concat(values)
                ],
                type: 'bar'
            },
            bar: {
                width: 5
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m'
                    }
                },
                y: {
                    label: {
                        text: 'Number of Occurrences',
                        position: 'outer-middle'
                    }
                }
            }
        });
    })();
</script>


<script type="application/javascript">
    (function() {
        var diarrheaDetails = <%=diarrheaDetails%>;

        var codeLookup = {};
        var codes = <%=diarrheaCodes%>;
        _.each(codes, function(codeObj) {
            codeLookup[codeObj.value] = codeObj.title;
        });

        var values = {};
        var index = {};
        _.each(diarrheaDetails, function(obj) {
            var date = obj.year + '-' + s.lpad(obj.month, 2, '0');

            if (!(date in index)) {
                index[date] = {};
            }

            values[obj.value] = true;

            index[date][obj.value] = obj.numtimes;
        });

        var dates = _.keys(index).sort();
        var valueSets = _.keys(values).map(function(code) {
            return [codeLookup[code]].concat(dates.map(function(date) {
                return index[date][code] || 0;
            }));
        });

        var chart = c3.generate({
            bindto: '#diarrhea-details-graph',
            data: {
                x: 'date',
                xFormat: '%Y-%m',
                columns: [
                    ['date'].concat(dates)
                ].concat(valueSets),
                type: 'bar'
            },
            bar: {
                width: 5
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m'
                    }
                },
                y: {
                    label: {
                        text: 'Number of Occurrences',
                        position: 'outer-middle'
                    }
                }
            }
        });
    })();
</script>