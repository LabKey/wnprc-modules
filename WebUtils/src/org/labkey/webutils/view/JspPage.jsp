<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.webutils.view.JspPage" %>
<%@ page import="org.springframework.web.servlet.ModelAndView" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.api.module.Module" %>
<%@ page import="org.labkey.api.data.PropertyManager" %>
<%@ page import="org.labkey.api.module.ModuleLoader" %>
<%@ page import="org.labkey.webutils.WebUtilsModule" %>
<%@ page import="org.labkey.api.module.ModuleProperty" %>
<%@ page import="org.labkey.webutils.api.model.JspPageModel" %>
<%@ page import="org.labkey.api.util.GUID" %>
<%@ page import="org.json.JSONArray" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspPage view = (JspPage) HttpView.currentView();
    JspPageModel model = (JspPageModel) getModelBean();
    Integer numberOfRenders = view.getNumberOfRenders();
    JSONArray unBindComponents = view.getUnbindComponents();


    String sufix = GUID.makeGUID();
%>

<style type="text/css">
    #bootstrap-box<%=sufix%> {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.42857143;
        color: #333;
        /* background-color: #fff; */ /* panels will include this, so it's not necessary to set here, and this way, it matches the outer divs */
    }

    #bootstrap-box<%=sufix%> input[type="button"] {
        -webkit-appearance: button;
        cursor: pointer;
    }

    #bootstrap-box<%=sufix%> input[disabled] {
        cursor: default;
    }

    .glyphicon.spinning {
        animation: spin 1s infinite linear;
        -webkit-animation: spin2 1s infinite linear;
    }

    @keyframes spin {
        from { transform: scale(1) rotate(0deg); }
        to { transform: scale(1) rotate(360deg); }
    }

    @-webkit-keyframes spin2 {
        from { -webkit-transform: rotate(0deg); }
        to { -webkit-transform: rotate(360deg); }
    }
</style>

<script type="application/javascript">
    var WebUtils = WebUtils || {};
    WebUtils.VM = {};
    var $ = jQuery;
</script>

<div class="koErrorDiv" style="display: none;">
    <h2 style="color: red;">An error occurred while applying bindings. <span style="font-weight: normal; font-style: italic" class="errorText"></span></h2>
</div>

<script type="application/javascript">
    (function() {
        WebUtils.TestResults = {
            total:     ko.observable(),
            failed:    ko.observable(),
            passed:    ko.observable(),
            runtime:   ko.observable(),
            completed: ko.observable(false)
        };

        WebUtils.TestResults.when$testsCompleted = new Promise(function(resolve) {
            QUnit.done(function(details) {
                var results = WebUtils.TestResults;

                results.total(   details.total   );
                results.failed(  details.failed  );
                results.passed(  details.passed  );
                results.runtime( details.runtime );

                results.completed( true );

                resolve(details);
            });
        });

        //QUnit.config.testTimeout = 3000; // Timeout after 3 seconds

        // Defining a deep isDefined custom assertion to be able to test that variables exist (X.Y.Z) without first checking
        // for parent variables (X.Y)
        QUnit.assert.isDefined = function(string, message) {
            var jsCode = "if (_.isDefined(" + string + ")) { varIsDefined = true }";
            var varIsDefined = false;
            try {
                eval(jsCode);
            }
            catch (e) {
                // Do nothing
            }

            this.pushResult({
                result: varIsDefined,
                actual: varIsDefined ? "Defined" : "Undefined",
                expected: "Defined",
                message: message || string + " is Defined"
            });
        };
    })()
</script>

<%
    String QUnitOnPropertyName = "PerformUnitTestingPerPage";
    Module module = ModuleLoader.getInstance().getModule(WebUtilsModule.class);
    ModuleProperty prop = module.getModuleProperties().get(QUnitOnPropertyName);

    String QUnitOnPropertyValue = PropertyManager.getCoalescedProperty(PropertyManager.SHARED_USER, getContainer(), prop.getCategory(), QUnitOnPropertyName);

    boolean QUnitOn = (QUnitOnPropertyValue != null) && QUnitOnPropertyValue.toLowerCase().equals("true");


    if (QUnitOn) {
%>
<div id="qunit"></div>
<div id="qunit-fixture"></div>

<hr style="margin: 20px 0 20px 0; border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));"/>
<%
    }
%>

<!-- Use a div to hide the content until Knockout bindings have been applied.-->
<div class="hiddenDiv" style="display: none;">
    <div id="bootstrap-box<%=sufix%>">
        <!-- Templates -->
        <%
            try {
                List<ModelAndView> templates = model.getTemplates();
                for (ModelAndView template: templates) {
                    view.include(template, out);
                }
            }
            catch (Exception e) {

            }
        %>

        <!-- Inner Page -->
        <%
            view.include(view.getBody(), out); // Don't need to handle exception here, because it'll get caught by the page handler
        %>
    </div>
</div>

<script type="application/javascript">
    (function() {
        var koSuccessfullyLoaded = true;
        //variables use for rendering the JSP a second time under a LabKey WebPart
        let $numberOfRenders = "<%=numberOfRenders %>";
        let unBindComponents  = <%=unBindComponents%>;
       // var applied = false;

        // Use a try block to ensure that we always show the hidden div.
        try {
            if ($numberOfRenders == 0){
                ko.applyBindings(WebUtils.VM);
            }else{
                if(typeof ko !== 'undefined'){
                    for(var i =0; i<unBindComponents.length; i++){
                        var nodeComponent = document.getElementById(unBindComponents[i]);
                        ko.cleanNode(nodeComponent);
                        ko.applyBindings(WebUtils.VM, nodeComponent);
                    }

                }

            }
        }
        catch (e) {
            koSuccessfullyLoaded = false;
            var $koErrorDiv = $('.koErrorDiv');

            console.error("Page failed to apply bindings: ", {Error: e});

            $koErrorDiv.find(".errorText").text(e.message);
            $koErrorDiv.show();
        }

        QUnit.test("(All Pages) Plugins and Extensions Loaded Correctly", function(assert) {
            assert.isDefined("_.isDefined");
            assert.isDefined("_.makeVarDeep");
            assert.isDefined("_.ensurePathExists");

            // Check for Strings module
            assert.isDefined("_.trim", "Underscore.String module loaded")
        });

        // Test that knockout was correctly setup and bound.
        QUnit.test("(All Pages) Knockout Successfully Applied Bindings", function (assert) {
            assert.isDefined("ko");

            var components = ['lk-table', 'lk-querytable', 'lk-input-textarea'];
            jQuery.each(components, function(i, componentName){
                assert.ok(ko.components.isRegistered(componentName), "ko component (" + componentName + ") Registered");
            });

            assert.ok(koSuccessfullyLoaded, "ko binding application successful");
        });

        // Test that WebUtils loaded correctly
        QUnit.test("(All Pages) WebUtils Global is Properly Formed", function(assert) {
            assert.isDefined("WebUtils");

            assert.isDefined("WebUtils.API.selectRows");
            assert.isDefined("WebUtils.API.insertRows");
            assert.isDefined("WebUtils.API.updateRows");
            assert.isDefined("WebUtils.API.deleteRows");

            assert.isDefined("WebUtils.Models.Table");
        });

        // Typeahead screws with the display, adding "inline-block" to the element itself, so this
        // switches it back to be full width
        $('.twitter-typeahead').css('display');

        $('.hiddenDiv').show();


        // For some reason, errors get output with a height of zero, and their subelement has a height of 200, so we
        // need to remove them if we actually want to be able to see the error.
        $('.xresizable-wrap').each(function () {
            var $this = $(this);
            if ($this.attr('id').match(/^errorDiv/))
            {
                $this.css('height', '').css('width', '');
                $this.children().css('height', '');
            }
        })
    })();
</script>