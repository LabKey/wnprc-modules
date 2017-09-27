/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @cfg defaultSubset
 */
Ext4.define('EHR.grid.column.SnomedColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.ehr-snomedcolumn',

    initComponent: function(){
        //do not allow custom renderers
        if (this.renderer){
            delete this.renderer;
        }

        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();

        this.callParent(arguments);
    },

    defaultRenderer: function(value, meta, record, rowIdx, colIdx, store, view){
        if (this.snomedStore && value){
            var display = [];
            value = value.split(';');
            var rec, recIdx;
            Ext4.Array.forEach(value, function(codeVal, idx){
                var code = codeVal.split('<>');
                LDK.Assert.assertTrue('Improper SNOMED code: ' + code, code.length == 2);
                code = code[1];
                recIdx = this.snomedStore.findExact('code', code);
                rec = recIdx != -1 ? this.snomedStore.getAt(recIdx) : null;

                if (rec && rec.get('meaning')){
                    display.push((idx + 1) + ': ' + rec.get('meaning') + ' (' + code + ')');
                }
                else {
                    display.push((idx + 1) + ': ' + code);
                }
            }, this);

            return display.join('<br>');
        }

        return value;
    },

    processEvent : function(type, view, cell, recordIndex, cellIndex, e, record, row){
        var me = this,
                target = e.getTarget(),
                key = type == 'keydown' && e.getKey();

        if (target) {
            if (type == 'click' || (key == e.ENTER || key == e.SPACE)){
                //ignore clicks if holding shift
                if (e.ctrlKey || e.shiftKey){
                    return;
                }

                if (me.handler) {
                    me.handler.call(target.scope || me.origScope || me, view, recordIndex, cellIndex, target, e, record, row);
                }
            }
        }

        return me.callParent(arguments);
    },

    handler: function(view, rowIndex, colIndex, item, e, rec) {
        Ext4.create('EHR.window.SnomedCodeWindow', {
            defaultSubset: this.defaultSubset,
            boundRec: rec
        }).show();
    }
});