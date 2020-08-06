/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow){
   row.alias = row.alias.toLowerCase();

   if (!row.isAcceptingCharges && row.isAcceptingCharges !== false) {
      row.isAcceptingCharges = true; //true by default
   }
}