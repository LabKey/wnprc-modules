Ext4.define('wnprc.ext.data.HusbandryServerStore', {
    extend: 'EHR.data.DataEntryServerStore',
    //alias: 'store.wnprc-HusbandryServerStore',

    constructor: function(){
        this.callParent(arguments);

    },

    getCommands: function(records, forceUpdate, validateOnly){
        var commands = [];
        var recordsPerCommand = [];

        //batch records into CRUD operations
        var recMap = {
            create: [],
            update: [],
            destroy: []
        };

        //only commit changed records
        if (!records){
            recMap.create = this.getNewRecords() || [];
            recMap.update = this.getUpdatedRecords() || [];

            if (!validateOnly){
                var removed = this.getRemovedRecordsToSync();
                if (removed.destroy.length)
                    recMap.destroy = removed.destroy;
                if (removed.update.length)
                    recMap.update = recMap.update.concat(removed.update);
            }
        }
        else {
            var r;
            for (var i=0; i<records.length;i++){
                r = records[i];
                var weight = r.get('weight');
                if (r.phantom && weight != null){
                    recMap.create.push(r);
                }
                else if (forceUpdate || !LABKEY.Utils.isEmptyObj(r.modified)){
                    var v = r.get(this.proxy.reader.getIdProperty());
                    LDK.Assert.assertNotEmpty('Record passed as update which lacks keyfield for store: ' + this.storeId + '/' + this.proxy.reader.idProperty + '/' + Ext4.encode(r.modified), v);
                    if (v){
                        recMap.update.push(r);
                    }
                    else {
                        r.phantom = true;
                        recMap.create.push(r);
                    }
                }
            }

            var removed = this.getRemovedRecordsToSync();
            if (!validateOnly){
                if (removed.destroy.length)
                    recMap.destroy = removed.destroy;
                if (removed.update.length){
                    for (var i=0;i<removed.update.length;i++){
                        LDK.Assert.assertNotEmpty('Deleted record passed as delete/update which lacks keyfield for store: ' + this.storeId + '/' + this.proxy.reader.idProperty, removed.update[i].get(this.proxy.reader.idProperty));
                    }

                    recMap.update = recMap.update.concat(removed.update);
                }
            }
        }

        //NOTE: this is debugging code designed to track down the 'row not found' error.  ultimately we should fix this underlying issue and remove this
        if (recMap.update.length){
            var key = this.proxy.reader.getIdProperty();
            LDK.Assert.assertNotEmpty('Unable to find key field for: ' + this.storeId, key);
            var toRemove = [];
            Ext4.Array.forEach(recMap.update, function(r){
                LDK.Assert.assertNotEmpty('Record passed as update which lacks keyfield for store: ' + this.storeId + '/' + key, r.get(key));
                if (!r.get(key)){
                    r.phantom = true;
                    recMap.create.push(r);
                    toRemove.push(r);
                }
            }, this);

            if (toRemove.length){
                for (var i=0;i<toRemove.length;i++){
                    recMap.update.remove(toRemove[i]);
                }
            }
        }

        for (var action in recMap){
            if (!recMap[action].length)
                continue;

            var operation = Ext4.create('Ext.data.Operation', {
                action: action,
                records: recMap[action]
            });

            commands.push(this.proxy.buildCommand(operation));
            recordsPerCommand.push(operation.records);
        }

        return {
            commands: commands,
            records: recordsPerCommand
        };
    }


});