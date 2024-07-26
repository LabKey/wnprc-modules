<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
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

<script type="text/javascript" nonce="<%=getScriptNonce()%>">

    LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL("wnprc_virology", "linkedSchemaSetup"),
        method : 'POST',
        jsonData : {},
        success: function () {
            LABKEY.requiresScript("gen/DropdownSelect",true, function() {
                LABKEY.App.loadApp('DropdownSelect', 'app', {update: false});
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
      <div id="app"></div>
    </form>
</div>

<div id="folder-type-unset" <%= unsafe(isNull ? "" : "style=\"display:none\"") %> >
    This folder has already been configured. <br>
</div>

