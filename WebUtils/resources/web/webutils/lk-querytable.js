function registerLkQueryTable(){
    ko.components.register('lk-querytable', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                var table = new WebUtils.Models.QueryTable({
                    schemaName: params.schema,
                    queryName: params.query,
                    viewName: params.view
                });

                var title = ko.observable(params.title);


                return {
                    actionButtons: params.actionButtons,
                    title: title,
                    table: table,
                    rowsAreSelectable: params.rowsAreSelectable,
                    rowClickCallback: params.rowClickCallback
                };
            }
        },
        template: {
            element: 'lk-querytable'
        }
    });
}