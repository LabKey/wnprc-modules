<%@ page import="org.labkey.security.xml.GroupEnumType" %>
<%@ page import="org.labkey.api.security.GroupManager" %>
<%@ page import="org.labkey.api.security.Group" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    Group pathologyGroup = GroupManager.getGroup(getContainer(), "pathology (LDAP)", GroupEnumType.SITE);
    boolean isPathologist = getUser().isInGroup(pathologyGroup.getUserId()) || getUser().isSiteAdmin();
%>

<script>
    (function() {
        window.PageLoadData = {
            lookups: {},
            isPathologist: <%= isPathologist ? "true" : "false" %>
        }
    })();
</script>

<div id="reactDiv"></div>

<script type="application/javascript" src="<%= getContextPath() %>/wnprc_ehr/necropsy-schedule.js"></script>
<link rel="stylesheet" type="text/css" href="<%= getContextPath() %>/wnprc_ehr/css/wnprc_ehr.css" />