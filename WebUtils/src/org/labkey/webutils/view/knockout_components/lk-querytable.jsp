<%
/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
%>
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
