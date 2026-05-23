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

<script type="text/javascript" nonce="<%=getScriptNonce()%>">
    QUnit.config.autostart = false;
</script>

<script src="<%= getContextPath() %>/wnprc_ehr/qunit-tests/trigger_tests.js"></script>

<div class="panel panel-primary">
    <div class="panel-heading">Trigger Tests</div>
    <div class="panel-body">
        <p>
            This page performs tests on the trigger scripts in the background using javascript.  To see the results
            and enable the tests, change the PerformUnitTestingPerPage module property to "true".
        </p>
        <p>
            These tests use animal ids that start with "x", however, since these tests do insert and delete data
            to the database, you need to press the button below to actually kick them off:
        </p>
        <% addHandler("performTests", "click", "QUnit.start()"); %>
        <button class="btn btn-primary" id="performTests">Perform Tests</button>
    </div>
</div>