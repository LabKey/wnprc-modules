<%@ page extends="org.labkey.api.jsp.JspBase" %>

<style type="text/css">
    th.header {
        cursor: pointer;
        cursor: hand;
    }
</style>

<template id="lk-table">
    <div class="panel panel-default">
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

        <table class="table table-striped table-bordered table-hover" data-bind="with: table">
            <thead>
            <tr>
                <!-- ko if: $component.rowsAreSelectable -->
                <th class="filter-false" data-sorter="false" style="width: 10px"><!-- Leave this cell blank --></th>
                <!-- /ko -->

                <!-- ko foreach: {data: $parent.rowHeaders} -->
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
                        <!-- ko if: (filter() !== undefined) && filter() !== "" -->
                        <span class="glyphicon glyphicon-remove" data-toggle="modal" data-bind="click: function() { filter('') } "></span>
                        <!-- /ko -->
                        <!-- ko ifnot: (filter() !== undefined) && filter() !== "" -->
                        <span class="glyphicon glyphicon-info-sign" data-toggle="modal" data-target="#tableFilterInfoModal"></span>
                        <!-- /ko -->
                    </span>
                    </div>
                    <!-- /ko -->
                </td>
                <!-- /ko -->
            </tr>

            <!-- ko foreach: {data: $parent.table.rows } -->
            <!-- ko if: !isHidden() -->
            <tr data-bind="css: { 'clickable': $component.rowsAreClickable, 'warning': warn, 'danger': err }">
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
            <!-- /ko -->
            </tbody>
        </table>

    </div>
</template>

<script type="application/javascript" src="<%= getContextPath() %>/webutils/lk-table.js"></script>
<script>
    registerLkTable();
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