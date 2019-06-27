/*
 * Copyright (c) 2012-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.reports');

//this contains WNPRC-specific reports that should be loaded on the animal history page
//this file is registered with EHRService, and should auto-load whenever EHR's
//dependencies are reuqested, provided this module is enabled

EHR.reports.viralLoads = function(panel, tab){
    var subjects = tab.filters.subjects || [];
    if (subjects.length){
        for (var i=0;i<subjects.length;i++){
            var subject = subjects[i];

            var filterArray = panel.getFilterArray(tab);
            filterArray.nonRemovable.push(LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL));

            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'ViralLoads',
                filterArray: filterArray.removable.concat(filterArray.nonRemovable),
                columns: 'Id,date,LogVL,Virus,SampleType,Comments',
                sort: 'Id,-date, Virus',
                requiredVersion: 9.1,
                success: Ext4.Function.pass(function(subj, results){
                    if (!results.rowCount){
                        tab.update('');
                        tab.add({
                            html: 'No animal selected to display Viral Load data'
                        });
                        return;
                    }
                    //virusType = (cloneObject(results));
                    var virusMap = new Map();
                    Ext4.each(results.rows, function(row){
                        console.log(row['Virus']);
                        var virusAndSample = row['Virus'].value +";"+ row['SampleType'].value;
                        if (virusMap.get(virusAndSample) === undefined){
                            virusMap.set(virusAndSample,1);
                        }else{
                            //var numberViralLoads = virusMap.get(row['Virus'].value);
                            //numberViralLoads++;
                            virusMap.set(virusAndSample, virusMap.get(virusAndSample)+1);

                        }



                    }, this);

                    var virusType;

                    tab.add({
                        xtype: 'tabpanel',
                        style: 'margin-bottom: 20px',
                        itemId: 'tabArea'

                    });
                    var panelOrder = 0;
                    var target = tab.down('#tabArea');

                    virusMap.forEach(function (value, key) {
                        console.log(key + ' number of VLs = '+ value );
                        var arrayFilter = key.split(";",2);
                        virusType = (cloneObject(results));

                        if (arrayFilter[1] !== "null"){
                            //clear array of clone
                            console.log ('first filter '+arrayFilter[0]);
                            virusType.rows = results.rows.filter(item => (item.Virus.value === arrayFilter[0] && item.SampleType.value === arrayFilter[1]));
                            if (arrayFilter[1] === 'Plasma'){
                                panelOrder = 0;
                                target.insert(panelOrder, {
                                    xtype: 'ldk-graphpanel',
                                    title: 'Viral Load: ' + subj + ' '+key,
                                    plotConfig: {
                                        results: virusType,
                                        title: 'Viral Loads: ' + subj + ' '+ key,
                                        height: 400,
                                        width: 900,
                                        yLabel: 'Log Copies/mL',
                                        xLabel: 'Date',
                                        xField: 'date',
                                        grouping: ['Id'],
                                        layers: [{
                                            y: 'LogVL',
                                            name: 'Viral Load'
                                        }]
                                    }
                                });

                            } else if (arrayFilter[1] === 'Urine'){
                                panelOrder = 1;
                                target.insert(panelOrder, {
                                    xtype: 'ldk-graphpanel',
                                    title: 'Viral Load: ' + subj + ' '+key,
                                    plotConfig: {
                                        results: virusType,
                                        title: 'Viral Loads: ' + subj + ' '+ key,
                                        height: 400,
                                        width: 900,
                                        yLabel: 'Log Copies/mL',
                                        xLabel: 'Date',
                                        xField: 'date',
                                        grouping: ['Id'],
                                        layers: [{
                                            y: 'LogVL',
                                            name: 'Viral Load'
                                        }]
                                    }
                                });

                            }
                            else if (arrayFilter[1] === 'Tissue'){
                                panelOrder++;
                                //filterArray.nonRemovable.push(LABKEY.Filter.create('SampleType', 'Tissue', LABKEY.Filter.Types.EQUAL));
                                target.insert(panelOrder, {
                                    xtype: 'ldk-querypanel',
                                    style: 'margin-bottom:20px;',
                                    title: 'Viral Load: ' + subj + ' '+key,
                                    queryConfig: panel.getQWPConfig({
                                        title: 'Viral Load: ' + subj + ' '+key,
                                        schemaName: 'study',
                                        queryName: 'ViralLoads',
                                        filterArray: [
                                            LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL),
                                            LABKEY.Filter.create('SampleType', arrayFilter[1], LABKEY.Filter.Types.EQUAL)


                                        ],
                                        columns: 'Id,date,LogVL,Virus,SampleType,Comments',
                                        frame: true
                                    })
                                });

                            }else {
                                panelOrder++;
                                //filterArray.nonRemovable.push(LABKEY.Filter.create('SampleType', 'Tissue', LABKEY.Filter.Types.EQUAL));
                                target.insert(panelOrder, {
                                    xtype: 'ldk-querypanel',
                                    style: 'margin-bottom:20px;',
                                    title: 'Viral Load: ' + subj + ' '+key,
                                    queryConfig: panel.getQWPConfig({
                                        title: 'Viral Load: ' + subj + ' '+key,
                                        schemaName: 'study',
                                        queryName: 'ViralLoads',
                                        filterArray: [
                                            LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL),
                                            LABKEY.Filter.create('SampleType', arrayFilter[1] , LABKEY.Filter.Types.EQUAL)


                                        ],
                                        columns: 'Id,date,LogVL,Virus,SampleType,Comments',
                                        frame: true
                                    })
                                });

                            }
                        } else {

                            //if (item.Comment.value === 'plas'){
                                virusType.rows = results.rows.filter(item => (item.Virus.value === arrayFilter[0] && (item.Comments.value === 'plas' || item.Comments.value === 'plasma')));
                                panelOrder = 0;
                                target.insert(panelOrder, {
                                    xtype: 'ldk-graphpanel',
                                    title: 'Viral Load: ' + subj + ' '+arrayFilter[0],
                                    plotConfig: {
                                        results: virusType,
                                        title: 'Viral Loads: ' + subj + ' '+ arrayFilter[0]+ ' '+ 'plasma',
                                        height: 400,
                                        width: 900,
                                        yLabel: 'Log Copies/mL',
                                        xLabel: 'Date',
                                        xField: 'date',
                                        grouping: ['Id'],
                                        layers: [{
                                            y: 'LogVL',
                                            name: 'Viral Load'
                                        }]
                                    }
                                });


                                virusType.rows = results.rows.filter(item => (item.Virus.value === arrayFilter[0] && item.SampleType.value === null && item.Comments.value !== 'plas' ));

                                 if(virusType.rows.length>0) {

                                     target.insert(panelOrder, {
                                         xtype: 'ldk-querypanel',
                                         style: 'margin-bottom:20px;',
                                         title: 'Viral Load: ' + subj + ' ' + arrayFilter[0],
                                         queryConfig: panel.getQWPConfig({
                                             title: 'Viral Load: ' + subj + ' ' + arrayFilter[0],
                                             schemaName: 'study',
                                             queryName: 'ViralLoads',
                                             filterArray: [
                                                 LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL),
                                                 LABKEY.Filter.create('Virus', arrayFilter[0], LABKEY.Filter.Types.EQUAL),
                                                 LABKEY.Filter.create('Comments', 'plas', LABKEY.Filter.Types.NOT_EQUAL_OR_MISSING),
                                                 LABKEY.Filter.create('SampleType', null, LABKEY.Filter.Types.MISSING)

                                             ],
                                             columns: 'Id,date,LogVL,Virus,SampleType,Comments',
                                             frame: true
                                         })
                                     });
                                 }



                        }

                        //virusType.rows = [virusType.rows[0]];

                        /*for (var i =results.rowCount-1; i>=0; i--){
                            var virus = results.rows[i].Virus.value;

                            if (virus === key){
                                virusType.rows[i]= ;
                            }

                        }*/

                        panelOrder++;


                    })


                }, [subject])
            });
        }

        function cloneObject(obj) {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }

            var temp = obj.constructor(); // give temp the original obj's constructor
            for (var key in obj) {
                    temp[key] = cloneObject(obj[key]);

            }

            return temp;
        }

    }

    var gridFilterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();
    //gridFilterArray.nonRemovable.push(LABKEY.Filter.create('Challenge', 'zika virus', LABKEY.Filter.Types.EQUAL));
    //var challengeFilter = LABKEY.Filter.create('Challenge', 'zika virus', LABKEY.Filter.Types.EQUAL);

    var config = panel.getQWPConfig({
        title: 'Viral Loads' + title,
        schemaName: 'study',
        queryName: 'ViralLoadsWpi',
        filters: gridFilterArray.nonRemovable,
        removeableFilters: gridFilterArray.removable,
        sort: 'id,-date',
        frame: true
    });

    /*tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });*/
    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.breeding_encounters = function(panel, tab) {
    var animalId = panel.activeFilterType.getTitle(tab);

    LABKEY.Query.selectRows({
        schemaName: 'study',
        queryName: 'demographics',
        columns: 'gender',
        filterArray: [LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL)],
        scope: this,
        success: function(results) {
            if (results.rows && results.rows.length) {
                var row = results.rows[0];
                var gender = row.gender;
                var filterColumn = 'Id';
                if (gender == 'm') {
                    filterColumn = 'sireid';
                }

                var breeding_encounters = panel.getQWPConfig({
                    title: 'Breeding Encounters',
                    schemaName: 'study',
                    queryName: 'breeding_encounters',
                    filters: [LABKEY.Filter.create(filterColumn, animalId, LABKEY.Filter.Types.EQUAL)],
                    frame: true
                });

                tab.add({
                    xtype: 'ldk-querypanel',
                    style: 'margin-bottom:20px;',
                    queryConfig: breeding_encounters
                })
            }
        }
    });
};

EHR.reports.hematology = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'hematologyPivot',
        title: "By Panel:",
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        sort: '-date'
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'hematologyMisc',
        title: "Misc Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Hematology Morphology',
        title: "Morphology:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'hematologyRefRange',
        //viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.immunology = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'immunologyPivot',
        title: "By Panel:",
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'immunologyMisc',
        title: "Immunology Misc:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Immunology Results',
        viewName: 'Plus Ref Range',
        title: "Reference Ranges:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.irregularObs = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var queryName;
    if(tab.filters.inputType == 'renderRoomCage' || tab.filters.inputType == 'renderColony'){
        queryName = 'irregularObsByLocation';
    }
    else {
        queryName = 'irregularObsById';
    }

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: queryName,
        title: "Irregular Observations" + title,
        sort: 'room,cage,-date',
        titleField: 'Id',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    if(tab.report.viewName)
        config.viewName = tab.report.viewName;

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.irregularObsTreatment = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var queryName;
    if(tab.filters.inputType == 'renderRoomCage' || tab.filters.inputType == 'renderColony'){
        queryName = 'irregularObsTreatmentByLocation';
    }
    else {
        queryName = 'irregularObsTreatmentById';
    }

    var config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: queryName,
        title: "Obs/Treatments" + title,
        titleField: 'Id',
        sort: 'room,cage,-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.diagnostics = function(panel, tab){
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var config = panel.getQWPConfig({
        title: 'Bacteriology',
        frame: true,
        schemaName: 'study',
        queryName: 'Bacteriology Results',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Chemistry',
        frame: true,
        schemaName: 'study',
        queryName: 'chemPivot',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;min-height:500px',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'chemMisc',
        title: "Misc Chemistry Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        title: 'Hematology',
        frame: true,
        schemaName: 'study',
        allowChooseView: true,
        queryName: 'hematologyPivot',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'hematologyMisc',
        title: "Misc Hematology Tests:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Hematology Morphology',
        title: "Hematology Morphology:",
        titleField: 'Id',
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'immunologyPivot',
        title: "Immunology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Parasitology Results',
        title: "Parasitology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'urinalysisPivot',
        title: "Urinalysis",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });

    config = panel.getQWPConfig({
        schemaName: 'study',
        queryName: 'Virology Results',
        title: "Virology",
        sort: '-date',
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable
    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config
    });
};

EHR.reports.weightGraph = function(panel, tab){
    if (tab.filters.subjects){
        renderSubjects(tab.filters.subjects, tab);
    }
    else
    {
        panel.resolveSubjectsFromHousing(tab, renderSubjects, this);
    }

    function renderSubjects(subjects, tab){
        if (!subjects.length){
            tab.add({
                html: 'No animals were found.',
                border: false
            });

            return;
        }

        var toAdd = [];

        if (subjects.length > 1)
        {
            var configWeights = panel.getQWPConfig({
                title: 'Weight Information - ' + subjects.length + ' Animals',
                schemaName: 'study',
                queryName: 'demographicsWeightChange',
                filters: [LABKEY.Filter.create('Id', subjects.join(';'), LABKEY.Filter.Types.IN)],
                frame: true
            });
            toAdd.push( {
                xtype: 'ldk-querypanel',
                style: 'margin-bottom:20px;',
                queryConfig: configWeights
            });
        }
        else
        {
            for (var i = 0; i < subjects.length; i++)
            {
                var subject = subjects[i];
                toAdd.push(EHR.reports.renderWeightData(panel, tab, subject));
            }
        }

        if (toAdd.length)
            tab.add(toAdd)
    }
};

EHR.reports.renderWeightData = function(panel, tab, subject){
    return {
        xtype: 'ldk-webpartpanel',
        title: 'Weights - ' + subject,
        style: 'margin-bottom: 20px;',
        border: false,
        items: [{
            style: 'padding-bottom: 20px;',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Weight Summary:</b>'
            },{
                html: '<hr>'
            },{
                itemId: 'summaryArea',
                border: false,
                defaults: {
                    border: false
                }
            }]
        },{
            html: 'Loading...',
            itemId: 'tabArea',
            border: false
        }],
        listeners: {
            single: true,
            scope: this,
            render: function(targetPanel){
                var filterArray = [LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL)];

                //first summary
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'demographicsWeightChange',
                    columns: 'id,date,MostRecentWeightDate,MostRecentWeight,DaysSinceWeight,MinLast30,MaxLast30,MaxChange30,AvgLast30,NumLast30,MinLast90,MaxLast90,AvgLast90,MaxChange90,NumLast90,MinLast180,MaxLast180,AvgLast180,MaxChange180,NumLast180',
                    requiredVersion: 9.1,
                    filterArray: filterArray,
                    failure: LDK.Utils.getErrorCallback(),
                    scope: this,
                    success: function(results){
                        var target = targetPanel.down('#summaryArea');
                        LDK.Assert.assertNotEmpty('target panel not present in callback of EHR.reports.renderWeightData.  This may indicate the layout changed before load.', target);

                        target.removeAll();

                        if (results.rows && results.rows.length){
                            var row = results.rows[0];

                            var dateVal = '';
                            if (!Ext4.isEmpty(row.MostRecentWeightDate)){
                                dateVal = row.MostRecentWeightDate.displayValue || row.MostRecentWeightDate.value;
                                if (!Ext4.isEmpty(row.DaysSinceWeight)){
                                    dateVal += ' (' + (row.DaysSinceWeight.displayValue || row.DaysSinceWeight.value) + ' days ago)'
                                }
                            }

                            function safeAppendNumber(row, prop, suffix){
                                if (row[prop] && Ext4.isEmpty(row[prop].value))
                                    return '';

                                if (row[prop] && row[prop].value)
                                    return Ext4.util.Format.round(row[prop].value, 2) + (suffix ? ' ' + suffix : '');
                                else
                                    return '';
                            }

                            target.add([{
                                defaults: {
                                    border: false,
                                    style: 'padding: 3px;'
                                },
                                layout: {
                                    type: 'table',
                                    columns: 2
                                },
                                items: [{
                                    html: 'Last Weight:'
                                },{
                                    html: (row.MostRecentWeight.value ? Ext4.util.Format.round(row.MostRecentWeight.value, 2) + ' kg' : 'no record')
                                },{
                                    html: 'Date:'
                                },{
                                    html: dateVal
                                }]
                            },{
                                border: false,
                                style: 'padding-top: 20px',
                                defaults: {
                                    border: false,
                                    style: 'padding: 3px;'
                                },
                                layout: {
                                    type: 'table',
                                    columns: 6
                                },
                                items: [{
                                    html: ''
                                },{
                                    html: '# Weights'
                                },{
                                    html: 'Avg Weight'
                                },{
                                    html: 'Min Weight'
                                },{
                                    html: 'Max Weight'
                                },{
                                    html: 'Max Pct Change'
                                },{
                                    html: 'Previous 30 Days:'
                                },{
                                    html: safeAppendNumber(row, 'numLast30')
                                },{
                                    html: safeAppendNumber(row, 'avgLast30', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'minLast30', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'maxLast30', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'maxChange30', '%')
                                },{
                                    html: 'Previous 90 Days:'
                                },{
                                    html: safeAppendNumber(row, 'numLast90')
                                },{
                                    html: safeAppendNumber(row, 'avgLast90', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'minLast90', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'maxLast90', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'maxChange90', '%')
                                },{
                                    html: 'Previous 180 Days:'
                                },{
                                    html: safeAppendNumber(row, 'numLast180')
                                },{
                                    html: safeAppendNumber(row, 'avgLast180', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'minLast180', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'maxLast180', ' kg')
                                },{
                                    html: safeAppendNumber(row, 'maxChange180', '%')
                                }]
                            }]);
                        }
                        else {
                            target.add({
                                html: 'There are no weight records within the past 90 days'
                            });
                        }
                    }
                });


                var weightLastYear;

                //then raw data
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName: 'weightRelChange',
                    filterArray: filterArray,
                    columns: 'id,date,weight,LatestWeight,LatestWeightDate,PctChange,IntervalInMonths',
                    sort: 'Id,-date',
                    requiredVersion: 9.1,
                    scope: this,
                    failure: LDK.Utils.getErrorCallback(),
                    filterArray: [
                                  LABKEY.Filter.create('Id', subject, LABKEY.Filter.Types.EQUAL)],
                    success: Ext4.Function.pass(function(subj, results){
                        var target = targetPanel.down('#tabArea');
                        if (target) {
                            LDK.Assert.assertNotEmpty('target panel not present in callback of weight report.  This may indicate the layout changed before load.', target);
                            if (!results.rowCount) {
                                target.update('');
                                target.add({
                                    html: 'No animal weights for that animal Id'
                                });
                                return;

                            }
                            weightLastYear = (cloneObject(results));
                            var lastYear = new Date(results.rows[0].date.value);
                            console.log('value of last weight ' + lastYear);
                            var dateLastYear = new Date(lastYear.setYear(lastYear.getFullYear() - 1));
                            console.log('value after extracting a year ' + dateLastYear);
                            for (var i = 0; i < results.rowCount; i++) {

                                var tempDate = new Date(results.rows[i].date.value);

                                if (tempDate < dateLastYear) {
                                    weightLastYear.rows.splice(i, weightLastYear.rowCount - i);
                                }

                            }
                            weightLastYear.rowCount = weightLastYear.rows.length;
                            console.log('rowcount ' + results.rowCount);
                            console.log('rowcount ' + weightLastYear.rowCount);

                            target.removeAll();
                            target.add({
                                xtype: 'tabpanel',
                                style: 'margin-bottom: 20px',
                                items: [{
                                    xtype: 'ldk-graphpanel',
                                    title: 'Graph',
                                    style: 'margin-bottom: 30px',
                                    plotConfig: {
                                        results: results,
                                        title: 'Weight : ' + subj,
                                        height: 400,
                                        width: 1000,
                                        yLabel: 'Weight (kg)',
                                        xLabel: 'Date',
                                        xField: 'date',
                                        grouping: ['Id'],
                                        layers: [{
                                            y: 'weight',
                                            hoverText: function (row) {
                                                var lines = [];

                                                lines.push('Date: ' + row.date.format(LABKEY.extDefaultDateFormat));
                                                lines.push('Weight: ' + row.weight + ' kg');
                                                lines.push('Latest Weight: ' + row.LatestWeight + ' kg');
                                                if (row.LatestWeightDate)
                                                    lines.push('Latest Weight Date: ' + row.LatestWeightDate.format(LABKEY.extDefaultDateFormat));
                                                if (row.PctChange)
                                                    lines.push('% Change From Current: ' + row.PctChange + '%');
                                                lines.push('Interval (Months): ' + row.IntervalInMonths);

                                                return lines.join('\n');
                                            },
                                            name: 'Weight'
                                        }]
                                    }
                                    //    }]
                                }, {
                                    xtype: 'ldk-graphpanel',
                                    title: 'Graph Last Year',
                                    style: 'margin-bottom: 30px',
                                    plotConfig: {
                                        results: weightLastYear,
                                        title: ' Weight : ' + subj,
                                        height: 400,
                                        width: 1000,
                                        yLabel: 'Weight (kg)',
                                        xLabel: 'Date',
                                        xField: 'date',
                                        grouping: ['Id'],
                                        layers: [{
                                            y: 'weight',
                                            hoverText: function (row) {
                                                var lines = [];

                                                lines.push('Date: ' + row.date.format('Y-m-d'));
                                                lines.push('Weight: ' + row.weight + ' kg');
                                                lines.push('Latest Weight: ' + row.LatestWeight + ' kg');
                                                if (row.LatestWeightDate)
                                                    lines.push('Latest Weight Date: ' + row.LatestWeightDate.format('Y-m-d'));
                                                if (row.PctChange)
                                                    lines.push('% Change From Current: ' + row.PctChange + '%');
                                                lines.push('Interval (Months): ' + row.IntervalInMonths);

                                                return lines.join('\n');
                                            },
                                            name: 'Weight'
                                        }]
                                    }
                                }]
                            });
                            target.add({
                                /*xtype: 'tabpanel',
                                 style: 'margin-bottom: 20px',
                                 items: [{*/
                                xtype: 'ldk-querypanel',
                                title: 'Raw Data',
                                style: 'margin: 5px;',
                                queryConfig: panel.getQWPConfig({
                                    frame: 'none',
                                    schemaName: 'study',
                                    queryName: 'weight',
                                    viewName: 'Percent Change',
                                    sort: 'id,-date',
                                    filterArray: filterArray
                                })
                            });
                            target.update('');
                            //},{
                        }
                    }, [subject])
                });
                function cloneObject(obj) {
                    if (obj === null || typeof obj !== 'object') {
                        return obj;
                    }

                    var temp = obj.constructor(); // give temp the original obj's constructor
                    for (var key in obj) {
                        temp[key] = cloneObject(obj[key]);
                    }

                    return temp;
                }
            }
        }
    }
};

(function() {
    EHR.reports['diarrheaCalendar'] = function(panel, tab) {
        var animalId = panel.activeFilterType.getTitle(tab);

        var html = "<p>** NOTE: The Diarrhea Trends page linked to from here can take up to 20 seconds to load.</p>";

        // If "Entire Database" is selected, don't add the additional panel
        if (animalId == "") {
            return;
        }

        // If "Current Location" is selected, don't add the additional panel
        if (animalId.match(/multiple rooms selected/i) || animalId.match(/^Room:/i)) {
            return;
        }

        var getDiarrheaLink = function(animalId) {
            var url = LABKEY.ActionURL.buildURL('wnprc_ehr', 'DiarrheaAnalysis', null, {
                id: animalId
            });

            return '<a href="' + url + '">' + animalId + '</a>'
        };

        var animalList = animalId.split(",");
        html += '<p>' + animalList.map(getDiarrheaLink).join(", ") + '</p>';

        var config = {
            xtype: 'ldk-webpartpanel',
            title: "Links to Diarrhea Trends Over Time",
            align: 'stretch',
            frame: true,
            html:  html,
            style: 'margin-bottom: 20px'
        };

        tab.add(config);

        var calendar = panel.getQWPConfig({
            title: 'Diarrhea Calendar - ' + animalList.join(', '),
            schemaName: 'study',
            queryName: 'diarrheaCalendar',
            filters: [LABKEY.Filter.create('Id', animalList.join(';'), LABKEY.Filter.Types.IN)],
            frame: true
        });
        tab.add( {
            xtype: 'ldk-querypanel',
            style: 'margin-bottom:20px;',
            queryConfig: calendar
        });

    };
})();

(function() {
    var abstractReport = EHR.reports['abstract'];

    EHR.reports['abstract'] = function(panel, tab) {
        abstractReport(panel, tab);

        var getErrorHTML = function(message) {
            return '<p style="color: red"><strong>' + message + '</strong></p>';
        };

        var animalId = panel.activeFilterType.getTitle(tab);
        var panelId = panel.getId();
        var housingHTML = "";

        let filterArray = panel.getFilterArray(tab);
        let title = panel.getTitleSuffix();

        // If "Entire Database" is selected, don't add the additional panel
        if (animalId == "") {
            return;
        }

        // If "Current Location" is selected, don't add the additional panel
        if (animalId.match(/multiple rooms selected/i) || animalId.match(/^Room:/i)) {
            return;
        }


        var animalList = animalId.split(/[^A-Za-z0-9]+/g);
        if (animalList.length <= 3) {
            jQuery.each(animalList, function(index, id) {
                id = id.replace(/\s/g, '');

                if (animalList.length > 1) {
                    if (index > 0) {
                        housingHTML += '<br/>';
                    }
                    housingHTML += '<h2>' + id + '</h2>';
                }
                housingHTML += '<animal-housing params="animalid: \'' + id + '\'"></animal-housing>';
            });
        }
        else {
            housingHTML = getErrorHTML("Please select three or fewer animals to view this visualization.");
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: [LABKEY.Filter.create('Id', animalList.join(';'), LABKEY.Filter.Types.IN)],
            columns: 'gender/origGender',
            scope: this,
            success: function(result){
                if(result && result.rows.length){
                    let showPregnancies = false;
                    for (let i = 0; i < result.rows.length; i++) {
                        if (result.rows[i]['gender/origGender'] === 'f') {
                            showPregnancies = true;
                            break;
                        }
                    }
                    if (showPregnancies) {
                        let pregnancies = panel.getQWPConfig({
                            title: 'Pregnancies' + title,
                            schemaName: 'study',
                            queryName: 'PregnancyInfo',
                            filters: [LABKEY.Filter.create('Id', animalList.join(';'), LABKEY.Filter.Types.IN)],
                            removeableFilters: filterArray.removable,
                            frame: true
                        });

                        tab.add({
                            xtype: 'ldk-querypanel',
                            style: 'margin-bottom:20px;',
                            queryConfig: pregnancies
                        });
                    }
                }
            },
            failure: LDK.Utils.getErrorCallback()
        });

        LABKEY.Utils.requiresCSS("wnprc_ehr/HousingAndAssignmentHistory.css");
        WNPRC_EHR.Utils.Lib.loadLibrary(['/webutils/lib/webutils'], function() {
            LABKEY.requiresScript("wnprc_ehr/HousingAndAssignmentHistory.js", function() {
                var config = {
                    xtype: 'ldk-webpartpanel',
                    title: "Housing and Assignment History - " + animalId,
                    align: 'stretch',
                    frame: true,
                    html: getErrorHTML("Please enable the WebUtils module to view this visualization."),
                    style: 'margin-bottom: 20px'
                };

                if (WebUtils) {
                    Ext4.apply(config, {
                        html: housingHTML,
                        listeners: {
                            afterrender: {
                                fn: function() {
                                    var applyBindings = function() {
                                        var $animalNodes = jQuery('#' + panelId).find('animal-housing');

                                        $animalNodes.each(function() {
                                            if (typeof ko !== 'undefined') {
                                                ko.cleanNode(this);
                                                ko.applyBindings({}, this);
                                            }
                                        });
                                    };
                                    applyBindings();

                                    var firstItem = tab.items.get(0);

                                    var oldfn = firstItem.onContentSizeChange;
                                    firstItem.onContentSizeChange = function() {
                                        applyBindings();
                                        if ( typeof oldfn === 'function' ) {
                                            oldfn();
                                        }
                                    };
                                }
                            }
                        }
                    });
                }

                tab.add(config);
            });
        });
    }
})();
