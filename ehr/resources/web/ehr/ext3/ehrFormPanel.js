/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext');

/**
 * Constructs a new LabKey FormPanel using the supplied configuration.
 * @class
 * EHR extension to the Ext.FormPanel class, which constructs a form panel, configured based on the query's metadata.
 * This class understands various LabKey metadata formats and can simplify generating basic forms. When a LABKEY.ext.FormPanel is created with additional metadata, it will try to intelligently construct fields of the appropriate type.
 * While the purpose of this class is similar to LABKEY.ext.FormPanel, it operates somewhat differently.  Notably, the FormPanel will automatically
 * construct an Ext.data.Record and bind the form input to this record.  This allows the Form to more easily communicate with an Ext Store and to operate on many records at once.
 * This class also delegates most of the work involved with interpreting metadata to EHR.ext.Metahelper, which allows the code of this class to be relatively basic.
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
 * @augments Ext.FormPanel
 * @param config Configuration properties. This may contain any of the configuration properties supported
 * by the <a href="http://www.extjs.com/deploy/dev/docs/?class=Ext.form.FormPanel">Ext.form.FormPanel</a>,
 * plus those listed here.
 * <p>
 * Note:
 * <ul>
 *  <li>You may construct a FormPanel by either supplying a store or by supplying a schema/query, in which case a store will be automatically created.</li>
 *  <li>FormPanel automatically uses the plugin EHR.ext.plugins.DataBind to bind form entry to an Ext record.  Please see documentation for this plugin for more information.
 * </ul>
 *
 * @param {String} [config.store] An EHR.ext.AdvancedStore configured for a LabKey query.
 * @param {String} [config.containerPath] The container path from which to query the server. If not specified, the current container is used.  Will be ignored if a store is provided.
 * @param {String} [config.schemaName] The LabKey schema to query.  Will be ignored if a store is provided.
 * @param {String} [config.queryName] The query name within the schema to fetch.  Will be ignored if a store is provided.
 * @param {String} [config.viewName] A saved custom view of the specified query to use if desired.  Will be ignored if a store is provided.
 * @param {Integer} [config.defaultFieldWidth] If provided, this will be used as the default width of fields in this form.
 * @param {Object} [config.metadata] A metadata object that will be applied to the default metadata returned by the server.  See EHR.Metadata or EHR.ext.AdvancedStore for more information.
 * @param {Object} [config.storeConfig] A config object passed directly to the EHR.ext.AdvancedStore that will be used to create the store.  Will only be used if no store is provided.
 * @param {Object} [config.bindConfig] A config object passed to EHR.ext.plugins.DataBind plugin.  See documention on this plugin for more information.
 * @example &lt;script type="text/javascript"&gt;
    var panel;
    Ext.onReady(function(){
        var panel = new EHR.ext.FormPanel({
            store: new EHR.ext.AdvancedStore({
                schemaName: 'core',
                queryName: 'users'
            }),
            renderTo: 'targetDiv',
            width: 800,
            autoHeight: true,
            title: 'Example'
        });
    });


&lt;/script&gt;
&lt;div id='targetDiv'/&gt;
 */

EHR.ext.FormPanel = function(config){
    EHR.ext.FormPanel.superclass.constructor.call(this, config);
};

Ext.extend(EHR.ext.FormPanel, Ext.FormPanel,
{
    initComponent: function()
    {
        this.storeConfig = this.storeConfig || {};
        if(!this.storeConfig.filterArray){
            this.storeConfig.maxRows = 0;
            this.on('load', function(){
                delete this.maxRows;
            }, this, {single: true});
        }

        this.store = this.store || new EHR.ext.AdvancedStore(Ext.applyIf(this.storeConfig, {
            //xtype: 'ehr-store',
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName || '~~UPDATE~~',
            columns: this.columns || EHR.Metadata.Columns[this.queryName] || '',
            storeId: [this.schemaName,this.queryName,this.viewName].join('||'),
            filterArray: this.filterArray || [],
            metadata: this.metadata,
            autoLoad: true
        }));

        this.store.importPanel = this.importPanel || this;

        Ext.apply(this, {
            plugins: ['databind']
            ,trackResetOnLoad: true
            ,bubbleEvents: ['added']
            ,buttonAlign: 'left'
            ,monitorValid: false
        });

        Ext.applyIf(this, {
            autoHeight: true
            //,autoWidth: true
            ,labelWidth: 125
            ,defaultFieldWidth: 200
            ,items: {xtype: 'displayfield', value: 'Loading...'}
            //,name: this.queryName
            ,bodyBorder: false
            ,border: false
            ,bodyStyle: 'padding:5px'
            ,style: 'margin-bottom: 15px'
            ,bindConfig: {
                disableUnlessBound: true,
                autoBindRecord: true,
                bindOnChange: false,
                showDeleteBtn: true
            }
            //,deferredRender: true
            ,bbar: this.showStatus ? {
                xtype: 'statusbar',
                defaultText: 'Default text',
                text: 'No Records',
                statusAlign: 'left',
                buttonAlign: 'left',
                iconCls: 'x-status-valid'
            } : null
        });

        //a test for whether the store is loaded
        if(!this.store.fields){
            this.mon(this.store, 'load', this.loadQuery, this, {single: true});
        }
        else {
            this.loadQuery(this.store);
        }

        EHR.ext.FormPanel.superclass.initComponent.call(this);

        //NOTE: participantchange and participantrefres are likely not used and can be removed after testing
        this.addEvents('beforesubmit', 'participantchange','participantrefresh');

        if(this.showStatus){
            //NOTE: recordchange is described in the DataBind plugin
            this.on('recordchange', this.onRecordChange, this, {buffer: 100, delay: 100});
            this.mon(this.store, 'validation', this.onStoreValidate, this, {delay: 100});
        }

        this.on('recordchange', this.markInvalid, this, {delay: 100});

    },

    //private
    loadQuery: function(store)
    {
        this.removeAll();
        var toAdd = this.configureForm(store, this);
        Ext.each(toAdd, function(item){
            this.add(item);
        }, this);

        //create a placeholder for error messages
        this.add({
            tag: 'div',
            ref: 'errorEl',
            border: false,
            width: 350,
            style: 'padding:5px;text-align:center;'
        });

        if(this.rendered)
            this.doLayout();

    },

    //private
    //This method iterates the fields of the form and created the appropriate Ext field editor, based on the field's metadata
    configureForm: function(store, formPanel)
    {
        var toAdd = [];
        var compositeFields = {};
        store.fields.each(function(c){
            var config = {
                queryName: store.queryName,
                schemaName: store.schemaName
            };

            if (!c.hidden && c.shownInInsertView)
            {
                var theField = this.store.getFormEditorConfig(c.name, config);

                if(!c.width){
                    theField.width = formPanel.defaultFieldWidth;
                }

                if (c.inputType == 'textarea' && !c.height){
                    Ext.apply(theField, {height: 100});
                }

                if(theField.xtype == 'combo'){
                    theField.lazyInit = false;
                    theField.store.autoLoad = true;
                }

                if(this.readOnly){
                    theField.xtype = 'displayfield';
                    console.log('is read only: '+store.queryName)
                }

                if(!c.compositeField)
                    toAdd.push(theField);
                else {
                    theField.fieldLabel = undefined;
                    if(!compositeFields[c.compositeField]){
                        compositeFields[c.compositeField] = {
                            xtype: 'panel',
                            autoHeight: true,
                            layout: 'hbox',
                            border: false,
                            //msgTarget: c.msgTarget || 'qtip',
                            fieldLabel: c.compositeField,
                            defaults: {
                                border: false,
                                margins: '0px 4px 0px 0px '
                            },
                            width: formPanel.defaultFieldWidth,
                            items: [theField]
                        };
                        toAdd.push(compositeFields[c.compositeField]);

                        if(compositeFields[c.compositeField].msgTarget == 'below'){
                            //create a div to hold error messages
                            compositeFields[c.compositeField].msgTargetId = Ext.id();
                            toAdd.push({
                                tag: 'div',
                                fieldLabel: null,
                                border: false,
                                id: compositeFields[c.compositeField].msgTargetId
                            });
                        }
                        else {
                            theField.msgTarget = 'qtip';
                        }
                    }
                    else {
                        compositeFields[c.compositeField].items.push(theField);
                    }
                }
            }
        }, this);

        //distribute width for compositeFields
        for (var i in compositeFields){
            var compositeField = compositeFields[i];
            var toResize = [];
            //this leaves a 2px buffer between each field
            var availableWidth = formPanel.defaultFieldWidth - 4*(compositeFields[i].items.length-1);
            for (var j=0;j<compositeFields[i].items.length;j++){
                var field = compositeFields[i].items[j];
                //if the field isnt using the default width, we assume it was deliberately customized
                if(field.width && field.width!=formPanel.defaultFieldWidth){
                    availableWidth = availableWidth - field.width;
                }
                else {
                    toResize.push(field)
                }
            }

            if(toResize.length){
                var newWidth = availableWidth/toResize.length;
                for (var j=0;j<toResize.length;j++){
                    toResize[j].width = newWidth;
                }
            }
        }

        return toAdd;
    },

    //private
    //Updates the statusbar icon if the bound record changes
    onRecordChange: function(theForm)
    {
        if(!this.boundRecord)
            this.getBottomToolbar().setStatus({text: 'No Records'});
    },

    //private
    //updates the statusbar area depending on the validation status of the record(s) in the store
    //because more than 1 error can occur, the store reports the max severity, meaning the most severe error
    onStoreValidate: function(store, records)
    {
        if(store.errors.getCount()){
            this.getBottomToolbar().setStatus({text: store.maxErrorSeverity(), iconCls: 'x-status-error'});
        }
        else
            this.getBottomToolbar().setStatus({text: 'Section OK', iconCls: 'x-status-valid'});

        this.markInvalid();
    },

    //private
    //updates the field error mesages based on the errors object returned by the store
    markInvalid : function()
    {
        var formMessages = [];
        var toMarkInvalid = {};
        var errorsInHiddenRecords = false;

        if(!this.boundRecord)
            return;

        this.store.errors.each(function(error){
            var meta = error.record.fields.get(error.field);

            if(meta && meta.hidden)
                return;

            if(error.record===this.boundRecord){
                if ("field" in error){
                    //these are generic form-wide errors
                    if ("_form" == error.field){
                        formMessages.push((error.severity=='INFO' ? 'INFO: ' : '')+error.message);
                    }
                }
                else {
                    formMessages.push((error.severity=='INFO' ? 'INFO: ' : '')+error.message);
                }
            }
            else {
                errorsInHiddenRecords = true;
            }
        }, this);

        if(errorsInHiddenRecords)
            formMessages.push('There are errors in one or more records.  Problem records should be highlighted in red.');

        if (this.errorEl){
            formMessages = Ext.util.Format.htmlEncode(formMessages.join('\n'));
            this.errorEl.update(formMessages);
        }

        this.getForm().items.each(function(f){
            f.validate();
        }, this);

    }
});
Ext.reg('ehr-formpanel', EHR.ext.FormPanel);


