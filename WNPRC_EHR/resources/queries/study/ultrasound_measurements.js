/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    if (event === "update") {
        helper.setScriptOptions({
            allowDatesInDistantPast: true
        });
    }
}

function onInsert(helper, scriptErrors, row, oldRow){
}

function onUpdate(helper, scriptErrors, row, oldRow){
}

function onUpdate(helper, scriptErrors, row, oldRow){
}