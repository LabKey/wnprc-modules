/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

function afterInsert (row, errors){
    var key  = row.key;
    var hostName =  'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendProjectNotification(key, hostName);
}

function beforeUpdate(row, oldRow, errors){
    var key  = row.key;
    var hostName =  'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendProjectNotification(key, hostName);
}