/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


/*
 * This file contains miscellaneous Ext containers used throughout the EHR.  These tend to be single-user Panels, such as the UI
 * that appears when a button is clicked or other popup windows.
 */


/**
 * @class
 * This is the panel that appears when hitting the 'Add Batch' button on EHR grids.  It provides a popup to find the set of
 * distinct animal IDs based on room, case, etc.
 */
EHR.ext.AnimalSelectorPanel = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,title: 'Choose Animals'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: 350
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [
                {
                    xtype: 'textarea',
                    height: 100,
                    ref: 'subjArea',
                    fieldLabel: 'Id(s)'
                },
//                {
//                    xtype: 'combo'
//                    ,emptyText:''
//                    ,fieldLabel: 'Area'
//                    ,displayField:'area'
//                    ,valueField: 'area'
//                    ,typeAhead: true
//                    ,editable: true
//                    ,triggerAction: 'all'
//                    ,store: new LABKEY.ext.Store({
//                        schemaName: 'ehr_lookups',
//                        queryName: 'areas',
//                        sort: 'area',
//                        autoLoad: true
//                    }),
//                    ref: 'areaField'
//
//                },
                {
                    emptyText:''
                    ,fieldLabel: 'Room(s)'
                    ,ref: 'roomField'
                    ,xtype: 'textfield'
                    ,listeners: {
                        render: function(field){
                            field.el.set({autocomplete: 'off'});
                        },
                        change: function(field, room){
                            if(room){
                                room = room.replace(/[,;]+/g, ';');
                                room = room.replace(/(^;|;$)/g, '');
                                room = room.toLowerCase();
                                field.setValue(room);
                            }
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    ref: 'cageField',
                    fieldLabel: 'Cage',
                    listeners: {
                        change: function(field, val){
                            if(val && !isNaN(val)){
                                var newVal = EHR.Utils.padDigits(val, 4);
                                if(val != newVal)
                                    field.setValue(newVal);
                            }
                        },
                        render: function(field){
                            field.el.set({autocomplete: 'off'});
                        }
                    }
//                },
//                {
//                    emptyText:''
//                    ,fieldLabel: 'Project'
//                    ,ref: 'projectField'
//                    ,xtype: 'combo'
//                    ,displayField:'project'
//                    ,valueField: 'project'
//                    ,typeAhead: true
//                    ,mode: 'local'
//                    ,triggerAction: 'all'
//                    ,editable: true
//                    ,store: new LABKEY.ext.Store({
//                        schemaName: 'ehr',
//                        queryName: 'project',
//                        viewName: 'Projects With Active Assignments',
//                        sort: 'project',
//                        autoLoad: true
//                    })
                }
            ],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.getAnimals();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
            //buttonAlign: 'left'
        });

        EHR.ext.AnimalSelectorPanel.superclass.initComponent.call(this, arguments);
    },

    getFilterArray: function(button)
    {
        var room = this.roomField.getValue();
        var cage = this.cageField.getValue();
        var area = (this.areaField ? this.areaField.getValue() : null);
        var project = (this.projectField ? this.projectField.getValue() : null);

        var filterArray = [];

        if (area)
            filterArray.push(LABKEY.Filter.create('area', area, LABKEY.Filter.Types.STARTS_WITH));

        if (room)
            filterArray.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (cage)
            filterArray.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.EQUAL));

        if (project)
            filterArray.push(LABKEY.Filter.create('Id/activeAssignments/projects', project, LABKEY.Filter.Types.CONTAINS));

        return filterArray;
    },

    getAnimals: function(button)
    {
        Ext.Msg.wait("Loading...");

        //we clean up, combine subjects
        var subjectList = this.subjArea.getValue();
        if(subjectList){
            subjectList = LDK.Utils.splitIds(subjectList);
            if(subjectList.length && this.targetStore){
                var records = [];
                Ext.each(subjectList, function(s){
                    records.push({Id: s});
                }, this);
                this.targetStore.addRecords(records);
            }
        }

        var filterArray = this.getFilterArray();
        if (!subjectList && !subjectList.length && !filterArray.length)
        {
            Ext.Msg.hide();
            if(!subjectList.length)
                alert('Must Enter A Room or List of Animals');
            return;
        }

        this.ownerCt.hide();

        if (filterArray.length){
            //find distinct animals matching criteria
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'demographicsCurLocation',
                sort: 'room,cage,Id',
                filterArray: filterArray,
                scope: this,
                timeout: 30000,
                success: this.onSuccess,
                failure: EHR.Utils.onError
            });
        }
        else {
            Ext.Msg.hide();
        }
    },

    onSuccess: function(results)
    {
        if (!results.rows || !results.rows.length)
        {
            alert('No matching animals were found.');
            Ext.Msg.hide();
            return;
        }

        var ids = {};
        var records = [];

        Ext.each(results.rows, function(row)
        {
            var obj;
            if (!ids[row.Id]){
                obj = {Id: row.Id};
                if(row.room)
                    obj['id/curlocation/location'] = row.room+'-'+row.cage;
                if(row.cond)
                    obj['id/curlocation/cond'] = row.cond;


                records.push(obj);
                ids[row.Id] = 0;
            }
        }, this);

        if (this.targetStore){
            this.targetStore.addRecords(records);
        }

        Ext.Msg.hide();
    }

});
Ext.reg('ehr-animalselector', EHR.ext.AnimalSelectorPanel);


/**
 * @class
 * This is the panel that appears when hitting the 'Add Series' button.  It provides UI that allows the user to generate a consecutive
 * series of animal IDs, (ie. cy0114, cy0115, cy0116, ....).  It is used on the arrival form (among others).  In this workflow we receive
 * some number of animals and they are often assigned consecutive IDs.  It is a helper function only, and does not validate these IDs.
 */
EHR.ext.AddSeriesWin = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,title: 'Enter Series of IDs'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: 350
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [
                {
                    xtype: 'textfield',
                    ref: 'prefix',
                    fieldLabel: 'Prefix'
                },{
                    fieldLabel: 'Starting Number'
                    ,ref: 'startNumber'
                    ,xtype: 'numberfield'
                },{
                    xtype: 'numberfield'
                    ,ref: 'totalIds'
                    ,fieldLabel: 'Total IDs'
                }
            ],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.getAnimals();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
            //buttonAlign: 'left'
        });

        EHR.ext.AddSeriesWin.superclass.initComponent.call(this, arguments);
    },

    getAnimals: function(button)
    {
        var prefix = this.prefix.getValue();
        var startNumber = this.startNumber.getValue();
        var totalIds = this.totalIds.getValue();

        if (!prefix || !startNumber || !totalIds)
        {
            alert('Must Enter A Prefix and Number of Animals');
            return;
        }

        this.ownerCt.hide();

        var records = [];
        var length = 6 - prefix.length;
        for(var i=0;i<totalIds;i++){
           records.push({Id: prefix+EHR.Utils.padDigits(startNumber+i, length)});
        }

        if (this.targetStore)
            this.targetStore.addRecords(records);
    }

});
Ext.reg('ehr-addseries', EHR.ext.AddSeriesWin);


/**
 * @class
 * This window will allow clinpath staff to import chemistry results from a tabular excel format.  It is designed to directly
 * parse the output provided by Meriter (circa 2011).  It will validate the incoming test IDs and resolve/normalize the
 * TestIDs based on known aliases.  The latter is governed by ehr_lookups.chemistry_tests.  This panel is connected to the 'Add Bulk' button
 * in the chemistry section of the ClinPath form.
 */
EHR.ext.ChemExcelWin = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            //layout: 'form'
            title: 'Enter Chemistry From Excel'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: '100%'
            ,defaults: {
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'displayfield',
                value: 'This allows bulk import of the text files provided by Meriter, without modifications.  These files should have 1 row per test, with values separated by commas.  Non-recognized tests or tests lacking a result will be skipped.'
            },{
                xtype: 'textarea',
                ref: 'fileField',
                height: 350,
                width: 430
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.doSubmit();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
            //buttonAlign: 'left'
        });

        EHR.ext.ChemExcelWin.superclass.initComponent.call(this, arguments);
    },

    doSubmit: function(button)
    {
        var fileContent = this.fileField.getValue();

        if (!fileContent)
        {
            alert('Must Paste Contents of File');
            return;
        }

        this.ownerCt.hide();
        Ext.Msg.wait('Loading...');

        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL("assay", "assayFileUpload"),
            params: {
                fileName: 'ChemistryUpload_'+(new Date()).format('Y-m-d_H:m:s')+'.csv',
                fileContent: fileContent
            },
            success: this.onFileUpload,
            failure: EHR.Utils.onError,
            scope: this
        });
    },
    onFileUpload: function(response, options) {
       var data = new LABKEY.Exp.Data(Ext.util.JSON.decode(response.responseText));
        data.getContent({
            //format: 'jsonTSVExtended',
            format: 'jsonTSV',
            scope: this,
            successCallback: this.onGetContent,
            failureCallback: EHR.Utils.onError
        });
    },
    onGetContent: function (content, format){
        if (!content)
        {
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file has no content");
            return;
        }
        if (!content.sheets || content.sheets.length == 0)
        {
            // expected the data file to be parsed as jsonTSV
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file has no sheets of data");
            return;
        }

        // User 1st sheet unless there's a sheet named "Data"
        var sheet = content.sheets[0];
        for (var index = 0; index < content.sheets.length; index++)
        {
            if (content.sheets[index].name == "Data")
                sheet = content.sheets[index];
        }

        var data = sheet.data;
        if (!data.length)
        {
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file contains no rows");
            return;
        }

        Ext.Msg.hide();
        this.processData(data);
    },
    processData: function(data){
        //remove header from tsv file
        var header = data.shift();
        var skippedRows = [];
        var runsStore = Ext.StoreMgr.get("study||Clinpath Runs||||");
        var testsStore = Ext.StoreMgr.get("ehr_lookups||chemistry_tests||testid||testid");

        var id;
        var date;
        var testId;
        var result;
        var resultOORIndicator;
        var units;
        var qualResult;
        var remark;
        var panelType;
        var rec;

        Ext.each(data, function(row, idx){
            id = row[7];
            if(!id){
                console.log ('animal ID ' + id);
                alert('Something went wrong reading the file ' + id);
                return;
            }

            if((typeof id == 'string') && id.match(/PatientName/i)){
                return;
            }

            id = id.replace(/(,)* MONKEY( )*/i, '');
            id = id.toLowerCase();

            if(runsStore.find('Id', id)==-1){
                Ext.Msg.hide();
                alert('ID: '+id+' not found in Clinpath Runs section. Records will not be added');
                return false;
            }

            date = new Date(row[16]);
            testId = row[22];
            result = row[24];
            if(result && (typeof result == 'string') && result.match(/[<>]+/)){
                resultOORIndicator = result.match(/[<>]+/)[0];
                result = result.replace(/[<>]+/, '');
            }
            else
                resultOORIndicator = null;

            units = row[25];
            panelType = row[14];

            if(testId && panelType=='V19SR'){
                testId = testId.replace(/SR$/, '');
            }

            if(!id || !date || date=='Invalid Date' || !testId || !result){
                skippedRows.push(['ID: '+id, 'Date: '+(date && (date.format ? date.format('Y-m-d') : date)), 'TestId: '+testId, 'Result: '+result].join('; '));
                return;
            }

            //attempt to find this test ID.  search aliases if not found
            var idx = testsStore.find('testid', new RegExp('^'+testId+'$'));
            if(idx==-1){
                var recIdx = testsStore.findBy(function(r){
                    var alias = r.get('aliases');
                    if(!r.phantom && alias){
                        alias = alias.split(',');
                        if(alias.indexOf(testId)!=-1){
                            return true;
                        }
                    }
                }, this);

                if(recIdx!=-1){
                    testId = testsStore.getAt(recIdx).get('testid');
                }

                //return false;
            }
            else {
                console.log('found test: '+testId);
            }

            rec = {
                Id: id,
                date: date,
                testid: testId,
                result: result,
                units: units
            };

            if(resultOORIndicator)
                rec.resultOORIndicator = resultOORIndicator;

            this.targetStore.addRecord(rec);
        }, this);

        if(skippedRows.length){
            alert('One or more rows were skipped:\n'+skippedRows.join('\n'));
        }
    }
});
Ext.reg('ehr-chemexcelwin', EHR.ext.ChemExcelWin);


/**
 * @class
 * This window will allow clinpath staff to import hematology results from a text-based format.  It is designed to directly
 * parse the output provided by the cytometer.  It will parse/validate the incoming records and normalize their values
 * and Test IDs.  It will also add units according to the data in ehr_lookups.hematology_tests.  This panel is connected to the
 * 'Add Bulk' button in the hematology section in the ClinPath form.
 */
EHR.ext.HematologyExcelWin = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            //layout: 'form'
            title: 'Enter Hematology From Sysmex Analyzer'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: '100%'
            ,defaults: {
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'displayfield',
                value: 'This allows bulk import of hematology results using the output of a Sysmex Hematology Analyzer.  Cut/paste the contents of the output below.'
            },{
                xtype: 'textarea',
                ref: 'fileField',
                height: 350,
                width: 430
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.doSubmit();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
            //buttonAlign: 'left'
        });

        EHR.ext.HematologyExcelWin.superclass.initComponent.call(this, arguments);
    },

    doSubmit: function(button)
    {
        var fileContent = this.fileField.getValue();

        if (!fileContent)
        {
            alert('Must Paste Contents of File');
            return;
        }

        this.ownerCt.hide();
        Ext.Msg.wait('Loading...');

        fileContent = fileContent.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL("assay", "assayFileUpload"),
            params: {
                fileName: 'HematologyUpload_'+(new Date()).format('Y-m-d_H:m:s.u')+'.tsv',
                fileContent: fileContent
            },
            success: this.onFileUpload,
            failure: EHR.Utils.onError,
            scope: this
        });
    },
    onFileUpload: function(response, options) {
       var data = new LABKEY.Exp.Data(Ext.util.JSON.decode(response.responseText));
        data.getContent({
            //format: 'jsonTSVExtended',
            format: 'jsonTSV',
            scope: this,
            successCallback: this.onGetContent,
            failureCallback: EHR.Utils.onError
        });
    },
    onGetContent: function (content, format){
        if (!content)
        {
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file has no content");
            return;
        }
        if (!content.sheets || content.sheets.length == 0)
        {
            // expected the data file to be parsed as jsonTSV
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file has no sheets of data");
            return;
        }

        // User 1st sheet unless there's a sheet named "Data"
        var sheet = content.sheets[0];
        for (var index = 0; index < content.sheets.length; index++)
        {
            if (content.sheets[index].name == "Data")
                sheet = content.sheets[index];
        }

        var data = sheet.data;
        if (!data.length)
        {
            Ext.Msg.hide();
            Ext.Msg.alert("Upload Failed", "The data file contains no rows");
            return;
        }

        Ext.Msg.hide();
        this.processData(data);
    },
    processData: function(data){
        var skippedRows = [];
        var runsStore = Ext.StoreMgr.get("study||Clinpath Runs||||");
        var unitStore = Ext.StoreMgr.get("ehr_lookups||hematology_tests||testid||testid");

        var result;
        var tests;
        var row1;
        var row2;
        var toAdd = [];

        if(!data.length || !data[0].length){
            alert('Something went wrong processing the file');
            console.log(data)
            return;
        }

        data = data[0][0].split(/D1U/i);

        Ext.each(data, function(row, idx){
            if(!row.match(/D2U/i))
                return;

            row = row.split(/D2U/i);

            row1 = row[0];
            row2 = row[1];
            row1 = row1.replace(/\s+/g, '');
            row2 = row2.split(/\s+/);
            row2 = row2.slice(2, row2.length-1);
            row2 = row2.join('');

            result = {};
            tests = {};

            //result.animalId = row1[2].substr(0,6);
            result.animalId = row1.substr(27,6);
            result.animalId = result.animalId.toLowerCase();

            var requestNumber = runsStore.find('Id',result.animalId)
            var record = runsStore.getAt(requestNumber);

            //Getting the collection time from the request itself, if it matches animalId
            if(requestNumber!= -1 && result.animalId == record.get('Id')){

                var collectionDate = record.get('date');
            }

            //result.sequenceNo = row1[1].substr(20,4);
            //result.date = new Date(row1[2].substr(6,4), row1[2].substr(10,2)-1, row1[2].substr(12,2));
            //result.date = new Date(row1.substr(33,4), row1.substr(37,2)-1, row1.substr(39,2));
            result.date= new Date(collectionDate);

            if(!result.animalId || runsStore.find('Id', result.animalId)==-1){
                //alert('ID: '+result.animalId+' not found in Clinpath Runs section. Records will not be added');
                skippedRows.push('Not found in Clinpath Runs: '+result.animalId);
                return;
            }

            tests['WBC'] = row2.substr(6,6);
            tests['RBC'] = row2.substr(12,5);
            tests['HGB'] = row2.substr(17,5);
            tests['HCT'] = row2.substr(22,5);
            tests['MCV'] = row2.substr(27,5);
            tests['MCH'] = row2.substr(32,5);
            tests['MCHC'] = row2.substr(37,5);
            tests['PLT'] = row2.substr(42,5);
      	     //tests['LYMPH%'] = row2.substr(47,5);
            tests['LY'] = row2.substr(47,5);

            //tests['MONO%'] = row2.substr(52,5);
            tests['MN'] = row2.substr(52,5);

            //tests['SEG%'] = row2.substr(57,5);
            tests['NE'] = row2.substr(57,5);

            //tests['EOSIN%'] = row2.substr(62,5);
            tests['EO'] = row2.substr(62,5);

            //tests['BASO%'] = row2.substr(67,5);
            tests['BS'] = row2.substr(67,5);

            //tests['LYMPH#'] = row2.substr(72,6);
            //tests['MONO#'] = row2.substr(78,6);
            //tests['SEG#'] = row2.substr(84,6);
            //tests['EOSIN#'] = row2.substr(90,6);
            //tests['BASO#'] = row2.substr(96,6);
            tests['RDW'] = row2.substr(102,5);
            //tests'RDW-CV'] = row2.substr(102,5);
            //tests['RDW-SD'] = row2.substr(107,5);
            //tests['PDW'] = row2.substr(112,5);
            tests['MPV'] = row2.substr(117,5);
            //tests['P-LCR'] = row2.substr(122,5);

            var value;
            for(var test in tests){
                var origVal = tests[test];
                value = tests[test];

                if (value.match(/^00(\d){4}$/)) {
                    tests[test] = value.substr(2,3) / 100;
                }
                //note: at the moment WBC is the only test with 6 chars, so this test is possibly redundant
                else if (value.match(/^0(\d){4,}$/) && test=='WBC') {
                    tests[test] = value.substr(1,4) / 100;
                }
                else if (value.match(/^0\d{4}$/)){
                    if (test=='RBC') {
                        tests[test] = value.substr(1,3) / 100;
                    }
                    else if (test=='PLT') {
                        tests[test] = value.substr(1,3) / 1; //convert to number
                    }
                    else {
                        tests[test] = value.substr(1,3) / 10;
                    }
                }
                else if (test=='PLT') {
                	tests[test] = value.substr(0,4);
                }

                //NOTE: the following is a possible replacement for the logic above
                //it attempts to more clearly define how the parsing works
                //so far as i can tell, specific tests return different sets of decimals
                //and there is no clear way to determine decimal number without knowing the test name
//                if(value.match(/^(\d){5,6}$/)){
//                    //we drop the last digit in all cases
//                    value = value.substr(0, value.length-1);
//
//                    var decimals = 1;
//                    //WBC is output as 10^1/uL, but reported at 10^3/ul
//                    //RBC is output as 10^4/ul, but reported at 10^6/ul
//                    if(test=='WBC' || test=='RBC')
//                        decimals = 2;
//                    if(test=='PLT')
//                        decimals = 0;
//
//                    value = value / Math.pow(10, decimals);
//
//                    value = Ext4.util.Format.round(value, decimals);
//                }
//                else {
//                    //alert('Value: '+value+' is not a number');
//                    return;
//                }
//
//                if(value != tests[test]){
//                    console.log('error: '+test+'/'+tests[test]+'/'+value+'/'+decimals);
//                }

                //find units
                var idx = unitStore.find('testid', test);
                var units = null;
                var sortOrder = null;
                if(idx!=-1){
                    units = unitStore.getAt(idx).get('units');
                    sortOrder = unitStore.getAt(idx).get('sort_order');
                }

                if(tests[test] && isNaN(tests[test])){
                    skippedRows.push('Invalid Result for: '+result.animalId+', TestId: '+test+', '+tests[test]);
                    tests[test] = null;
                }

                toAdd.push({
                    Id: result.animalId,
                    date: result.date,
                    testid: test,
                    result: tests[test],
                    units: units,
                    sortOrder: sortOrder
                });
            }

        }, this);

        if(toAdd.length){
            toAdd.sort(function(a, b){
                return a.Id < b.Id ? -1 :
                        a.Id > b.Id ? 1 :
                        a.date < b.date ? -1 :
                        a.date > b.date ? 1 :
                        a.sortOrder < b.sortOrder ? -1 :
                        a.sortOrder > b.sortOrder ? 1 :
                        0
            });
            this.targetStore.addRecords(toAdd);
        }

        if(skippedRows.length){
            alert('One or more rows were skipped:\n'+skippedRows.join('\n'));
        }
    }
});
Ext.reg('ehr-hematologyexcelwin', EHR.ext.HematologyExcelWin);


/**
 * @class
 * This window will allow users to query the treatment schedule and add records to a task based on the scheduled treatments
 * that match their criteria.  It is connected to the 'Add Treatments' button in the treatments form.
 */
EHR.ext.TreatmentSelector = function(config){
    EHR.ext.TreatmentSelector.superclass.constructor.call(this, config);
};
Ext.extend(EHR.ext.TreatmentSelector, Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,title: 'Import Scheduled Treatments'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: 350
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'datefield',
                fieldLabel: 'Date',
                value: (new Date()),
                hidden: !EHR.Security.hasPermission('Completed', 'update', {queryName: 'Blood Draws', schemaName: 'study'}),
                maxValue: (new Date()),
                ref: 'dateField'
            },{
                emptyText:''
                ,fieldLabel: 'Room'
                ,ref: 'roomField'
                ,xtype: 'textfield'
                ,listeners: {
                    render: function(field){
                        field.el.set({autocomplete: 'off'});
                    },
                    change: function(field, room){
                        if(room){
                            room = room.replace(/[\s,;]+/g, ';');
                            room = room.replace(/(^;|;$)/g, '');
                            room = room.toLowerCase();
                            field.setValue(room);
                        }
                    }
                }
            },{
                emptyText:''
                ,fieldLabel: 'Time of Day'
                ,ref: 'timeField'
                ,xtype: 'lovcombo'
                ,separator: ';'
                ,displayField:'time'
                ,valueField: 'time'
                ,typeAhead: true
                ,mode: 'local'
                ,triggerAction: 'all'
                ,editable: true
                ,store: new Ext.data.ArrayStore({
                    fields: [
                        'time'
                    ],
                    idIndex: 0,
                    data: [
                        ['AM'],
                        ['Any Time'],
                        ['Noon'],
                        ['PM'],
                        ['Night']
                    ]
                })
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.getTreatments();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.TreatmentSelector.superclass.initComponent.call(this, arguments);
    },

    getFilterArray: function(button)
    {
        var room = (this.roomField ? this.roomField.getValue() : null);
        var area = (this.areaField ? this.areaField.getValue() : null);
        var time = (this.timeField ? this.timeField.getValue() : null);
        var date = (this.dateField ? this.dateField.getValue() : new Date());

        if (!room || !time.length)
        {
            alert('Must provide room and time of day');
            return;
        }

        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('date', date, LABKEY.Filter.Types.DATE_EQUAL));
        filterArray.push(LABKEY.Filter.create('treatmentStatus', '', LABKEY.Filter.Types.ISBLANK));

        if (area)
            filterArray.push(LABKEY.Filter.create('CurrentRoom/area', area, LABKEY.Filter.Types.EQUAL));

        if (room)
            filterArray.push(LABKEY.Filter.create('CurrentRoom', room, LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (time)
            filterArray.push(LABKEY.Filter.create('TimeOfDay', time, LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getTreatments: function(button)
    {
        var filterArray = this.getFilterArray();
        if (!filterArray || !filterArray.length)
        {
            return;
        }

        Ext.Msg.wait("Loading...");
        this.ownerCt.hide();

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'treatmentSchedule',
            sort: 'date,CurrentRoom,CurrentCage,Id',
            columns: 'primaryKey,lsid,Id,date,CurrentRoom,CurrentCage,project,project.account,meaning,code,qualifier,route,concentration,conc_units,amount,amount_units,dosage,dosage_units,volume,vol_units,remark',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: EHR.Utils.onError
        });

    },
    onSuccess: function(results){
        if (!results.rows || !results.rows.length)
        {
            alert('No uncompleted treatments were found.');
            Ext.Msg.hide();
            return;
        }

        var ids = {};
        var records = [];
        var obj;
        var date;
        Ext.each(results.rows, function(row)
        {
            row.date = new Date(row.date);
            var date = new Date();

            //if retroactively entering, we take the record's date.  otherwise we use the current time
            if(row.date.getDate()!=date.getDate() || row.date.getMonth()!=date.getMonth() || row.date.getFullYear()!=date.getFullYear())
                date = row.date;

            records.push({
                Id: row.Id,
                'id/curlocation/location': row.CurrentRoom+'-'+row.CurrentCage,
                date: date,
                project: row.project,
                account: row.account,
                code: row.code,
                qualifier: row.qualifier,
                route: row.route,
                concentration: row.concentration,
                conc_units: row.conc_units,
                amount: row.amount,
                amount_units: row.amount_units,
                volume: row.volume,
                vol_units: row.vol_units,
                dosage: row.dosage,
                dosage_units: row.dosage_units,
                parentid: row.primaryKey,
                performedby: null,
                remark: row.remark,
                category: 'Treatments'
            });
        }, this);

        if (this.targetStore){
            this.targetStore.addRecords(records);
        }

        Ext.Msg.hide();
    }

});
Ext.reg('ehr-treatmentselector', EHR.ext.TreatmentSelector);

/**
 * This should probably be deprecated.  It was originally created to supplement EHR.ext.TreatmentSelector
 * by allowing admin users to pick a date (the normal one will only query treatments on the current date.
 * This was necessary to allow users to retroactively mark treatments as complete.  However, EHR.ext.TreatmentSelector
 * was modified to conditionally show the date field, which is probably a better solution.
 */
EHR.ext.TreatmentSelector2 = Ext.extend(EHR.ext.TreatmentSelector, {
    initComponent: function()
    {
        EHR.ext.TreatmentSelector2.superclass.initComponent.call(this, arguments);
        this.dateField.setVisible(true);
    }
});
Ext.reg('ehr-treatmentselector2', EHR.ext.TreatmentSelector2);


/*
 * @class
 * This provides the UI to copy records from a previous necropsy into the current one.  The users selects which dataset(s) to copy from
 * The code then selects all records from these datasets.  It will only copy the fields specified in .onMultiLoad(), since it would
 * not make sense to copy Id/Date/Caseno, etc.  It is connected to the 'Copy From Necropsy' button in the necropsy form.
 */
EHR.ext.NecropsyCopyPanel = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.apply(this, {
            layout: 'form'
            //,title: 'Copy Necropsy'
            ,autoHeight: true
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: 350
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'textfield',
                fieldLabel: 'Case No',
                ref: 'caseField'
            },{
                fieldLabel: 'Include Organ Weights?'
                ,ref: 'Organ Weights Field'
                ,xtype: 'checkbox'
                ,checked: true
            },{
                fieldLabel: 'Include Tissues?'
                ,ref: 'Tissue Samples Field'
                ,xtype: 'checkbox'
                ,checked: true
            },{
                fieldLabel: 'Include Histology?'
                ,ref: 'Histology Field'
                ,xtype: 'checkbox'
                ,checked: true
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.doQuery();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.NecropsyCopyPanel.superclass.initComponent.call(this, arguments);
    },

    doQuery: function(){
        var caseno = this.caseField.getValue();
        if(!caseno){
            alert('Must enter case number');
            return;
        }

        caseno = caseno.toLowerCase();

        Ext.Msg.wait('Loading...');
        this.ownerCt.hide();

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'Necropsies',
            columns: 'objectid',
            filterArray: [
                LABKEY.Filter.create('caseno', caseno, LABKEY.Filter.Types.EQUAL)
            ],
            scope: this,
            success: this.onLoadNecropsy,
            failure: EHR.Utils.onError
        });

    },
    onLoadNecropsy: function(data){
        if(!data || !data.rows.length){
            Ext.Msg.hide();
            alert('Unable to find necropsy');
            return;
        }

        this.necropsyObjectId = data.rows[0].objectid;

        this.multi = new LABKEY.MultiRequest();
        this.requestedDatasets = [];
        Ext.each(['Histology', 'Tissue Samples', 'Organ Weights'], this.addDatasetQuery, this);
        this.multi.send(this.onMultiLoad, this);


    },
    addDatasetQuery: function(queryName){
        if(this[queryName+' Field'].checked){
            this.requestedDatasets.push(queryName);
            this.multi.add(LABKEY.Query.selectRows, {
                schemaName: 'study',
                queryName: queryName,
                filterArray: [
                    LABKEY.Filter.create('parentid', this.necropsyObjectId, LABKEY.Filter.Types.EQUAL)
                ],
                scope: this,
                success: function(results){
                    this[queryName+'Results'] = results;
                },
                failure: EHR.Utils.onError
            });
        }
    },
    onMultiLoad: function(){
        Ext.each(this.requestedDatasets, function(queryName){
            var results = this[queryName+'Results'];
            if(!results){
                alert('No records found for ')
            }
            else {
                var records = [];
                Ext.each(results.rows, function(row)
                {
                    records.push({
                        tissue: row.tissue,
                        qualifier: row.qualifier,
                        remark: row.remark,

                        //tissues
                        preservation: row.preservation,
                        quantity: row.quantity,
                        recipient: row.recipient,

                        //histology
                        slideNum: row.slideNum,
                        stain: row.stain
                    });
                }, this);

                if (records.length){
                    var store = this.targetStore.get('study||'+queryName+'||||');
                    if(store)
                        store.addRecords(records);
                }
            }
        }, this);

        Ext.Msg.hide();
    }
});
Ext.reg('ehr-necropsycopy', EHR.ext.NecropsyCopyPanel);


/**
 * @class
 * This is designed to be generic UI to sort a store client-side, based on multiple fields.  At time of writing, this is
 * only used in necropsy and biopsy for the purpose of sorting histology, tissues, etc.  However, it could in theory be added
 * as an option to any EHR form section.
 */
EHR.ext.StoreSorterPanel = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        var storeData = [];
        this.targetStore.fields.each(function(field){
            if(!field.isHidden)
                storeData.push([field.name, field.fieldLabel]);
        }, this);

        this.sortFields = new Ext.data.ArrayStore({
            fields: [
                'name',
                'label'
            ],
            idIndex: 0,
            data: storeData
        });

        Ext.apply(this, {
            layout: 'form'
            ,ref: 'theForm'
            ,autoHeight: true
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            //,width: 250
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'combo'
                ,emptyText:''
                ,fieldLabel: 'Sort 1'
                ,displayField:'label'
                ,valueField: 'name'
                ,typeAhead: true
                ,editable: true
                ,mode: 'local'
                ,triggerAction: 'all'
                ,store: this.sortFields
                ,ref: 'sortField'
            },{
                xtype: 'combo'
                ,emptyText:''
                ,fieldLabel: 'Sort 2'
                ,displayField:'label'
                ,valueField: 'name'
                ,typeAhead: true
                ,editable: true
                ,mode: 'local'
                ,triggerAction: 'all'
                ,store: this.sortFields
                ,ref: 'sortField2'
            },{
                xtype: 'combo'
                ,emptyText:''
                ,fieldLabel: 'Sort 3'
                ,displayField:'label'
                ,valueField: 'name'
                ,typeAhead: true
                ,editable: true
                ,mode: 'local'
                ,triggerAction: 'all'
                ,store: this.sortFields
                ,ref: 'sortField3'
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.doSort();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.StoreSorterPanel.superclass.initComponent.call(this);
    },
    doSort: function(){
        var field1 = this.ownerCt.theForm.sortField.getValue();
        var field2 = this.ownerCt.theForm.sortField2.getValue();
        var field3 = this.ownerCt.theForm.sortField3.getValue();

        if(!field1){
            alert('Must pick a field');
            return;
        }

        this.ownerCt.hide();

        field1 = this.targetStore.fields.get(field1);
        field2 = this.targetStore.fields.get(field2);
        field3 = this.targetStore.fields.get(field3);

        var sortArray = [];

        sortArray.push({term: field1.dataIndex});
        if(field1.lookup){
            sortArray[0].storeId = LABKEY.ext.FormHelper.getLookupStoreId(field1);
            sortArray[0].displayField = field1.lookup.displayColumn;
            sortArray[0].valueField = field1.lookup.keyColumn;
        }

        if(field2){
            sortArray.push({term: field2.dataIndex});
            if(field2.lookup){
                sortArray[1].storeId = LABKEY.ext.FormHelper.getLookupStoreId(field2);
                sortArray[1].displayField = field2.lookup.displayColumn;
                sortArray[1].valueField = field2.lookup.keyColumn;
            }
        }

        if(field3){
            sortArray.push({term: field3.dataIndex});
            if(field3.lookup){
                sortArray[2].storeId = LABKEY.ext.FormHelper.getLookupStoreId(field3);
                sortArray[2].displayField = field3.lookup.displayColumn;
                sortArray[2].valueField = field3.lookup.keyColumn;
            }
        }

        this.targetStore.data.sort('ASC', EHR.Utils.sortStore(sortArray));
        this.targetStore.fireEvent('datachanged', this.targetStore);

    }
});
Ext.reg('ehr-storesorterpanel', EHR.ext.StoreSorterPanel);


/**
 * @class
 * This provides the UI which allows the user to import scheduled blood draws to the current task.  Note that this works slightly
 * differently than adding scheduled treatments.  For blood, adding a request creates an actual record in study.blood draws.  This request
 * does not initiall have a taskId.  When the user attempts to add scheduled blood to a task, it will query all blood records
 * that are approved requests, but lack a taskId (aka not already assigned to a different task).  It will update these records with the taskId of the
 * current task, and also change the date to reflect the current time.  It then reloads the active blood draws store, which will cause it to
 * load these records (because we just updated their taskId field).
 */
EHR.ext.BloodSelectorPanel = Ext.extend(Ext.Panel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,title: 'Import Scheduled Blood Draws'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: 350
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'datefield'
                ,fieldLabel: 'Date'
                ,value: new Date()
                ,hidden: !EHR.Security.hasPermission('Completed', 'update', {queryName: 'Blood Draws', schemaName: 'study'})
                ,ref: 'dateField'
            },{
                xtype: 'combo'
                ,emptyText:''
                ,fieldLabel: 'Area (optional)'
                ,displayField:'area'
                ,valueField: 'area'
                ,typeAhead: true
                ,editable: true
                ,triggerAction: 'all'
                ,store: new LABKEY.ext.Store({
                    schemaName: 'ehr_lookups',
                    queryName: 'areas',
                    sort: 'area',
                    autoLoad: true
                }),
                ref: 'areaField'
            },{
                emptyText:''
                ,fieldLabel: 'Room'
                ,ref: 'roomField'
                ,xtype: 'textfield'
                ,listeners: {
                    render: function(field){
                        field.el.set({autocomplete: 'off'});
                    },
                    change: function(field, room){
                        if(room){
                            room = room.replace(/[\s,;]+/g, ';');
                            room = room.replace(/(^;|;$)/g, '');
                            room = room.toLowerCase();
                            field.setValue(room);
                        }
                    }
                }
            },{
                xtype: 'textfield'
                ,ref: 'idField'
                ,fieldLabel: 'Id (optional)'
            },{
                emptyText:''
                ,fieldLabel: 'Assigned To'
                ,ref: 'billedbyField'
                ,xtype: 'combo'
                ,displayField:'description'
                ,valueField: 'value'
                ,typeAhead: true
                ,mode: 'local'
                ,triggerAction: 'all'
                ,editable: true
                ,value: 'a'
                ,store: new LABKEY.ext.Store({
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_billed_by',
                    sort: 'description',
                    autoLoad: true
                })
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.getRecords();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.BloodSelectorPanel.superclass.initComponent.call(this, arguments);
    },

    getFilterArray: function(button)
    {
        var room = (this.roomField ? this.roomField.getValue() : null);
        var area = (this.areaField ? this.areaField.getValue() : null);
        var billedby = (this.billedbyField ? this.billedbyField.getValue() : null);
        var Id = (this.idField ? this.idField.getValue() : null);

        if ((!room && !area && !Id) || !billedby)
        {
            alert('Must provide a room, area or Id and complete the \'assigned to\' field');
            return;
        }

        var filterArray = [];

        filterArray.push(LABKEY.Filter.create('date', this.dateField.getValue(), LABKEY.Filter.Types.DATE_EQUAL));

        filterArray.push(LABKEY.Filter.create('taskid', null, LABKEY.Filter.Types.ISBLANK));
        filterArray.push(LABKEY.Filter.create('drawStatus', 'Pending', LABKEY.Filter.Types.EQUAL));

        if (area)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/area', area, LABKEY.Filter.Types.EQUAL));

        if (room)
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', room, LABKEY.Filter.Types.EQUALS_ONE_OF));

        if(billedby)
            filterArray.push(LABKEY.Filter.create('billedby', billedby, LABKEY.Filter.Types.EQUALS_ONE_OF));

        if(Id)
            filterArray.push(LABKEY.Filter.create('Id', Id, LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getRecords: function(button)
    {
        var filterArray = this.getFilterArray();
        if (!filterArray || !filterArray.length)
        {
            return;
        }

        Ext.Msg.wait("Loading...");
        this.ownerCt.hide();

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'BloodSchedule',
            sort: 'Id/curLocation/Room,Id',
            columns: 'lsid,Id,date',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: EHR.Utils.onError
        });

    },
    onSuccess: function(results){
        if (!results.rows || !results.rows.length)
        {
            alert('No uncompleted blood draws were found.');
            Ext.Msg.hide();
            return;
        }

        var ids = {};
        var records = [];
        var obj;
        var dateVal = new Date();
        Ext.each(results.rows, function(row){
            obj = {
                lsid: row.lsid,
                taskid: this.parentPanel.formUUID,
                date: dateVal
            };

            if(EHR.Security.getQCStateByLabel('In Progress')){
                obj.qcState = EHR.Security.getQCStateByLabel('In Progress').RowId;
            }

            records.push(obj);
        }, this);

        if (this.targetStore){
            //we save the task to be sure there is a record of it
            var store = Ext.StoreMgr.get('ehr||tasks||||');
            var record = store.getAt(0);
            if(record.phantom){
                Ext.Msg.wait('Saving...');
                store.on('commitcomplete', function(c){
                    doUpdate(this.targetStore);
                }, this, {single: true});
                store.commitRecords([record]);
            }
            else {
                doUpdate(this.targetStore);
            }

            function doUpdate(targetStore){
                LABKEY.Query.updateRows({
                    schemaName: 'study',
                    queryName: 'Blood Draws',
                    scope: this,
                    rows: records,
                    success: function(data){
                        targetStore.load();
                        Ext.Msg.hide();
                    },
                    failure: EHR.Utils.onError
                });
            }
        }
    }

});
Ext.reg('ehr-bloodselector', EHR.ext.BloodSelectorPanel);


/**
 * @class
 * This is a subclass of EHR.ext.FormPanel designed to be used by the top-most section of TaskPanels.  The primary purpose was to allow distinct
 * buttons to be present in this form secion; however, many of these buttons have been disabled in favor of other mechanisms.
 */
EHR.ext.HeaderFormPanel = Ext.extend(EHR.ext.FormPanel, {
    initComponent: function()
    {
        Ext.apply(this, {
            autoHeight: true
            //,autoWidth: true
            ,name: 'tasks'
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
            ,plugins: ['databind']
            ,readOnly: false
            ,buttonAlign: 'left'
            ,tbar: {hidden: true}
//            ,buttons: [{
//                xtype: 'button',
//                text: 'Apply Template',
//                scope: this,
//                disabled: !this.canUseTemplates===false,
//                handler: this.applyTemplate
//            },{
//                xtype: 'button',
//                text: 'Save As Template',
//                scope: this,
//                disabled: !this.canUseTemplates===false,
//                handler: this.saveTemplate
//            },{
//                xtype: 'button',
//                text: 'Print Form',
//                scope: this,
//                handler: this.printFormHandler
//            }]
        });

        EHR.Utils.rApplyIf(this, {
            bindConfig: {
                disableUnlessBound: false
                ,bindOnChange: false
                ,autoBindRecord: true
                ,createRecordOnLoad: true
                ,showDeleteBtn: false
            }
            ,ref: 'importPanelHeader'
            ,defaults: {
                width: 160,
                border: false,
                bodyBorder: false,
                importPanel: this.importPanel || this
            }
        });

        EHR.ext.HeaderFormPanel.superclass.initComponent.call(this, arguments);

    },
    saveTemplate: function(){
        var theWindow = new EHR.ext.SaveTemplatePanel({
            width: 600,
            height: 300,
            importPanel: this.importPanel,
            formType: this.formType
        });
        theWindow.show();
    },

    applyTemplate: function(){
        var theWindow = new Ext.Window({
            closeAction:'hide',
            title: 'Apply Template To Form',
            width: 350,
            items: [{
                xtype: 'ehr-applytemplatepanel',
                ref: 'theForm',
                importPanel: this.importPanel,
                formType: this.formType
            }]
        });
        theWindow.show();
    },
    printFormHandler: function(){
        window.location = LABKEY.ActionURL.buildURL(
            'ehr',
            'printTask.view',
            (this.containerPath || LABKEY.ActionURL.getContainer()),
            {
                taskid: this.formUUID,
                formtype: this.formType,
                _print: 1
            }
        );
    }
});
Ext.reg('ehr-headerformpanel', EHR.ext.HeaderFormPanel);


/**
 * @class
 * This panel is designed to display the animal's abstract in an ImportPanel.  It listens for the participantchange event on the bound
 * ImportPanel and will fire participantloaded when the participant's information is available.
 *
 */
EHR.ext.AbstractPanel = function(config){
    EHR.ext.AbstractPanel.superclass.constructor.call(this, config);
};
Ext.extend(EHR.ext.AbstractPanel, Ext.FormPanel, {
    initComponent: function()
    {
        var panelDefaults = {
            border: false,
            bodyBorder: false,
            labelStyle: 'padding: 0px;'
        };

        Ext.apply(this, {
            name: 'abstract'
            ,title: 'Animal Info'
            ,labelWidth: 120
            ,autoHeight: true
            ,border: true
            ,bodyBorder: false
            ,participantMap: new Ext.util.MixedCollection(null, function(f){return f.Id})
            ,defaults: panelDefaults
            ,defaultType: 'displayfield'
            ,style: 'margin-bottom: 15px'
            ,bodyStyle: 'padding:5px'
            ,ref: '../../abstract'
            ,items: [{
                xtype: 'panel',
                layout: 'form',
                labelWidth: 170,
                defaults: panelDefaults,
                ref: 'placeForAbstract',
                //275 is the height of the Clinical Summary view
                height: this.boxMinHeight || 300,
                items: [{html: 'No Animal Selected'}]
            },{
                xtype: 'panel',
                defaults: panelDefaults,
                border: false,
                bodyBorder: false,
                items: [{tag: 'div', ref: '../placeForQwp'}]
            }]
        });
        EHR.ext.AbstractPanel.superclass.initComponent.call(this, arguments);

        this.addEvents('participantchange', 'participantloaded');
        this.enableBubble('participantloaded');

        if (this.importPanel){
            this.mon(this.importPanel, 'participantchange', this.onParticipantChange, this, {delay: 50});
            this.importPanel.participantMap = this.participantMap;
        }

    },
    onParticipantChange: function(field)
    {
        field.participantMap = this.participantMap;
        this.participantField = field;

        var id = field.getValue();

        //no need to reload if ID is unchanged
        if (this.loadedId == id){
//            console.log('animal id is the same, no reload needed');
            return;
        }

        this.loadedId = id;

        this.placeForAbstract.removeAll();
        this.placeForQwp.body.update();

        if(!id){
            this.placeForAbstract.add({html: 'No Animal Selected'});
            this.doLayout();
        }
        else {
            this.participantMap.add(id, {loading: true});

            LABKEY.Query.selectRows({
                schemaName: this.schemaName || 'study',
                queryName: this.queryName || 'demographics',
                viewName: this.viewName || 'Clinical Summary',
                //columns: '',
                filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                successCallback: function(data){
                    this.renderAbstract(data, id, field)
                }
            });

            if(this.queryConfig){
                var qwpConfig = {
                    allowChooseQuery: false,
                    allowChooseView: true,
                    showRecordSelectors: true,
                    frame: 'none',
                    showDeleteButton: false,
                    timeout: 0,
                    linkTarget: '_blank',
                    renderTo: this.placeForQwp.body.id,
                    scope: this,
                    failure: EHR.Utils.onError
                };
                Ext.apply(qwpConfig, this.queryConfig);

                qwpConfig.filterArray = qwpConfig.filterArray || [];
                if(qwpConfig.filterColumn)
                    qwpConfig.filterArray.push(LABKEY.Filter.create(qwpConfig.filterColumn, id, LABKEY.Filter.Types.EQUAL));
                else
                    qwpConfig.filterArray.push(LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL));

                this.QWP = new LABKEY.QueryWebPart(qwpConfig);
            }
        }
    },
    renderAbstract: function(data, id, field)
    {
        this.placeForAbstract.removeAll();
        if (!data.rows.length)
        {
            this.participantMap.replace(id, {});
            this.placeForAbstract.add({html: 'Id not found: '+id});
        }
        else
        {
            var row = data.rows[0];
//            if (!this.allowDeadAnimals && row['calculated_status'] != 'Alive'){
//                alert('Animal: '+id+' is not currently alive and at the center');
//            }

            Ext.each(data.metaData.fields, function(c)
            {
                if (c.hidden)
                    return false;
                var rawValue = row[c.name];
                if (Ext.isNumber(rawValue))
                {
                    rawValue = Ext.util.Format.number(rawValue, "0.00");
                }
                var value = row['_labkeyurl_' + c.name] ? '<a href="' + row['_labkeyurl_' + c.name] + '" target=_blank>' + rawValue + '</a>' : rawValue;
                this.placeForAbstract.add({id: c.name, xtype: 'displayfield', fieldLabel: c.caption, value: value, submitValue: false});
            }, this);

            //this.loadedId = row['Id'];
            this.participantMap.replace(row['Id'], row);
            this.fireEvent('participantloaded', this, row['Id'], row);
        }

        this.doLayout();
        this.expand();
    }
});
Ext.reg('ehr-abstractpanel', EHR.ext.AbstractPanel);


/**
 * @class
 * A subclass of EHR.ext.Abstract panel.  Instead of simply displaying the abstract, this panel also displays information
 * about the selected protocol, including number assigned and distinct assignments by species
 */
EHR.ext.AssignmentAbstractPanel = Ext.extend(EHR.ext.AbstractPanel, {
    initComponent: function(){
        EHR.ext.AssignmentAbstractPanel.superclass.initComponent.call(this, arguments);

        this.setTitle('Protocol Details');

        this.removeAll();
        this.add({
            xtype: 'panel',
            ref: 'placeForQwp',
            border: false,
            defaults: {border: false},
            items: [{
                html: 'No Protocol Selected'
            }]
        });
    },
    onParticipantChange: function(field){
        if(field){
            var theForm = field.findParentByType('ehr-formpanel').getForm();
            var projectField = theForm.findField('project');

            if(projectField){
                var proj = projectField.getValue();
                if(!proj){
                    this.doUpdate();
                }
                else {
                    var projectRec = projectField.store.find('project', proj);
                    if(projectRec!=-1){
                        projectRec = projectField.store.getAt(projectRec);
                        this.doUpdate(projectRec.get('protocol'));
                    }
                    else {
                        this.doUpdate();
                    }
                }
            }
        }
    },
    doUpdate: function(protocol){
        if(this.loadedProtocol == protocol){
            return;
        }

        this.loadedProtocol = protocol;

        this.placeForQwp.removeAll();
        this.placeForQwp.body.update();

        if(protocol){
            this.QWP = new LABKEY.QueryWebPart({
                allowChooseQuery: false,
                allowChooseView: true,
                showRecordSelectors: true,
                frame: 'none',
                showDeleteButton: false,
                timeout: 0,
                linkTarget: '_blank',
                renderTo: this.placeForQwp.body.id,
                schemaName: 'ehr',
                queryName: 'protocolTotalAnimalsBySpecies',
                //viewName: 'With Animals',
                scope: this,
                failure: EHR.Utils.onError,
                filterArray: [LABKEY.Filter.create('protocol', protocol, LABKEY.Filter.Types.EQUAL)]
            });
        }
        else {
            this.placeForQwp.add({html: 'No Protocol Selected'});
        }

        this.doLayout();
    }
});
Ext.reg('ehr-assignmentabstractpanel', EHR.ext.AssignmentAbstractPanel);


/**
 * @class
 * This is an ext panel designed to load a LABKEY QueryWebPart.  The advantage of using this panel is that it will fit into a larger
 * Ext layout more easily and can be manipulated like a normal Ext container.  In the EHR it is used primarily by the UI on the 'Enter Data'
 * or Manage Requests pages.
 */
EHR.ext.QueryPanel = Ext.extend(Ext.Panel, {
    initComponent: function(){
        Ext.applyIf(this, {
            //width: 'auto',
            layout: 'fit',
            autoScroll: true,
            border: false,
            //headerStyle: 'background-color : transparent;background : transparent;',
            frame: false,
            autoHeight: true,
            listeners: {
                scope: this,
                activate: this.loadQuery,
                click: this.loadQuery
            },
            bodyStyle: 'padding:5px;'
        });

        EHR.ext.QueryPanel.superclass.initComponent.call(this, arguments);

        if(this.autoLoadQuery){
            this.on('render', this.loadQuery, this, {single: true});
        }
    },
    loadQuery: function(tab){
        tab = tab || this;

        if(tab.isLoaded)
            return;

        if(!tab.rendered){
            this.on('render', this.loadQuery, this, {single: true});
            return;
        }

        var target = tab.body;
        var qwpConfig = {
            schemaName: tab.schemaName,
            queryName: tab.queryName,
            filters: tab.filterArray,
            allowChooseQuery: false,
            allowChooseView: true,
            showRecordSelectors: true,
            showDetailsColumn: false,
//            showUpdateColumn: false,
            frame: 'none',
            showDeleteButton: false,
            timeout: 0,
            linkTarget: '_blank',
            renderTo: target.id,
            failure: EHR.Utils.onError,
            success: function(result){
                tab.isLoaded = true;
            },
            scope: this
        };
        Ext.apply(qwpConfig, tab.queryConfig);

        tab.QWP = new LABKEY.QueryWebPart(qwpConfig);

    }
});
Ext.reg('ehr-qwppanel', EHR.ext.QueryPanel);

/**
 * @class
 * This provides the UI to duplicate one or more records from an EHR.ext.GridFormPanel.  It allows the user to pick the number of copies
 * per record and which fields to copy
 */
EHR.ext.RecordDuplicatorPanel = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,bodyBorder: true
            ,border: true
            ,bodyStyle: 'padding:5px'
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'numberfield',
                fieldLabel: 'Number of Records',
                ref: 'newRecs',
                value: 1
            },{
                xtype: 'fieldset',
                fieldLabel: 'Choose Fields to Copy',
                items: []
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: function(s){
                    this.duplicate();
                    this.ownerCt.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        this.populateForm();

        if(!this.records || !this.records.length){
            this.ownerCt.hide();
        }
        EHR.ext.RecordDuplicatorPanel.superclass.initComponent.call(this, arguments);
    },

    populateForm: function(){
        this.targetStore.fields.each(function(f){
            if (!f.hidden && f.shownInInsertView && f.allowDuplicateValue!==false){
                this.items[1].items.push({
                    xtype: 'checkbox',
                    dataIndex: f.dataIndex,
                    name: f.dataIndex,
                    fieldLabel: f.fieldLabel,
                    checked: !f.noDuplicateByDefault
                })
            }
        }, this);

    },

    duplicate: function(){
        var newRec;
        for (var i=0;i<this.newRecs.getValue();i++){
            Ext.each(this.records, function(rec){
                var data = {};
                this.getForm().items.each(function(f){
                    if(f.checked){
                        data[f.dataIndex] = rec.get(f.dataIndex);
                    }
                }, this);
                newRec = this.targetStore.addRecord(data);
            }, this);
        }
    }
});
Ext.reg('ehr-recordduplicator', EHR.ext.RecordDuplicatorPanel);


/**
 * @class
 * This panel provides the UI that allows the user to apply a saved template to the current form.  It also provides UI to let the user
 * override existing values on this saved template.
 */
EHR.ext.ApplyTemplatePanel = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            layout: 'form'
            ,bodyBorder: true
            ,border: true
            ,bodyStyle: 'padding:5px'
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'combo',
                displayField: 'title',
                valueField: 'entityid',
                triggerAction: 'all',
                fieldLabel: 'Template Name',
                ref: 'templateName',
                store: new LABKEY.ext.Store({
                    schemaName: 'ehr',
                    queryName: 'my_formtemplates',
                    sort: 'title',
                    autoLoad: true,
                    filterArray: [LABKEY.Filter.create('formtype', this.formType, LABKEY.Filter.Types.EQUAL)]
                })
            },{
                xtype: 'checkbox',
                fieldLabel: 'Customize Values',
                ref: 'customizeValues',
                checked: false
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.ownerCt.hide();
                }
            }]
        });

        EHR.ext.ApplyTemplatePanel.superclass.initComponent.call(this, arguments);
    },

    onSubmit: function(){
        this.ownerCt.hide();
        var templateId = this.templateName.getValue();
        if(!templateId)
            return;

        this.loadTemplate(templateId);
    },

    loadTemplate: function(templateId){
        if(!templateId)
            return;

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'formtemplaterecords',
            filterArray: [
                LABKEY.Filter.create('templateId', templateId, LABKEY.Filter.Types.EQUAL)
            ],
            sort: '-rowid',
            success: this.onLoadTemplate,
            failure: EHR.Utils.onError,
            scope: this
        });

        Ext.Msg.wait("Loading Template...");
    },

    onLoadTemplate: function(data){
        if(!data || !data.rows.length){
            Ext.Msg.hide();
            return;
        }

        var toAdd = {};
        Ext.each(data.rows, function(row){
            var data = Ext.util.JSON.decode(row.json);
            var store = Ext.StoreMgr.get(row.storeid);

            //verify store exists
            if(!store){
                Ext.StoreMgr.on('add', function(){
                    this.onLoadTemplate(data);
                }, this, {single: true, delay: 200});
                return false;
            };

            //also verify it is loaded
            if(!store.fields && store.fields.length){
                store.on('load', function(){
                    this.onLoadTemplate(data);
                }, this, {single: true, delay: 200});
                return false;
            };

            if(!toAdd[store.storeId])
                toAdd[store.storeId] = [];

            toAdd[store.storeId].push(data);
        });

        if(this.customizeValues.checked)
            this.customizeData(toAdd);
        else
            this.loadTemplateData(toAdd);
    },

    customizeData: function(toAdd){
        Ext.Msg.hide();

        //create window
        this.theWindow = new Ext.Window({
            closeAction:'hide',
            title: 'Customize Values',
            width: 350,
            items: [{
                xtype: 'tabpanel',
                autoHeight: true,
                ref: 'theForm',
                activeTab: 0
            }],
            scope: this,
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: '../submit',
                scope: this,
                handler: this.onCustomize
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.theWindow.hide();
                }
            }]
        });

        for (var i in toAdd){
            this.addStore(i, toAdd[i]);
        }

        this.theWindow.show();
    },

    addStore: function(storeId, records){
        var store = Ext.StoreMgr.get(storeId);
        if(!store){
            alert('ERROR: Store not found');
            return;
        }

        var toAdd = {
            xtype: 'form',
            //layout: 'form',
            ref: 'thePanel',
            autoHeight: true,
            storeId: storeId,
            records: records,
            items: []
        };

        store.fields.each(function(f){
            if(!f.hidden && f.shownInInsertView && f.allowSaveInTemplate!==false && f.allowDuplicate!==false){
                var editor = store.getFormEditorConfig(f.name);
                editor.width= 200;
                if (f.inputType == 'textarea')
                    editor.height = 100;

                var values = [];
                Ext.each(records, function(data){
                    if(data[f.dataIndex]!==undefined){
                        values.push(f.convert(data[f.dataIndex], data));
                    }
                }, this);

                values = Ext.unique(values);

                if(values.length==1)
                    editor.value=values[0];
                else if (values.length > 1){
                    editor.xtype = 'displayfield';
                    editor.store = null;
                    editor.value = values.join('/');
                }

                toAdd.items.push(editor);
            }
        }, this);

        this.theWindow.theForm.add({
            bodyStyle: 'padding: 5px;',
            title: store.queryName,
            autoHeight: true,
            defaults: {
                border: false,
                bodyStyle: 'padding: 5px;'
            },
            items: [{
                html: '<b>'+records.length+' Record'+(records.length==1 ? '' : 's')+' will be added.</b><br>If you enter values below, these will be applied to all new records, overriding any saved values.'
            },
                toAdd
            ]
        });
    },

    loadTemplateData: function(toAdd){
        for (var i in toAdd){
            var store = Ext.StoreMgr.get(i);
            store.addRecords(toAdd[i])
        }

        Ext.Msg.hide();
    },

    onCustomize: function(){
        var toAdd = {};
        this.theWindow.theForm.items.each(function(tab){
            var values = tab.thePanel.getForm().getFieldValues(true);
            toAdd[tab.thePanel.storeId] = tab.thePanel.records;
            Ext.each(tab.thePanel.records, function(r){
                Ext.apply(r, values);
            }, this);
        }, this);

        this.loadTemplateData(toAdd);
        this.theWindow.hide();
    }
});
Ext.reg('ehr-applytemplatepanel', EHR.ext.ApplyTemplatePanel);


/**
 * @class
 * This panel provides the UI which allows the user to save existing records in a Form or Form section as a template.  It
 * gives the ability to choose which section(s) (ie. queries) should be saved and which field(s) per section to save.
 */
EHR.ext.SaveTemplatePanel = Ext.extend(Ext.Window, {
    initComponent: function()
    {
        Ext.apply(this, {
            closeAction:'hide'
            ,title: 'Save As Template'
            ,xtype: 'panel'
            ,autoScroll: true
            ,autoHeight: true
            ,boxMaxHeight: 600
            ,defaults: {
                border: false
                ,bodyStyle: 'padding: 5px;'
            }
            ,items: [{
                layout: 'form',
                autoScroll: true,
                bodyStyle: 'padding: 5px;',
                monitorValid: true,
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Template Name',
                    allowBlank: false,
                    ref: '../templateName',
                    listeners: {
                        scope: this,
                        change: function(f){
                            this.buttons[0].setDisabled(!f.getValue())
                        }
                    }
                },{
                    xtype: 'combo',
                    displayField: 'DisplayName',
                    valueField: 'UserId',
                    triggerAction: 'all',
                    mode: 'local',
                    listWidth: 300,
                    fieldLabel: 'User/Group',
                    //value: 0,
                    store: new LABKEY.ext.Store({
                        schemaName: 'core',
                        queryName: 'PrincipalsWithoutAdmin',
                        columns: 'UserId,DisplayName',
                        sort: 'Type,DisplayName',
                        autoLoad: true
                    }),
                    ref: '../templateUser'
                },{
                    xtype: 'displayfield',
                    value: 'NOTE: You can choose a user or group in order to limit which users can see the template.  Leave it blank to expose the template to everyone.  Pick your own user to make it visible to you only.  If you want to share it with a specific group (ie. vets or pathology), choose them from the list.'
                },{
                    xtype: 'textarea',
                    fieldLabel: 'Description',
                    width: 300,
                    ref: '../templateDescription'
                },{
                    html: 'You can elect to save either all or some of the records in this form as a template.  For each section, you can choose which fields to save.',
                    style: 'padding-top:10px;'
                }]
            },{
                xtype: 'tabpanel',
                activeTab: 0,
                ref: 'theForm',
                autoScroll: true
            }]
            ,scope: this
            ,buttons: [{
                text:'Submit',
                scope: this,
                disabled: true,
                handler: function(s){
                    this.onSubmit();
                    this.hide();
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(){
                    this.hide();
                }
            }]

        });

        EHR.ext.SaveTemplatePanel.superclass.initComponent.call(this, arguments);

        //function differently depending on whether we're bound to a grid or import panel
        if(this.grid)
            this.targetStore = this.grid.store;
        else
            this.targetStore = this.importPanel.store;

        if(!this.targetStore)
            return;
        else if (this.targetStore instanceof EHR.ext.StoreCollection)
            this.populateFromStoreCollection();
        else if (this.targetStore instanceof LABKEY.ext.Store)
            this.populateFromStore();

        this.on('show', function(){
            this.templateName.focus(false, 50);
        }, this);
    },
    populateFromStoreCollection: function(){
        var hasRecords = false;
        this.targetStore.each(function(s){
            if(s.canSaveInTemplate === false)
                return;

            this.addStore(s);
            if(s.getCount())
                hasRecords = true;
        }, this);

        if(!hasRecords){
            this.on('beforeshow', function(){return false}, this, {single: true});
            this.hide();
            Ext.Msg.alert('Error', 'There are no records to save.');
        }
    },
    populateFromStore: function(){
        if(!this.targetStore.getCount()){
            this.on('beforeshow', function(){return false}, this, {single: true});
            this.hide();
            Ext.Msg.alert('Error', 'There are no records to save.');
        }
        else
            this.addStore(this.targetStore);
    },
    addStore: function(store){
        var count = store.getCount();

        if(!count){
            return
        }
        var panel = {
            xtype: 'panel',
            title: store.queryName + ': '+count+' Record' + (count==1 ? '' : 's'),
            border: false,
            style: 'padding-bottom:10px;',
            autoHeight: true,
            storeId: store.storeId,
            items: [{
                xtype: 'fieldset',
                title: 'Choose Records To Save',
                items: [{
                    xtype: 'radiogroup',
                    style: 'padding-bottom:10px;',
                    //bodyStyle: 'padding: 5px;',
                    ref: '../recordSelector',
                    columns: 3,
                    //width: 400,
                    items: [{
                        fieldLabel: 'Include All',
                        inputValue: 'all',
                        checked: true,
                        name: store.storeId+'-radio'
                    },{
                        fieldLabel: 'Include None',
                        inputValue: 'none',
                        name: store.storeId+'-radio'
                    }]
                }]
            }]
        };

        if(this.grid){
            panel.items[0].items[0].items.push({
                fieldLabel: 'Selected Only',
                inputValue: 'selected',
                name: store.storeId+'-radio'
            });
        }

        panel = this.theForm.add(panel);

        var toAdd = {
            xtype: 'checkboxgroup',
            ref: '../fieldSelector',
            name: store.storeId,
            columns: 3,
            items: []
        };
        store.fields.each(function(f){
            if(!f.hidden && f.shownInInsertView && f.allowSaveInTemplate!==false && f.allowDuplicate!==false){
                toAdd.items.push({
                    xtype: 'checkbox',
                    dataIndex: f.dataIndex,
                    name: f.dataIndex,
                    fieldLabel: f.fieldLabel || f.name,
                    checked: !(f.noDuplicateByDefault || f.noSaveInTemplateByDefault)
                })
            }
        }, this);

        panel.add({
            xtype: 'fieldset',
            title: 'Choose Fields to Save',
            items: [toAdd]
        });
    },
    onSubmit: function(){
        this.hide();
        Ext.Msg.wait("Saving...");

        var tn = this.templateName.getValue();
        var rows = [];

        this.theForm.items.each(function(tab){
            var selections = tab.recordSelector.getValue().inputValue;
            var fields = tab.fieldSelector.getValue();

            if(!fields.length)
                return;
            if(selections == 'none')
                return;

            var store = Ext.StoreMgr.get(tab.storeId);

            var records = [];
            if(selections == 'selected'){
                records = this.grid.getSelectionModel().getSelections();
                if(!records.length){
                    Ext.Msg.hide();
                    Ext.Msg.alert('Error', 'No records were selected in the grid');
                }
            }
            else
                records = store.data.items;

            Ext.each(records, function(rec){
                var json = {};
                Ext.each(fields, function(chk){
                    json[chk.dataIndex] = rec.get(chk.dataIndex);
                }, this);

                rows.push({
                    templateId: null,
                    storeId: store.storeId,
                    json: Ext.util.JSON.encode(json),
                    templateName: tn
                })
            }, this);
        }, this);

        if(!rows.length){
            Ext.Msg.hide();
            Ext.Msg.alert('Error', "No records selected");
            return;
        };

        this.saveTemplate(rows);
    },

    saveTemplate: function(rows){
        LABKEY.Query.insertRows({
            schemaName: 'ehr',
            queryName: 'formtemplates',
            scope: this,
            rows: [{
                title: this.templateName.getValue(),
                userid: this.templateUser.getValue(),
                description: this.templateDescription.getValue(),
                formType: this.formType
            }],
            success: function(rows){return function(data){
                Ext.each(rows, function(r){
                    r.templateId = data.rows[0].entityid;
                }, this);

                LABKEY.Query.insertRows({
                    schemaName: 'ehr',
                    queryName: 'formTemplateRecords',
                    rows: rows,
                    failure: EHR.Utils.onError,
                    success: function(){
                        Ext.Msg.hide();
                    }
                });
            }}(rows),
            failure: EHR.Utils.onError
        });
    }
});
Ext.reg('ehr-savetemplatepanel', EHR.ext.SaveTemplatePanel);


/*
 * Although this has been commented out, this is designed to present a basic EHR.ext.Formpanel to the user in an Ext window.  This
 * can be useful to allow fast insertion of records into a table.  It was originally used to allow vets to enter clinical remarks;
 * however, this was removed in favor of all remarks going through the Task pathway.  This code was note removed because the basic
 * mechanism was prove useful in other contexts.
 */
//EHR.ext.FormWindow = Ext.extend(Ext.Window, {
//    initComponent: function()
//    {
//        Ext.apply(this, {
//            closeAction:'hide'
//            ,title: 'Enter Data'
//            ,xtype: 'panel'
//            ,autoScroll: true
//            ,autoHeight: true
//            ,boxMaxHeight: 600
//            ,defaults: {
//                border: false
//                ,bodyStyle: 'padding: 5px;'
//            }
//            ,items: [{
//                xtype: 'ehr-formpanel'
//                ,schemaName: this.schemaName
//                ,queryName: this.queryName
//                ,columns: EHR.Metadata.Columns[this.queryName]
//                ,metadata: EHR.Metadata.getTableMetadata(this.queryName, ['Task'])
//            }]
//            ,scope: this
//        });
//
//        EHR.ext.FormWindow.superclass.initComponent.call(this, arguments);
//    }
//});
//Ext.reg('ehr-formwindow', EHR.ext.FormWindow);


