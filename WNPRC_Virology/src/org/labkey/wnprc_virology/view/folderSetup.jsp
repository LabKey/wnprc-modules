<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_virology.WNPRC_VirologyController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    //configure fancier folder type checking later if needed
    boolean isNull = false;

    if (isNull)
    {
%>
  The WNPRC Virology folder cannot be configured at this time.
<%
    }
%>

<style type="text/css">
    .dropdown-section {
        padding-bottom: 5px;
    }
</style>

<script type="text/javascript">

    LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL("wnprc_virology", "linkedSchemaSetup"),
        method : 'POST',
        jsonData : {},
        success: function () {
            LABKEY.requiresScript("/wnprc_ehr/gen/dropdown.js",true, function() {
                Dropdown.renderDropdown("whtaever",'Whatever')
                document.getElementById("folder-type-set").setAttribute("style", "display:block");
            });
        },
        failure: function (e) {
            alert(JSON.parse(e.response).exception)
        }
    });




</script>

<div id="folder-type-set" style="display:none">
    <form method="post">
      <div id="dropdown-section"></div>
    </form>
</div>

<div id="folder-type-unset" <%= unsafe(isNull ? "" : "style=\"display:none\"") %> >
    This folder has already been configured. <br>
</div>

