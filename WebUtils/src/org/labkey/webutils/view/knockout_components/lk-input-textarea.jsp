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

<style type="text/css">
    .data-paste-box > div {
        padding: 10px;
    }

    .data-paste-box textarea, .data-paste-box input {
        width: 100%;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }

    .data-valid {
        outline: none;
        border-color: green;
        box-shadow: 0 0 10px green;
    }

    .data-invalid {
        outline: none;
        border-color: red;
        box-shadow: 0 0 10px red;
    }
</style>

<template id="lk-input-textarea">
    <div class="data-paste-box">
        <div data-bind="with: input">
            <textarea rows="5" data-bind="textInput: data, css: { 'data-valid': dataValid, 'data-invalid': dataInvalid }"></textarea>
            <div style="float: right">
                {{#if: dataValid}}
                <span class="ui-icon ui-icon-check" style="display: inline-block"></span>
                <span style="color: green">{{validMessage}}</span>
                {{/if}}
                {{#if: dataInvalid}}
                <span class="ui-icon ui-icon-closethick" style="display: inline-block"></span>
                <span style="color: red;">{{invalidMessage}}</span>
                {{/if}}
            </div>
        </div>
    </div>
</template>

<script type="text/javascript" nonce="<%=getScriptNonce()%>">
    (function(){
        ko.components.register('lk-input-textarea', {
            viewModel: {
                createViewModel: function(params, componentInfo) {
                    var VM = {
                        input: params.inputData
                    };

                    return VM;
                }
            },
            template: {
                element: 'lk-input-textarea'
            }
        });
    })();
</script>