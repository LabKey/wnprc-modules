<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%@ taglib prefix="lk" uri="http://ehr.primate.wisc.edu/taglib" %>

<lk:lk-webpart title="Test Page">
    <h1>Hello!</h1>
    <h2>Goodbye24</h2>
</lk:lk-webpart>

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

<script type="application/javascript">
    (function(){
        WebUtils.VM.datetime = ko.observable('');
    })();
</script>
