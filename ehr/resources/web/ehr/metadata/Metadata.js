/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.ns('EHR.Metadata.Sources');

/**
 * @class
 * @name EHR.Metadata
 * @description The EHR UI is heavily driven by metadata.  EHR.Metadata provides a number of static config objects that
 * are merged to provide the final config object used to generate the Ext-based forms.  These are organized into 'Metadata sources'.
 * Each source is a node under EHR.Metadata.Sources.  They can be requested used .getTableMetadata() and will be merged in order to form
 * the final Ext config object.  The purpose of this system is to allow sharing/inheritance of complex configuration between many forms.
 */
EHR.Metadata = new function(){
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
         * EHR.Metadata.getTableMetadata('Necropsies', ['Task', 'Necropsy'])
         * <p>
         * Then the following config objects will be merged, in order, if they are present, to form the final config object:
         * <p>
         * EHR.Metadata.Sources.Default.allQueries
         * EHR.Metadata.Sources.Default['Necropsies']
         * EHR.Metadata.Sources.Task.allQueries
         * EHR.Metadata.Sources.Task['Necropsies']
         * EHR.Metadata.Sources.Necropsy.allQueries
         * EHR.Metadata.Sources.Necropsies['Necropsies']
         * <p>
         * The purpose is to allow layering on config objects and inheritance such that different forms can support highly customized behaviors per field.
         * <p>
         * Also, arbitrary new additional metadata sources can be added in the future, should they become required.
         */
        getTableMetadata: function(queryName, sources){
            var meta = {};

            if (metadata.Default){
                EHR.Utils.rApplyClone(meta, metadata.Default.allQueries);

                if (metadata.Default.byQuery[queryName]){
                    EHR.Utils.rApplyClone(meta, metadata.Default.byQuery[queryName]);
                }
            }

            if (sources && sources.length){
                Ext.each(sources, function(source)
                {
                    if (metadata[source])
                    {
                        if (metadata[source].allQueries)
                        {
                            EHR.Utils.rApplyClone(meta, metadata[source].allQueries);
                        }

                        if (metadata[source].byQuery && metadata[source].byQuery[queryName])
                        {
                            EHR.Utils.rApplyClone(meta, metadata[source].byQuery[queryName]);
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
    }
}

/**
 * Describes the metadata of a single field.  It includes any fields in LABKEY.Query.FieldMetaData, along with those described here.
 * @name EHR.Metadata.FieldMetadata
 * @class Describes the metadata of a single field.  It includes any fields in LABKEY.Query.FieldMetaData, along with those described here.
 *
 */

/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name allowDuplicateValue
 * @description If false, the EHR.ext.RecordDuplicatorPanel will not give the option to duplicate the value in this field
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name noDuplicateByDefault
 * @description If true, this field will not be checked by default in an EHR.ext.RecordDuplicatorPanel, which provides a mechanism to duplicate records in a data entry panel.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name noSaveInTemplateByDefault
 * @description If true, this field will not be checked by default in an EHR.ext.SaveTemplatePanel, which provides a mechanism to save templates from a data entry panel.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name allowSaveInTemplate
 * @description If false, an EHR.ext.SaveTemplatePanel will not give the option to include this field in saved templates
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name updateValueFromServer
 * @description If true, when a record is validated on the server, if this validated record contains a value for this field then it will be applied to the record on the client.  Currently used to automatically populate location, cagemates or active assignments.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name ignoreColWidths
 * @description If true, the LabKey-provided column widths will be deleted.  The effect is to auto-size columns equally based on available width.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name defaultValue
 * @description A value to use as the default for any newly created records
 * @type Mixed
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name colModel
 * @description A config object that will be used when a column config is created from this metadata object using EHR.ext.metaHelper.getColumnConfig().  This can contain any properties that will be interpreted by Ext or your custom code.
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name setInitialValue
 * @description A function that will be called to set the initial value of this field.  Similar to defaultValue, except more complex values can be generated.  This function will be passed 2 arguments: value (the current value.  if defaultValue is defined, value will be the defaultValue) and rec (the Ext.data.Record)
 * @type Function
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name  parentConfig
 * @description A object used by EHR.ext.StoreInheritance to configure parent/child relationships between fields.  It is an object containing the following:
 * <br>
 * <li>storeIdentifier: An object with the properties: queryName and schemaName</li>
 * <li>dataIndex: The dataIndex of the field in the parent record that will be used as the value on this field</li>
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name shownInGrid
 * @description If false, this field will not be shown in the default grid view
 * @type String
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name shownInForm
 * @description If false, this field will not be shown in the default form panel
 * @type String
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name editorConfig
 * @description A config object that will be used when an editor config is created from this metadata object using EHR.ext.metaHelper.getDefaultEditor() or any derivatives such as getFormEditor() or getGridEditor().  This can contain any properties that will be interpreted by Ext or your custom code.
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name formEditorConfig
 * @description Similar to editorConfig, except will only be applied when the editor is created through getFormEditor() or getFormEditorConfig().
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name gridEditorConfig
 * @description Similar to editorConfig, except will only be applied when the editor is created through getGridEditor() or getGridEditorConfig();
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name isAutoExpandColumn
 * @description If true, then this column will auto-expand to will available width in an EditorGrid
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name qtipRenderer
 * @description A function to override the default qtipRender created in EHR.metaHelper.buildQtip().  See this method for more detail.
 * @type Function
 */



EHR.Metadata.hiddenCols = 'lsid,objectid,parentid,taskid,requestid'; //,createdby,modifiedby
EHR.Metadata.topCols = 'id,date,enddate,project,account';
EHR.Metadata.bottomCols = 'remark,performedBy,qcstate,'+EHR.Metadata.hiddenCols;
EHR.Metadata.sharedCols = ',id,date,project,account,'+EHR.Metadata.bottomCols;

/**
 * A static object that specifies the default columns to be used in data entry forms.
 * When adding a new dataset or adding columns to an existing dataset, this should be modified.
 * Columns are hard-coded here because a number of otherwise hidden columns are required by data entry.
 * A newer option that may be available would be to create a hidden view of a consistent name (ie. 'Data Entry') for
 * each dataset and use this view to manage the column list.
 * @name EHR.Metadata.Columns
 * @class
 *
 *
 */
//TODO: this should get replaced with the ~~UPDATE~~ view
EHR.Metadata.Columns = {
    Alopecia:                        EHR.Metadata.topCols + ',score,cause,head,shoulders,upperArms,lowerArms,hips,rump,dorsum,upperLegs,lowerLegs,other,'                                                                                                                                     + EHR.Metadata.bottomCols,
    Arrival:                         EHR.Metadata.topCols + ',source,geographic_origin,gender,birth,dam,sire,initialRoom,initialCage,initialCond,id/numroommates/cagemates,'                                                                                                                  + EHR.Metadata.bottomCols,
    Assignment:                      EHR.Metadata.topCols + ',projectedRelease,'                                                                                                                                                                                                              + EHR.Metadata.bottomCols,
    'Bacteriology Results':          EHR.Metadata.topCols + ',method,organism,source,qualresult,result,units,antibiotic,sensitivity,'                                                                                                                                                         + EHR.Metadata.bottomCols,
    'Behavior Remarks':              EHR.Metadata.topCols + ',so,a,p,category,'                                                                                                                                                                                                               + EHR.Metadata.bottomCols,
    Biopsies:                        EHR.Metadata.topCols + ',caseno,type,veterinarian,performedby,nhpbmd,grossdescription,histologicalDescription,'                                                                                                                                          + EHR.Metadata.bottomCols + ',patho_notes',
    Birth:                           EHR.Metadata.topCols + ',estimated,gender,weight,wdate,dam,sire,room,cage,cond,origin,conception,type,'                                                                                                                                                  + EHR.Metadata.bottomCols,
    'Blood Draws':                   'id/curlocation/location,' + EHR.Metadata.topCols + ',tube_type,tube_vol,num_tubes,quantity,requestor,additionalServices,billedby,assayCode,restraint,restraintDuration,daterequested,instructions,'                                                     + EHR.Metadata.bottomCols,
    'Body Condition':                EHR.Metadata.topCols + ',score,weightstatus,remark,tattoo_chest,tattoo_thigh,microchip,tag,tattoo_remark,'                                                                                                                                               + EHR.Metadata.bottomCols,
    cage_observations:               'date,room,cage,feces,userId,no_observations,'                                                                                                                                                                                                           + EHR.Metadata.sharedCols,
    Charges:                         EHR.Metadata.topCols + ',type,unitCost,quantity,'                                                                                                                                                                                                        + EHR.Metadata.bottomCols,
    'Chemistry Results':             EHR.Metadata.topCols + ',testid,method,resultOORIndicator,result,units,qualResult,'                                                                                                                                                                      + EHR.Metadata.bottomCols,
    'Clinical Encounters':           EHR.Metadata.topCols + ',title,type,major,serviceRequested,restraint,restraintDuration,'                                                                                                                                                                 + EHR.Metadata.bottomCols,
    'Clinical Remarks':              EHR.Metadata.topCols + ',so,a,p,'                                                                                                                                                                                                                        + EHR.Metadata.bottomCols,
    'Clinical Observations':         EHR.Metadata.topCols + ',area,observation,code,'                                                                                                                                                                                                         + EHR.Metadata.bottomCols,
    'Clinpath Runs':                 EHR.Metadata.topCols + ',servicerequested,type,sampletype,sampleId,collectionMethod,collectedBy,'                                                                                                                                                        + EHR.Metadata.bottomCols,
    'Cytology Automated Evaluation': EHR.Metadata.topCols + ',sampleType,collectionMethod,testid,result,units,'                                                                                                                                                                               + EHR.Metadata.bottomCols,
    'Cytology Manual Evaluation':    EHR.Metadata.topCols + ',sampleType,collectionMethod,sampleAppearance,slidesMade,slidesSubmitted,stainType,results,reviewedBy,'                                                                                                                          + EHR.Metadata.bottomCols,
    Deaths:                          EHR.Metadata.topCols + ',tattoo,dam,cause,manner,'                                                                                                                                                                                                       + EHR.Metadata.bottomCols,
    Demographics:                    EHR.Metadata.topCols + ',species,gender,birth,death,hold,dam,sire,origin,geographic_origin,cond,medical,prepaid,v_status,'                                                                                                                               + EHR.Metadata.bottomCols,
    Departure:                       EHR.Metadata.topCols + ',authorize,destination,'                                                                                                                                                                                                         + EHR.Metadata.bottomCols,
    'Dental Status':                 EHR.Metadata.topCols + ',priority,extractions,gingivitis,tartar,'                                                                                                                                                                                        + EHR.Metadata.bottomCols,
    'Drug Administration':           'id/curlocation/location,' + 'id,date,begindate,enddate,project,account' + ',code,qualifier,category,route,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,headerdate,restraint,restraintDuration,remark,performedby,' + EHR.Metadata.bottomCols,
    Feeding:                         EHR.Metadata.topCols + ',amount,type,'                                                                                                                                                                                                                   + EHR.Metadata.bottomCols,
    'Final Reports':                 EHR.Metadata.topCols + ','                                                                                                                                                                                                                               + EHR.Metadata.bottomCols,
    'Hematology Results':            EHR.Metadata.topCols + ',testid,method,result,units,qualResult,'                                                                                                                                                                                         + EHR.Metadata.bottomCols,
    'Hematology Morphology':         EHR.Metadata.topCols + ',morphology,score,'                                                                                                                                                                                                              + EHR.Metadata.bottomCols,
    Histology:                       EHR.Metadata.topCols + ',slideNum,stain,tissue,qualifier,container_type,pathologist,trimdate,trimmed_by,trim_remarks,'                                                                                                                                   + EHR.Metadata.bottomCols,
    'Housing':                       'id,project,date,enddate,room,cage,id/numroommates/cagemates,cond,reason,isTemp,'                                                                                                                                                                        + EHR.Metadata.bottomCols,
    'Immunology Results':            EHR.Metadata.topCols + ',testid,method,result,units,qualResult,'                                                                                                                                                                                         + EHR.Metadata.bottomCols,
    'Irregular Observations':        'id/curlocation/location,' + EHR.Metadata.topCols + ',feces,menses,other,tlocation,behavior,otherbehavior,other,breeding,'                                                                                                                               + EHR.Metadata.bottomCols,
    'Necropsy Diagnosis':            EHR.Metadata.topCols + ',tissue,severity,duration,distribution,process,'                                                                                                                                                                                 + EHR.Metadata.bottomCols,
    Necropsies:                      EHR.Metadata.topCols + ',tattoo,caseno,performedby,assistant,billing,tissue_distribution,timeofdeath,causeofdeath,mannerofdeath,perfusion_area,grossdescription,histologicalDescription,'                                                                + EHR.Metadata.bottomCols + ',patho_notes',
    'Notes':                         EHR.Metadata.topCols + ',userid,category,value,'                                                                                                                                                                                                         + EHR.Metadata.bottomCols,
    'Morphologic Diagnosis':         EHR.Metadata.topCols + ',remark,tissue,tissue_qualifier,severity,duration,distribution,inflammation,etiology,process,performedBy,qcstate,'                                                                                                               + EHR.Metadata.hiddenCols,
    'Pair Tests':                    EHR.Metadata.topCols + ',partner,bhav,testno,sharedFood,aggressions,affiliation,conclusion,'                                                                                                                                                             + EHR.Metadata.bottomCols,
    'Parasitology Results':          EHR.Metadata.topCols + ',organism,method,result,units,qualresult,'                                                                                                                                                                                       + EHR.Metadata.bottomCols,
    'Prenatal Deaths':               EHR.Metadata.topCols + ',species,gender,weight,dam,sire,room,cage,conception,'                                                                                                                                                                           + EHR.Metadata.bottomCols,
    'Procedure Codes':               EHR.Metadata.topCols + ',code,'                                                                                                                                                                                                                          + EHR.Metadata.bottomCols,
    'Problem List':                  EHR.Metadata.topCols + ',code,category,'                                                                                                                                                                                                                 + EHR.Metadata.bottomCols,
    'Organ Weights':                 EHR.Metadata.topCols + ',tissue,qualifier,weight,'                                                                                                                                                                                                       + EHR.Metadata.bottomCols,
    requests:                        'rowid,title,formtype,daterequested,priority,notify1,notify2,notify3,createdby,qcstate'                                                                                                                                                                                           ,
    Restraint:                       EHR.Metadata.topCols + ',enddate,type,totaltime,'                                                                                                                                                                                                        + EHR.Metadata.bottomCols,
    tasks:                           'rowid,title,formtype,created,createdby,assignedto,duedate,taskid,category,qcstate'                                                                                                                                                                                               ,
    'TB Tests':                      EHR.Metadata.topCols + ',notPerformedAtCenter,lot,dilution,eye,result1,result2,result3,'                                                                                                                                                                 + EHR.Metadata.bottomCols,
    'Teeth':                         EHR.Metadata.topCols + ',jaw,side,tooth,status,'                                                                                                                                                                                                         + EHR.Metadata.bottomCols,
    'Tissue Samples':                EHR.Metadata.topCols + ',tissue,qualifier,preservation,quantity,recipient,ship_to,container_type,accountToCharge,tissueRemarks,slideNum,stain,pathologist,trimdate,trimmed_by,trim_remarks,'                                                             + EHR.Metadata.bottomCols,
    'Treatment Orders':              EHR.Metadata.topCols + ',meaning,code,qualifier,route,frequency,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,'                                                                                                      + EHR.Metadata.bottomCols,
    'Urinalysis Results':            EHR.Metadata.topCols + ',testid,method,resultOORIndicator,result,units,qualResult,'                                                                                                                                                                      + EHR.Metadata.bottomCols,
    'Virology Results':              EHR.Metadata.topCols + ',virus,method,source,resultOORIndicator,result,units,qualResult,'                                                                                                                                                                + EHR.Metadata.bottomCols,
    Vitals:                          EHR.Metadata.topCols + ',temp,heartrate,resprate,'                                                                                                                                                                                                       + EHR.Metadata.bottomCols,
    Weight:                          'id/curlocation/location,' + EHR.Metadata.topCols + ',weight,'                                                                                                                                                                                           + EHR.Metadata.bottomCols
};
