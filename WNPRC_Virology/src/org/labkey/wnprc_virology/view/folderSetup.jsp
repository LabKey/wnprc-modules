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
tr.spaceUnder > td
{
  padding-bottom: 1em;
}
</style>

<div id="folder-type-set" <%= unsafe(!isNull ? "" : "style=\"display:none\"") %> >
    <labkey:form action="<%= new ActionURL(WNPRC_VirologyController.FolderSetupAction.class, getContainer()) %>" method="post">
        <table cellspacing="7" width="100%">
            <tr class="spaceUnder">
                <td>
                    <!--- maybe we can get the value later for updates --->
                  <label for="accountNumbers"><strong>Account number(s)</strong></label>  <input type="text" name="accountNumbers" id="accountNumbers">
                </td>
            </tr>
            <tr>
                <td align="right">
                    <labkey:button text="Save and Configure Permissions" />
                </td>
            </tr>
        </table>
    </labkey:form>
</div>

<div id="folder-type-unset" <%= unsafe(isNull ? "" : "style=\"display:none\"") %> >
    This folder has already been configured. <br>
</div>

