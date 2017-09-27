/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.TaskStoreCollection', {
    extend: 'EHR.data.StoreCollection',

    getTaskId: function(){
        if (this.taskId) {
            return this.taskId;
        }

        var model = this.getServerStoreForQuery('ehr', 'tasks').getAt(0);
        if (model){
            return model.get('taskid');
        }

        console.error('Unable to find taskid');
        return null
    },

    setClientModelDefaults: function(model){
        if (!model.get('taskid')){
            model.suspendEvents();
            model.set('taskid', this.getTaskId());
            model.resumeEvents();
        }

        return this.callParent([model]);
    },

    commitChanges: function(){
        // ensure all records are using this taskId and alert if not
        var taskid = this.getTaskId();
        if (taskid){
            this.clientStores.each(function(cs){
                if (cs.getFields().get('taskid') != null){
                    cs.each(function(r){
                        if (taskid != r.get('taskid')){
                            LDK.Assert.assertEquality('Incorrect taskid for client store:' + cs.storeId, taskid, r.get('taskid'));
                            r.beginEdit();
                            r.set('taskid', this.getTaskId());
                            r.endEdit(true);
                        }
                    }, this);
                }
            }, this);

            this.serverStores.each(function(cs){
                if (cs.getFields().get('taskid') != null){
                    cs.each(function(r){
                        if (r.isRemovedRequest){
                            return;  //do not check these records.  they have deliberately been separated.
                        }

                        if (taskid != r.get('taskid')){
                            LDK.Assert.assertEquality('Incorrect taskid for server store:' + cs.storeId, taskid, r.get('taskid'));
                            r.beginEdit();
                            r.set('taskid', this.getTaskId());
                            r.endEdit(true);
                        }
                    }, this);
                }
            }, this);
        }

        return this.callParent(arguments);
    }
});