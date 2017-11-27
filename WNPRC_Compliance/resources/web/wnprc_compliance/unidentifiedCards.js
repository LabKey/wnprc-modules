function applyKnockoutBindings(markExemptUri) {
    var $exemptDialog = $('#exemptDialog').modal({
        show: false
    });

    var form = {
        selectedCardIds: ko.observableArray(),
        notes: ko.observable('')
    };
    WebUtils.VM.form = form;

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

    WebUtils.VM.submit = function() {
        $exemptDialog.modal('hide');

        WebUtils.API.postJSON(markExemptUri, {
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
}