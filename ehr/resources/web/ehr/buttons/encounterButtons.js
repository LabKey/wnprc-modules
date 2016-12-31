/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

EHR.DataEntryUtils.registerGridButton('ENCOUNTERDELETE', function(config){
    return Ext4.Object.merge({
        text: 'Delete Selected',
        tooltip: 'Click to delete selected rows',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            var selections = grid.getSelectionModel().getSelection();

            if(!grid.store || !selections || !selections.length)
                return;

            var hasPermission = true;
            var runIds = [];
            Ext4.Array.each(selections, function(r){
                if (!r.canDelete()){
                    hasPermission = false;
                    return false;
                }

                LDK.Assert.assertNotEmpty('No objectid in encounters record', r.get('objectid'));
                if (r.get('objectid'))
                    runIds.push(r.get('objectid').toLowerCase());
            }, this);

            //find children
            var childrenToDelete = {};
            var totalChildren = 0;
            var fieldName = 'parentid';
            if (hasPermission){
                grid.dataEntryPanel.storeCollection.clientStores.each(function(s){
                    if (!hasPermission)
                        return false;

                    if (s != grid.store){
                        if (!s.model.prototype.fields.containsKey(fieldName)){
                            console.log('no encounterid: ' + s.storeId);
                            return;
                        }

                        s.each(function(childRec){
                            var parentid = childRec.get(fieldName);
                            parentid = parentid ? parentid.toLowerCase() : parentid;

                            if (runIds.indexOf(parentid) != -1){
                                childrenToDelete[s.storeId] = childrenToDelete[s.storeId] || [];
                                childrenToDelete[s.storeId].push(childRec);
                                totalChildren++;

                                if (!childRec.canDelete()){
                                    console.log('no delete permission, aborting');
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