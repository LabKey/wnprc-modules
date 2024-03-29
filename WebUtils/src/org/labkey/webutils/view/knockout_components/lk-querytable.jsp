<%@ page extends="org.labkey.api.jsp.JspBase" %>

<template id="lk-querytable">
    <h2>{{title}}</h2>
    <lk-table params="table: table, rowsAreSelectable: rowsAreSelectable, actionButtons: actionButtons,
    rowClickCallback: rowClickCallback, rowBackgroundColorClicked: rowBackgroundColorClicked, cursor: cursor, caseInsensitiveFilter: true"></lk-table>
</template>

<script type="text/javascript" nonce="<%=getScriptNonce()%>">
    (function(){
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
                        rowClickCallback: params.rowClickCallback,
                        rowBackgroundColorClicked: params.rowBackgroundColorClicked,
                        cursor: params.cursor
                    };
                }
            },
            template: {
                element: 'lk-querytable'
            }
        });
    })();
</script>
