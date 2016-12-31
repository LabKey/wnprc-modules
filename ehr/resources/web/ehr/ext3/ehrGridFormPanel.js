/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');


/**
 * Constructs a new EHR GridFormPanel using the supplied configuration.
 * @class
 * EHR extension to the Ext.Panel class, which constructs a panel containing an EHR.ext.FormPanel and EHR.ext.EditorGridPanel, configured based on the query's metadata.
 * The GridFormPanel is a combination of an EHR.ext.FormPanel and EHR.ext.EditorGridPanel.  The combined unit shares a single Ext store.
 * It is designed to provide a mechanism to work with and edit multiple records at a time.  When a record is selected, it
 * becomes 'bound' to the FormPanel and can be edited.  The user can click between any records in the grid, editing them in the FormPanel as they go along.
 * <p>
 * This class attempts to outsource as much to the GridFormPanel and FormPanel as possible.  It does contain its own button bars (so that they will span both components),
 * and had to override the child components' handling of these.
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
 * @param config Configuration properties. This may contain any of the configuration properties supported
 * by the <a href="http://www.extjs.com/deploy/dev/docs/?class=Ext.Panel">Ext.Panel</a>, plus those listed here.
 * You may construct a GridFormPanel by either supplying a store or by supplying a schema/query (in which case a store will be automatically created).  Also, be aware that
 * the internal FormPanel automatically uses the plugin EHR.ext.plugins.DataBind to bind form entry to an Ext record.  Please see documentation for this plugin for more information.
 *
 * @param {String} [config.store] An EHR.ext.AdvancedStore configured for a LabKey query.
 * @param {String} [config.containerPath] The container path from which to get the data. If not specified, the current container is used.  Will be ignored if a store is provided.
 * @param {String} [config.schemaName] The LabKey schema to query.  Will be ignored if a store is provided.
 * @param {String} [config.queryName] The query name within the schema to fetch.  Will be ignored if a store is provided.
 * @param {String} [config.viewName] A saved custom view of the specified query to use if desired.  Will be ignored if a store is provided.
 * @param {String} [config.columns] A comma separated list of columns for the store to use.  Will be ignored if a store is provided.
 * @param {String} [config.tbarBtns] A commas separated list of the buttons to display in the grid.  These strings refer to the static button configs defined in EHR.ext.GridFormPanel.gridBtns.  This mechanism was designed to provide most convient usage within the EHR (which has many forms sharing few buttons)
 * @param {String} [config.bbarBtns] Similar to tbatBtns, except configures buttons in the bottom toolbar (bbar).  See tbarBtns for more information.
 * @param {Boolean} [config.showStatus] If true, a status bar will appear below the grid providing information about validation status.
 * @param {Boolean} [config.readOnly] If true, the fields on the FormPanel will be read-only.
 * @param {Integer} [config.gridWidth] The width of the EditorGridPanel created by this class.
 * @param {Object} [config.metadata] A metadata object that will be applied to the default metadata returned by the server.  See EHR.ext.AdvancedStore for more detail on metadata.
 * @param {Object} [config.storeConfig] A config object for EHR.ext.AdvancedStore that will be used to create the store.  Will only be used if no store is provided.
 * @example &lt;script type="text/javascript"&gt;
    var grid, store;
    Ext.onReady(function(){

        //create a Store bound to the 'Users' list in the 'core' schema
        var store = new EHR.ext.AdvancedStore({
            schemaName: 'study',
            queryName: 'Demographics'
        });

        //create a grid using that store as the data source
        var grid = new EHR.ext.GridFormPanel({
            store: store,
            renderTo: 'grid'
        });
    });

&lt;/script&gt;
&lt;div id='grid'/&gt;
 */

EHR.ext.GridFormPanel = Ext.extend(Ext.Panel,
{
    initComponent: function()
    {
        this.storeConfig = this.storeConfig || {};

        if (!this.store) {
            var newStoreConfig = Ext.applyIf(this.storeConfig, {
                //xtype: 'ehr-store',
                containerPath: this.containerPath,
                schemaName: this.schemaName,
                queryName: this.queryName,
                viewName: this.viewName || '~~UPDATE~~',
                columns: this.columns || EHR.Metadata.Columns[this.queryName] || '',
                storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
                filterArray: this.filterArray || [],
                metadata: this.metadata
                //autoLoad: true
            });

            // Issue 4241: Ensure that we have a unique storeid.
            //
            //  ** Note that there are some places in the code (such as form/formpanel configurations) where the
            //     storeid is hardcoded, so it is not a good idea to change this unless necessary.  This should only
            //     get invoked if there are multiple grids on a page that save to the same schema/query/view.
            if ( typeof(Ext.StoreMgr.get(newStoreConfig.storeId)) !== 'undefined' ) {
                var base = newStoreConfig.storeId;
                var iterator = 1;  // the next one will start with //2, because this will get incremented before assignment
                var newid = "";
                do {
                    iterator++;
                    newid = base + "//" + iterator;
                } while (typeof(Ext.StoreMgr.get(newid)) !== 'undefined');
                newStoreConfig.storeId = newid;
            }

            this.store = new EHR.ext.AdvancedStore(newStoreConfig);
        }

        //set buttons
        var tbar = {xtype: 'toolbar', items: []};
        this.tbarBtns = this.tbarBtns || ['add', 'addbatch', 'requestdelete', 'selectall', 'duplicate', 'bulk_edit', 'apply_template', 'save_template'];
        for (var i=0;i<this.tbarBtns.length;i++){
            var btnCfg = this.gridBtns[this.tbarBtns[i]];
            if(btnCfg.requiredQC){
                if(!EHR.Security.hasPermission(btnCfg.requiredQC, 'insert', {queryName: this.queryName, schemaName: this.schemaName}))
                    btnCfg.disabled = true;
            }
            btnCfg.scope = this;
            tbar.items.push(btnCfg);
            if(i != this.tbarBtns.length-1){
                tbar.items.push('-');
            }
        };

        var bbar;
        if(this.showStatus){
            bbar = {
                xtype: 'statusbar',
                defaultText: 'Default text',
                text: 'No records',
                statusAlign: 'left',
                spacer: 'tbspacer',
                iconCls: 'x-status-valid',
                //items: [{xtype: 'tbspacer', width: 50}]
                items: []
            };
        }
        else {
            bbar = [];
        }

        //var bbar = {xtype: 'toolbar', items: []};
        this.bbarBtns = this.bbarBtns || []; //['markSelectedComplete', 'markComplete', 'validate'];
        for (var i=0;i<this.bbarBtns.length;i++){
            var btnCfg = this.gridBtns[this.bbarBtns[i]];
            if(btnCfg.requiredQC){
                if(!EHR.Security.hasPermission(btnCfg.requiredQC, 'insert', {queryName: this.queryName, schemaName: this.schemaName}))
                    btnCfg.disabled = true;
            }
            btnCfg.scope = this;
            bbar.items.push(btnCfg);
            if(i != this.bbarBtns.length-1){
                bbar.items.push('-');
            }
            else {
                bbar.items.push({xtype: 'tbspacer', width: 50});
                bbar.items.push('->');
            }
        };


        this.buttonAlign = 'left';
        Ext.applyIf(this, {
            autoHeight: true
            //,autoWidth: true
            ,forceLayout: true
            ,layout: 'table'
            ,columns: 2
            ,style: 'margin-bottom: 15px;'
            ,tbar: tbar
            ,bbar: bbar
            ,border: true
            ,defaults: {
                border: false,
                bodyBorder: false
            }
            ,items: [{
                xtype: 'ehr-formpanel',
                cellCls: 'ehr-gridpanel-cell',
                autoHeight: true,
                width: 340,
                name: this.queryName,
                schemaName: this.schemaName,
                queryName: this.queryName,
                viewName: this.viewName,
                bindConfig: {
                    disableUnlessBound: true,
                    bindOnChange: false,
                    showDeleteBtn: false
                },
                //buttonAlign: 'right',
                ref: 'theForm',
                metadata: this.metadata,
                store: this.store,
                importPanel: this.importPanel || this,
                border: false,
                bodyBorder: false,
                readOnly: this.readOnly,
                items: {xtype: 'displayfield', value: 'Loading...'}
            },{
                xtype: 'ehr-editorgrid',
                style: 'margin-top: 5px;margin-left:15px',
                //NOTE: this is done to make sure the grid aligns vertically
                //TODO: might be better to just set style on cell directly
                //style is: "vertical-align: top;"
                cls: 'ehr-' + this.queryName.toLowerCase().replace(' ', '_') + '-records-grid', // marker class for testing
                cellCls: 'ehr-gridpanel-cell',
                //cellStyle: 'vertical-align: top;',
                title: 'Records',
                editable: false, //this.editable!==false ? true : false,
                width: this.gridWidth || 950,
                height: 700,
                maxHeight: 700,
                autoHeight: false,
                store: this.store,
                ref: 'theGrid',
                importPanel: this.importPanel || this,
                readOnly: this.readOnly,
                tbar: [],
                sm: new Ext.grid.RowSelectionModel()
            }],
            keys: [{
                key: 'r',
                ctrl: true,
                alt: true,
                handler: function(e, k){
                    this.theGrid.getSelectionModel().selectPrevious();
                    //this.theForm.focusFirstField.defer(30, this);
                },
                scope: this
            },{
                key: 'f',
                ctrl: true,
                alt: true,
                handler: function(e, k){
                    this.theGrid.getSelectionModel().selectNext();
                    //this.theForm.focusFirstField.defer(30, this);
                },
                scope: this
            }]
        });

        EHR.ext.GridFormPanel.superclass.initComponent.call(this);

        this.theGrid.getSelectionModel().on('selectionchange', function(sm){
            //select the first record
            var recs = sm.getSelections();

            if (recs.length==1){
                if(recs[0] != this.theForm.boundRecord){
                    //NOTE: this allows any changes to values of select menus to commit before bindRecord() runs
                    this.theForm.bindRecord.defer(100, this.theForm, [recs[0]]);
                    //this.theForm.focusFirstField.defer(250, this.theForm);
                }
            }
            else {
                this.theForm.unbindRecord();
            }
        }, this, {buffer: 20});

        if(this.showStatus){
            this.mon(this.theForm, 'recordchange', this.onRecordChange, this, {delay: 100});
            this.mon(this.store, 'validation', this.onStoreValidate, this, {delay: 100});
        }

        this.addEvents('beforesubmit');
    },

    //private
    //updates the status bar when no records are bound
    onRecordChange: function()
    {
        if(!this.theForm.boundRecord)
            this.getBottomToolbar().setStatus({text: 'No Records'})
    },

    //private
    //updates the status bar when a record is validated.  delegates markInvalid() to the FormPanel
    onStoreValidate: function(store, records)
    {
        if(store.errors.getCount()){
            this.getBottomToolbar().setStatus({text: store.maxErrorSeverity(), iconCls: 'x-status-error'});
        }
        else
            this.getBottomToolbar().setStatus({text: 'Section OK', iconCls: 'x-status-valid'});

        this.theForm.markInvalid();
    },

    //private
    //static config objects used to create buttons.  the intent is to have the code behind buttons centralized such that buttons
    //can be more easily reused between forms.  the config 'tbarBtns' and bbarBtns can reference these buttons used their string names
    gridBtns: {
        'add': {
            text: 'Add Record',
            //requiredQC: 'In Progress',
            xtype: 'button',
            tooltip: 'Click to add a blank record',
            name: 'add-record-button',
            handler: function ()
            {
                var store = this.theGrid.store;
                if (store.recordType)
                {
                    store.addRecord();
                    this.theGrid.getSelectionModel().selectLastRow();
                    this.theForm.focusFirstField();
                }
            }
        },
        'delete': {
            text: 'Delete Selected',
            xtype: 'button',
            tooltip: 'Click to delete selected row(s)',
            name: 'delete-records-button',
            handler: function()
            {
                if(!this.theGrid.getSelectionModel().getSelections().length){
                    Ext.Msg.alert('Error', 'No rows selected');
                    return;
                }

                Ext.MessageBox.confirm(
                    'Confirm',
                    'You are about to permanently delete these records.  It cannot be undone.  Are you sure you want to do this?',
                    function(val){
                        if(val=='yes'){
                            Ext.Msg.wait("Deleting Records...");

                            this.theGrid.stopEditing();
                            var recs = this.theGrid.getSelectionModel().getSelections();
                            this.theForm.unbindRecord();

                            function onComplete(response){
                                this.store.un('commitcomplete', onComplete);
                                this.store.un('commitexception', onComplete);
                                Ext.Msg.hide();
                            }

                            this.store.on('commitcomplete', onComplete, this, {single: true});
                            this.store.on('commitexception', onComplete, this, {single: true});
                            this.store.deleteRecords(recs);
                        }
                    },
                    this);
            }
        },
        'requestdelete': {
            text: 'Delete Selected',
            xtype: 'button',
            tooltip: 'Click to delete selected row(s)',
            name: 'delete-records-button',
            handler: function()
            {
                if(!this.theGrid.getSelectionModel().getSelections().length){
                    Ext.Msg.alert('Error', 'No rows selected');
                    return;
                }

                Ext.MessageBox.confirm(
                    'Confirm',
                    'You are about to permanently delete these records.  It cannot be undone.  Are you sure you want to do this?',
                    function(val){
                        if(val=='yes'){
                            Ext.Msg.wait("Deleting Records...");

                            this.theGrid.stopEditing();
                            var recs = this.theGrid.getSelectionModel().getSelections();
                            this.theForm.unbindRecord();

                            function onComplete(){
                                this.store.un('commitcomplete', onComplete);
                                this.store.un('commitexception', onComplete);
                                Ext.Msg.hide();
                            }

                            this.store.on('commitcomplete', onComplete, this, {single: true});
                            this.store.on('commitexception', onComplete, this, {single: true});
                            this.store.requestDeleteRecords(recs);
                        }
                    },
                    this);
            }
        },
        'next': {
                text: 'Select Next',
                xtype: 'button',
                tooltip: 'Click to move one record forward',
                name: 'select-next-button',
                handler: function()
                {
                    this.theGrid.getSelectionModel().selectNext();
                    this.theForm.focusFirstField();
                },
                scope: this
        },
        'previous': {
                text: 'Select Previous',
                xtype: 'button',
                tooltip: 'Click to move one record backward',
                name: 'select-previous-button',
                handler: function()
                {
                    this.theGrid.getSelectionModel().selectPrevious();
                    this.theForm.focusFirstField();
                },
                scope: this
        },
        'selectall': {
                text: 'Select All',
                xtype: 'button',
                tooltip: 'Click to move one record backward',
                name: 'select-previous-button',
                handler: function()
                {
                    this.theGrid.getSelectionModel().selectAll();
                },
                scope: this
        },
        'duplicate': {
            text: 'Duplicate Selected',
            //requiredQC: 'In Progress',
            xtype: 'button',
            tooltip: 'Duplicate Selected Record',
            name: 'duplicate-button',
            handler: function()
            {
                var records = this.theGrid.getSelectionModel().getSelections();
                if(!records || !records.length){
                    Ext.Msg.alert('Error', 'No rows selected');
                    return;
                }

                var theWindow = new Ext.Window({
                    closeAction:'hide',
                    title: 'Duplicate Records',
                    items: [{
//                        layout: 'form',
                        width: 350,
                        xtype: 'ehr-recordduplicator',
                        ref: 'recordduplicator',
                        targetStore: this.store,
                        records: records
                    }]
                });

                theWindow.show();
            }
        },
        'addbatch': {
                text: 'Add Batch',
                //requiredQC: 'In Progress',
                xtype: 'button',
                scope: this,
                tooltip: 'Click to add a group of animals',
                name: 'add-batch-button',
                handler: function()
                {
                    this.animalSelectorWin = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-animalselector',
                            ref: 'animalselector',
                            targetStore: this.store,
                            title: ''
                        }]
                    });

                    this.animalSelectorWin.show();
                }
            },
        'addseries': {
                text: 'Add Series',
                requiredQC: 'In Progress',
                xtype: 'button',
                scope: this,
                tooltip: 'Click to add a series of IDs',
                name: 'add-series-button',
                handler: function()
                {
                    this.addSeriesWin = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-addseries',
                            ref: 'addseries',
                            targetStore: this.store,
                            title: ''
                        }]
                    });

                    this.addSeriesWin.show();
                }
            },
        'addtreatments': {
                text: 'Add Treatments',
                requiredQC: 'In Progress',
                xtype: 'button',
                scope: this,
                tooltip: 'Click to add scheduled treatments',
                name: 'add-treatments-button',
                handler: function()
                {
                    this.treatmentSelectorWin = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-treatmentselector',
                            ref: 'treatmentselector',
                            targetStore: this.store,
                            title: ''
                        }]
                    });

                    this.treatmentSelectorWin.show();
                }
            },
        //NOTE: this was originally created as an admin mechanism to allow certain users to retroactively enter treatments
        //I since edited to primary AddTreatments btn to conditionally show a date picker for admins, so this button can probably
        //be deprecated.
        'addtreatments2': {
                text: 'Add Treatments - Admin',
                requiredQC: 'In Progress',
                xtype: 'button',
                scope: this,
                tooltip: 'Click to add previously scheduled treatments',
                name: 'add-treatments-button',
                handler: function()
                {
                    this.treatmentSelectorWin = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-treatmentselector2',
                            ref: 'treatmentselector',
                            targetStore: this.store,
                            title: ''
                        }]
                    });

                    this.treatmentSelectorWin.show();
                }
            },
            'apply_template': {
                text: 'Apply Template',
                xtype: 'button',
                scope: this,
                tooltip: 'Add records to this grid based on a saved template',
                title: 'Apply Template',
                name: 'apply-template-button',
                handler: function()
                {
                    var theWindow = new Ext.Window({
                        closeAction:'hide',
                        width: 350,
                        items: [{
                            xtype: 'ehr-applytemplatepanel',
                            formType: this.store.storeId,
                            ref: 'theForm'
                        }]
                    });

                    theWindow.show();
                }
            },
            'save_template': {
                text: 'Save As Template',
                xtype: 'button',
                scope: this,
                tooltip: 'Save selected records as a template',
                title: 'Save Template',
                name: 'save-template-button',
                handler: function()
                {
                    var theWindow = new EHR.ext.SaveTemplatePanel({
                        width: 600,
                        height: 300,
                        importPanel: this.importPanel,
                        grid: this.theGrid,
                        formType: this.store.storeId
                    });
                    theWindow.show();
                }
            },
            bulk_edit: {
                text: 'Bulk Edit',
                disabled: false,
                tooltip: 'Click this to change values on all checked rows in bulk',
                scope: this,
                handler : function(c){
                    var totalRecs = this.theGrid.getSelectionModel().getSelections().length;
                    if(!totalRecs){
                        Ext.Msg.alert('Error', 'No rows selected');
                        return;
                    }

                    var fields = [];
                    this.store.fields.each(function(c){
                        if(!c.hidden && !c.isReadOnly && c.isUserEditable!==false)
                            fields.push([c.dataIndex, c.fieldLabel, c])
                    }, this);

                    var comboStore = new Ext.data.ArrayStore({
                        fields: ['value', 'name', 'meta'],
                        data: fields
                    });

                    var batchEditWin = new Ext.Window({
                        width: 350,
                        autoHeight: true,
                        bodyStyle:'padding:5px',
                        closeAction:'hide',
                        scope: this,
                        plain: true,
                        keys: [
                            {
                                key: Ext.EventObject.ENTER,
                                handler: this.onEdit,
                                scope: this
                            }
                        ],
                        title: 'Batch Edit',
                        layout: 'form',
                        items: [{
                            html: 'Editing '+totalRecs+' records',
                            style: 'padding-bottom: 10px;background-color: transparent;'
                        },{
                            emptyText:''
                            ,fieldLabel: 'Select Field'
                            ,ref: 'fieldName'
                            ,xtype: 'combo'
                            ,displayField:'name'
                            ,valueField: 'value'
                            ,typeAhead: true
                            ,triggerAction: 'all'
                            ,isFormField: false
                            ,mode: 'local'
                            ,width: 200
                            ,editable: false
                            ,required: true
                            ,store: comboStore
                            ,listeners: {
                                scope: this,
                                select: function(combo, rec){
                                    var editor = this.store.getFormEditorConfig(rec.get('value'));
                                    editor.width = 200;
                                    if(editor.originalConfig.inputType=='textarea')
                                        editor.height = 100;
                                    editor.ref = editor.name;

                                    if(!batchEditWin[editor.name]){
                                        batchEditWin.fieldVal = batchEditWin.add(editor);
                                    }
                                    combo.setValue('');
                                    batchEditWin.doLayout();

                                }
                            }
                        }],
                        buttons: [{
                            text:'Reset',
                            disabled:false,
                            ref: '../reset',
                            scope: this,
                            handler: function(){
                                batchEditWin.items.each(function(item){
                                    if(item.isFormField){
                                        batchEditWin.remove(item);
                                    }
                                }, this);
                            }
                        },{
                            text:'Submit',
                            disabled:false,
                            formBind: true,
                            ref: '../submit',
                            scope: this,
                            handler: onEdit
                        },{
                            text: 'Close',
                            ref: '../close',
                            scope: this,
                            handler: function(c){
                                batchEditWin.hide();
                            }
                        }]
                    });

                    this.theGrid.stopEditing();
                    var s = this.theGrid.getSelectionModel().getSelections();
                    this.theGrid.getSelectionModel().clearSelections();

                    batchEditWin.show();

                    function onEdit(){
                        batchEditWin.hide();
                        var toChange = [];
                        batchEditWin.items.each(function(item){
                            if(item.isFormField){
                                var v;
                                if (item instanceof Ext.form.RadioGroup){
                                    v = (item.getValue() ? item.getValue().inputValue : null);
                                }
                                else if (item instanceof Ext.form.Radio){
                                    if(item.checked)
                                        v = item.getValue();
                                    else
                                        v = false;
                                }
                                else if (item instanceof Ext.form.CheckboxGroup){
                                    v = item.getValueAsString();
                                }
                                else
                                    v = item.getValue();

                                toChange.push([item.name, v]);
                            }
                        }, this);

                        for (var i = 0, r; r = s[i]; i++){
                            r.beginEdit();
                            Ext.each(toChange, function(i){
                                r.set(i[0], i[1]);
                            });
                            r.endEdit();
                        }

                        //reset the form
                        batchEditWin.fieldVal.reset();
                        batchEditWin.items.each(function(item){
                            if(item.isFormField){
                                batchEditWin.remove(item);
                            }
                        }, this);
                    }
                }
        },
        validate: {
            text: 'Validate Section',
            xtype: 'button',
            scope: this,
            tooltip: 'Validate records',
            title: 'Validate Section',
            name: 'validate-button',
            handler: function()
            {
                if(this.store.getCount()){
                    this.store.each(function(r){
                        this.store.validateRecordOnServer(r);
                    }, this);
                }
            }
        },
        markComplete: {
            text: 'Mark Section Complete',
            xtype: 'button',
            scope: this,
            tooltip: 'Mark Section Complete',
            title: 'Mark Section Complete',
            name: 'mark-all-complete-button',
            handler: function()
            {
                this.store.each({

                }, this);
            }
        },
        markSelectedComplete: {
            text: 'Mark Selected Complete',
            xtype: 'button',
            scope: this,
            tooltip: 'Mark Selected Complete',
            title: 'Mark Selected Complete',
            name: 'mark-selected-complete-button',
            handler: function()
            {
                var records = this.theGrid.getSelectionModel().getSelections();
                if(!records || !records.length){
                    Ext.Msg.alert('Error', 'No rows selected');
                    return;
                }

                Ext.each(records, function(r){

                }, this);
            }
        },
        pruneObsRecords: {
            text: 'Remove Blank',
            xtype: 'button',
            scope: this,
            tooltip: 'Remove Blank Records',
            title: 'Remove Blank',
            name: 'remove-blank-records',
            handler: function()
            {
                Ext.Msg.confirm('Remove Blank Records', 'This will remove any unsaved records that have no observations.  Do you want to do this?', function(v){
                    if(v=='yes'){
                        if(!this.store.getCount()){
                            return;
                        }

                        this.store.each(function(r){
                            if(r.phantom
                                && !r.get('remark')
                                && !r.get('feces')
                                && !r.get('menses')
                                && !r.get('other')
                                && !r.get('tlocation')
                                && !r.get('behavior')
                                && !r.get('otherbehavior')
                                && !r.get('breeding')
                            ){
                                this.store.remove(r);
                            }
                        }, this);
                    }
                }, this);
            }
        },

        addscheduledblood: {
            text: 'Add Scheduled Blood',
            requiredQC: 'In Progress',
            xtype: 'button',
            scope: this,
            tooltip: 'Click to add scheduled blood draws',
            name: 'add-blood-button',
            handler: function()
            {
                this.bloodSelectorWin = new Ext.Window({
                    closeAction:'hide',
                    width: 350,
                    items: [{
                        xtype: 'ehr-bloodselector',
                        ref: 'bloodselector',
                        targetStore: this.store,
                        parentPanel: this,
                        title: ''
                    }]
                });

                this.bloodSelectorWin.show();
            }
        },

        copytodiagnosis: {
            text: 'Copy To Diagnosis',
            //requiredQC: 'In Progress',
            xtype: 'button',
            scope: this,
            tooltip: 'Click to copy records to the diagnosis section',
            name: 'add-blood-button',
            handler: function()
            {
                var targetStore = Ext.StoreMgr.get("study||Morphologic Diagnosis||||");
                if(targetStore){
                    var recs = this.theGrid.getSelectionModel().getSelections();
                    if(!recs.length){
                        alert('Must select one or more records.  Use the \'Select All\' button to choose all.');
                        return;
                    }

                    if(recs.length){
                        Ext.each(recs, function(r){
                            targetStore.addRecord({
                                Id: r.get('Id'),
                                date: r.get('date'),
                                tissue: r.get('tissue'),
                                tissue_qualifier: r.get('qualifier')
                            });
                        }, this);
                    }
                }
            }
        },

        copytohistology: {
            text: 'Copy To Histology',
            //requiredQC: 'In Progress',
            xtype: 'button',
            scope: this,
            tooltip: 'Click to copy records to the histology section',
            name: 'add-blood-button',
            handler: function()
            {
                var targetStore = Ext.StoreMgr.get("study||Histology||||");
                if(targetStore){
                    var recs = this.theGrid.getSelectionModel().getSelections();
                    if(!recs.length){
                        alert('Must select one or more records.  Use the \'Select All\' button to choose all.');
                        return;
                    }

                    if(recs.length){
                        Ext.each(recs, function(r){
                            targetStore.addRecord({
                                Id: r.get('Id'),
                                date: r.get('date'),
                                tissue: r.get('tissue'),
                                qualifier: r.get('qualifier')
                            });
                        }, this);
                    }
                }
            }
        },

        copyfromarrival: {
            text: 'Copy From Arrival',
            //requiredQC: 'In Progress',
            xtype: 'button',
            scope: this,
            tooltip: 'Click to copy records from the arrivals section',
            name: 'add-blood-button',
            handler: function()
            {
                var store = Ext.StoreMgr.get("study||Arrival||||");
                if(store){
                    store.each(function(r){
                        this.store.addRecord({
                            Id: r.get('Id')
                        });
                    }, this);
                }
            }
        },

        copyfromclinpath: {
            text: 'Copy From Clinpath Runs',
            //requiredQC: 'In Progress',
            xtype: 'button',
            scope: this,
            tooltip: 'Click to copy records from the clinpath runs section',
            name: 'add-clinpath-button',
            handler: function()
            {
                var store = Ext.StoreMgr.get("study||Clinpath Runs||||");
                if(store){
                    var type = this.store.queryName.split(' ');
                    type = type[0];
                    store.each(function(r){
                        if(r.get('type') == type){
                            this.store.addRecord({
                                Id: r.get('Id'),
                                date: r.get('date')
                            });
                        }
                    }, this);
                }
            }
        },

        addchemexcel: {
            text: 'Add Bulk',
            requiredQC: 'In Progress',
            xtype: 'button',
            scope: this,
            tooltip: 'Click to add results from a Meriter excel file',
            name: 'add-blood-button',
            handler: function()
            {
                this.selectorWin = new Ext.Window({
                    closeAction:'hide',
                    width: 450,
                    items: [{
                        xtype: 'ehr-chemexcelwin',
                        ref: 'chemselector',
                        targetStore: this.store,
                        parentPanel: this,
                        title: ''
                    }]
                });

                this.selectorWin.show();
            }
        },

        addhematologyexcel: {
            text: 'Add Bulk',
            requiredQC: 'In Progress',
            xtype: 'button',
            scope: this,
            tooltip: 'Click to add results from a XS-1000 Hematology Analyzer',
            name: 'add-hematology-button',
            handler: function()
            {
                this.selectorWin = new Ext.Window({
                    closeAction:'hide',
                    width: 450,
                    items: [{
                        xtype: 'ehr-hematologyexcelwin',
                        ref: 'hematologyselector',
                        targetStore: this.store,
                        parentPanel: this,
                        title: ''
                    }]
                });

                this.selectorWin.show();
            }
        },

        sortany: {
            text: 'Sort',
            xtype: 'button',
            scope: this,
            tooltip: 'Sort records',
            name: 'sort-button',
            handler: function()
            {
                this.selectorWin = new Ext.Window({
                    closeAction:'hide',
                    title: 'Sort',
                    width: 350,
                    items: [{
                        xtype: 'ehr-storesorterpanel',
                        targetStore: this.store,
                        parentPanel: this
                    }]
                });

                this.selectorWin.show();

//                this.store.data.sort('ASC', EHR.Utils.sortStore([
//                    {term: 'slideNum'},
//                    {term: 'tissue', storeId: 'ehr_lookups||snomed||code||meaning', displayField: 'meaning', valueField: 'code'},
//                    {term: 'qualifier'}
//                ]));
//                this.store.fireEvent('datachanged', this.store);
            }
        }
    }
});

Ext.reg('ehr-gridformpanel', EHR.ext.GridFormPanel);
