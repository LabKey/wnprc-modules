<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.wnprc_compliance.lookups.SpeciesClass" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.api.util.CSRFUtil" %>
<%@ page import="org.labkey.api.settings.AppProps" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    JSONObject availableSpecies = new JSONObject();
    for (SpeciesClass speciesClass : SpeciesClass.values()) {
        availableSpecies.put(speciesClass.name(), speciesClass.name());
    }
%>

<script>
    (function() {
        window.LABKEY = {
            CSRF: '<%= CSRFUtil.getExpectedToken(getViewContext()) %>',
            ActionURL: {
                getContainer: function() {
                    return '<%= getViewContext().getContainer().getPath() %>';
                },
                getBaseURL: function() {
                    return '<%= AppProps.getInstance().getBaseServerUrl() %>';
                },
                buildURL: function(controller, action, container, queryParams) {
                    return [
                        LABKEY.ActionURL.getBaseURL(),
                        controller,
                        container || LABKEY.ActionURL.getContainer(),
                        action
                    ].join("/") + ".view" + (queryParams ? "?" + $.param(queryParams) : "");
                }
            },
            getModuleContext: function() {
                return {};
            }
        };

        window.PageLoadData = {
            lookups: {
                species: <%= availableSpecies.toString() %>
            }
        }
    })();
</script>

<script type="application/javascript" src="<%= getContextPath() %>/wnprc_compliance/pages/protocol-list.js"></script>