/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.plugin.RowEditor', {
    extend: 'Ext.AbstractPlugin',

    editorWindow: null,

    constructor: function(config){
        Ext4.apply(this, config);
    },

    init: function(cmp){
        this.cmp = cmp;
        this.initListeners(cmp);
    },

    destroy: function(){
        this.editorWindow.destroy();
        delete this.editorWindow;

        if (this.keyNav){
            this.keyNav.destroy();
        }

        this.callParent(arguments);
    },

    getFormPanelCfg: function(){
        return {
            xtype: 'ehr-formpanel',
            itemId: 'formPanel',
            maxFieldHeight: 100,
            maxItemsPerCol: 9,
            textareaFieldWidth: EHR.form.Panel.defaultFieldWidth,
            maxFieldWidth: EHR.form.Panel.defaultFieldWidth,
            bodyStyle: 'padding: 5px;',
            formConfig: this.cmp.formConfig,
            store: this.cmp.getStore(),
            trackResetOnLoad: true
        };
    },

    getDetailsPanelCfg: function(){
        return {
            xtype: 'ehr-animaldetailspanel',
            itemId: 'detailsPanel',
            showDisableButton: false
        }
    },

    getEditorWindow: function(){
        if (!this.editorWindow)
            this.createWindow();

        return this.editorWindow;
    },

    createWindow: function(){
        this.editorWindow = Ext4.create('Ext.window.Window', this.getWindowCfg());
        this.getEditorWindow().addEvents('animalchange');
    },

    getWindowButtons: function(){
        return [{
            text: 'Previous',
            handler: function(){
                this.loadPreviousRecord();
            },
            scope: this
        },{
            text: 'Next',
            handler: function(){
                this.loadNextRecord();
            },
            scope: this
        },{
            text: 'Close',
            handler: function(btn){
                var win = btn.up('window');
                win.close();
            },
            scope: this
        }];
    },
    getWindowCfg: function(){
        return {
            modal: true,
            width: 800,
            items: [{
                items: [this.getDetailsPanelCfg(), this.getFormPanelCfg()]
            }],
            buttons: this.getWindowButtons(),
            closeAction: 'destroy',
            listeners: {
                scope: this,
                close: this.onWindowClose,
                destroy: this.onWindowClose,
                beforerender: function(win){
                    var cols = win.down('#formPanel').items.get(0).items.getCount();
                    if (cols > 1){
                        win.setWidth(cols * (EHR.form.Panel.defaultFieldWidth + 20));
                    }
                },
                afterrender: function(editorWin){
                    this.keyNav = new Ext4.util.KeyNav({
                        target: editorWin.getId(),
                        scope: this,
                        up: function(e){
                            if (e.ctrlKey){
                                this.loadPreviousRecord();
                            }
                        },
                        down: function (e){
                            if (e.ctrlKey){
                                this.loadNextRecord();
                            }
                        }
                    });
                },
                animalchange: {
                    fn: function(id){
                        this.getEditorWindow().down('#detailsPanel').loadAnimal(id);
                    },
                    scope: this,
                    buffer: 200
                }
            }
        }
    },

    onWindowClose: function(){
        delete this.editorWindow;
    },

    onCellClick: function(view, cell, colIdx, record){
        this.editRecord(record);
    },

    editRecord: function(record){
        this.loadRecord(record);
        this.getEditorWindow().show();
    },

    loadRecord: function(record){
        var win = this.getEditorWindow();
        win.down('#formPanel').bindRecord(record);
        win.down('#detailsPanel').loadAnimal(record.get('Id'));

        var sm = this.cmp.getSelectionModel();
        if (!sm.hasSelection()){
            if (sm instanceof Ext4.selection.CellModel){
                sm.setCurrentPosition(sm.getCurrentPosition());
            }
        }

        sm.select([record]);

        win.center();
    },

    initListeners: function(grid){
        grid.mon(grid.view, {
            scope: this,
            celldblclick: this.onCellClick
        });
    },

    loadPreviousRecord: function(){
        var currentRec = this.getEditorWindow().down('#formPanel').getForm().getRecord(), prevRec;
        if(currentRec){
            prevRec = this.cmp.getStore().getAt(this.cmp.getStore().indexOf(currentRec) - 1);
            if(prevRec){
                this.loadRecord(prevRec);
            }
            else {
                Ext4.Msg.alert('', 'You have selected the first record, there are no previous records');
            }
        }
    },

    loadNextRecord: function(){
        var currentRec = this.getEditorWindow().down('#formPanel').getForm().getRecord(), nextRec;
        if (currentRec){
            nextRec = this.cmp.getStore().getAt(this.cmp.getStore().indexOf(currentRec) + 1);
            if (nextRec){
                this.loadRecord(nextRec);
            }
            else {
                //NOTE: behvior changed by request
                //Ext4.Msg.alert('', 'There are no more records');
                this.getEditorWindow().close();
            }
        }
    }
});