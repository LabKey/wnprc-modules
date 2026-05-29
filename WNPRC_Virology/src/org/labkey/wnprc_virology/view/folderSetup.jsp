<%
/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
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

