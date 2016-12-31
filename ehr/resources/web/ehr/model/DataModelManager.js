/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * @class
 * @name EHR.model.DataModelManager
 * @description The EHR UI is heavily driven by metadata.  DataModelManager provides a number of static config objects that
 * are merged to provide the final config object used to generate the Ext-based forms.  These are organized into 'sources'.
 * Each source is registered using EHR.model.DataModelManager.registerMetadata().  They can be requested using .getTableMetadata() and will be merged in order to form
 * the final config object.  The purpose of this system is to allow sharing/inheritance of complex configuration between many forms.
 */
Ext4.ns('EHR.model.DataModelManager');

EHR.model.DataModelManager = new function(){
    //private
    var metadata = {};

    //public
    return {
        /**
         * The preferred method to obtain metadata for a given EHR query
         * @param {String} queryName The name of the query for which to retrieve metadata
         * @param {Array} sources An array of metadata sources (in order) from which to retrieve metadata.  If the metadata source has metadata on this query, these will be merged with the default metadata in the order provided.
         * @description If the following is called:
         * <p>
         * EHR.model.DataModelManager.getTableMetadata('study', 'Necropsies', ['Task', 'Necropsy'])
         * <p>
         * Then the following config objects will be merged, in order, if they are present, to form the final config object:
         * <p>
         * Default.allQueries
         * Default['study.Necropsies']
         * Task.allQueries
         * Task['study.Necropsies']
         * Necropsy.allQueries
         * Necropsies['study.Necropsies']
         * <p>
         * The purpose is to allow layering on config objects and inheritance such tht different forms can support highly customized behaviors per field.
         * <p>
         * Also, arbitrary new additional metadata sources can be added in the future, should they become required.
         */
        getTableMetadata: function(schemaName, queryName, sources){
            var meta = {};
            var tableId = schemaName + '.' + queryName;

            if (metadata.Default){
                EHR.Utils.rApplyClone(meta, metadata.Default.allQueries);

                var cfg = metadata.Default.byQuery[tableId];
                if (cfg){
                    EHR.Utils.rApplyClone(meta, cfg);
                }
//                else {
//                    console.log('no config found for table: ' + tableId);
//                }
            }

            if (sources && sources.length){
                Ext4.Array.forEach(sources, function(source){
                    if (metadata[source]){
                        if (metadata[source].allQueries){
                            EHR.Utils.rApplyClone(meta, metadata[source].allQueries);
                        }

                        if (metadata[source].byQuery && metadata[source].byQuery[tableId]){
                            EHR.Utils.rApplyClone(meta, metadata[source].byQuery[tableId]);
                        }
                    }
                }, this);
            }

            return meta;
        },

        registerMetadata: function(source, object){
            if (!metadata[source])
                metadata[source] = {};
            EHR.Utils.rApplyClone(metadata[source], object);
        }

//        //case-insensitive fieldnames
//        applyMetadata: function(target, source){
//            target = target || {};
//            source = source || {};
//
//            var map = {};
//            for (var key in target){
//                map[key.toLowerCase()] = key;
//            }
//
//            for (var name in source){
//                var normalized = map[name.toLowerCase()] || name;
//                EHR.Utils.rApplyClone(target[normalized], source[name]);
//            }
//        }
    }
}

/**
 * Describes the metadata of a single field.  It includes any fields in LABKEY.Query.FieldMetaData, along with those described here.
 * @name EHR.model.FieldMetadata
 * @class Describes the metadata of a single field.  It includes any fields in LABKEY.Query.FieldMetaData, along with those described here.
 *
 */

/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name allowDuplicateValue
 * @description If false, the EHR.ext.RecordDuplicatorPanel will not give the option to duplicate the value in this field
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name noDuplicateByDefault
 * @description If true, this field will not be checked by default in an EHR.ext.RecordDuplicatorPanel, which provides a mechanism to duplicate records in a data entry panel.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name noSaveInTemplateByDefault
 * @description If true, this field will not be checked by default in an EHR.ext.SaveTemplatePanel, which provides a mechanism to save templates from a data entry panel.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name allowSaveInTemplate
 * @description If false, an EHR.ext.SaveTemplatePanel will not give the option to include this field in saved templates
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name updateValueFromServer
 * @description If true, when a record is validated on the server, if this validated record contains a value for this field then it will be applied to the record on the client.  Currently used to automatically populate location, cagemates or active assignments.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name ignoreColWidths
 * @description If true, the LabKey-provided column widths will be deleted.  The effect is to auto-size columns equally based on available width.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name defaultValue
 * @description A value to use as the default for any newly created records
 * @type Mixed
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name colModel
 * @description A config object that will be used when a column config is created from this metadata object using EHR.ext.metaHelper.getColumnConfig().  This can contain any properties that will be interpreted by Ext or your custom code.
 * @type Object
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name getInitialValue
 * @description A function that will be called to set the initial value of this field.  Similar to defaultValue, except more complex values can be generated.  This function will be passed 2 arguments: value (the current value.  if defaultValue is defined, value will be the defaultValue) and rec (the Ext.data.Record)
 * @type Function
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name  parentConfig
 * @description A object used by EHR.ext.StoreInheritance to configure parent/child relationships between fields.  It is an object containing the following:
 * <br>
 * <li>storeIdentifier: An object with the properties: queryName and schemaName</li>
 * <li>dataIndex: The dataIndex of the field in the parent record that will be used as the value on this field</li>
 * @type Object
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name shownInGrid
 * @description If false, this field will not be shown in the default grid view
 * @type String
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name shownInForm
 * @description If false, this field will not be shown in the default form panel
 * @type String
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name editorConfig
 * @description A config object that will be used when an editor config is created from this metadata object using EHR.ext.metaHelper.getDefaultEditor() or any derivatives such as getFormEditor() or getGridEditor().  This can contain any properties that will be interpreted by Ext or your custom code.
 * @type Object
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name formEditorConfig
 * @description Similar to editorConfig, except will only be applied when the editor is created through getFormEditor() or getFormEditorConfig().
 * @type Object
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name gridEditorConfig
 * @description Similar to editorConfig, except will only be applied when the editor is created through getGridEditor() or getGridEditorConfig();
 * @type Object
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name isAutoExpandColumn
 * @description If true, then this column will auto-expand to will available width in an EditorGrid
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.model.FieldMetadata
 * @field
 * @name qtipRenderer
 * @description A function to override the default qtipRender created in EHR.metaHelper.buildQtip().  See this method for more detail.
 * @type Function
 */