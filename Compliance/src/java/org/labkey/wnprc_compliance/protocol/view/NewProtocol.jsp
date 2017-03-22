<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.wnprc_compliance.lookups.SpeciesClass" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    JSONObject availableSpecies = new JSONObject();
    for (SpeciesClass speciesClass : SpeciesClass.values()) {
        availableSpecies.put(speciesClass.name(), speciesClass.name());
    }
%>

<script>
    (function() {
        window.PageLoadData = {
            lookups: {
                species: <%= availableSpecies.toString() %>
            }
        }
    })();
</script>

<script type="application/javascript" src="<%= getContextPath() %>/wnprc_compliance/pages/new-protocol.js"></script>