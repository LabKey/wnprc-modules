/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.DataEntryUtils.registerGridButton('ROUNDSDELETE', function(config){
    return Ext4.Object.merge({
        text: 'Delete Selected',
        tooltip: 'Click to delete selected rows',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selections = grid.getSelectionModel().getSelection();

            if(!grid.store || !selections || !selections.length)
                return;

            var hasPermission = true;
            var keys = [];
            var fieldName = 'caseid';
            Ext4.Array.each(selections, function(r){
                if (!r.canDelete()){
                    hasPermission = false;
                    return false;
                }

                LDK.Assert.assertNotEmpty('No caseid in rounds record', r.get(fieldName));
                keys.push(r.get(fieldName));
            }, this);

            //find children
            var childrenToDelete = {};
            var totalChildren = 0;
            if (hasPermission){
                grid.dataEntryPanel.storeCollection.clientStores.each(function(s){
                    if (!hasPermission)
                        return false;

                    if (s != grid.store){
                        if (!s.model.prototype.fields.containsKey(fieldName)){
                            console.log('field ' + fieldName + ' not found: ' + s.storeId);
                            return;
                        }

                        s.each(function(childRec){
                            if (keys.indexOf(childRec.get(fieldName)) != -1){
                                childrenToDelete[s.storeId] = childrenToDelete[s.storeId] || [];
                                childrenToDelete[s.storeId].push(childRec);
                                totalChildren++;

                                if (!childRec.canDelete()){
                                    hasPermission = false;
                                    return false;
                                }
                            }
                        }, this);
                    }
                }, this);
            }

            if (hasPermission){
                Ext4.Msg.confirm('Confirm', 'You are about to permanently delete these records from this form, along with the ' + totalChildren + ' results associated with them.  It cannot be undone.  Are you sure you want to do this?', function(val){
                    if (val == 'yes'){
                        for (var storeId in childrenToDelete){
                            var store = grid.dataEntryPanel.storeCollection.clientStores.get(storeId);
                            LDK.Assert.assertNotEmpty('Unable to find store: ' + storeId, store);

                            store.safeRemove(childrenToDelete[storeId]);
                        }

                        grid.store.safeRemove(selections);
                    }
                }, this);
            }
            else {
                Ext4.Msg.alert('Error', 'You do not have permission to remove one or more of these records');
            }
        }
    }, config);
});

EHR.DataEntryUtils.registerGridButton('MARK_ROUNDS_REVIEWED', function(config){
    return Ext4.Object.merge({
        text: 'Mark Reviewed',
        tooltip: 'Click to mark the selected rows as reviewed',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selections = grid.getSelectionModel().getSelection();

            if (!grid.store || !selections || !selections.length){
                Ext4.Msg.alert('Error', 'No rows selected');
                return;
            }

            var keyMap = {};
            Ext4.Array.each(selections, function(r){
                LDK.Assert.assertNotEmpty('No caseid in rounds record', r.get('caseid'));
                LDK.Assert.assertNotEmpty('Id not found in rounds record', r.get('Id'));

                keyMap[r.get('caseid')] = r.get('Id');
            }, this);

            Ext4.Msg.confirm('Mark Reviewed', 'This will mark the selected rows as reviewed.  Continue?', function(val){
                if (val == 'yes'){
                    var obsStore = grid.dataEntryPanel.storeCollection.getClientStoreByName('Clinical Observations');
                    LDK.Assert.assertNotEmpty('Unable to find clinical_observations store in round buttons', obsStore);

                    var toAdd = [];
                    for (var caseId in keyMap){
                        toAdd.push(obsStore.createModel({
                            Id: keyMap[caseId],
                            date: new Date(),
                            category: 'Reviewed',
                            area: 'N/A',
                            observation: LABKEY.Security.currentUser.displayName,
                            caseid: caseId
                        }));
                    }

                    if (toAdd.length){
                        obsStore.add(toAdd);
                    }
                }
            }, this);

        }
    }, config);
});
