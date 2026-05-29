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

<div class="panel panel-primary">
    <div class="panel-heading">Test Form</div>
    <div class="panel-body">
        <form class="form-horizontal">
            <div class="form-group">
                <label class="col-xs-3 control-label">DateTime: </label>
                <div class="col-xs-9">
                    <div class='input-group date' id='datetimepicker1'>
                        <input type='text' class="form-control" data-bind="dateTimePicker: datetime"/>
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-calendar"></span>
                        </span>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>

<script type="text/javascript" nonce="<%=getScriptNonce()%>">
    (function(){
        WebUtils.VM.datetime = ko.observable('');
    })();
</script>
