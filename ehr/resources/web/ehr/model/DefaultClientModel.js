/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.model.DefaultClientModel', {
    extend: 'LDK.data.CaseInsensitiveModel',
    sectionConfig: null,
    queries: {},

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'root'
        }
    },

    statics: {
        getFieldConfigs: function(fieldConfigs, sources, extraMetaData){
            var fields = [];
            for (var i=0;i<fieldConfigs.length;i++){
                var cfg = this.getFieldConfig(fieldConfigs[i], sources, extraMetaData);

                if (cfg.xtype == 'ehr-snomedcombo' || (cfg.editorConfig && cfg.editorConfig.xtype == 'ehr-snomedcombo')){
                    EHR.DataEntryUtils.getSnomedStore();
                }

                if (cfg.lookup && cfg.lookup.schemaName == 'ehr' && cfg.lookup.queryName == 'project'){
                    EHR.DataEntryUtils.getProjectStore();
                }

                if (cfg.lookup && cfg.lookup.schemaName == 'ehr_lookups' && cfg.lookup.queryName == 'procedures'){
                    EHR.DataEntryUtils.getProceduresStore();
                }

                if (cfg.lookup && cfg.lookup.schemaName == 'onprc_billing' && cfg.lookup.queryName == 'chargeableItems'){
                    EHR.DataEntryUtils.getChareableItemsStore();
                }

                if (cfg.lookup && cfg.lookup.schemaName == 'ehr_lookups' && cfg.lookup.queryName == 'labwork_services'){
                    EHR.DataEntryUtils.getLabworkServicesStore();
                }

                //added to support automatic type conversion
                if (Ext4.data.Types[LABKEY.ext4.Util.EXT_TYPE_MAP[cfg.jsonType]]){
                    cfg.type = Ext4.data.Types[LABKEY.ext4.Util.EXT_TYPE_MAP[cfg.jsonType]];
                }

                fields.push(cfg);
            }

            return fields;
        },

        getFieldConfig: function(cfg, sources, extraMetaData){
            var tableConfig = EHR.model.DataModelManager.getTableMetadata(cfg.schemaName, cfg.queryName, sources);
            var ret = Ext4.apply({}, cfg);
            Ext4.apply(ret, {
                useNull: true
            });

            var map = {};
            for (var key in tableConfig){
                if (map[key.toLowerCase()]){
                    console.error('duplicate keys: ' + key);
                }

                map[key.toLowerCase()] = key;
            }

            if (map[cfg.name.toLowerCase()]){
                ret = LABKEY.Utils.merge(ret, tableConfig[map[cfg.name.toLowerCase()]]);
            }

            if (extraMetaData && extraMetaData[cfg.name]){
                ret = LABKEY.Utils.merge(ret, extraMetaData[cfg.name]);
            }

            if (ret.jsonType && !Ext4.isEmpty(ret.defaultValue)){
                var type = Ext4.data.Types[LABKEY.ext4.Util.EXT_TYPE_MAP[ret.jsonType]];
                if (type){
                    ret.defaultValue = type.convert(ret.defaultValue);
                }
            }

            return ret;
        }
    },

    constructor: function(config){
        this.callParent(arguments);
        this.setFieldDefaults();
        if (this.storeCollection){
            this.storeCollection.setClientModelDefaults(this);
        }

        if (this.sectionCfg){
            this.queries = this.sectionCfg.queries;
        }

        this.serverErrors = Ext4.create('EHR.data.Errors', {
            record: this
        });
    },

    setFieldDefaults: function(){
        this.fields.each(function(field){
            if (Ext4.isFunction(field.getInitialValue)){
                this.data[field.name] = field.getInitialValue.call(this, this.data[field.name], this);
            }
//            else if (Ext4.isEmpty(this.data[field.name]) && !Ext4.isEmpty(field.defaultValue)){
//                console.log('default: ' + field.name);
//                this.data[field.name] = field.defaultValue;
//            }
        }, this);
    },

    validate: function(){
        var errors = this.callParent(arguments);

        this.fields.each(function(field){
            //NOTE: we're drawing a distinction between LABKEY's nullable and ext's allowBlank.
            // This allows fields to be set to 'allowBlank: false', which throws a warning
            // nullable:false will throw an error when null.
            // also, if userEditable==false, we assume will be set server-side so we ignore it here
            if(field.userEditable !== false && Ext4.isEmpty(this.get(field.name))){
                if(field.nullable === false || field.allowBlank === false){
                    errors.add({
                        id: LABKEY.Utils.generateUUID(),
                        field: field.name,
                        message: (field.nullable === false ? 'ERROR' : 'WARN') + ': This field is required',
                        severity: (field.nullable === false ? 'ERROR' : 'WARN'),
                        fromServer: false
                    });
                }
            }
        }, this);

        if(this.serverErrors && this.serverErrors.getCount()){
            errors.addAll(this.serverErrors.getRange());
        }

        return errors;
    },

    getCurrentQCStateLabel: function(){
        var qc = this.get('QCState');
        if (qc)
            return EHR.Security.getQCStateByRowId(qc).Label;

        //default to draft records
        return 'In Progress';
    },

    canDelete: function(){
        return this.hasPermission('delete');
    },

    hasPermission: function(permission, targetQCStateLabel){
        var currentQcStateLabel = this.getCurrentQCStateLabel();
        var permissionName;
        var permMap = this.storeCollection.formConfig.permissions;

        if (permission == 'delete'){
            if (this.phantom)
                return true;

            return EHR.DataEntryUtils.hasPermission(currentQcStateLabel, permission, permMap, this.queries);
        }
        else if (permission == 'insert'){
            return EHR.DataEntryUtils.hasPermission(currentQcStateLabel, permission, permMap, this.queries);
        }
        else if (permission == 'update'){
            if (!EHR.DataEntryUtils.hasPermission(currentQcStateLabel, permission, permMap, this.queries)){
                return false;
            }

            if (targetQCStateLabel){
                if (!EHR.DataEntryUtils.hasPermission(targetQCStateLabel, 'insert', permMap, this.queries)){
                    return false;
                }
            }

            return true;
        }
        else {
            return false;
        }
    }
});