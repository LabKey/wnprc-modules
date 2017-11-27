function applyKnockoutBindings(resolveUrl) {
    var $resultDialog = $('#resultDialog').modal({
        show: false
    });

    var form = {
        selectedTBIds: ko.observableArray(),
        notes: ko.observable(''),
        date: ko.observable(moment())
    };
    WebUtils.VM.form = form;

    WebUtils.VM.actions = [
        {
            title: "Finalize",
            execute: function(tableRows, table) {
                var ids = tableRows.map(function(val) {
                    return val.rowData[0];
                });
                form.selectedTBIds(ids);

                $resultDialog.modal('show');
            }
        }
    ];

    WebUtils.VM.submit = function() {
        $resultDialog.modal('hide');

        WebUtils.API.postJSON(resolveUrl, {
            pendingTBIds: form.selectedTBIds(),
            notes: form.notes(),
            date:  moment(form.date()).format()
        }).then(function(d) {
            toastr.success("Success!  Please reload the page to see the changes.")
        }).catch(function(e) {
            toastr.error("Hit an error: " + e.message || e);
        });
    }
}