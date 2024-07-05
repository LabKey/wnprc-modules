/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.ns('EHR.Ext3Utils');

EHR.Ext3Utils = new function(){
    return {
        /**
         * A utility that will load a EHR form template based on the title and storeId.  These correspond to records in ehr.formtemplates.
         * @param {string} title The title of the template
         * @param {string} storeId The storeId associated with the template
         */
        loadTemplateByName: function(title, storeId){
            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'formtemplates',
                filterArray: [
                    LABKEY.Filter.create('title', title, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('storeId', storeId, LABKEY.Filter.Types.EQUAL)
                ],
                success: onLoadTemplate
            });

            function onLoadTemplate(data){
                if(!data || !data.rows.length)
                    return;

                EHR.Utils.loadTemplate(data.rows[0].entityid)
            }
        },

        /**
         * A utility that will load a EHR form template based on the templateId.  These correspond to records in ehr.formtemplates.
         * @param {string} templateId The templateId, which is the GUID of the corresponding record in ehr.formtemplates
         */
        loadTemplate: function(templateId){
            if(!templateId)
                return;

            LABKEY.Query.selectRows({
                schemaName: 'ehr',
                queryName: 'formtemplaterecords',
                filterArray: [LABKEY.Filter.create('templateId', templateId, LABKEY.Filter.Types.EQUAL)],
                sort: '-rowid',
                success: onLoadTemplate,
                scope: this
            });

            Ext.Msg.wait("Loading Template...");

            function onLoadTemplate(data){
                if(!data || !data.rows.length){
                    Ext.Msg.hide();
                    return;
                }

                var toAdd = {};

                Ext.each(data.rows, function(row){
                    var data = Ext.decode(row.json);
                    var store = Ext.StoreMgr.get(row.storeid);

                    //verify store exists
                    if(!store){
                        Ext.StoreMgr.on('add', function(){
                            onLoadTemplate(data);
                        }, this, {single: true, delay: 200});
                        return false;
                    };

                    //also verify it is loaded
                    if(!store.fields || !store.fields.length){
                        store.on('load', function(){
                            onLoadTemplate(data);
                        }, this, {single: true, delay: 200});
                        return false;
                    };

                    if(!toAdd[store.storeId])
                        toAdd[store.storeId] = [];

                    toAdd[store.storeId].push(data);
                });

                for (var i in toAdd){
                    var store = Ext.StoreMgr.get(i);
                    toAdd[i].reverse();
                    var recs = store.addRecords(toAdd[i])
                }

                Ext.Msg.hide();
            }
        },

        /**
         * A utility that will create a variant of EHR.ext.ImportPanel based on a supplied config.
         * This is used by the data entry page to create the appropriate panel based on records from ehr.formtypes
         * @param {object} config The configuration object.  Can contain any properties used by EHR.ext.ImportPanel in addition to the ones below.
         * @param {string} [config.formType] The formType to create, which should correspond to a value in ehr.formtypes.  However, if it does not match a known FormType, it will assume this is a SimpleTask (ie. Task consisting of only one query) and the FormType will be used as the queryName.
         * @param {string} [config.formUUID] The GUID to use when creating this form.  If creating a new form (as opposed to loading an existing one) this should be left blank.
         * @param {string} [config.panelType] The type of ImportPanel to create.  Should correspond to a class under EHR.ext.ImportPanel (ie. TaskPanel or TaskDetailsPanel)
         *
         */
        createImportPanel: function(config){
            var multi = new LABKEY.MultiRequest();

            var formSections;
            multi.add(LABKEY.Query.selectRows, {
                schemaName: 'ehr',
                queryName: 'formpanelsections',
                filterArray: [LABKEY.Filter.create('formType', config.formType, LABKEY.Filter.Types.EQUAL)],
                sort: 'destination,sort_order',
                scope: this,
                successCallback: function(results){
                    formSections = results.rows;
                },
                failure: EHR.Utils.onError
            });

            var formConfig;
            multi.add(LABKEY.Query.selectRows, {
                schemaName: 'ehr',
                queryName: 'formtypes',
                filterArray: [LABKEY.Filter.create('formType', config.formType, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                successCallback: function(results){
                    if(results.rows.length)
                        formConfig = results.rows[0];
                    else
                        formConfig = {};
                },
                failure: EHR.Utils.onError
            });
            multi.send(onSuccess, this);

            function onSuccess(){
                if(!formSections.length){
                    //we assume this is a simple query:
                    config.queryName = config.formType;
                    config.schemaName = 'study';
                    if(config.panelType=='TaskPanel')
                        EHR.Ext3Utils.createSimpleTaskPanel(config);
                    else if (config.panelType=='TaskDetailsPanel')
                        EHR.Ext3Utils.createSimpleTaskDetailsPanel(config);
                    else
                        alert('Form type not found');
                    return;
                }

                var panelCfg = formConfig.configjson ? Ext.util.JSON.decode(formConfig.configjson) : {};
                panelCfg = Ext.apply(panelCfg, config);

                Ext.applyIf(panelCfg, {
                    title: config.formType,
                    formHeaders: [],
                    formSections: [],
                    formTabs: []
                });

                Ext.each(formSections, function(row){
                    var metaSources;
                    if(row.metadatasources)
                        metaSources = row.metadatasources.split(',');

                    var obj = {
                        xtype: row.xtype,
                        schemaName: row.schemaName,
                        queryName: row.queryName,
                        title: row.title || row.queryName,
                        metadata: EHR.Metadata.getTableMetadata(row.queryName, metaSources)
                    };

                    if(row.buttons)
                        obj.tbarBtns = row.buttons.split(',');

                    if(row.initialTemplates && !config.formUUID){
                        panelCfg.initialTemplates = panelCfg.initialTemplates || [];
                        var templates = row.initialTemplates.split(',');
                        var storeId;
                        Ext.each(templates, function(t){
                            storeId = [row.schemaName, row.queryName, '', ''].join('||');
                            panelCfg.initialTemplates.push({storeId: row.storeId, title: t});
                        }, this);

                    }

                    if(row.configJson){
                        var json = Ext.util.JSON.decode(row.configJson);
                        Ext.apply(obj, json);
                    }

                    if(config.noTabs && row.destination == 'formTabs')
                        panelCfg['formSections'].push(obj);
                    else
                        panelCfg[row.destination].push(obj);
                }, this);

                if (panelCfg.panelType === 'TaskDetailsPanel' && panelCfg.readOnly) {
                    // Avoid creating ExtJS3 panel-wrapped QueryWebParts - just add them directly to the DOM via
                    // the JavaScript API. See ticket 38440
                    // First add the tasks section see ticket 39076
                    panelCfg.formHeaders.unshift({
                        xtype: 'ehr-qwppanel',
                        title: '',
                        collapsible: false,
                        formType: panelCfg.formType,
                        schemaName: 'ehr',
                        queryName: 'tasks',
                        keyField: 'taskid',
                        ref: 'importPanelHeader',
                        formUUID: panelCfg.formUUID,
                        importPanel: panelCfg,
                        readOnly: panelCfg.readOnly,
                        storeConfig: {
                            canSaveInTemplate: false
                        }
                    });
                    var index = 0;
                    index = this.addQueryWebParts(panelCfg.formHeaders, panelCfg, index);
                    index = this.addQueryWebParts(panelCfg.formSections, panelCfg, index);
                }
                else {
                    return new EHR.ext.ImportPanel[config.panelType](panelCfg);
                }
            }

        },

        addQueryWebParts: function(sections, panelCfg, index) {
            var rootElement = Ext.get(panelCfg.renderTo);
            Ext.each(sections, function(section){
                if (section.schemaName && section.queryName) {
                    var targetId = panelCfg.renderTo + index;
                    rootElement.createChild({id: targetId, tag: 'div'});
                    var qwpConfig = {
                        schemaName: section.schemaName,
                        queryName: section.queryName,
                        filters: [LABKEY.Filter.create('taskId', panelCfg.formUUID, LABKEY.Filter.Types.EQUAL)],
                        allowChooseQuery: false,
                        allowChooseView: true,
                        showRecordSelectors: true,
                        showDetailsColumn: false,
                        showDeleteButton: false,
                        timeout: 0,
                        linkTarget: '_blank',
                        renderTo: targetId,
                        failure: EHR.Utils.onError,
                        scope: this
                    };
                    var qwp = new LABKEY.QueryWebPart(qwpConfig);
                    index++;
                }

            }, this);
            return index;
        },

        /**
         * A utility that will create an EHR.ext.ImportPanel.TaskPanel containing only a single section.
         * This is a special case of ImportPanel, because there does not need to be a record in ehr.formtypes describing the panel sections.
         * @param {object} config The configuration object.  Can contain any properties used by EHR.ext.ImportPanel in addition to the ones below.
         * @param {string} [config.queryName] The queryName to load in the panel's single section.
         * @param {string} [config.schemaName] The schemaName to load in the panel's single section.
         *
         */
        createSimpleTaskPanel: function(config){
            if(!config || !config.queryName){
                alert('Must provide queryName');
                return;
            }

            var panelCfg = Ext.apply({}, config);
            Ext.apply(panelCfg, {
                title: config.queryName,
                formHeaders: [{xtype: 'ehr-abstractpanel'}],
                formSections: [{
                    xtype: 'ehr-gridformpanel',
                    schemaName: config.schemaName,
                    queryName: config.queryName,
                    title: config.title || config.queryName,
                    viewName:  '~~UPDATE~~',
                    columns: EHR.Metadata.Columns[config.queryName],
                    metadata: EHR.Metadata.getTableMetadata(config.queryName, ['Task'])
                }],
                formTabs: []
            });

            return new EHR.ext.ImportPanel.TaskPanel(panelCfg);
        },


        /**
         * A utility that will create an EHR.ext.ImportPanel.TaskDetailsPanel containing only a single section.
         * This is a special case of ImportPanel, because there does not need to be a record in ehr.formtypes describing the panel sections.
         * @param {object} config The configuration object.  Can contain any properties used by EHR.ext.ImportPanel in addition to the ones below.
         * @param {string} [config.queryName] The queryName to load in the panel's single section.
         * @param {string} [config.schemaName] The schemaName to load in the panel's single section.
         *
         */
        createSimpleTaskDetailsPanel: function(config){
            if(!config || !config.queryName){
                alert('Must provide queryName');
                return;
            }

            var panelCfg = Ext.apply({}, config);
            Ext.apply(panelCfg, {
                title: config.queryName,
                formSections: [{
                    xtype: 'ehr-gridformpanel',
                    schemaName: config.schemaName,
                    queryName: config.queryName,
                    readOnly: true,
                    title: config.title || config.queryName,
                    viewName: '~~UPDATE~~',
                    columns: EHR.Metadata.Columns[config.queryName],
                    metadata: EHR.Metadata.getTableMetadata(config.queryName, ['Task'])
                }],
                formTabs: []
            });

            return new EHR.ext.ImportPanel.TaskDetailsPanel(panelCfg);
        },

        //this looks into an ext3 config.store obj for a specified error field config.errorField
        //expects a config obj with 2 props:
        // (1) "store" which is an ext3 store obj,
        // (2) "errorField" which is a string that specifies which field to report
        // then returns animal ids and the error msg.
        getBloodLimitErrorMsg: function (config) {
            let errorToDisplay = "";
            let count = 0;
            for (let i = 0; i < config.store.errors.getCount(); i++){
                const theError = config.store.errors.get(i);
                if (theError.field === config.errorField) {
                    count++;
                    errorToDisplay = errorToDisplay + theError.record.data.Id + "'s " + theError.message + " "
                }
            }
            if (count === 0) {
                return "";
            } else {
                return errorToDisplay;
            }
        },

        getAccountErrorMsg: function (config) {
            let errorToDisplay = "The following records have updated account fields, and will charge to the corresponding account / contact person:" + "<br>";
            let count = 0;
            for (let i = 0; i < config.store.errors.getCount(); i++){
                const theError = config.store.errors.get(i);
                if (theError.field === config.errorField) {
                    count++;
                    errorToDisplay = errorToDisplay + theError.record.data.Id + ": " + theError.message + "</br>"
                }
            }
            if (count === 0) {
                return "";
            } else {
                return errorToDisplay;
            }

        }
    }
}