EHR.DataEntryUtils.registerGridButton('ADDRESTORETIME', function (config){
    return Ext4.Object.merge({
        text: 'Food Restored',
        tooltip: 'Click to mark the selected rows for food restored time',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selections = grid.getSelectionModel().getSelection();

            if (!grid.store || !selections || !selections.length){
                Ext4.Msg.alert('Error', 'No rows selected');
                return;
            }

         //   this.targetStore.suspendEvents(true);

            var keyMap = {};
            var restoredTime  = {restoredTime: new Date ()};
            var toAdd = [];

            Ext4.Array.each(selections, function(r){
                LDK.Assert.assertNotEmpty('No caseid in rounds record', r.get('objectid'));
                LDK.Assert.assertNotEmpty('Id not found in rounds record', r.get('Id'));

                r.set(restoredTime);

                if (!r.store){
                    toAdd.push(r);
                }


                //keyMap[r.get('objectid')] = r.get('Id');

            }, this);

            if (toAdd.length){
                if (!Ext4.isEmpty(this.insertIndex)){
                    this.targetStore.insert(this.insertIndex, toAdd);
                }
                else{
                    this.targetStore.add(toAdd);
                }
            }

           // this.targetStore.resumeEvents();


            /*Ext4.Msg.confirm('Mark Reviewed', 'This will mark the selected rows as reviewed.  Continue?', function(val){
                if (val == 'yes'){
                    var obsStore = grid.dataEntryPanel.storeCollection.getClientStoreByName('foodDeprives');
                    LDK.Assert.assertNotEmpty('Unable to find clinical_observations store in round buttons', obsStore);

                    var toAdd = [];
                    for (var caseId in keyMap){
                        toAdd.push(obsStore.createModel({
                            Id: keyMap[caseId],
                            procedureTime: new Date()

                            //caseid: caseId
                        }));
                    }

                    if (toAdd.length){
                        obsStore.add(toAdd);
                    }
                }
            }, this);*/

        }
    }, config);

});

EHR.DataEntryUtils.registerGridButton('ADDSTARTTIME', function (config){
    return Ext4.Object.merge({
        text: 'Deprive Start time',
        tooltip: 'Click to mark the selected rows for food deprive start time',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selections = grid.getSelectionModel().getSelection();

            if (!grid.store || !selections || !selections.length){
                Ext4.Msg.alert('Error', 'No rows selected');
                return;
            }

            //   this.targetStore.suspendEvents(true);

            var keyMap = {};
            var startTime  = {depriveStartTime: new Date ()};
            var toAdd = [];

            Ext4.Array.each(selections, function(r){
                LDK.Assert.assertNotEmpty('No caseid in rounds record', r.get('objectid'));
                LDK.Assert.assertNotEmpty('Id not found in rounds record', r.get('Id'));

                if (!r.get('depriveStartTime'))
                    r.set(startTime);

                if (!r.store){
                    toAdd.push(r);
                }

            }, this);

            if (toAdd.length){
                if (!Ext4.isEmpty(this.insertIndex)){
                    this.targetStore.insert(this.insertIndex, toAdd);
                }
                else{
                    this.targetStore.add(toAdd);
                }
            }

            //this.targetStore.resumeEvents();

        }
    }, config);

});

EHR.DataEntryUtils.registerDataEntryFormButton('FOOD_STARTED', {
    text: 'Start Food Deprive',
    name: 'food_started',
    requiredQC: 'Started',
    targetQC: 'Started',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('wnprc_ehr', 'dataEntry.view'),
    disabled: true,
    itemId: 'depriveBtn',
    disableOn: 'ERROR',
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        if (panel.storeCollection.getRemarksRec){
            var rows = panel.storeCollection.getRemarksRec();
            var currentTime = new Date();

            for (var idx = 0; idx <rows.getCount(); idx++){
                var row = rows.getAt(idx);
                if (row && row.get('taskid')){
                    if (!row.get('depriveStartTime')){
                        row.set('depriveStartTime', currentTime)
                    }

                }
            }
            panel.onSubmit(btn)

            /*if (rr && rr.get('taskid')){
                rr.set('depriveStartTime',new Date());
                panel.onSubmit(btn)

            }*/
            //var requestStore = panel.storeCollection.getServerStoreForQuery('ehr', 'request');
            //  var notificationList = requestStore.getAt(0).get('notify1');
            /*if (rr && rr.get('requestid')){
                var requestId = rr.get('requestid');
                Ext4.Msg.wait('Loading...')
                console.log('print requestId '+requestId);
                if (requestId)
                {
                    LABKEY.Query.selectRows( {
                        //requiredVersion: 9.1,
                        schemaName: 'ehr',
                        queryName: 'requests',
                        columns: 'requestid,notify1,notify1/DisplayName,notify2,notify2/DisplayName,notify3,notify3/DisplayName',
                        scope: this,
                        filterArray:[
                            LABKEY.Filter.create('requestid',requestId,LABKEY.Filter.Types.EQUAL)
                        ],
                        success: function (data){

                            //TODO: send notification to all people in the notification list.
                            if (data.rows&&data.rows.length){
                                row = data.rows[0];
                                Ext4.Msg.hide();
                                var msg = 'Select contact to notify for deprive started';
                                Ext4.create('EHR.window.SubmitForReviewWindowHusbandry', {
                                    dataEntryPanel: panel,
                                    dataEntryBtn: btn,
                                    reviewRecipientMsg: msg,
                                    reviewRequiredRecipient: row.notify1,
                                    storeOptions: [
                                        {
                                            value: row.notify1,
                                            display: row['notify1/DisplayName']
                                        },
                                        {
                                            value: row.notify2,
                                            display: row['notify2/DisplayName']
                                        },
                                        {
                                            value: row.notify3,
                                            display: row['notify3/DisplayName']
                                        }

                                    ]
                                }).show();


                                console.log (row.notify1);
                            }

                        },
                        failure: function(error){
                            Ext4.Msg.hide();
                            Ext4.Msg.alert('Error', 'no request found');

                            console.log('no notification list')
                        }

                    });

                    // var requestStore = this.dataEntryPanel.storeCollection.getServerStoreForQuery('ehr', 'request');
                    //requestStore.getAt(0).get('assignedto');
                    //this.getNotificationList(requestId);
                }



            }*/
        }

    }

});

Ext4.define('EHR.window.SubmitForReviewWindowHusbandry', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        var store = Ext4.create(Ext4.data.Store,{
            fields: ['value','display'],
            data: this.storeOptions
        });

        Ext4.apply(this, {
            closeAction: 'destroy',
            modal: true,
            title: 'Submit For Review',
            width: 430,
            buttons: [{
                text:'Submit',
                disabled:false,
                itemId: 'submit',
                scope: this,
                handler: function(btn){
                    var win = btn.up('window');
                    var assignedTo = win.down('#husbandryassignedTo').getValue();
                    if(!assignedTo){
                        alert('Must assign this task to someone');
                        return;
                    }

                    var taskStore = this.dataEntryPanel.storeCollection.getServerStoreForQuery('ehr', 'tasks');
                    taskStore.getAt(0).set('assignedto', assignedTo);
                    this.dataEntryPanel.storeCollection.transformServerToClient();
                    this.dataEntryPanel.onSubmit(this.dataEntryBtn);
                    win.close();
                }
            },{
                text: 'Cancel',
                scope: this,
                handler: function(btn){
                    btn.up('window').hide();
                }
            }],
            items: [{
                bodyStyle: 'padding:5px;',
                items: [{
                    html: this.reviewRecipientMsg || '',
                    border: false,
                    style: 'padding-bottom: 10px;',
                    hidden: !this.reviewRecipientMsg
                },{
                    xtype: 'combobox',
                    forceSelection: true,
                    fieldLabel: 'Assign To',
                    width: 400,
                    queryMode: 'local',
                    store: store,
                    //value: this.getDefaultRecipient(),
                    displayField: 'display',
                    valueField: 'value',
                    itemId: 'husbandryassignedTo'
                }]
            }]
        });

        this.callParent(arguments);
    },

    getDefaultRecipient: function(){
        return this.reviewRequiredRecipient;
    }
});