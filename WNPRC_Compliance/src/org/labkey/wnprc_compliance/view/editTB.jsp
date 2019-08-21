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
                    <div style="padding-bottom:10px"><strong>Displaying all clearance dates for the selected person:</strong></div>
                    <!-- /ko -->

                    <div data-bind="foreach: TBClearances">
                        <div>
                            <label>
                                <!--<input id="radio-person" class="form-control" type="text" name="selectedUser" data-bind="dateTimePicker: $parent.tbdatetoupdate, dateTimePickerOptions: {format: 'MM/DD/YYYY'}, value: tbdate">-->
                                <!--<input id="radio-person" class="form-control" type="text" name="selectedUser" data-bind="dateTimePicker: tbdate, dateTimePickerOptions: {format: 'MM/DD/YYYY'}, value: tbdate">-->
                                <input id="radio-person" class="form-control" type="text" data-bind="dateTimePicker: tbdate, dateTimePickerOptions: {format: 'MM/DD/YYYY'}, value: tbdate">
                                <!--<button data-bind="click: customActions.linkcard.execute($parent.selectedPerson)">Update this one</button>-->
                                <button data-bind="click: $parent.updateTB($data,$index()) ">Update this one</button>
                                <!--<a href="http://localhost:8080/query/WNPRC/EHR/updateQueryRow.view?schemaName=wnprc_compliance&query.queryName=tb_clearances&id={{tbid}}">edit</a>-->
                                <!--<button data-bind="disable: $parent.selectedPerson">Test</button>-->
                            </label>
                        </div>
                    </div>
                </div>


            </div>
            <button style="margin: 8px" data-bind="click: customActions.linkcard.execute" id="link-card-button" class="btn btn-primary" disabled>{{customActions.linkcard.title}}</button>

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
                        <div style="padding-bottom:10px"><strong>Displaying all clearance dates for the selected person:</strong></div>
                        <!-- /ko -->

                        <div data-bind="foreach: MeaslesClearances">
                            <div>
                                <label>
                                    <input id="radio-person" class="form-control" type="text" data-bind="dateTimePicker: mdate, dateTimePickerOptions: {format: 'MM/DD/YYYY'}, value: mdate">
                                    <!--<button data-bind="click: customActions.linkcard.execute($parent.selectedPerson)">Update this one</button>-->
                                    <button data-bind="click: $parent.updateMeasles($data,$index()) ">Update this one</button>
                                    <!--<button data-bind="disable: $parent.selectedPerson">Test</button>-->
                                </label>
                            </div>
                        </div>
                    </div>


                </div>
                <button style="margin: 8px" data-bind="click: customActions.linkcard.execute" id="link-card-button" class="btn btn-primary" disabled>{{customActions.linkcard.title}}</button>

            </div>
        </div>
        <!--<button style="margin: 8px" data-bind="click: customActions[0].execute, enable: results.TBClearances.selectedUser" class="btn btn-primary">Link this Person to Card</button>-->
        <!--<button style="margin: 8px" data-bind="click: customActions[0].execute, disable: disabled" class="btn btn-primary">Link this Person to Card</button>-->
        <!--<button style="margin: 8px" data-bind="click: customActions[0].execute, disable: customActions[0].disabled" class="btn btn-primary">Link this Person to Card</button>-->
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
        var $exemptDialog = $('#exemptDialog').modal({
            show: false
        });
        var $linkDialog = $('#linkDialog').modal({
            show: false
        });

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
            /*updateMe: function(data,index){
                console.log(data);
                console.log(index);
                var something = ko.mapping.toJS(WebUtils.VM.results);
                console.log('before')
                console.log(something);
                var old = WebUtils.VM.results.TBClearances()[index];
                var neww = data;
                WebUtils.VM.results.TBClearances.replace(old,neww);
                var something2 = ko.mapping.toJS(WebUtils.VM.results);
                console.log('after')
                console.log(something2)
            },*/
            updateTB: function(data,index){
                var tbid = WebUtils.VM.results.TBClearances()[index]['tbid'];
                var date = WebUtils.VM.results.tbdatetoupdate();
                if (tbid && date) {
                    WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.UpdateTBClearanceAPI.class, getContainer()) %>", {
                        tbId: tbid,
                        tbDate:date
                    });
                }

            },
            updateMeasles: function(data,index){
                var mid = WebUtils.VM.results.MeaslesClearances()[index]['mid'];
                var date = WebUtils.VM.results.tbdatetoupdate();
                if (mid && date) {
                    WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.UpdateMeaslesClearanceAPI.class, getContainer()) %>", {
                        tbId: mid,
                        tbDate:date
                    });
                }

            },
            selectedUser: ko.observable(""),
            tbdate: ko.observable(""),
            tbdatetoupdate: ko.observable("").extend({notify:'always'}),
            TBClearances: ko.observableArray([]),
            MeaslesClearances: ko.observableArray([]),
            loading: ko.observable(false).extend({notify:'always'})
            //selectedPersonId: ko.observableArray(),
        };

        WebUtils.VM.customActions = {
            linkcard: {
                title: "Update User",
                //disabled: typeof ko.mapping.toJS(WebUtils.VM.results).selectedPerson == 'undefined',
                execute: function (person) {
                    $linkDialog.modal('show');
                    console.log(person)
                    var personData = ko.mapping.toJS(WebUtils.VM.results);
                    console.log(personData)
                    if (!personData.selectedPerson) {
                        toastr.error("Hit an error: no person was selected to link the card to.");
                        return;
                    }
                    return;
                }
            },
        };

        WebUtils.VM.submit = function() {
            $exemptDialog.modal('hide');

            WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.MarkCardExemptAPI.class, getContainer()) %>", {
                exemptions: form.selectedCardIds().map(function(id) {
                    return {
                        cardId: id,
                        reason: form.notes()
                    }
                })
            }).then(function(d) {
                toastr.success("Success!  Please reload the page to see the changes.")
            }).catch(function(e) {
                toastr.error("Hit an error: " + e.message || e);
            });
        }

        WebUtils.VM.rowClicked = function(row) {

            if (WebUtils.VM.rowSelected.row() != ''){
                disableButton('#link-card-button',false);
                WebUtils.VM.rowSelected.row().isSelected(false)
            }
            row.isSelected(true);
            WebUtils.VM.rowSelected.row(row);

            <%
                ActionURL searchQuery = new ActionURL(WNPRC_ComplianceController.GetTBClearancesFromPerson.class, getContainer());
            %>

            var url = LABKEY.ActionURL.buildURL('<%= searchQuery.getController() %>', '<%= searchQuery.getAction()%>', null, {
                query: row.rowData[0]
            });

            WebUtils.API.getJSON(url)
                .then(function (data) {
                    WebUtils.VM.results.loading(false);
                    WebUtils.VM.results.TBClearances(data.results)
                    console.log(data);
                });
            <%
                ActionURL searchQuery2 = new ActionURL(WNPRC_ComplianceController.GetMeaslesClearanceFromPerson.class, getContainer());
            %>

            var url = LABKEY.ActionURL.buildURL('<%= searchQuery2.getController() %>', '<%= searchQuery2.getAction()%>', null, {
                query: row.rowData[0]
            });

            WebUtils.API.getJSON(url)
                    .then(function (data) {
                        WebUtils.VM.results.loading(false);
                        WebUtils.VM.results.MeaslesClearances(data.results)
                        console.log(data);
                    });
        }

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
                    WebUtils.VM.results.TBClearances()[context.$rawData._row-1]['tbdate'] = event.date.format("YYYY-MM-DD");
                    WebUtils.VM.results.tbdatetoupdate(event.date.format("YYYY-MM-DD"));
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