/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

require("ehr/triggers").initScript(this);
var console = require('console');
var CageUI = require("cageui/CageUI").CageUI;

function onUpsert(helper, scriptErrors, row){
    row.objectid = row.objectid || LABKEY.Utils.generateUUID().toUpperCase();

    if (this.extraContext['history_id'] != null) {

        //add any errors that are returned to the page
        let javaErrors = CageUI.Utils.getJavaHelper().updateRackHistory(row, this.extraContext['history_id']);
        if (javaErrors) {
            for (let i = 0; i < javaErrors.length; i++) {
                let error = javaErrors[i];
                console.log('Field: ' + error.field + ', Message: ' + error.message + ', Severity: ' + error.severity);
                EHR.Server.Utils.addError(scriptErrors, error.field, error.message, error.severity);
            }
        }
    }

}