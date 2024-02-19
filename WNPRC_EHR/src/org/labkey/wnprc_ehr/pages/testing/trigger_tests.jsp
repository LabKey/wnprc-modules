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

        <button class="btn btn-primary" onclick="QUnit.start()">Perform Tests</button>
    </div>
</div>