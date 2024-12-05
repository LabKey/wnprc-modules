EHR.DataEntryUtils.registerGridButton('REMOVERECORD', function(config){
    return Ext4.Object.merge({
        text: 'Remove Records',
        tooltip: 'Click to delete selected rows',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selections = grid.getSelectionModel().getSelection();

            if(!grid.store || !selections || !selections.length)
                return;

            for (var i = 0; i < selections.length; i++) {
                // Flag this record as being simply removed from the batch being saved, not being deleted
                selections[i].isNonDelete = true;
            }

            grid.store.remove(selections);
        }
    }, config);
});

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

        }
    }, config);

});
EHR.DataEntryUtils.registerGridButton('CHANGETIME', function (config){
    return Ext4.Object.merge({
        text: 'Update time',
        tooltip: 'Click to mark the selected rows to update the date and time',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selections = grid.getSelectionModel().getSelection();

            if (!grid.store || !selections || !selections.length){
                Ext4.Msg.alert('Error', 'No rows selected');
                return;
            }
            var keyMap = {};
            var startTime  = {date: new Date ()};
            var toAdd = [];

            Ext4.Array.each(selections, function(r){
                LDK.Assert.assertNotEmpty('No caseid in rounds record', r.get('objectid'));
                LDK.Assert.assertNotEmpty('Id not found in rounds record', r.get('Id'));
                                
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

        }
    }, config);

});

EHR.DataEntryUtils.registerDataEntryFormButton('FOOD_STARTED', {
    text: 'Start Food Deprive',
    name: 'food_started',
    requiredQC: 'Scheduled',
    targetQC: 'Started',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('wnprc_ehr', 'dataEntry.view'),
    disabled: true,
    itemId: 'depriveBtn',
    disableOn: 'ERROR',
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        if (panel.storeCollection.getFoodDepriveRec()){
            var rows = panel.storeCollection.getFoodDepriveRec();
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

            //TODO: get the store from client side and send update function to the server
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
                    displayField: 'display',
                    valueField: 'value',
                    itemId: 'husbandryassignedTo'
                }]
            }]
        });

        this.callParent(arguments);
    },
});


EHR.DataEntryUtils.registerDataEntryFormButton('SUBMIT_WATER', {
    text: 'Submit Water',
    name: 'submit',
    requiredQC: 'Completed',
    targetQC: 'Completed',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('wnprc_ehr', 'dataEntry.view'),
    disabled: true,
    itemId: 'submitWtrBtn',
    disableOn: 'WARN',
    handler: function(btn){
        //this.onSubmit(btn);
        // let waterGiven = btn.up('gridpanel').store;
        // if (store.getFields().get('waterSource')){
        //
        // }

        let waterStore = this.storeCollection.getServerStoreForQuery("study", "waterGiven");

        if (waterStore){
            var animalIds = [];
            for (var idx=0; idx<waterStore.count(); idx++){
                var waterGivenRecord = waterStore.getAt(idx);
                if (waterGivenRecord !== undefined && waterGivenRecord.get('waterSource')==='lixit'){
                    animalIds.push(waterGivenRecord.get('Id'));
                }
            }
            if(animalIds.length){
                var animalString = '';
                if (animalString.length >1){
                    animalIds.forEach((animalId)=> animalString+=animalId+',');
                }else{
                    animalString = animalIds[0];
                }

                Ext4.MessageBox.show({
                    title: 'Lixit Confirmation',
                    msg: 'Is the water line connected for animal '+ animalString,
                    width: '300',
                    buttons: Ext4.MessageBox.YESNO,
                    icon: Ext4.MessageBox.QUESTION,
                    scope: this,
                    fn: function proceed(resp){
                        if (resp === 'yes'){
                            this.onSubmit(btn);
                        }else{
                            Ext4.MessageBox.hide();
                        }
                    }
                });
            }else {
                this.onSubmit(btn);
            }
        }



        //var panel = btn.up('ehr-dataentrypanel');


    }

});
