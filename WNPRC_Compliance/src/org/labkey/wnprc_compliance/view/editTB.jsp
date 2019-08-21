<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceSchema" %>
<%@ page import="org.labkey.wnprc_compliance.WNPRC_ComplianceController" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    String url = (new ActionURL(WNPRC_ComplianceController.BeginAction.class, getContainer())).toString();
%>
<div class="text-center" style="margin-bottom: 10px;">
    <a class="btn btn-primary" href="<%= url %>">
        <span class="glyphicon glyphicon-home"></span>
        TB Dashboard
    </a>
</div>

<div id="exemptDialog" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="close">
                    <span aria-hidden="true">&times</span>
                </button>
                <h4 class="modal-title">Mark Cards as Exempt</h4>
            </div>
            <div class="modal-body" data-bind="with: form">
                <form class="form-horizontal">
                    <div class="form-group">
                        <label class="col-sm-4 control-label">Reason</label>
                        <div class="col-sm-8">
                            <textarea rows="4" class="form-control" data-bind="textInput: notes"></textarea>
                        </div>

                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-bind="click: submit">Submit</button>
            </div>
        </div>
    </div>
</div>


<div class="row">
    <div class="col-xs-8">
<div class="panel panel-primary">
    <div class="panel-heading">Persons List</div>

    </div>
    <lk-querytable params="schema: '<%= WNPRC_ComplianceSchema.NAME %>',
                           query: 'personsList',
                                   rowsAreSelectable: false,
                                   rowsAreClickable: true,
                                   actionButtons: actions,
                                   rowClickCallback: rowClicked,
                                   rowBackgroundColorClicked: '#78b0e0',
                                   cursor: 'pointer'"
    ></lk-querytable>
    </div>


    <div class="col-xs-4 ">
        <div class="row">
        <div class="panel panel-primary">
            <div class="panel-heading">TB Clearances</div>
            <div class="panel-body" data-bind="with: results">

                <div data-bind="visible:loading()"><img src="<%=getContextPath()%>/webutils/icons/loading.svg">Loading...</div>
                <div id="person-results" data-bind="visible:!loading()">
                    <!-- ko if: TBClearances().length == 0 -->
                    <div style="padding-bottom:10px"><strong>Please select a person.</strong></div>
                    <!-- /ko -->
                    <!-- ko if: !TBClearances().length == 0 -->
                    <div style="padding-bottom:10px"><strong>Displaying recent (up to 3) clearance dates for the selected person:</strong></div>
                    <!-- /ko -->

                    <div data-bind="foreach: TBClearances">
                        <div>
                            <label>
                                <input id="radio-person" class="form-control" type="text" data-bind="dateTimePicker: date, dateTimePickerOptions: {format: 'MM/DD/YYYY'}, value: date">
                            </label>
                        </div>
                    </div>
                </div>


            </div>
            <button style="margin: 8px" data-bind="click: submitTB" id="link-card-button" class="btn btn-primary" >Update all</button>

        </div>
        </div>

        <div class="row">
            <div class="panel panel-primary">
                <div class="panel-heading">Measles Clearances</div>
                <div class="panel-body" data-bind="with: results">

                    <div data-bind="visible:loading()"><img src="<%=getContextPath()%>/webutils/icons/loading.svg">Loading...</div>
                    <div id="person-results" data-bind="visible:!loading()">
                        <!-- ko if: MeaslesClearances().length == 0 -->
                        <div style="padding-bottom:10px"><strong>Please select a person.</strong></div>
                        <!-- /ko -->
                        <!-- ko if: !MeaslesClearances().length == 0 -->
                        <div style="padding-bottom:10px"><strong>Displaying recent (up to 3) clearance dates for the selected person:</strong></div>
                        <!-- /ko -->

                        <div data-bind="foreach: MeaslesClearances">
                            <div>
                                <label>
                                    <input id="radio-person" class="form-control" type="text" data-bind="dateTimePicker: date, dateTimePickerOptions: {format: 'MM/DD/YYYY'}, value: date">
                                </label>
                            </div>
                        </div>
                    </div>


                </div>
                <button style="margin: 8px" data-bind="click: submitMeasles" id="link-card-button" class="btn btn-primary">Update all</button>

            </div>
        </div>
    </div>

</div>
</div>

<div id="linkDialog" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="close">
                    <span aria-hidden="true">&times</span>
                </button>
                <h4 class="modal-title">Notice</h4>
            </div>
            <div class="modal-body" data-bind="with: form">
                <form class="form-horizontal">
                    <input id="radio-person" class="form-control" type="text" data-bind="dateTimePicker: date, dateTimePickerOptions: {format: 'MM/DD/YYYY'}, value: date">
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-bind="click: submitLinkCard">Submit</button>
            </div>
        </div>
    </div>
</div>

<script>
    (function() {

        var form = {
            selectedCardIds: ko.observableArray(),
            notes: ko.observable(''),
            date: ko.observable(moment())
        };

        var disableButton = function(el,val){
            $(el).prop('disabled',val);
        };

        WebUtils.VM.rowSelected = {
            row: ko.observable('')
        };

        WebUtils.VM.form = form;

        WebUtils.VM.actions = [
        ];

        WebUtils.VM.customAction = {

        }

        WebUtils.VM.results = {
            TBClearances: ko.observableArray([]),
            TBClearancesToUpdate: ko.observableArray([]),
            MeaslesClearances: ko.observableArray([]),
            MeaslesClearancesToUpdate: ko.observableArray([]),
            loading: ko.observable(false).extend({notify:'always'}),
            TableName: ko.observable("")
        };

        WebUtils.VM.submitTB = function() {
            WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.UpdateClearanceAPI.class, getContainer()) %>", {
                clearances: WebUtils.VM.results.TBClearancesToUpdate(),
                table_name: WebUtils.VM.results.TableName()
            }).then(function(d) {
                toastr.success("Success!")
            }).catch(function(e) {
                toastr.error("Hit an error: " + e.message || e);
            });
        };
        WebUtils.VM.submitMeasles = function() {
            WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.UpdateClearanceAPI.class, getContainer()) %>", {
                clearances: WebUtils.VM.results.MeaslesClearancesToUpdate(),
                table_name: WebUtils.VM.results.TableName()
            }).then(function(d) {
                toastr.success("Success!")
            }).catch(function(e) {
                toastr.error("Hit an error: " + e.message || e);
            });
        };

        WebUtils.VM.rowClicked = function(row) {
            //clear the measles and tb data to update each time new person is selected
            WebUtils.VM.results.MeaslesClearancesToUpdate([]);
            WebUtils.VM.results.TBClearancesToUpdate([]);

            if (WebUtils.VM.rowSelected.row() != ''){
                disableButton('#link-card-button',false);
                WebUtils.VM.rowSelected.row().isSelected(false)
            }
            row.isSelected(true);
            WebUtils.VM.rowSelected.row(row);

            <%
                ActionURL searchQuery = new ActionURL(WNPRC_ComplianceController.GetClearancesFromPerson.class, getContainer());
            %>

            var tbUrl = LABKEY.ActionURL.buildURL('<%= searchQuery.getController() %>', '<%= searchQuery.getAction()%>', null, {
                query: row.rowData[0],
                table: "mapTBClearances"
            });

            WebUtils.API.getJSON(tbUrl)
                .then(function (data) {
                    WebUtils.VM.results.loading(false);
                    WebUtils.VM.results.TBClearances(data.results);
                }).catch(function(e) {
                    toastr.error("Hit an error: " + e.message || e);
                });

            var mUrl = LABKEY.ActionURL.buildURL('<%= searchQuery.getController() %>', '<%= searchQuery.getAction()%>', null, {
                query: row.rowData[0],
                table: "mapMeaslesClearances"
            });

            WebUtils.API.getJSON(mUrl)
                .then(function (data) {
                    WebUtils.VM.results.loading(false);
                    WebUtils.VM.results.MeaslesClearances(data.results)
                }).catch(function(e) {
                    toastr.error("Hit an error: " + e.message || e);
                });
        };

        var resolveElement = function(element) {
            var $element = $(element);

            // If the input is wrapped by an element with .date, or .input-group, initialize on that
            // element instead, to allow the user to click an icon next to the input.
            if ($element.parent().hasClass('date') || $element.parent().hasClass('input-group')) {
                $element = $element.parent();
            }

            return $element;
        };

        ko.bindingHandlers.dateTimePicker = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                //initialize datepicker with some optional options
                var options = allBindingsAccessor().dateTimePickerOptions || {};
                var $element = resolveElement(element);

                $element.datetimepicker(options);

                // Insert the initial value
                var picker = $element.data("DateTimePicker");
                var koDate = ko.utils.unwrapObservable(valueAccessor());
                picker.date(_.isUndefined(koDate) ? null : koDate);

                //when a user changes the date, update the view model
                ko.utils.registerEventHandler($element.get(0), "dp.change", function (event) {
                    var context = ko.contextFor(event.target);
                    //need to figure out of TB or measles
                    if (context.$data.table_name == 'measles_clearances'){
                        WebUtils.VM.results.MeaslesClearances()[context.$data._row-1]['date'] = event.date.format("YYYY-MM-DD");
                        WebUtils.VM.results.MeaslesClearancesToUpdate.push(WebUtils.VM.results.MeaslesClearances()[context.$data._row-1])
                        WebUtils.VM.results.TableName(context.$data.table_name);
                    }

                    if (context.$data.table_name == 'tb_clearances'){
                        WebUtils.VM.results.TBClearances()[context.$data._row-1]['date'] = event.date.format("YYYY-MM-DD");
                        WebUtils.VM.results.TBClearancesToUpdate.push(WebUtils.VM.results.TBClearances()[context.$data._row-1])
                        WebUtils.VM.results.TableName(context.$data.table_name);
                    }
                    /*var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        if (moment.isMoment(event.date)) {
                            value(event.date.toDate());
                            WebUtils.VM.results.tbdatetoupdate(event.date);
                        }
                        else if (event.date == false) {
                            value(null);
                            WebUtils.VM.results.tbdatetoupdate(null);
                        }
                        else {
                            value(event.date);
                            WebUtils.VM.results.tbdatetoupdate(null);
                        }
                    }*/
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    var picker = resolveElement(element).data("DateTimePicker");
                    if (picker) {
                        picker.destroy();
                    }
                });

            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var picker = resolveElement(element).data("DateTimePicker");
                //when the view model is updated, update the widget
                if (picker) {
                    var koDate = ko.utils.unwrapObservable(valueAccessor());

                    picker.date(_.isUndefined(koDate) ? null : koDate);
                }
            }
        };
    })();
</script>