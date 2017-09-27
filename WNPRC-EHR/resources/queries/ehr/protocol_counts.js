/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
//var LABKEY = require("labkey");
//var Ext = require("Ext").Ext;


function beforeInsert(row, errors){
    beforeBoth(errors, row);
}

function beforeUpdate(row, oldRow, errors){
    beforeBoth(errors, row, oldRow);
}


function beforeBoth(errors, row, oldRow){
    if(row.protocol)
        row.protocol = row.protocol.toLowerCase();

    if(row.species){
        if(row.species.match(/cyno/i)){
            row.species = 'Cynomolgus';
        }
        else if(row.species.match(/rhesus/i)){
            row.species = 'Rhesus';
        }
        if(row.species.match(/vervet/i)){
            row.species = 'Vervet';
        }
        if(row.species.match(/pigtail/i)){
            row.species = 'Pigtail';
        }
        if(row.species.match(/marmoset/i)){
            row.species = 'Marmoset';
        }
    }
}
