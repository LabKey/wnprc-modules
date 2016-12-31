/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.CopyBehaviorExamWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Copy Previous Exam',
            width: 450,
            bodyStyle: 'padding: 5px;',
            modal: true,
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper allows you to copy the SOAP and observations from the last behavior exam performed for the selected animals.',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'textarea',
                itemId: 'animalField',
                fieldLabel: 'Enter Animal(s)',
                width: 400
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    onSubmit: function(){
        var ids = this.down('#animalField').getValue();
        ids = Ext4.String.trim(ids);
        if (!ids){
            Ext4.Msg.alert('Error', 'Must enter at least one animal Id');
            return;
        }

        ids = LDK.Utils.splitIds(ids);

        var obsStore = this.storeCollection.getClientStoreByName('Clinical Observations');
        LDK.Assert.assertNotEmpty('Unable to find observations store in CopyBehaviorExamWindow', obsStore);

        var remarkStore = this.storeCollection.getClientStoreByName('Clinical Remarks');
        LDK.Assert.assertNotEmpty('Unable to find remarks store in CopyBehaviorExamWindow', remarkStore);

        var multi = new LABKEY.MultiRequest();
        var whereSql = " WHERE t.taskid = (SELECT t1.taskId FROM study.clinremarks t1 WHERE t1.taskid.formType = 'BSU Exam' AND t1.Id = t.Id AND t1.taskId  != '" + this.storeCollection.getTaskId()+ "' ORDER BY t1.date DESC LIMIT 1) AND t.Id IN ('" + ids.join("','") + "') ORDER BY t.Id, t.formSort";
        this.recordCount = 0;

        var sql1 = "SELECT t.Id, t.s, t.o, t.a, t.p, t.remark " +
            " FROM study.clinremarks t " + whereSql;

        multi.add(LABKEY.Query.executeSql, {
            schemaName: 'study',
            requiredVersion: 9.1,
            sql: sql1,
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                if (results && results.rows){
                    var toAdd = [];
                    var date = new Date();
                    Ext4.Array.forEach(results.rows, function(row){
                        var sr = new LDK.SelectRowsRow(row);
                        toAdd.push(remarkStore.createModel({
                            Id: sr.getValue('Id'),
                            date: date,
                            s: sr.getValue('s'),
                            o: sr.getValue('o'),
                            a: sr.getValue('o'),
                            p: sr.getValue('p'),
                            remark: sr.getValue('remark')
                        }));
                    }, this);

                    this.recordCount += toAdd.length;
                    if (toAdd.length){
                        remarkStore.add(toAdd);
                    }
                }
            }
        });

        var sql2 = "SELECT t.Id, t.category, t.area, t.observation, t.remark " +
            " FROM study.clinical_observations t " + whereSql

        multi.add(LABKEY.Query.executeSql, {
            schemaName: 'study',
            requiredVersion: 9.1,
            sql: sql2,
            failure: LDK.Utils.getErrorCallback(),
            scope: this,
            success: function(results){
                if (results && results.rows){
                    var toAdd = [];
                    var date = new Date();
                    Ext4.Array.forEach(results.rows, function(row){
                        var sr = new LDK.SelectRowsRow(row);
                        toAdd.push(obsStore.createModel({
                            Id: sr.getValue('Id'),
                            date: date,
                            category: sr.getValue('category'),
                            area: sr.getValue('area'),
                            observation: sr.getValue('observation'),
                            remark: sr.getValue('remark')
                        }));
                    }, this);

                    if (toAdd.length){
                        this.recordCount += toAdd.length;
                        obsStore.add(toAdd);
                    }
                }
            }
        });

        Ext4.Msg.wait('Loading...');
        multi.send(this.onLoad, this);
    },

    onLoad: function(){
        Ext4.Msg.hide();
        if (!this.recordCount){
            Ext4.Msg.alert('No Records', 'No previous records were found');
        }

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('COPY_BEHAVIOR_EXAM', function(config){
    return Ext4.Object.merge({
        text: 'Copy Previous Exam',
        tooltip: 'Click to copy SOAPs and observations from a previous exam',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.CopyBehaviorExamWindow', {
                storeCollection: grid.store.storeCollection
            }).show();
        }
    }, config);
});
