<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%

%>

<script>
    (function() {
        window.PageLoadData = {
            lookups: {}
        }
    })();
</script>

<div id="reactDiv"></div>

<script type="application/javascript" src="<%= getContextPath() %>/wnprc_ehr/pages/necropsy-schedule.js"></script>