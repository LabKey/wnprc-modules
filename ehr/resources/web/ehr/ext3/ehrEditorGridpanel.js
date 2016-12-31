/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Constructs a new EHR EditorGridPanel using the supplied configuration.
 * @class
 * EHR extension to the LABKEY.ext.EditorGridPanel class, which constructs an editor grid, configured based on the query's metadata.
 * Within the EHR, this class is predominantly used internally by EHR.ext.GridFormPanel; however, it could be used as a standalone.
 * While the overall purpose is similar to LABKEY.ext.EditorGridPanel, this class operates somewhat differently.
 * Unlike LABKEY.ext.EditorGridPanel, most of the complexity of interpreting LABKEY metadata has been removed from this class and
 * is delegated to EHR.ext.Metahelper.  The purpose is to have a single, centralized, and standardized implementation of fairly complex processes.
 * EHR.ext.EditorGridPanel also allows the client to supply additional metadata config to be applied to the server-supplied config.  This is a significant
 * part of how the EHR data entry forms operate.
 *
 * <p>If you use any of the LabKey APIs that extend Ext APIs, you must either make your code open source or
 * <a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=extDevelopment">purchase an Ext license</a>.</p>
 *            <p>Additional Documentation:
 *              <ul>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=javascriptTutorial">LabKey JavaScript API Tutorial</a></li>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=labkeyExt">Tips for Using Ext to Build LabKey Views</a></li>
 *              </ul>
 *           </p>
 *
 * @constructor
 * @augments LABKEY.ext.EditorGridPanel
 * @param config Configuration properties. This may contain any of the configuration properties supported
 * by <a href="http://www.extjs.com/deploy/dev/docs/?class=Ext.form.FormPanel">Ext.grid.EditorGridPanel</a>
 * and LABKEY.ext.EditorGridPanel, plus those listed here.
 * @param {String} [config.store] An EHR.ext.AdvancedStore configured for a LabKey query.
 * @param {object} [config.sm] An Ext selection model.  If not provided, this will default to using Ext.grid.CheckboxSelectionModel
 * @example &lt;script type="text/javascript"&gt;
    var grid, store;
    Ext.onReady(function(){

        //create a Store bound to the 'Users' list in the 'core' schema
        var store = new EHR.ext.AdvancedStore({
            schemaName: 'core',
            queryName: 'users'
        });

        //create a grid using that store as the data source
        var grid = new EHR.ext.EditorGridPanel({
            store: store,
            renderTo: 'grid',
            width: 800,
            title: 'Example'
        });
    });


&lt;/script&gt;
&lt;div id='grid'/&gt;
 */

EHR.ext.EditorGridPanel = Ext.extend(LABKEY.ext.EditorGridPanel,
{
    initComponent: function(){
        
        var sm = this.sm || new Ext.grid.CheckboxSelectionModel();

        Ext.applyIf(this, {
            viewConfig: {
                forceFit: true,
                scrollOffset: 0,
                getRowClass : function(record, rowIndex, rowParams, store){
                    if(record.errors && record.errors.length){
                        return 'x-grid3-row-invalid';
                    }
                    return '';
                }
            },
            autoHeight: true,
            autoWidth: true,
            pageSize: 200,
            autoSave: false,
            deferRowRender : true,
            editable: true,
            stripeRows: true,
            enableHdMenu: false,
            tbar: [
                {
                    text: 'Add Record',
                    tooltip: 'Click to add a blank record',
                    name: 'add-record-button',
                    handler: this.onAddRecord,
                    scope: this
                },
                    "-"
                ,{
                    text: 'Delete Selected',
                    tooltip: 'Click to delete selected row(s)',
                    name: 'delete-records-button',
                    handler: this.onDeleteRecords,
                    scope: this
                }
            ]
        });

        EHR.ext.EditorGridPanel.superclass.initComponent.apply(this, arguments);

        this.store.on('validation', this.onStoreValidate, this, {delay: 100});
    }

    //private
    ,onStoreValidate: function(store, records){
        if(records && !Ext.isArray(records))
            records = [records];

        Ext.each(records, function(rec){
            if(this.rendered)
                this.getView().refreshRow(rec);
        }, this);

    }

    //NOTE: any methods marked as 'no longer needed' are methods inherited from LABKEY's EditorGridPanel
    //LABKEY's EditorGrid and this version take different routes to handle interpreting LabKey metadata
    //the non-needed methods have been explicitly overridden with empty functions to clarify differences in the classes

    //private
    ,populateMetaMap : function() {
        //not longer needed
    }

    //private
    ,getDefaultEditor: function(){
        //moved to EHR.ext.metaHelper
    }

    //private
    ,getLookupEditor: function(){
        //moved to EHR.ext.metaHelper
    }

    //private
    ,setLongTextRenderers : function() {
        //moved to EHR.ext.metaHelper
    }

    //private
    ,onLookupStoreError: function(){
        //moved to EHR.ext.metaHelper
    }

    //private
    ,onLookupStoreLoad: function(){
        //moved to EHR.ext.metaHelper
    }

    //private
    ,getLookupRenderer: function(){
        //moved to EHR.ext.metaHelper
    }

    //private
    //configures the Ext ColumnModel used by this grid, based on the fields and metadata supplied in the store
    ,setupColumnModel : function() {
        var columns = this.getColumnModelConfig();

        //if a sel model has been set, and if it needs to be added as a column,
        //add it to the front of the list.
        //CheckBoxSelectionModel needs to be added to the column model for
        //the check boxes to show up.
        //(not sure why its constructor doesn't do this automatically).
        if(this.getSelectionModel() && this.getSelectionModel().renderer)
            columns = [this.getSelectionModel()].concat(columns);

        //register for the rowdeselect event if the selmodel supports events
        //and if autoSave is on
        if(this.getSelectionModel().on && this.autoSave)
            this.getSelectionModel().on("rowselect", this.onRowSelect, this);

        //fire the "columnmodelcustomize" event to allow clients
        //to modify our default configuration of the column model
        //NOTE: I dont think this will be permissible b/c it's a public API,
        // but I would suggest changing the arguments on this event
        // might make more sense to pass 'this' and 'columns'.  can use getColumnById() method
        this.fireEvent("columnmodelcustomize", columns);

        //reset the column model
        this.reconfigure(this.store, new Ext.grid.ColumnModel(columns));

    }

    //private
    ,getColumnModelConfig: function(){
        var config = {
            editable: this.editable,
            defaults: {
                sortable: false
            }
        };

        var columns = EHR.ext.metaHelper.getColumnModelConfig(this.store, config, this);

        Ext.each(columns, function(col, idx){
            var meta = this.store.findFieldMeta(col.dataIndex);

            //remember the first editable column (used during add record)
            if(!this.firstEditableColumn && col.editable)
                this.firstEditableColumn = idx;

            if(meta.isAutoExpandColumn && !col.hidden){
                this.autoExpandColumn = idx;
            }

        }, this);

        return columns;
    }

    //private
    ,getColumnById: function(colName){
        return this.getColumnModel().getColumnById(colName);
    }
});
Ext.reg('ehr-editorgrid', EHR.ext.EditorGridPanel);

