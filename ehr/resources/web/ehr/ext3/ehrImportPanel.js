/*
 * Copyright (c) 2011-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.ns('EHR.ext.ImportPanel');

/**
 * This is an abstract base class inherited by the classes that create the outer panels used in EHR data entry forms.
 * @class
 * This class is the base class for other classes that generate the outer Ext Panels used to make EHR Task and Request forms.
 * These forms consist of multiple sections, each of which
 *
 * This class provides an outer panel and is designed to manage a collection of child FormPanels or GridFormPanels.  Each of these
 * children contains an EHR.ext.AdvancedStore.  The ImportPanel sublclass is bound to an EHR.ext.StoreCollection, which manages
 * communication to/from the server for all children.  The EHR.ext.StoreCollection instance is automatically created by the ImportPanel
 *
 * <p>If you use any of the LabKey APIs that extend Ext APIs, you must either make your code open source or
 * <a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=extDevelopment">purchase an Ext license</a>.</p>
 *            <p>Additional Documentation:
 *              <ul>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=javascriptTutorial">LabKey JavaScript API Tutorial</a></li>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=labkeyExt">Tips for Using Ext to Build LabKey Views</a></li>
 *              </ul>
 *           </p>
 * @constructor
 * @augments Ext.Panel
 * @param {object} config Configuration properties. This may contain any of the configuration properties supported
 * by the <a href="http://www.extjs.com/deploy/dev/docs/?class=Ext.form.FormPanel">Ext.Panel</a>, plus those listed here.
 * @param {string} [config.formType] The type of this form, which will usually correspond to a row in ehr.formTypes
 * @param {string} [config.formUUID] The unique GUID associated with this form.  This will usually be the taskId or requestId, depending on the type of form.
 * @param {boolean} [config.readOnly] If true, instead of rendering the children as FormPanels or GridPanels, they will be displayed using QueryWebParts
 * @param {array} [config.formHeaders] An array of Ext config objects used to create the sections appearing in the header portion of this ImportPanel.  These will appear in order, starting at the top of the panel.
 * @param {array} [config.formSections] An array of Ext config objects used to create the sections appearing in the body of this form.  These will appear in order, after all header items.
 * @param {array} [config.formTabs] An array of Ext config objects used to create tabs in this form.  These will be added in order, after the formHeaders and formSections.
 * @param {array} [config.initialTemplates] An array of templates to apply to this form.  Each item must be an object with the properties storeId and title.  Each storeId/title provided must match a record in ehr.formtemplates.
 * @param {string} [config.allowableButtons] An array of strings corresponding to the button configs defined in EHR.ext.ImportPanel.Buttons.  These buttons will not necessarily be displayed, if the current user does not have permissions for the button being requested.
 */

EHR.ext.ImportPanel.Base = function(config){
    EHR.ext.ImportPanel.Base.superclass.constructor.call(this, config);
};

Ext.extend(EHR.ext.ImportPanel.Base, Ext.Panel, {
    initComponent: function()
    {
        Ext.QuickTips.init();

        Ext.applyIf(this, {
            autoHeight: true
            ,defaults: {
                bodyBorder: false
                ,border: false
            }
            ,items: []
            ,store: new EHR.ext.StoreCollection({
                monitorValid: true
            })
            ,fbar: []
        });

        EHR.ext.ImportPanel.Base.superclass.initComponent.call(this);

        this.addEvents('participantchange', 'participantloaded','participantrefresh');

        this.mon(this.store, 'validation', this.onStoreValidation, this);
        this.mon(this.store, 'commitcomplete', this.afterSubmit, this);
        this.mon(this.store, 'commitexception', this.afterSubmit, this);

        //monitor dirty state
        window.onbeforeunload = LABKEY.beforeunload(function (){
            if (this.isDirty())
                return this.warningMessage || 'we should set a warning message somewhere';
        }, this);

        EHR.Security.init({
            success: this.calculatePermissions,
            failure: EHR.Utils.onError,
            scope: this
        });
    },

    //@private
    //called when the permissionMap loads.  calculates effective permissions based on queries represented in this form
    calculatePermissions: function()
    {
        this.populateItems();

        //add stores to StoreCollection
        //TODO: this seems like a bad method to perform this.  Rather than iterating all stores, we
        //should use something more refined
        Ext.StoreMgr.each(this.addStore, this);

        this.populateButtons();

        if(this.initialTemplates && this.initialTemplates.length)
            this.applyTemplates(this.initialTemplates);
    },

    //@private
    //returns the set of unique queries represented in this form
    getQueries: function()
    {
        var queries = [];

        if(this.formHeaders)
            Ext.each(this.formHeaders, function(item){
                if(item.schemaName && item.queryName)
                    queries.push({
                        schemaName: item.schemaName,
                        queryName: item.queryName
                    })
            }, this);
        if(this.formSections)
            Ext.each(this.formSections, function(item){
                if(item.schemaName && item.queryName)
                    queries.push({
                        schemaName: item.schemaName,
                        queryName: item.queryName
                    })
            }, this);
        if(this.formTabs)
            Ext.each(this.formTabs, function(item){
                if(item.schemaName && item.queryName)
                    queries.push({
                        schemaName: item.schemaName,
                        queryName: item.queryName
                    });
            }, this);

        return queries;
    },

    //@private
    //configures the buttons shown in the bbar of this panel
    populateButtons: function()
    {
        if(this.allowableButtons){
            if(!Ext.isArray(this.allowableButtons))
                this.allowableButtons = this.allowableButtons.split(',');
        }
        else {
            this.allowableButtons = [
                'VALIDATE',
                //'PRINT',
                'SAVEDRAFT',
                //'SCHEDULE',
                'REVIEW',
                'SUBMIT',
                'FORCESUBMIT',
                'DISCARD',
                'CLOSE'
            ];
        }

        var buttons = [];
        var buttonCfg;
        Ext.each(this.allowableButtons, function(b){
            var buttonCfg;
            if(Ext.isString(b) && EHR.ext.ImportPanel.Buttons[b])
                buttonCfg = EHR.ext.ImportPanel.Buttons[b].call(this);
            else
                buttonCfg = b;

            buttonCfg = this.configureButton(buttonCfg);

            if(buttonCfg)
                buttons.push(buttonCfg);

        }, this);

        if (EHR.debug){
            buttons.push([
                {text: 'Stores?', name: 'stores', handler: this.store.showStores, scope: this.store},
                {text: 'Errors?', name: 'errors', handler: this.store.showErrors, scope: this.store}
            ])
        }

        var button;
        Ext.each(buttons, function(b){
            if(this.rendered)
                button = this.getFooterToolbar().add(b);
            else
                button = this.addButton(b);

            if(b.ref)
                this[b.ref] = button;
        }, this);
        this.getFooterToolbar().doLayout();
    },

    //@private
    //This method configures each button, including determining whether it should be visible/enabled based on permissions
    configureButton: function(buttonCfg)
    {
        buttonCfg.scope = this;
        buttonCfg.xtype = 'button';

        //only show button if user can access this QCState
        if(buttonCfg.requiredQC){
            if(!EHR.Security.hasPermission(buttonCfg.requiredQC, (buttonCfg.requiredPermission || 'insert'), this.store.getQueries())){
                buttonCfg.hidden = true;
            }
        }

        return buttonCfg;
    },

    //@private
    //configures/adds all the sections of this form
    populateItems: function()
    {
        var toAdd = [];
        if(this.formHeaders){
            Ext.each(this.formHeaders, function(c){
                this.configureItem(c);
                this.configureHeaderItem(c);
                toAdd.push(c);
            }, this);
        }

        if(this.formSections){
            Ext.each(this.formSections, function(c){
                this.configureItem(c);
                toAdd.push(c);
            }, this);
        }

        if(this.formTabs && this.formTabs.length){
            var tabs = [];
            Ext.each(this.formTabs, function(c){
                this.configureItem(c);
                tabs.push(c);
            }, this);

            toAdd.push({
                xtype: 'tabpanel',
                activeTab: 0,
                width: 1110,
                ref: 'queryPanel',
                items: tabs,
                cls: 'extContainer'
            });
        }

        this.add(toAdd);
        this.doLayout();
    },

    //@private
    configureHeaderItem: function(c)
    {
        EHR.Utils.rApplyIf(c, {
            bindConfig: {
                createRecordOnLoad: true,
                autoBindRecord: true,
                showDeleteBtn: false
            }
        });
    },

    //@private
    configureItem: function(c)
    {
        EHR.Utils.rApplyIf(c, {
            collapsible: true,
            border: true,
            //uuid: this.uuid,
            formUUID: this.formUUID,
            formType: this.formType,
            readOnly: this.readOnly,
            bindConfig: {
                disableUnlessBound: false,
                bindOnChange: true
            },
            defaults: {
                bodyBorder: false
                ,border: false
            },
            showStatus: true,
            storeConfig: {
                //xtype: 'ehr-store',
                containerPath: c.containerPath,
                schemaName: c.schemaName,
                queryName: c.queryName,
                viewName: c.viewName || '~~UPDATE~~',
                columns: c.columns || EHR.Metadata.Columns[c.queryName] || '',
                //autoLoad: true,
                storeId: [c.schemaName,c.queryName,c.viewName,c.storeSuffix].join('||'),
                metadata: c.metadata,
                ignoreFilter: 1
            }
        });
        c.importPanel = this;

        if(c.xtype == 'ehr-formpanel'){
            c.bindConfig.autoBindRecord = true;
        }

        if(this.printFormat)
            c.xtype = 'ehr-printtaskpanel';
        if(this.readOnly){
            c.type = 'ehr-qwppanel';
        }
    },

    //@private
    applyTemplates: function(templates)
    {
        Ext.each(templates, function(obj){
            EHR.Ext3Utils.loadTemplateByName(obj.title, obj.storeId);
        }, this);
    },

    //@private
    //this was at one point used to add a loading mask to the panel prior to store loading.  not currently used.
    setLoadMask: function()
    {
        if(!this.store.isLoading() && EHR.Security.hasLoaded()){
            Ext.Msg.hide();
            delete this.loadMsg;
        }
        else {
            if(!this.loadMsg)
                this.loadMsg = Ext.Msg.wait("Loading...");

            this.setLoadMask.defer(500, this);
        }
    },

    //@private
    //add a new store to the panel's store collection
    addStore: function(c)
    {
        if (c instanceof EHR.ext.AdvancedStore){
            this.store.add(c);
        }
    },

    //@private
    //if a section is removed that contains a store, also remove from the StoreCollection.
    onRemove: function(o)
    {
        if(o.store)
            this.store.remove(o.store);
    },

    //@private
    //called when the form is submitted.  triggers UI changes, but the StoreCollection does most of the work
    onSubmit: function(o)
    {
        Ext.Msg.wait("Saving Changes...");

        //add a context flag to the request to saveRows
        var extraContext = {
            targetQC : o.targetQC,
            errorThreshold: o.errorThreshold,
            successURL : o.successURL,
            importPathway: 'ehr-ext3DataEntry'
        };

        //we delay this event so that any modified fields can fire their blur events and/or commit changes
        this.store.commitChanges.defer(300, this.store, [extraContext, true]);
    },

    //@private
    //similar to onSubmit, but provides extra notification prior to deleting a form.
    //NOTE: currently instead of deleting directly, the code marks the records with the QCState 'Delete Requested'.
    // A cron script runs periodically to delete these.  This is for historical purposes and should be changed to a direct delete
    // at some point.
    requestDelete: function(o)
    {
        Ext.Msg.confirm(
            "Warning",
            "You are about to delete this form and all its data.  Are you sure you want to do this?",
            function(v)
            {
                if (v == 'yes')
                {
                    Ext.Msg.wait("Discarding Form...");

                    var extraContext = {
                        errorThreshold: o.errorThreshold,
                        successURL : o.successURL,
                        importPathway: 'ehr-ext3DataEntry'
                    };

                    this.store.requestDeleteAllRecords(extraContext);
                }
            }, this);
    },

    //@private
    //when a store validates records on the server, we toggle buttons based on validation status (ie. the most severe error)
    onStoreValidation: function(storeCollection, maxSeverity)
    {
        if(EHR.debug && maxSeverity)
            console.log('Error level: '+maxSeverity);

        this.getFooterToolbar().items.each(function(item){
            if(item.disableOn){
                if(maxSeverity && EHR.Utils.errorSeverity[item.disableOn] <= EHR.Utils.errorSeverity[maxSeverity])
                    item.setDisabled(true);
                else
                    item.setDisabled(false);
            }
        }, this);
    },

    //@private
    validateAll: function()
    {
        this.store.each(function(s){
            s.validateRecords(s, null, true, {operation: 'edit'});
        }, this);
    },

    //@private
    afterSubmit: function(o, e)
    {
        //console.log('after submit');
        Ext.Msg.hide();
    },

    //@private
    //similar to onSubmit, but provides extra confirmation before discarding a form
    discard: function(o)
    {
        Ext.Msg.confirm(
            "Warning",
            "You are about to discard this form.  All data will be deleted.  Are you sure you want to do this?",
            function(v)
            {
                if (v == 'yes')
                {
                    Ext.Msg.wait("Deleting Records...");

                    //add a context flag to the request to saveRows
                    var extraContext = {
                        targetQC : o.targetQC,
                        errorThreshold: o.errorThreshold,
                        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
                        importPathway: 'ehr-ext3DataEntry'
                    };

                    //we delay this event so that any modified fields can fire their blur events and/or commit changes
                    this.store.deleteAllRecords.defer(300, this.store, [extraContext]);
                }
            },
        this);
    },

    //@private
    //helper to test whether the stores on this form have any changes
    isDirty: function()
    {
        return this.store.isDirty();
    },

    //@private
    //helper to validate all records in this form
    isValid: function()
    {
        return this.store.isValid();
    }
});

/**
  * Constructs a new EHR.ext.ImportPanel.TaskPanel based on the supplied config
  * @class
  * An extension of EHR.ext.ImportPanel.Base that generates the outer panel used on the import page for Tasks.
  * Primrily configures the ehr.tasks store and configures each panel item with consistent sorts/filters (will only load records where the taskId matches the current form's UUID).  See EHR.ext.ImportPanel.Base
  * for additional documentation.
  *
  * @constructor
  * @param {object} config Configuration properties. This may contain any of the configuration properties supported in EHR.ext.ImportPanel.Base in addition to those below.
  * @augments EHR.ext.ImportPanel.Base
  * @param {string} [config.taskHeaderMetaSources] A comma separated list of Metadata Sources (see EHR.Metadata) applied to the ehr.tasks store
 */
EHR.ext.ImportPanel.TaskPanel = Ext.extend(EHR.ext.ImportPanel.Base, {

    addStore: function(c)
    {
        EHR.ext.ImportPanel.TaskPanel.superclass.addStore.apply(this, arguments);

        if (c.storeId == 'ehr||tasks||||'){
            this.mon(c, 'load', function(store){


                if(store.getCount()){

                    var rec= store.getAt(0);

                    LABKEY.NavTrail.setTrail(rec.get('title'));
                }
            },this)
        }
    },

    initComponent: function()
    {

        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];
        this.formHeaders.unshift({
            xtype: 'ehr-headerformpanel',
            formType: this.formType,
            schemaName: 'ehr',
            queryName: 'tasks',
            keyField: 'taskid',
            ref: 'importPanelHeader',
            //uuid: this.uuid,
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: this.readOnly,
            metadata: EHR.Metadata.getTableMetadata('tasks', this.taskHeaderMetaSources || ['Task']),
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        EHR.ext.ImportPanel.TaskPanel.superclass.initComponent.call(this, arguments);
    },

    //@override
    configureItem: function(c)
    {
        EHR.ext.ImportPanel.TaskPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [
            LABKEY.Filter.create('taskId', this.formUUID, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('qcstate/label', 'Delete Requested', LABKEY.Filter.Types.NEQ)
        ];

        var sortCol = [];
        if(c.storeConfig && c.storeConfig.columns){
            var cols = c.storeConfig.columns.split(',');
            Ext.each(['id', 'id/curlocation/location'], function(item){
                Ext.each(cols, function(o){
                    if(o && o.match(new RegExp('^'+item+'$', 'i'))){
                        sortCol.push(item)
                    }
                }, this);
            }, this);

        }
        if(sortCol.length){
            sortCol = Ext.unique(sortCol);
            c.storeConfig.sort = sortCol.join(',');
        }
    }
});

/**
 * Constructs a new EHR.ext.ImportPanel.TaskDetailsPanel based on the supplied config.
 * @class
 * An extension of EHR.ext.ImportPanel.Base that generates the outer panel used on the import page for Tasks.
 * Unlike EHR.ext.ImportPanel.TaskPanel, this panel creates a read-only panel that uses QueryWebParts instead of EHR grids.
 * See EHR.ext.ImportPanel.Base for additional documentation.
 *
 * @constructor
 * @param {object} config Configuration properties. This may contain any of the configuration properties supported in EHR.ext.ImportPanel.Base.
 * @augments EHR.ext.ImportPanel.Base
 */
EHR.ext.ImportPanel.TaskDetailsPanel = Ext.extend(EHR.ext.ImportPanel.Base, {
    initComponent: function()
    {
        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];
        this.formHeaders.unshift({
            xtype: 'ehr-qwppanel',
            title: '',
            collapsible: false,
            formType: this.formType,
            schemaName: 'ehr',
            queryName: 'tasks',
            keyField: 'taskid',
            ref: 'importPanelHeader',
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: this.readOnly,
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        EHR.ext.ImportPanel.TaskDetailsPanel.superclass.initComponent.call(this, arguments);
    },

    //@override
    configureItem: function(c)
    {
        if(!c.queryName || !c.schemaName){
            c.hidden = true;
            return;
        }

        EHR.ext.ImportPanel.TaskDetailsPanel.superclass.configureItem.apply(this, arguments);
        c.filterArray = [LABKEY.Filter.create('taskId', this.formUUID, LABKEY.Filter.Types.EQUAL)];

        if(c.xtype != 'ehr-detailsview'){
            c.xtype = 'ehr-qwppanel';
            c.autoLoadQuery = true;
            c.collapsed = false;
        }

        c.storeConfig = null;
        c.style = 'padding-bottom:20px;';

    }
});

/**
 * Constructs a new EHR.ext.ImportPanel.RequestPanel based on the supplied config.
 * @class
 * An extension of EHR.ext.ImportPanel.Base that generates the outer panel used on the import page for Requests.
 * The primary difference is that this class sets standardized sorts/filter on the component stores in the configureItem method (will only load records where the requestId matches the current form's UUID).
 * See EHR.ext.ImportPanel.Base for additional documentation.
 *
 * @constructor
 * @param {object} config Configuration properties. This may contain any of the configuration properties supported in EHR.ext.ImportPanel.Base.
 * @augments EHR.ext.ImportPanel.Base
 *
 */
EHR.ext.ImportPanel.RequestPanel = Ext.extend(EHR.ext.ImportPanel.Base, {
    initComponent: function()
    {
        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];

        this.formHeaders.unshift({
            xtype: 'ehr-headerformpanel',
            formType: this.formType,
            schemaName: 'ehr',
            queryName: 'requests',
            keyField: 'requestid',
            ref: 'importPanelHeader',
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: this.readOnly,
            metadata: EHR.Metadata.getTableMetadata('requests', ['Request']),
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        this.allowableButtons = this.allowableButtons || 'VALIDATE,REQUEST';

        EHR.ext.ImportPanel.RequestPanel.superclass.initComponent.call(this, arguments);
    },

    //@override
    configureItem: function(c){
        EHR.ext.ImportPanel.RequestPanel.superclass.configureItem.apply(this, arguments);
        c.storeConfig.filterArray = [
            LABKEY.Filter.create('requestId', this.formUUID, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('qcstate/label', 'Delete Requested', LABKEY.Filter.Types.NEQ)
        ];
    }
});

/**
 * Constructs a new EHR.ext.ImportPanel.RequestDetailsPanel based on the supplied config.
 * @class
 * An extension of EHR.ext.ImportPanel.Base that generates the outer panel used on the import page for Requests.
 * Unlike EHR.ext.ImportPanel.RequestPanel, this creates a read-only panel in which QueryWebParts are used instead of EHR grids.
 * See EHR.ext.ImportPanel.Base for additional documentation.
 *
 * @constructor
 * @param {object} config Configuration properties. This may contain any of the configuration properties supported in EHR.ext.ImportPanel.Base.
 * @augments EHR.ext.ImportPanel.Base
 */
EHR.ext.ImportPanel.RequestDetailsPanel = Ext.extend(EHR.ext.ImportPanel.Base, {
    initComponent: function()
    {
        this.formUUID = this.formUUID || LABKEY.Utils.generateUUID();
        this.formHeaders = this.formHeaders || [];
        this.formHeaders.unshift({
            xtype: 'ehr-qwppanel',
            title: '',
            collapsible: false,
            formType: this.formType,
            queryConfig: {
                showDetailsColumn: true
            },
            schemaName: 'ehr',
            queryName: 'requests',
            keyField: 'requestid',
            ref: 'importPanelHeader',
            formUUID: this.formUUID,
            importPanel: this,
            readOnly: true,
            storeConfig: {
                canSaveInTemplate: false
            }
        });

        this.store = new Ext.util.MixedCollection();
        this.store.getQueries = function(){
            var queries = [];
            this.each(function(s){
                queries.push({
                    schemaName: s.schemaName,
                    queryName: s.queryName
                })
            }, this);
            return queries;
        };

        EHR.ext.ImportPanel.RequestDetailsPanel.superclass.initComponent.call(this, arguments);
    },

    //@override
    configureItem: function(c)
    {
        if(!c.queryName || !c.schemaName){
            c.hidden = true;
            return;
        }

        EHR.ext.ImportPanel.RequestDetailsPanel.superclass.configureItem.apply(this, arguments);
        c.filterArray = [LABKEY.Filter.create('requestId', this.formUUID, LABKEY.Filter.Types.EQUAL)];

        if(c.xtype != 'ehr-detailsview'){
            c.xtype = 'ehr-qwppanel';
            c.autoLoadQuery = true;
            c.collapsed = false;
            c.queryConfig = {
                showDetailsColumn: true
            }
        }

        c.storeConfig = null;
        c.style = 'padding-bottom:20px;';

        if(c.queryName && c.schemaName){
            this.store.add({
                schemaName: c.schemaName,
                queryName: c.queryName
            })
        }
    }
});

/**
 * Constructs a new EHR.ext.ImportPanel.SimpleImportPanel based on the supplied config.
 * @class
 * An extension of EHR.ext.ImportPanel.Base that generates a stripped down ImportPanel.  It is used by manageRecord.html,
 * which is a generic page to allow editing of any record from a single query, assuming you provide the table and PK.
 * See EHR.ext.ImportPanel.Base for additional documentation.
 *
 * @constructor
 * @param {object} config Configuration properties. This may contain any of the configuration properties supported in EHR.ext.ImportPanel.Base.
 * @augments EHR.ext.ImportPanel.Base
 */
EHR.ext.ImportPanel.SimpleImportPanel = Ext.extend(EHR.ext.ImportPanel.Base, {
    initComponent: function()
    {
        EHR.ext.ImportPanel.SimpleImportPanel.superclass.initComponent.call(this, arguments);
    },

    //@override
    configureItem: function(c)
    {
        EHR.ext.ImportPanel.SimpleImportPanel.superclass.configureItem.apply(this, arguments);
        c.bindConfig.showDeleteBtn = false;
        c.bindConfig.bindOnChange = true;
        c.bindConfig.autoBindRecord = true;

        if(c.keyField && c.keyValue){
            c.storeConfig.filterArray = [
                LABKEY.Filter.create(c.keyField, c.keyValue, LABKEY.Filter.Types.EQUAL)
            ];
        }
        else {
            delete c.storeConfig.filterArray;
            c.storeConfig.maxRows = 0;
            c.storeConfig.loadMetadataOnly = true;
        }
    }
});

/**
 * A static set of button config objects used by EHR.ext.ImportPanel.Base subclasses.
 * @class
 * These are a collection of static button config objects used by EHR.ext.ImportPanel
 * The intent is to place the code behind buttons in the single location, since these are often shared across multiple forms.
 *
 * Button configs are processed in ImportPanel.Base.configureButton.  They support the following properties, in addition to standard Ext config:
 *   <li>targetQC: If provided, when the form is submitted using this button it will set the QCState on all the records to this value.  Must provide a QCStateLabel, not the numeric QCState</li>
 *   <li>requiredQC: If provided, the user must has insert privledges over this QCState on all tables in this form, or this button will be hidden.  Must provide a QCStateLabel, not the numeric QCState</li>
 *   <li>errorThreshold: Either 'WARN', 'INFO' or 'ERROR'.  If the max error severity of any record in this form is above this value, the button will be disabled</li>
 *   <li>successURL: On a successful submit, the page will navigate to this URL</li>
 */
EHR.ext.ImportPanel.Buttons = {
    /**
     * This button is the 'Save' button on most forms.   Will save records using their current QCState, or 'In Progress' if none is provided
     */
    SAVEDRAFT: function(){return {
        text: 'Save Draft',
        name: 'saveDraft',
        //targetQC: 'In Progress',
        requiredQC: 'In Progress',
        errorThreshold: 'WARN',
        //successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'saveDraftBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    /**
     * A variation on the normal submit button, except will be hidden to non-admins.  It was created so MPRs could have a submit button visible only to admins (permission-based logic was not a sufficient distinction otherwise)
     */
    SUBMITADMIN: function(){return {
        text: 'Submit Final',
        name: 'submit',
        requiredQC: 'Completed',
        requiredPermission: 'admin',
        targetQC: 'Completed',
        errorThreshold: 'INFO',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    /**
     * The standard 'Submit Final' button.  Will change the QCState of all records to 'Completed' and submit the form
     */
    SUBMIT: function(){return {
        text: 'Submit Final',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        errorThreshold: 'INFO',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    /**
     * A button unique to deaths.  This is the normal 'submit final' button, except it provides stronger warning language.
     */
    SUBMITDEATH: function(){return {
        text: 'Submit Final',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        errorThreshold: 'INFO',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Death', 'You are about to finalize this death record on this animal.  This will end all treatments, problems, assignments and housing. BE ABSOLUTELY SURE YOU WANT TO DO THIS BEFORE CLICKING SUBMIT.', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    /**
     * An admin button that will force records to submit with a QCState of 'Completed', ignoring validation errors.  Created for situations where there is a valid reason to override normal validation errors.
     */
    FORCESUBMIT: function(){return {
        text: 'Force Submit',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        requiredPermission: 'admin',
        errorThreshold: 'ERROR',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'foreceSubmitBtn',
        handler: function(o){
            Ext.Msg.confirm('Force Finalize Form', 'You are about to finalize this form.  Do you want to do this?', function(v){
                if(v=='yes')
                    this.onSubmit(o);
            }, this);
        },
        disableOn: 'SEVERE',
        scope: this
        }
    },
    /**
     * Necropsy-specific button that provides UI to copy records from an existing necropsy into the current one.  The process is similar to using the earlier necropsy as a template.
     */
    COPYNECROPSY: function(){return {
        text: 'Copy Necropsy',
        name: 'copyNecropsy',
        requiredQC: 'Completed',
        disabled: false,
        ref: 'copyNecropsyBtn',
        handler: function(o){
            var theWindow = new Ext.Window({
                closeAction:'hide',
                title: 'Copy From Necropsy',
                //height: 900,
                items: [{
                    width: 350,
                    xtype: 'ehr-necropsycopy',
                    targetStore: this.store
                }]
            }).show();
        },
        scope: this
        }
    },
    /**
     * Necrospy-specific button that will create/update a record (depending on whether one already exists) in either Deaths or Prenatal Deaths (depending on the ID prefix of the animal's name).
     */
    FINALIZEDEATH: function(){return {
        text: 'Finalize Death',
        name: 'finalizeDeath',
        requiredQC: 'Completed',
        //targetQC: 'Completed',
        errorThreshold: 'INFO',
        //successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'finalizeDeathBtn',
        handler: function(o){
            Ext.Msg.confirm('Finalize Death', 'You are about to finalize this death record on this animal.  This will end all treatments, problems, assignments and housing. BE ABSOLUTELY SURE YOU WANT TO DO THIS BEFORE CLICKING SUBMIT.', function(v){
                if(v=='yes'){
                    Ext.Msg.wait('Saving...');

                    var store = Ext.StoreMgr.get('study||Necropsies||||');
                    var record = store.getAt(0);
                    var store2 = Ext.StoreMgr.get('study||Weight||||');
                    var record2 = store2.getAt(0);

                    if(!record ||
                            !record.get('Id') ||
                            !record.get('causeofdeath') ||
                            !record.get('timeofdeath') ||
                            !record.get('project')
                            ){
                        alert('Must provide Id, project, type of death, and time of death');
                        return;
                    }

                    var Id = record.get('Id');
                    var obj = {
                        Id: Id,
                        project: record.get('project'),
                        date: record.get('timeofdeath'),
                        cause: record.get('causeofdeath'),
                        manner: record.get('mannerofdeath'),
                        necropsy: record.get('caseno'),
                        parentid: record.get('objectid'),
                        weight: record2.get('weight'),
                        necropsyDate: record.get('date')
                    };

                    var queryName;
                    if(Id.match(/^pd/))
                        queryName = 'Prenatal Deaths';
                    else
                        queryName = 'Deaths';

                    //we look for a death record
                    LABKEY.Query.selectRows({
                        schemaName: 'study',
                        queryName: queryName,
                        scope: this,
                        filterArray: [
                            LABKEY.Filter.create('Id', Id, LABKEY.Filter.Types.EQUAL)
                        ],
                        success: function(data){
                            if(data && data.rows && data.rows.length){
                                obj.lsid = data.rows[0].lsid;
                                LABKEY.Query.updateRows({
                                    schemaName: 'study',
                                    queryName: queryName,
                                    rows: [obj],
                                    scope: this,
                                    success: function(data){
                                        Ext.Msg.hide();
                                        alert('Success updating '+queryName+' from necropsy for '+Id);
                                    },
                                    failure: EHR.Utils.onError
                                });
                            }
                            //otherwise we create a new record
                            else {

                                function doInsert(){
                                    LABKEY.Query.insertRows({
                                        schemaName: 'study',
                                        queryName: queryName,
                                        scope: this,
                                        rows: [obj],
                                        success: function(data){
                                            Ext.Msg.hide();
                                            alert('Success inserting into '+queryName+' from necropsy for '+Id)
                                        },
                                        failure: function(error){
                                            alert('ERROR: ' + (error.msg || error.exception));
                                            EHR.Utils.onError(error);
                                        }
                                    });
                                }

                                if(queryName=='Prenatal Deaths'){
                                    var selectorWin = new Ext.Window({
                                        closeAction:'hide',
                                        title: 'Prenatal Death',
                                        width: 450,
                                        items: [{
                                            xtype: 'form',
                                            style: 'padding: 5px;',
                                            items: [{
                                                emptyText:''
                                                ,fieldLabel: 'Species'
                                                ,ref: '../speciesField'
                                                ,xtype: 'combo'
                                                ,displayField:'common'
                                                ,valueField: 'common'
                                                ,typeAhead: true
                                                ,lazyInit: false
                                                ,mode: 'local'
                                                ,triggerAction: 'all'
                                                ,editable: true
                                                ,store: new LABKEY.ext.Store({
                                                    schemaName: 'ehr_lookups',
                                                    queryName: 'species',
                                                    sort: 'common',
                                                    autoLoad: true
                                                })
                                            },{
                                                emptyText:''
                                                ,fieldLabel: 'Gender'
                                                ,ref: '../genderField'
                                                ,xtype: 'combo'
                                                ,displayField:'meaning'
                                                ,valueField: 'code'
                                                ,typeAhead: true
                                                ,lazyInit: false
                                                ,mode: 'local'
                                                ,triggerAction: 'all'
                                                ,editable: true
                                                ,store: new LABKEY.ext.Store({
                                                    schemaName: 'ehr_lookups',
                                                    queryName: 'gender_codes',
                                                    sort: 'meaning',
                                                    autoLoad: true
                                                })
                                            },{
                                                    emptyText:''
                                                    ,fieldLabel: 'Dam'
                                                    ,ref: '../damField'
                                                    ,xtype: 'combo'
                                                    ,displayField:'Id'
                                                    ,valueField: 'Id'
                                                    ,typeAhead: true
                                                    ,lazyInit: false
                                                    ,mode: 'local'
                                                    ,triggerAction: 'all'
                                                    ,editable: true
                                                    ,store: new LABKEY.ext.Store({
                                                    schemaName: 'study',
                                                    sql: "SELECT * FROM study.demographics WHERE gender.code = 'f'",
                                                    //queryName: 'demographics',
                                                    sort: 'id',
                                                    autoLoad: true
                                                    //maxRows: 100,

                                                    })
                                                }]
                                        }],
                                        buttons: [{
                                            text:'Submit',
                                            disabled:false,
                                            ref: '../submit',
                                            scope: this,
                                            handler: function(s){
                                                obj.gender = s.ownerCt.ownerCt.genderField.getValue();
                                                obj.species = s.ownerCt.ownerCt.speciesField.getValue();
                                                obj.dam = s.ownerCt.ownerCt.damField.getValue();

                                                doInsert();

                                                s.ownerCt.ownerCt.hide();
                                            }
                                        },{
                                            text: 'Close',
                                            scope: this,
                                            handler: function(s){
                                                s.ownerCt.ownerCt.hide();
                                                return;
                                            }
                                        }]
                                    });

                                    selectorWin.show();
                                }
                                else {
                                    doInsert();
                                }
                            }
                        },
                        failure: function(error){
                            alert('ERROR: ' + (error.msg || error.exception));
                            EHR.Utils.onError(error);
                        }
                    });
                }
            }, this);
        },
        disableOn: 'ERROR',
        scope: this
    }
    },
    /**
     * Will attempt to convert the QCState of all records to 'Completed' and submit the form.  Similar to the other SUBMIT button; however, this button does not require a confirmation prior to submitting.
     */
    BASICSUBMIT: function(){return {
        text: 'Submit',
        name: 'basicsubmit',
        requiredQC: 'Completed',
        errorThreshold: 'INFO',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'submitBtn',
        handler: function(o){
            this.onSubmit(o);
        },
        disableOn: 'WARN',
        scope: this
        }
    },
    /**
     * Will attempt to convert the QCState of all records to 'Completed', submit the current form then reload with a blank new one.  Designed for single-record entry.
     */
    SUBMITANDNEXT: function(){return {
        text: 'Submit And Next',
        name: 'submit',
        requiredQC: 'Completed',
        targetQC: 'Completed',
        errorThreshold: 'INFO',
        successURL: LABKEY.ActionURL.buildURL("ehr", LABKEY.ActionURL.getAction(), null, {
            schemaName: LABKEY.ActionURL.getParameter('schemaName'),
            queryName: LABKEY.ActionURL.getParameter('queryName'),
            formtype: LABKEY.ActionURL.getParameter('formtype')
        }),
        disabled: true,
        ref: 'submitNextBtn',
        handler: this.onSubmit,
        disableOn: 'WARN',
        scope: this
        }
    },
    /**
     * Will attempt to convert all records to the QCState 'Review Required' and submit the form.
     */
    REVIEW: function(){return {
        text: 'Submit for Review',
        name: 'review',
        requiredQC: 'Review Required',
        targetQC: 'Review Required',
        errorThreshold: 'WARN',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'reviewBtn',
        disableOn: 'ERROR',
        handler: function(o){
            var theWindow = new Ext.Window({
                closeAction:'hide',
                title: 'Submit For Review',
                width: 350,
                scope: this,
                buttons: [{
                    text:'Submit',
                    disabled:false,
                    ref: '../submit',
                    scope: this,
                    handler: function(btn){
                        var assignedTo = btn.ownerCt.ownerCt.theForm.assignedTo.getValue();
                        if(!assignedTo){
                            alert('Must assign this task to someone');
                            return;
                        }
                        var taskStore = Ext.StoreMgr.get('ehr||tasks||||');
                        taskStore.getAt(0).set('assignedto', assignedTo);
                        theWindow.hide();
                        this.onSubmit(o);
                    }
                },{
                    text: 'Cancel',
                    scope: this,
                    handler: function(){
                        theWindow.hide();
                    }
                }],
                items: [{
                    xtype: 'form',
                    ref: 'theForm',
                    bodyStyle: 'padding:5px;',
                    items: [{
                        xtype: 'combo',
                        fieldLabel: 'Assign To',
                        width: 200,
                        triggerAction: 'all',
                        mode: 'local',
                        store: new LABKEY.ext.Store({
                            xtype: 'labkey-store',
                            schemaName: 'core',
                            queryName: 'PrincipalsWithoutAdmin',
                            columns: 'UserId,DisplayName',
                            sort: 'Type,DisplayName',
                            autoLoad: true,
                            listeners: {
                                //scope: this,
                                load: function(s){
                                    var recIdx = s.find('DisplayName', (o.ownerCt.ownerCt.reviewRequiredRecipient || 'dataentry (LDAP)'));
                                    if(recIdx!=-1){
                                        theWindow.theForm.assignedTo.setValue(s.getAt(recIdx).get('UserId'));
                                    }
                                }
                            }
                        }),
                        displayField: 'DisplayName',
                        valueField: 'UserId',
                        ref: 'assignedTo'
                    }]
                }]
            });
            theWindow.show();
        },
        scope: this
        }
    },
    /**
     * Will attempt to convert all records to a QCState of 'scheduled' and submit the form.
     */
    SCHEDULE: function(){return {
        text: 'Schedule',
        name: 'review',
        requiredQC: 'Scheduled',
        targetQC: 'Scheduled',
        errorThreshold: 'WARN',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'scheduledBtn',
        disableOn: 'ERROR',
        handler: this.onSubmit,
        scope: this
        }
    },
    /**
     * Re-runs server-side validation on all records.  Primarily useful if something goes wrong in the normal validation process and an error will not disappear as it should
     */
    VALIDATE: function(){return {
        text: 'Validate',
        name: 'validate',
        //targetQC: 'In Progress',
        //errorThreshold: 'WARN',
        //successURL: LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: false,
        ref: 'validateBtn',
        handler: this.validateAll,
        //disableOn: 'ERROR',
        scope: this
        }
    },
    /**
     * Will attempt to convert all records to a QCState of 'Delete Requested' and submit the form.  NOTE: this button and the requestDelete method should really be converted to perform a true delete
     */
    DISCARD: function(){return {
        text: 'Discard',
        name: 'discard',
        ref: 'discardBtn',
        targetQC: 'Delete Requested',
        requiredQC: 'Delete Requested',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        handler: this.requestDelete,
        //handler: this.onSubmit,
        scope: this
        }
    },
    /**
     * Similar to DISCARD, but the button has a different label.  In some situations 'Discard' was interpreted more like 'discard changes'.  NOTE: this button and the requestDelete method should really be converted to perform a true delete
     */
     DELETEBTN: function(){return {
        text: 'Delete',
        name: 'delete',
        ref: 'deleteBtn',
        targetQC: 'Delete Requested',
        requiredQC: 'Delete Requested',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        handler: this.requestDelete,
        //handler: this.onSubmit,
        scope: this
        }
    },
    /**
     * Will submit/save the form and then return to the dataEntry page.  It does not alter the QCState of records.
     */
    CLOSE: function(){return {
        text: 'Save & Close',
        name: 'closeBtn',
        //targetQC: 'In Progress',
        requiredQC: 'In Progress',
        errorThreshold: 'WARN',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'closeBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    /**
     * This button will open an EHR.ext.PrintTaskPanel with this form; however, this class is not fully completed at time of writing.  The intent was to provide a print-friendly view of the records.  This button is not currently used.
     */
    PRINT: function(){return {
        text: 'Print',
        name: 'print',
        ref: 'printBtn',
        handler: function(){
            this.mon(this.store, 'commitcomplete', function(){
                window.open(LABKEY.ActionURL.buildURL('ehr','printTask.view', null, {_print: 1, formtype:this.formType, taskid: this.formUUID}))
            }, this, {single: true});

            this.onSubmit({
                text: 'Print',
                name: 'print'
            });
        },
        requiredQC: 'In Progress',
        errorThreshold: 'WARN',
        disabled: true,
        disableOn: 'ERROR',
        scope: this
        }
    },
    /**
     * This button will attempt to convert the QCState of records to 'Request: Pending' and submit the form.  Default button for request pages.
     */
    REQUEST: function(){return {
        text: 'Request',
        name: 'request',
        targetQC: 'Request: Pending',
        requiredQC: 'Request: Pending',
        errorThreshold: 'WARN',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "requestServices.view"),
        disabled: true,
        ref: 'requestBtn',
        handler: this.onSubmit,
        disableOn: 'WARN',
        scope: this
        }
    },
    /**
     * This button will convert the QCState on records to 'Request: Approved' and submit.  Not currently used in the EHR, because requests are better managed through the tabbed UI on the dataEntry page.
     */
    APPROVE: function(){return {
        text: 'Approve Request',
        name: 'approve',
        targetQC: 'Request: Approved',
        requiredQC: 'Request: Approved',
        errorThreshold: 'WARN',
        successURL : LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL("ehr", "dataEntry.view"),
        disabled: true,
        ref: 'approveBtn',
        handler: this.onSubmit,
        disableOn: 'ERROR',
        scope: this
        }
    },
    /**
     * This button will navigate the user to the non-read only manageTask page, showing the current task.  It was designed to be used on a read-only TaskDetailsPanel.
     */
    EDIT: function(){return {
        text: 'Edit',
        name: 'edit',
        targetQC: 'Completed',
        requiredQC: 'Completed',
        errorThreshold: 'WARN',
        handler: function(){
            window.onbeforeunload = Ext.emptyFn;
            window.location = LABKEY.ActionURL.buildURL('ehr','manageTask.view', null, {formtype:this.formType, taskid: this.formUUID});
        },
        disabled: false,
        ref: 'editBtn',
        disableOn: 'ERROR'
        }
    },
    /**
     * This button will only appear for RequestAdmins and is designed to allow them to edit the ehr.request record associated with the request for the purpose of editing the notification recipients.  It was designed to be added to a RequestDetailsPanel.
     */
    EDITCONTACTS: function(){return {
        text: 'Edit Contacts',
        name: 'edit',
        requiredQC: 'Request: Approved',
        requiredPermission: 'admin',
        errorThreshold: 'WARN',
        handler: function(){
            window.onbeforeunload = Ext.emptyFn;
            window.location = LABKEY.ActionURL.buildURL('ehr','manageRecord.view', null, {schemaName: 'ehr', queryName: 'Requests', keyField: 'requestid', key: this.formUUID, update: 1});
        },
        disabled: false,
        ref: 'editBtn',
        disableOn: 'ERROR'
        }
    }
};
