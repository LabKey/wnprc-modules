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
                <h4 class="modal-title">Notice</h4>
            </div>
            <div class="modal-body" data-bind="with: form">
                <form class="form-horizontal">
                    <div class="form-group">
                        <label class="col-sm-4 control-label">Reason for marking as exempt:</label>
                        <div class="col-sm-8">
                            <textarea rows="4" class="form-control" data-bind="textInput: notes"></textarea>
                        </div>

                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-bind="click: submitMarkExempt">Submit</button>
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
                    <div>Link the person to card?</div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-bind="click: submitLinkCard">Submit</button>
            </div>
        </div>
    </div>
</div>


<div class="row">
    <div class="col-xs-8">
        <div class="panel panel-primary">
            <div class="panel-heading">Unidentified Cards</div>

            <div class="panel-body">
            <lk-querytable params="schema: '<%= WNPRC_ComplianceSchema.NAME %>',
                                   query: 'unidentifiedCards',
                                   rowsAreSelectable: false,
                                   rowsAreClickable: true,
                                   actionButtons: actions,
                                   rowClickCallback: rowClicked,
                                   rowBackgroundColorClicked: '#78b0e0',
                                   cursor: 'pointer'"
            ></lk-querytable>
            </div>
        </div>
    </div>

    <div class="col-xs-4 ">
        <div class="panel panel-primary">
            <div class="panel-heading">Person(s)</div>
            <div class="panel-body" data-bind="with: listPersons">

                <div data-bind="visible:loading()"><img src="<%=getContextPath()%>/webutils/icons/loading.svg">Loading...</div>
                <div id="person-results" data-bind="visible:!loading()">
                    <!-- ko if: userMatches().length == 0 -->
                    <div style="padding-bottom:10px"><strong>Please select a card.</strong></div>
                    <!-- /ko -->
                    <!-- ko if: !userMatches().length == 0 -->
                    <div style="padding-bottom:10px"><strong>Displaying all potential persons for the selected card:</strong></div>
                    <!-- /ko -->

                    <div data-bind="foreach: userMatches">
                        <div>
                            <label>
                                <!-- ko if: display.indexOf('User not found') == -1 -->
                                    <input id="radio-person" type="radio" name="selectedUser" value="{{id}}" data-bind="checked: $parent.selectedPerson">
                                    {{last_name}}, {{first_name}} {{middle_name}}
                                <!-- ko if: notes -->
                                    ({{notes}})
                                <!-- /ko -->
                                <!-- /ko -->
                                <!-- ko ifnot: display.indexOf('User not found') == -1 -->
                                    <strong>{{display}}</strong>
                                <!-- /ko -->
                                <!--<button data-bind="disable: $parent.selectedPerson">Test</button>-->
                            </label>
                        </div>
                    </div>
                </div>


            </div>
                <button style="margin: 8px" data-bind="click: customActions.linkcard.execute" id="link-card-button" class="btn btn-primary" disabled>{{customActions.linkcard.title}}</button>

        </div>
        <!--<button style="margin: 8px" data-bind="click: customActions[0].execute, enable: listPersons.userMatches.selectedUser" class="btn btn-primary">Link this Person to Card</button>-->
        <!--<button style="margin: 8px" data-bind="click: customActions[0].execute, disable: disabled" class="btn btn-primary">Link this Person to Card</button>-->
        <!--<button style="margin: 8px" data-bind="click: customActions[0].execute, disable: customActions[0].disabled" class="btn btn-primary">Link this Person to Card</button>-->
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
            selectedCard: ko.observableArray().extend({notify:'always'}),
            selectedCardIds: ko.observableArray(),
            notes: ko.observable('')
        };

        var disableButton = function(el){
            $(el).prop('disabled',true);
        };

        var reloadPage = function(ms){
            setTimeout(function(){
                window.location.reload();
            },ms)
        };

        WebUtils.VM.form = form;

        WebUtils.VM.rowSelected = {
            row: ko.observable('')
        };

        WebUtils.VM.listPersons = {
            selectedUser: ko.observable(""),
            userMatches: ko.observableArray([]),
            loading: ko.observable(false).extend({notify:'always'})
            //selectedPersonId: ko.observableArray(),
        };

        WebUtils.VM.actions = [
            {
                title: "Mark as Exempt",
                execute: function(tableRows, table) {
                    form.selectedCardIds(tableRows.map(function(val) {
                        return val.rowData[0];
                    }));

                    $exemptDialog.modal('show');
                }
            }
        ];

        //failed attempt to disable button w knockout
        /*
        WebUtils.VM.actionButtonsDisabled = {
            disabled: ko.observable(true)
        };

        WebUtils.VM.listPersons.selectedPersonId.subscribe(function(val){
            console.log('subscribed..')
            console.log(val);
        });

        WebUtils.VM.disabled = ko.computed(function(listPersons){
            return WebUtils.VM.listPersons
        });*/

        // need a separate action for linking a card to person
        // cannot put in WebUtils.VM.actions above since that gets tied to the lk-querytable.
        WebUtils.VM.customActions = {
            linkcard: {
                title: "Link Card to Person",
                //disabled: typeof ko.mapping.toJS(WebUtils.VM.listPersons).selectedPerson == 'undefined',
                execute: function (tableRows, table) {
                    var personData = ko.mapping.toJS(WebUtils.VM.listPersons);
                    if (!personData.selectedPerson) {
                        toastr.error("Hit an error: no person was selected to link the card to.");
                        return;
                    }
                    $linkDialog.modal('show');
                    return;
                }
            },
        };

        WebUtils.VM.submitMarkExempt = function() {
            $exemptDialog.modal('hide');
            var cardData = ko.mapping.toJS(WebUtils.VM.form);
            WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.MarkCardExemptAPI.class, getContainer()) %>", {
                        cardId: cardData.selectedCard[0],
                        reason: cardData.notes
            }).then(function(d) {
                toastr.success("Success! The selected card was marked as exempt. Page is reloading...");
                reloadPage(1000);
            }).catch(function(e) {
                toastr.error("Hit an error: " + e.message || e);
            });
        };


        WebUtils.VM.submitLinkCard = function() {
            $linkDialog.modal('hide');
            var personData = ko.mapping.toJS(WebUtils.VM.listPersons);
            var cardData = ko.mapping.toJS(WebUtils.VM.form);

            //TODO validate here...
            //TODO not sure how this $parent selectedPerson really works here?
            WebUtils.API.postJSON("<%= new ActionURL(WNPRC_ComplianceController.LinkCardAPI.class, getContainer()) %>", {
                cardId: cardData.selectedCard[0],
                personId: personData.selectedPerson
            }).then(function(d) {
                toastr.success("Success! The selected card was linked to the selected person. Page is reloading...");
                reloadPage(1000);
            }).catch(function(e) {
                toastr.error("Hit an error: " + e.message || e);
            });
        };

        // searches for potential persons
        WebUtils.VM.rowClicked = function(row) {
            WebUtils.VM.listPersons.loading(true);
            // allow only one row to be selected at a time
            if (WebUtils.VM.rowSelected.row() != ''){
                disableButton('#link-card-button');
                WebUtils.VM.rowSelected.row().isSelected(false)
            }
            row.isSelected(true);
            WebUtils.VM.rowSelected.row(row);
            WebUtils.VM.form.selectedCard(row.rowData);

            <%
                ActionURL searchQuery = new ActionURL(WNPRC_ComplianceController.GetPersonFromCardAPI.class, getContainer());
            %>

            //TODO allow the user to specify the filter
            var url = LABKEY.ActionURL.buildURL('<%= searchQuery.getController() %>', '<%= searchQuery.getAction()%>', null, {
                query: row.rowData[1]
            });

            WebUtils.API.getJSON(url)
                .then(function (data) {
                    console.log(data);
                    WebUtils.VM.listPersons.loading(false);
                    var PERSONS = 'PERSONS';
                    var results = data.results;
                    if (!results[PERSONS]){
                        disableButton('#link-card-button');
                        var fakeUser = results['UW CARD'][0];
                        fakeUser.display = "User not found for card: " + fakeUser.display;
                        fakeUser.notfound = true;
                        WebUtils.VM.listPersons.userMatches(fakeUser);
                        toastr.error("No user found in persons table for selected card.");
                        return;
                    } else {
                        // knockout wasn't playing nice here, using jQuery to force button to disabled
                        $(document).on('click', '#radio-person', function () {
                            $('#link-card-button').removeProp('disabled');
                        });
                    }
                    WebUtils.VM.listPersons.userMatches((PERSONS in results) ? results[PERSONS] : []);
            });
        };

    })();
</script>

