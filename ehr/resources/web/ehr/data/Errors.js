/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.Errors', {
    extend : 'Ext.data.Errors',
    _hasChanges: false,

    constructor: function(config){
        this.callParent(arguments);

        this.record = config.record;
    },

    hasChanges: function(){
        return this._hasChanges;
    },

    clear: function(){
        this.callParent(arguments);

        if (this.getCount()){
            this._hasChanges = true;
        }
    },

    replaceErrorsForField: function(fieldName, serverErrors){
        serverErrors = serverErrors || [];
        var hasChanged = false;

        var messages = {};
        Ext4.Array.forEach(serverErrors, function(e){
            messages[e.message] = e;
        }, this);

        this.each(function(err){
            if (err.fromServer && err.field == fieldName){
                //if the existing error isnt present from the server, delete it.  if already present, ignore the server-provided one
                if (!messages[err.message]){
                    //console.log('removing error: ' + fieldName + '/' + err.message);
                    this.remove(err);
                    hasChanged = true;
                }
                else {
                    hasChanged = true;
                    delete messages[err.message];
                }
            }
        }, this);

        Ext4.Array.forEach(Ext4.Object.getKeys(messages), function(key){
            var newError = Ext4.apply({}, messages[key]);
            newError.field = fieldName;
            this.add(newError);
            hasChanged = true;
        }, this);

        return hasChanged;
    },

    setHasChanges: function(hasChanges){
        this._hasChanges = hasChanges;
    },

    add: function(err){
        this._hasChanges = true;

        this.callParent(arguments);
    },

    remove: function(obj){
        this._hasChanges = true;

        this.callParent(arguments);
    }
});