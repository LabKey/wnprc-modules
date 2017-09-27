/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * Created to allow a custom row editor plugin and column that summarize observations
 */
Ext4.define('EHR.grid.RoundsRemarksGridPanel', {
    extend: 'EHR.grid.Panel',
    alias: 'widget.ehr-roundsremarksgridpanel',

    initComponent: function(){
        this.callParent(arguments);

        this.obsStore = this.store.storeCollection.getClientStoreByName('Clinical Observations');
        LDK.Assert.assertNotEmpty('Unable to find clinical observations store', this.obsStore);

        this.mon(this.obsStore, 'update', this.onObsStoreChange, this, {buffer: 400});
        this.mon(this.obsStore, 'remove', this.onObsStoreChange, this, {buffer: 400});
        this.mon(this.obsStore, 'add', this.onObsStoreChange, this, {buffer: 400});
    },

    onObsStoreChange: function(store, rec){
        console.log('refresh remark grid');
        this.getView().refresh();
    },

    getRowEditorPlugin: function(){
        if (this.rowEditorPlugin)
            return this.rowEditorPlugin;

        this.rowEditorPlugin = Ext4.create('EHR.plugin.ClinicalRemarksRowEditor', {
            cmp: this
        });

        return this.rowEditorPlugin;
    },

    configureColumns: function(){
        this.callParent(arguments);

        this.columns.push({
            name: 'observations',
            header: 'Observations',
            width: 400,
            renderer: function(value, cellMetaData, record, rowIndex, colIndex, store){
                if (!this.obsStore){
                    this.obsStore = store.storeCollection.getClientStoreByName('Clinical Observations');
                }
                LDK.Assert.assertNotEmpty('Unable to find clinical observations store', this.obsStore);

                if (this.obsStore){
                    var id = record.get('Id');
                    var caseid = record.get('caseid');
                    var date = record.get('date') ? record.get('date').format('Y-m-d') : null;
                    var data = this.obsStore.snapshot || this.obsStore.data;

                    var lines = [];
                    data.each(function(r){
                        var rowDate = r.get('date') ? r.get('date').format('Y-m-d') : null;
                        if (id !== r.get('Id') || rowDate !== date || caseid != r.get('caseid')){
                            return;
                        }

                        var line = '';
                        var prefix = '';
                        var suffix = '';

                        if (r.get('category')){
                            line += r.get('category') + ': ';

                            if (r.get('category') == 'Vet Attention'){
                                prefix = '<span style="margin-top: 2px;background-color: yellow;line-height: 1.2;">';
                                suffix = '</span>';
                            }
                            else if (r.get('category') == 'Reviewed'){
                                prefix = '<span style="margin-top: 2px;background-color: green;line-height: 1.2;">';
                                suffix = '</span>';
                            }
                        }

                        if (!Ext4.isEmpty(r.get('observation'))){
                            line += r.get('observation');
                        }

                        if (r.get('remark')){
                            line += '.  ' + r.get('remark');
                        }

                        if (!r.get('remark') && Ext4.isEmpty(r.get('observation'))){
                            if (['Vet Attention', 'Reviewed'].indexOf(r.get('category')) == -1)
                                line += '<span style="margin-top: 2px;background-color: red;line-height: 1.2;">&nbsp;&nbsp;</span>';
                        }

                        if (line){
                            lines.push(prefix + line + suffix);
                        }
                    }, this);

                    return lines.join('<br>');
                }

                return '';
            }
        });
    }
});