function applyKnockoutBindings(searchQueryController, searchQueryAction, createUrl, updateUrl) {
    ko.bindingHandlers.bsChecked = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();
            var newValueAccessor = function () {
                return {
                    change: function () {
                        value(element.value);
                    }
                }
            };
            ko.bindingHandlers.event.init(element, newValueAccessor, allBindingsAccessor, viewModel, bindingContext);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if ($(element).val() == ko.unwrap(valueAccessor())) {
                setTimeout(function () {
                    $(element).closest('.btn').button('toggle');
                }, 1);
            }
        }
    };

    var VM = {
        createNewUser: ko.observable("no"),
        searchTerm:    ko.observable(''),
        searchResults: ko.observableArray(),
        selectedPerson: ko.observable()
    };

    VM.createNewUser.subscribe(function(val) {
        if (val == "no") {
            VM.clearForm();
        }
    });

    VM.submitDisabledReason = ko.computed(function() {
        if (VM.createNewUser() !== "yes") {
            if (_.isBlank(VM.selectedPerson())) {
                return "You must either specify a person or create a new person.";
            }

            if (measlesForm.disabled() && tbForm.disabled()) {
                return "You must enter either a TB Clearance or a Measles Clearance.";
            }

            return "";
        }

        if (_.isBlank(VM.newUserForm.firstName()) || _.isBlank(VM.newUserForm.lastName())) {
            return "First and last names are required for new persons."
        }

        return "";
    });

    VM.submitDisabled = ko.computed(function() {
        return !_.isBlank(VM.submitDisabledReason());
    });

    VM.newUserForm = {
        firstName:  ko.observable(''),
        middleName: ko.observable(''),
        lastName:   ko.observable(''),
        notes:      ko.observable(''),
        isEmployee: ko.observable(false),
        userMatches: ko.observableArray([]),
        cardMatches: ko.observableArray([]),
        selectedUsers: ko.observableArray([]),
        selectedCards: ko.observableArray([])
    };

    VM.searchTerm.subscribe(function(query) {
        if (query.length < 3) {
            VM.newUserForm.userMatches([]);
            VM.newUserForm.cardMatches([]);
            return;
        }

        var url = LABKEY.ActionURL.buildURL(searchQueryController, searchQueryAction, null, {
            query: query
        });

        WebUtils.API.getJSON(url).then(function (data) {
            if (query != VM.searchTerm()) {
                return;
            }
            var results = data.results;

            var LABKEY_USER = 'LABKEY USER';
            var UW_CARD = 'UW CARD';
            var PERSON = "PERSONS";

            VM.newUserForm.userMatches((LABKEY_USER in results) ? results[LABKEY_USER] : []);
            VM.newUserForm.cardMatches((UW_CARD in results)     ? results[UW_CARD]     : []);

            VM.searchResults((PERSON in results) ? results[PERSON] : []);
        });
    });

    var tbForm = {
        disabled: ko.observable(),
        $element: $('#tb-form-body'),
        notes: ko.observable(''),
        date: ko.observable(moment()),
        pending : ko.observable(false)
    };
    VM.tbForm = tbForm;

    (function() {
        tbForm.clear = function() {
            tbForm.notes('');
            tbForm.date(moment());
            tbForm.disabled(true);
        };
        tbForm.$element.collapse({toggle: true});
        tbForm.disabled.subscribe(function(val) {
            if (val) {
                tbForm.notes('');
                tbForm.date(moment());
            }
            tbForm.$element.collapse(val ? 'hide' : 'show');
        });
        tbForm.disabled(true)
    })();

    var measlesForm = {
        $element: $('#measles-form-body'),
        disabled: ko.observable(),
        notes: ko.observable(''),
        date: ko.observable(moment())
    };
    VM.measlesForm = measlesForm;

    (function() {
        measlesForm.clear = function() {
            measlesForm.notes('');
            measlesForm.date(moment());
            measlesForm.disabled(true);
        };
        measlesForm.$element.collapse({toggle: true});
        measlesForm.disabled.subscribe(function(val) {
            if (val) {
                measlesForm.notes('');
                measlesForm.date(moment());
            }
            measlesForm.$element.collapse(val ? 'hide' : 'show');
        });
        measlesForm.disabled(true);
    })();



    VM.clearForm = function() {
        VM.createNewUser('no');
        VM.searchTerm('');
        VM.newUserForm.firstName('');
        VM.newUserForm.middleName('');
        VM.newUserForm.lastName('');
        VM.newUserForm.notes('');
        VM.newUserForm.isEmployee(false);
        VM.newUserForm.userMatches([]);
        VM.newUserForm.cardMatches([]);
        VM.newUserForm.selectedUsers([]);
        VM.newUserForm.selectedCards([]);
        measlesForm.clear();
        tbForm.clear();
    };

    var $mainFormBody = $('#mainFormBody');
    VM.submit = function() {
        var submission = {
            url: undefined,
            data: undefined
        };

        var form = ko.mapping.toJS(VM.newUserForm);

        if (VM.createNewUser() == 'yes') {
            submission.url = createUrl;

            submission.data = {
                firstName:   form.firstName,
                middleName:  form.middleName,
                lastName:    form.lastName,
                description: form.notes,
                cardNumbers: _.map(form.selectedCards, function(card) { return card.id }),
                userIds:     _.map(form.selectedUsers, function(user) { return user.id })
            };

            if (!measlesForm.disabled()) {
                submission.data.measlesInfo = {
                    notes: measlesForm.notes(),
                    dateCompleted: moment(measlesForm.date()).format()
                };
            }

            if (!tbForm.disabled()) {
                submission.data.tbInfo = {
                    dateCompleted: moment(tbForm.date()).format(),
                    notes: tbForm.notes(),
                    pending: tbForm.pending()
                }
            }
        }
        else {
            submission.url = updateUrl;

            submission.data = {
                personid: VM.selectedPerson()
            };

            if (!measlesForm.disabled()) {
                submission.data.measlesInfo = {
                    notes: measlesForm.notes(),
                    dateCompleted: moment(measlesForm.date()).format()
                };
            }

            if (!tbForm.disabled()) {
                submission.data.tbInfo = {
                    dateCompleted: moment(tbForm.date()).format(),
                    notes: tbForm.notes(),
                    pending: tbForm.pending()
                }
            }
        }

        $mainFormBody.block();

        WebUtils.API.postJSON(submission.url, submission.data).then(function() {
            toastr.success("Success");
            VM.clearForm();
        }).catch(function(e) {
            toastr.error("An error occurred: " + e.message || message)
        }).finally(function() {
            $mainFormBody.unblock();
        });
    };

    WebUtils.VM = _.extend(WebUtils.VM, VM);
}