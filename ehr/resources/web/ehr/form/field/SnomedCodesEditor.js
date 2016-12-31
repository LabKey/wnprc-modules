/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.SnomedCodesEditor', {
    alias: 'widget.ehr-snomedcodeseditor',
    extend: 'Ext.form.field.Display',

    initComponent: function(){
        this.callParent(arguments);

        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();

        this.on('render', function(field){
            this.getEl().on('click', this.onClick, this);
        }, this);
    },

    onClick: function(el){
        this.showEditorWindow();
    },

    showEditorWindow: function(){
        var boundRec = EHR.DataEntryUtils.getBoundRecord(this);
        LDK.Assert.assertNotEmpty('Unable to find bound record in SnomedCodesEditor.js', boundRec);

        Ext4.create('EHR.window.SnomedCodeWindow', {
            boundRec: boundRec
        }).show();
    },

    getDisplayValue: function() {
        var value = this.getRawValue();
        if (value){
            var display = [];
            value = value.split(';');
            var rec, recIdx;
            Ext4.Array.forEach(value, function(code){
                recIdx = this.snomedStore.findExact('code', code);
                rec = recIdx != -1 ? this.snomedStore.getAt(recIdx) : null;

                if (rec && rec.get('meaning')){
                    display.push(rec.get('meaning') + ' (' + code + ')');
                }
                else {
                    display.push(code);
                }
            }, this);

            return display.join('<br>');
        }

        return '';
    }
});

/**
 * @cfg defaultSubset
 */
Ext4.define('EHR.window.SnomedCodeWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();

        Ext4.apply(this, {
            closeAction: 'destroy',
            width: 700,
            title: 'Manage SNOMED Codes',
            modal: true,
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                xtype: 'ehr-snomedcombo',
                defaultSubset: this.defaultSubset || 'All',
                width: 500,
                fieldLabel: 'Add Code',
                listeners: {
                    scope: this,
                    select: this.onFieldSelect
                }
            },{
                xtype: 'panel',
                itemId: 'codePanel',
                style: 'padding-top: 10px;'
            }],
            buttons: [{
                text: 'Submit',
                handler: function(btn){
                    var win = btn.up('window');
                    var codes = [];
                    if (win.codes){
                        for (var i=0;i<win.codes.length;i++){
                            codes.push((i + 1) + '<>' + win.codes[i]);
                        }
                    }

                    win.boundRec.set('codesRaw', codes.length ? codes.join(';') : null);
                    win.close();
                }
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        this.applyCodes(this.boundRec.get('codesRaw'));

        this.on('show', function(win){
            win.down('ehr-snomedcombo').focus();
        }, this, {delay: 100});
    },

    onFieldSelect: function(field, recs){
        if (recs && recs.length){
            var code = recs[0].get('code');
            this.codes.push(code);
            this.down('#codePanel').add(this.getCodeItem(code, this.codes.length -  1));
            
            field.reset();
        }
    },

    applyCodes: function(codes){
        if (!Ext4.isArray(codes)){
            if (codes){
                codes = codes.split(';');
                var newCodes = [];
                Ext4.Array.forEach(codes, function(c){
                    c = c.split('<>');
                    LDK.Assert.assertTrue('Improper SNOMED code: ' + c, c.length == 2);
                    if (c.length == 2){
                        newCodes.push(c[1]);
                    }
                }, this);

                codes = newCodes;
            }
            else {
                codes = [];
            }
        }
        this.codes = codes;

        var toAdd = [];
        Ext4.Array.forEach(codes, function(code, idx){
            toAdd.push(this.getCodeItem(code, idx));
        }, this);

        var panel = this.down('#codePanel');
        panel.removeAll();
        if (toAdd.length){
            panel.add(toAdd);
        }
    },

    getCodeItem: function(code, idx){
        var recIdx = this.snomedStore.findExact('code', code);
        var rec = recIdx != -1 ? this.snomedStore.getAt(recIdx) : null;

        return {
            xtype: 'panel',
            layout: 'hbox',
            border: false,
            code: code,
            codeIdx: idx,
            items: [{
                xtype: 'button',
                style: 'margin-right: 5px;',
                width: 20,
                testLocator: 'snomedUpArrow',
                icon: LABKEY.ActionURL.getContextPath() + '/_images/uparrow.gif',
                //text: 'Up',
                handler: function(btn){
                    var panel = btn.up('panel');
                    var win = btn.up('window');

                    var newIdx = panel.codeIdx - 1;
                    if (newIdx < 0){
                        return;
                    }

                    win.codes.splice(panel.codeIdx, 1);
                    Ext4.Array.insert(win.codes, newIdx, [panel.code]);

                    win.applyCodes(win.codes);
                }
            },{
                xtype: 'button',
                style: 'margin-right: 5px;',
                width: 20,
                testLocator: 'snomedDownArrow',
                icon: LABKEY.ActionURL.getContextPath() + '/_images/downarrow.gif',
                handler: function(btn){
                    var panel = btn.up('panel');
                    var win = btn.up('window');

                    var newIdx = panel.codeIdx + 1;
                    if (newIdx >= win.codes.length){
                        return;
                    }

                    win.codes.splice(panel.codeIdx, 1);
                    Ext4.Array.insert(win.codes, newIdx, [panel.code]);

                    win.applyCodes(win.codes);
                }
            },{
                xtype: 'button',
                style: 'margin-right: 5px;',
                width: 20,
                testLocator: 'snomedDelete',
                icon: LABKEY.ActionURL.getContextPath() + '/_images/delete.gif',
                handler: function(btn){
                    var panel = btn.up('panel');
                    var win = btn.up('window');

                    win.codes.splice(panel.codeIdx, 1);
                    win.applyCodes(win.codes);
                }
            },{
                border: false,
                html: (idx + 1) + ': ' + (rec ? rec.get('meaning') + ' (' + code + ')' : code),
                width: 650
            }]
        }
    }
});
