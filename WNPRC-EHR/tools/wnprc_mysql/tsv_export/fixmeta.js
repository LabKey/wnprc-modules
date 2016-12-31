/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// List of built-in methods:
// https://developer.mozilla.org/en/Rhino_Shell

if (arguments.length != 1)
{
    print("ehr_root required as first argument");
    quit();
}
else
{
    var ehr_root = arguments[0];
}

load(ehr_root + "/tools/util.js");

function fixupSharedProperties(tables)
{
    for each (var table in tables..table)
    {
        var tableName = table.@tableName;
        print("processing " + tableName + "...");

        for each (var col in table..column.(@columnName == "description" || @columnName == "remark" || @columnName == "pno" || @columnName == "account"))
        {
            print("  " + col.@columnName);

            if (col.@columnName == "remark")
                col.propertyURI = "urn:ehr.labkey.org/#Remark";
            else if (col.@columnName == "description"){
                col.propertyURI = "urn:ehr.labkey.org/#Description";
                col.isHidden = true;
                col.shownInInsertView = false;
                col.shownInUpdateView = false;
                col.shownInDetailsView = false;
            }
            else if (col.@columnName == "pno"){
                col.propertyURI = "urn:ehr.labkey.org/#Project";
                col.fk = {fkDbSchema: 'lists', fkTable: 'project', fkColumnName: 'pno'};
            }
            else if (col.@columnName == "account")
                col.propertyURI = "urn:ehr.labkey.org/#Account";
            else
                throw new Error("shouldn't happen");

            //print(col);
        }

    }
}

function fixupMultiLineInputs(tables)
{
    columns(tables, ["remark", "description", "clinremark", "clincomment"], function (col) {
        col.inputType = "textarea";
    });
}


default xml namespace = "http://labkey.org/data/xml";

var filename = ehr_root + "/ehr-study/datasets/datasets_metadata.xml";
var fixedname = ehr_root + "/ehr-study/datasets/datasets_metadata.fixed.xml";
var tables = new XML(readFile(filename));
print("read " + filename);

//fixupSharedProperties(tables);
fixupMultiLineInputs(tables);

print("writing " + fixedname);
write(tables, fixedname);
print("done.");


