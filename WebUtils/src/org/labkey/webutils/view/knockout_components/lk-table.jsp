<%@ page extends="org.labkey.api.jsp.JspBase" %>

<style type="text/css">
    th.header {
        cursor: pointer;
        cursor: hand;
    }
</style>


<template id="lk-table">
    <div class="panel panel-default table-responsive">
        <div class="panel-heading">
            <div class="container-fluid panel-container">
                <div class="col-xs-8 text-left">
                    <!-- ko foreach: actionButtons -->
                    <button style="margin: 8px" data-bind="click: clickAction, disable: disabled" class="btn btn-primary">{{title}}</button>
                    <!-- /ko -->
                </div>

                <div class="col-xs-4 text-right">
                    <p><strong>Displaying {{shownRows}} / {{table.rows().length}} rows.</strong></p>
                </div>
            </div>
        </div>

        <div id="loading-bar" data-bind="visible: table.rows().length==0" ><img src="<%=getContextPath()%>/webutils/icons/loading.svg">Loading...</div>

        <table class="table table-striped table-bordered table-hover" data-bind="with: table, visible: table.rows().length!=0">
            <thead>
            <tr>
                <!-- ko if: $component.rowsAreSelectable -->
                <th class="filter-false" data-sorter="false" style="width: 10px"><!-- Leave this cell blank --></th>
                <!-- /ko -->

                <!-- ko foreach2: {data: $parent.rowHeaders} -->
                <th class="header" data-bind="click: function(){ $component.sortTable($index()) }, css: getCSSClass ">
                    {{data}}
                    <!-- ko if: sort() != 0 -->
                    <span class="glyphicon pull-right" data-bind="css: (sort() > 0) ? 'glyphicon-arrow-up' : 'glyphicon-arrow-down'"></span>
                    <!-- /ko -->
                </th>
                <!-- /ko -->
            </tr>
            </thead>
            <tbody>
            <tr class="noclick">
                <!-- ko if: $component.rowsAreSelectable -->
                <td><!-- No content --></td>
                <!-- /ko -->
                <!-- ko foreach: $parent.filterBoxes -->
                <td>
                    <!-- ko if: $data != null -->
                    <div class="input-group">
                        <input class="form-control input-sm" placeholder="No active filter" type="text" data-bind="textInput: filter">
                    <span class="input-group-addon">
                        <!-- ko if: _.isDefined(filter()) && filter() !== "" -->
                        <span class="glyphicon glyphicon-remove" data-toggle="modal" data-bind="click: function() { filter('') } "></span>
                        <!-- /ko -->
                        <!-- ko ifnot: _.isDefined(filter()) && filter() !== "" -->
                        <span class="glyphicon glyphicon-info-sign" data-toggle="modal" data-target="#tableFilterInfoModal"></span>
                        <!-- /ko -->
                    </span>
                    </div>
                    <!-- /ko -->
                </td>
                <!-- /ko -->
            </tr>

            <!-- ko foreach2: {data: $parent.table.rows } -->
            <tr data-bind="css: { 'clickable': $component.rowsAreClickable, 'warning': warn, 'danger': err}, visible: !isHidden(), style: {background-color: isSelected() ? $component.rowBackgroundColorClicked : '', 'cursor' : $component.cursor} ">
                <!-- ko if: $component.rowsAreSelectable -->
                <td onclick="event.stopPropagation();"> <%-- prevent click from propagating to the row. --%>
                    <input type="checkbox" data-bind="checked: isSelected" >
                </td>
                <!-- /ko -->

                <!-- ko foreach: rowData -->
                <td>
                    <!-- ko if: _.isObject($data) -->
                    {{{$data.display}}}
                    <!-- /ko -->
                    <!-- ko ifnot: _.isObject($data) -->
                    {{{$data}}}
                    <!-- /ko -->

                </td>
                <!-- /ko -->
            </tr>
            <!-- /ko -->
            </tbody>
        </table>

    </div>
</template>

<script type="application/javascript">
    (function() {
        var parseMomentLookups = {
            d: "days",
            t: "days",
            m: "months",
            w: "weeks",
            y: "years"
        };

        var parseMoment = function(text) {
            if (text.match(/^\d\d\d\d$/)) {
                return moment(text, "YYYY");
            }
            else if (text.match(/^[tmwy]([+-]\d+)?$/i)) {
                var key = text.substr(0,1);
                var number = parseInt(text.substr(1));

                var time = moment().startOf('day');

                if (!_.isNaN(number)) {
                    time.add(number, parseMomentLookups[key.toLowerCase()]);
                }

                return time;
            }
            else {
                return moment(text);
            }
        };

        // Set of filters to choose from.  Note that filter and cellValue are assumed to be strings.
        var filters = {
            substring: function(filter, cellValue, caseInsensitive) {
                if (caseInsensitive) {
                    return (cellValue.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
                }
                return (cellValue.indexOf(filter) !== -1);
            },
            regex: function(filter, cellValue) {
                var innerRegex = filter.match(regularExpressionToMatchRegexFilters)[1];

                // Convert to regex object
                var flags = '';
                if (filter.match(/i$/)) {
                    flags = 'i'
                }
                innerRegex = new RegExp(innerRegex, flags);

                return cellValue.match(innerRegex);
            },
            numerical: function(filter, cellValue) {
                var comparator   = filter.substr(0, 1);
                var filterNumber = filter.substr(1);

                cellValue = parseFloat(cellValue);
                filterNumber = parseFloat(filterNumber);
                if (_.isNaN(filterNumber) || _.isNaN(cellValue)) {
                    return false;
                }

                if (comparator === ">") {
                    return cellValue > filterNumber;
                }
                else if (comparator === "<") {
                    return cellValue < filterNumber;
                }
                else {
                    throw new Error("Failed to match...")
                }
            },
            date: function(filter, cellValue) {
                var comparator  = filter.substr(1,1); // <, >, or =
                var date        = parseMoment(filter.substr(2));
                var cellDate    = parseMoment(cellValue);
                var granularity = parseMomentLookups[filter.substr(0,1).toLowerCase()];

                if (comparator === ">") {
                    return cellDate.isAfter(date, granularity);
                }
                else if (comparator === "<") {
                    return cellDate.isBefore(date, granularity);
                }
                else if (comparator === "=") {
                    return cellDate.isSame(date, granularity);
                }
                else {
                    throw new Error("Failed to match...")
                }
            },
            blankCheck: function(filter, cellValue) {
                return _.isBlank(cellValue);
            }
        };
        $.each(filters, function(key, value) {
            value.filterName = key;
        });

        var regularExpressionToMatchRegexFilters = /^\/(.*)\/i?$/;

        var filterIsUnnecessary = function(filter) {
            if (_.isUndefined(filter) || (filter === null)) {
                return true;
            }

            // Look for and remove any leading negation marker
            if (filter.substr(0, 1) == "!") {
                filter = filter.substr(1);
            }

            // Now, look for a date signifier
            if (_.includes("dwmy", filter.substr(0,1))) {
                filter = filter.substr(1);
            }

            // Now, look for comparators
            if ( filter.match(/^[=<>]/) ) {
                filter = filter.substr(1);
            }

            if (filter === "") {
                return true;
            }
            // We may have a regex
            else if (filter.match(/^\//)) {
                // Until the regex is complete, there is no need to apply the filter.
                if (!filter.match(regularExpressionToMatchRegexFilters)) {
                    return true;
                }

                var innerRegex = filter.match(regularExpressionToMatchRegexFilters)[1];
                var returnVal;
                try {
                    innerRegex = new RegExp(innerRegex);
                    returnVal = false;
                }
                catch(e) {
                    returnVal = true;
                }

                return returnVal;
            }
            return false;
        };

        var applyFilter = function(filter, cellValue, caseInsensitive) {
            // TODO: applyFilter gets called for every row, so this split is happening (n-1) times more than it really
            // needs to.  Although this hasn't yet caused a problem, it would be prudent to break out the "instantiation"
            // of the filter, which would also allow us to make other more performant and targeted filters.
            var innerFilters = filter.split(";");
            var valueHasFailedFilterTest = false;

            $.each(innerFilters, function(i, filter) {
                if (!valueMatchesFilterInner(filter, cellValue, caseInsensitive)) {
                    valueHasFailedFilterTest = true;
                    return false;
                }
            });

            return !valueHasFailedFilterTest;
        };

        var determineFilter = function(filter) {
            // Regex
            if (filter == '""') {
                return filters.blankCheck;
            }
            if (filter.match(regularExpressionToMatchRegexFilters)) {
                return filters.regex;
            }
            else if (filter.match(/^[<>]/)) {
                return filters.numerical;
            }
            else if (filter.match(/^[dwmy][=<>]/)) {
                return filters.date;
            }
            // DEFAULT: Substring Match
            else {
                return filters.substring;
            }
        };

        var valueMatchesFilterInner = function(filter, cellValue, caseInsensitive) {
            var negateAnswer  = false;

            // Ensure we have something to filter on, and that it's a string.
            if (filterIsUnnecessary(filter)) {
                return true;
            }
            filter = filter.toString();

            // Ensure that cellValue is a string.
            cellValue = (_.isUndefined(cellValue) || (cellValue === null) ) ? "" : cellValue.toString();

            // Apply negation rule.
            if (filter.match(/^!/)) {
                negateAnswer = true;
                filter = filter.substring(1);
            }

            var filterFunction = determineFilter(filter);
            var matchesFilter = filterFunction.call(undefined, filter, cellValue, caseInsensitive);

            return negateAnswer ? !matchesFilter : matchesFilter;
        };

        QUnit.test("Table Filters Are Correctly Determined", function(assert) {
            var ensureCorrectFilter = function(filter, text) {
                assert.equal(determineFilter(text), filter, "Text '" + text + "' matches type \"" + filter.filterName + "\"");
            };

            // Check some patterns that should be regexes.
            ensureCorrectFilter(filters.regex, "/hello/i");
            ensureCorrectFilter(filters.regex, "/hello/");

            // Check dates
            ensureCorrectFilter(filters.date, "d<2015-05");
            ensureCorrectFilter(filters.date, "m=2015-05");
            ensureCorrectFilter(filters.date, "y=2015-05");
            ensureCorrectFilter(filters.date, "w=w-1");
            ensureCorrectFilter(filters.date, "d<2015/05");
            ensureCorrectFilter(filters.date, "d<2015/05/20");
            ensureCorrectFilter(filters.date, "d<2015/05/20 00:00:00");

            // Check some numbers
            ensureCorrectFilter(filters.numerical, "<13");
            ensureCorrectFilter(filters.numerical, "<013");
            ensureCorrectFilter(filters.numerical, ">2");
        });

        QUnit.test("Table Filters are applied correctly", function(assert) {
            var checkMatch = function(shouldMatch, filterString, cellValue) {
                var matchString = (shouldMatch) ? "matches" : "does not match";
                var message = "Cell Value '" + cellValue + "' " + matchString + " filter '" + filterString + "'";
                var actuallyMatches = applyFilter(filterString, cellValue);

                assert.equal(actuallyMatches, shouldMatch, message);
            };

            var dateFormat = "YYYY/MM/DD HH:mm:ss";
            var now = moment().format(dateFormat);
            var yesterday = moment().subtract(1, "day").format(dateFormat);
            var threeDaysAgo = moment().subtract(3, "day").format(dateFormat);

            checkMatch(true,  "/hello/i",         "Hello, my good friend.");
            checkMatch(false, "/hello/",          "Hello, my good friend.");
            checkMatch(true,  "y=2016",           "2016/05/05 09:30:00");
            checkMatch(false, "y=2016",           "2015/05/05 09:30:00");
            checkMatch(true,  "d>2016-04-01",     "2016/05/05 09:30:00");
            checkMatch(false, "m=2016-04-01",     "2016/05/05 09:30:00");
            checkMatch(true,  "m=2016-05-01",     "2016/05/05 09:30:00");
            checkMatch(true,  "m=2016-05",        "2016/05/05 09:30:00");
            checkMatch(true,  "d<t+1",            now);
            checkMatch(true,  "d<t",              yesterday);
            checkMatch(true,  "d<t-2",            threeDaysAgo);
            checkMatch(true,  "y=2016;m>2016-04", "2016/05/05 09:30:00");
            checkMatch(false, ">2",               "001");
            checkMatch(false, ">2",               "1");
            checkMatch(true,  ">2",               "3");
            checkMatch(true,  ">2",               "003");
            checkMatch(true,  ">2;<04",           "003");
            checkMatch(true,  ">2;<04",           "03.00");
            checkMatch(true,  ">2.9;<3.1",        "03.00");
        });

        ko.components.register('lk-table', {
            viewModel: {
                createViewModel: function(params, componentInfo) {
                    var $element = $(componentInfo.element);

                    var VM = {
                        rowsAreSelectable:     params.rowsAreSelectable,
                        rowsAreClickable:      ko.observable(false),
                        errorMessage:          ko.observable(),
                        table:                 params.table,
                        caseInsensitiveFilter: ko.observable(params.caseInsensitiveFilter || false),
                        shownRows:             ko.observable(0),
                        shownRowsPrev:         ko.observable(0),
                        rowBackgroundColorClicked:   params.rowBackgroundColorClicked,
                        cursor:                params.cursor
                    };

                    if ('rowClickCallback' in params) {
                        VM.rowsAreClickable(true);
                        var $tbody = $element.find('tbody');

                        $tbody.click(function(event) {
                            var $row = $(event.target).closest('tr');
                            if ($row.hasClass('noclick')) {
                                return;
                            }

                            var rowData = ko.dataFor($row.get(0));

                            if (_.isFunction(params.rowClickCallback)) {
                                params.rowClickCallback(rowData);
                            }
                        });
                    }

                    VM.filterBoxes = ko.computed(function() {
                        var columnHeaders = VM.table.rowHeaders();

                        return columnHeaders.map(function(header) {
                            if (_.isObject(header) && header.hideFilter) {
                                return null;
                            }
                            else {
                                return {
                                    filter: ko.observable()
                                };
                            }
                        });
                    });

                    VM.filters = ko.computed(function() {
                        var filterBoxes = VM.filterBoxes();

                        return filterBoxes.map(function(obj) {
                            return (obj == null) ? null : obj.filter();
                        });
                    });

                    VM.sortColumn    = ko.observable();
                    VM.sortDirection = ko.observable(1);

                    var oldFilters;
                    ko.computed(function() {
                        var rows = VM.table.rows();
                        var filters = VM.filters();

                        filters = filters.map(function(filter, index) {
                            return {
                                filter: filter,
                                colIndex: index
                            };
                        });
                        filters = _.filter(filters, function(filterObj) {
                            return (filterObj.filter != null) && !_.isUndefined(filterObj.filter);
                        });

                        // Since changing the sort order will trigger this by changing the Table Rows Observable Array,
                        // we shouldn't run the filter algorithm unless we need to.  However, since this is what
                        // controls the striping of the table, we should still loop through the rows.
                        var filtersHaveChanged = !_.isEqual(filters, oldFilters);
                        oldFilters = filters;

                        var shown = 0;

                        var curIndexOfShow = 0;
                        _.each(rows, function(row) {
                            var showRow;

                            if (filtersHaveChanged) {
                                var indexOfFirstFailure = _.findIndex(filters, function(filter) {
                                    var colValue = row.rowData[filter.colIndex];

                                    if (_.isObject(colValue)) {
                                        colValue = colValue.value;
                                    }

                                    return !applyFilter(filter.filter, colValue, VM.caseInsensitiveFilter());
                                });
                                showRow = (indexOfFirstFailure == -1);
                            }
                            else {
                                showRow = !row.isHidden();
                            }

                            if (showRow) {
                                row.isHidden(false);
                                row.isEven( curIndexOfShow % 2 == 0 );

                                curIndexOfShow = curIndexOfShow + 1;

                                shown++;
                            }
                            else {
                                row.isHidden(true);
                            }
                        });
                        VM.shownRowsPrev(VM.shownRows())
                        VM.shownRows(shown);
                        //cover the use case to hide loading bar on no results (hack, but works)
                        if (VM.shownRowsPrev()==0 && VM.shownRows()==0){
                            $('#loading-bar').hide();
                        }
                    }).extend({throttle:1000});

                    ko.computed(function() {
                        var sortColumn    = VM.sortColumn();
                        var sortDirection = VM.sortDirection();

                        if (!_.isUndefined(sortColumn) && (sortColumn !== null) ) {
                            VM.table.rows.sort(function(left, right) {
                                var leftVal = left.rowData[sortColumn];
                                var rightVal = right.rowData[sortColumn];

                                leftVal  = _.isObject(leftVal)  ?  leftVal.value : leftVal;
                                rightVal = _.isObject(rightVal) ? rightVal.value : rightVal;

                                return (leftVal == rightVal) ? 0 : (leftVal < rightVal) ? -1 : 1;
                            });
                        }

                        if (sortDirection < 0) {
                            VM.table.rows.reverse();
                        }
                    });

                    VM.getHeaderSortClass = ko.computed(function(index) {
                        if (index === VM.sortColumn()) {
                            return (VM.sortDirection() > 0) ? "headerSortDown" : "headerSortUp";
                        }
                        else {
                            return "";
                        }
                    });

                    VM.rowHeaders = ko.computed(function(){
                        return VM.table.rowHeaders().map(function(header, index) {
                            var headerName = _.isObject(header) ? header.display : header;

                            return {
                                data: headerName,
                                getCSSClass: ko.computed(function() {
                                    if (index === VM.sortColumn()) {
                                        return (VM.sortDirection() > 0) ? "headerSortDown" : "headerSortUp";
                                    }
                                    else {
                                        return "";
                                    }
                                }),
                                sort: ko.computed(function() {
                                    if (index === VM.sortColumn()) {
                                        return 0 - VM.sortDirection();
                                    }
                                    else {
                                        return 0;
                                    }
                                })
                            };
                        });
                    });

                    VM.sortTable = function(index) {
                        if (VM.sortColumn() === index) {
                            VM.sortDirection(-VM.sortDirection());
                        }
                        else {
                            VM.sortColumn(index);
                            VM.sortDirection(1)
                        }
                    };

                    VM.actionButtonsDisabled = ko.computed(function() {
                        return VM.table.getSelectedRows().length === 0;
                    });

                    VM.actionButtons = (params.actionButtons || []).map(function(actionButton){
                        return {
                            title: actionButton.title,
                            disabled: VM.actionButtonsDisabled,
                            clickAction: function() {
                                actionButton.execute(VM.table.getSelectedRows(), VM.table);
                            }
                        };
                    });

                    var handleIsLoadingValue = function(isLoading) {
                        var $el = $element.children().first('.panel');
                        if (isLoading) {
                            //Block further ui
                            $el.block({
                                message: '<img src="<%=getContextPath()%>/webutils/icons/loading.svg">Loading...',
                                css: {
                                    border: 'none',
                                    padding: '5px',
                                    backgroundColor: '#000',
                                    '-webkit-border-radius': '10px',
                                    '-moz-border-radius': '10px',
                                    opacity: .5,
                                    color: '#fff'
                                }
                            });
                        }
                        else {
                            $el.unblock();
                        }
                    };
                    handleIsLoadingValue(VM.table.isLoading());
                    VM.table.isLoading.subscribe(handleIsLoadingValue);

                    return VM;
                }
            },
            template: {
                element: 'lk-table'
            }
        });
    })();
</script>

<!-- Help Popup -->
<div class="modal fade" id="tableFilterInfoModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&#215;</span></button>
                <h4 class="modal-title" id="myModalLabel">Filter Instructions</h4>
            </div>
            <div class="modal-body">
                <p>
                    There are several available filter rules:
                </p>
                <ul>
                    <li>
                        Basic Text Matching
                        <ul>
                            <li>
                                If you just type some text, such as "abc", the table will filter for any
                                rows that contain "abc" anywhere in the text for that column.
                            </li>
                            <li>
                                This is case-sensitive, so "hello" will not match a row with "Hello" as
                                the value.
                            </li>
                        </ul>
                    </li>

                    <li>
                        Number comparison
                        <ul>
                            <li>
                                If you prefix your filter rule with "<" or ">", this filter will treat
                                every value in this column as a number and only display the rows that have
                                a value greater than or less than that number.
                            </li>
                            <li>
                                This ignores leading and trailing zeroes, so "<2" will match '01' and '1'.
                            </li>
                            <li>
                                When converting a cell value to a number for comparison, the system will
                                look for any leading numbers, plus an optional decimal, and ignore the rest.
                                See the examples below to see how various values are interpreted.
                                <ul>
                                    <li>"2016/05/01" is compared as if it were the number "2015"</li>
                                    <li>"1.5 mg" is converted to "1.5"</li>
                                    <li>"2015c149" is converted to "2015"</li>
                                    <li>"r95061" is converted to "0"</li>
                                </ul>
                            </li>
                            <li>
                                You may notice there is no "=".  If you need to find numbers that equal a
                                value, such as "1.5", you can use the filter ">1.49;<1.51".
                            </li>
                        </ul>
                    </li>

                    <li>
                        Date comparison
                        <ul>
                            <li>
                                To compare dates, prefix a date with either "d", "w", "m", or "y", followed
                                by "<", ">", or "=".  This will test whether the date, week, month, or year
                                of the date in that row is less than, greater than, or equal to the date
                                specified in the filter.
                            </li>
                            <li>
                                Besides dates formatted like "2015-05" or "2015-05-01", there are also some
                                special shortcut dates that you can use:
                                <ul>
                                    <li>
                                        "t" indicates today.  So, "d&lt;t" indicates any date before today.
                                    </li>
                                    <li>
                                        You can also use relative dates.  "d&lt;t-1" means any date before
                                        yesterday.  In the same way, "d&gt;t+1" means any date after tomorrow.
                                    </li>
                                    <li>
                                        In addition to "t" which gives relative times in terms of days, you
                                        can use "w" to give relative terms in terms of weeks.  "d&gt;w+1"
                                        indicates any dates more than 7 days out.  In the same way, "m"
                                        indicates months, and "y" indicates years.
                                        <ul>
                                            <li>
                                                Note that these are not in terms of weeks or months. "d=w-1"
                                                doesn't indicate any time last week.  It means the exact date
                                                7 days ago.
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Examples:
                                <ul>
                                    <li>"m=m-1" would filter for any dates that occurred last month.</li>
                                    <li>"y&lt;y" would give you any dates that happened before this year.</li>
                                    <li>"w=w+1" would give you any dates that occur next week.</li>
                                    <li>"m=2015-06" would give you anything that occured in June, 2015.</li>
                                </ul>
                            </li>
                        </ul>
                    </li>

                    <li>
                        Regular Expressions
                        <ul>
                            <li>
                                Regular expressions are incredibly powerful ways to match text, but they can have
                                a bit of a steep learning curve.  If you are familiar with them, you can use
                                them to filter for text in tables.  Unfortunately, explaining them in detail is
                                out of the scope of this help text.
                            </li>
                            <li>
                                To use a regular expression as a filter rule, just surround the regex in forward
                                slashes, such as you might do in many programming languages:
                                <ul>
                                    <li>Ex: "<strong>/</strong>{regularExpressionHere}<strong>/</strong>{flags}"</li>
                                </ul>
                            </li>
                            <li>
                                As you can see in the example above, it also supports flags.  At this point,
                                only the "i" flag is supported (for case insensitivity).
                            </li>
                        </ul>
                    </li>
                </ul>
                <p>
                    Additional tricks:
                </p>
                <ul>
                    <li>
                        Prefixing a rule with "<strong>!</strong>" will invert the rule (show only rows
                        that <em>don't</em> match that rule).
                        <ul>
                            <li>For example: "!/^\s*$/" will match any non-blank entries.</li>
                        </ul>
                    </li>
                    <li>
                        You can chain rules together using "<strong>;</strong>".  Then, the table will only
                        display rows that match each of the chained rules.
                        <ul>
                            <li>
                                For example, "y=y;m&ltm" will yield results for any date that occurred this
                                year but before the start of this month.
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>