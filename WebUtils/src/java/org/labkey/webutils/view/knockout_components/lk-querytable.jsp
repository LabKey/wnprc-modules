<%@ page extends="org.labkey.api.jsp.JspBase" %>

<template id="lk-querytable">
    <h2>{{title}}</h2>
    <lk-table params="table: table, rowsAreSelectable: rowsAreSelectable, actionButtons: actionButtons,
    rowClickCallback: rowClickCallback"></lk-table>
</template>

<script type="application/javascript" src="<%= getContextPath() %>/webutils/lk-querytable.js"></script>
<script>
    registerLkQueryTable();
</script>