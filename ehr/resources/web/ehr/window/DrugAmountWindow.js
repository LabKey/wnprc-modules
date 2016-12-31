/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg label
 */
Ext4.define('EHR.window.DrugAmountWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.ehr-drugamountwindow',

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            width: 1240,
            title: 'Review Drug Amounts',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper is designed to help calculate drug amounts.  Below is each drug entered, along with the most recent weight and estimated amount.  All values can be changed.',
                style: 'margin-bottom: 5px;padding: 5px;'
            },{
                xtype: 'ldk-linkbutton',
                text: '[View Formulary]',
                linkTarget: '_blank',
                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'ehr_lookups', 'query.queryName': 'drug_defaults'}),
                style: 'margin-left: 5px;margin-bottom: 10px;'
            },{
                xtype: 'tabpanel',
                maxHeight: '80%',
                bodyStyle: 'padding: 5px;',
                //width: 1190,
                defaults: {
                    border: false
                },
                items: [{
                    title: 'All Rows',
                    autoScroll: true,
                    items: [{
                        itemId: 'drugTab',
                        xtype: 'form',
                        border: false,
                        items: this.getInitialItems()
                    }]
                },{
                    title: 'Doses Used',
                    autoScroll: true,
                    items: [{
                        itemId: 'drugDoseTab',
                        border: false,
                        bodyStyle: 'padding: 5px;',
                        items: this.getInitialItems()
                    }]
                },{
                    title: 'Weights Used',
                    autoScroll: true,
                    itemId: 'weights',
                    items: this.getInitialItems()
                }]
            }],
            buttons: [{
                text: 'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    if (btn.up('window').down('#drugTab').isDirty()){
                        Ext4.Msg.confirm('Close?', 'You will lose any changes to these records.  Do you want to continue?', function(val){
                            if (val == 'yes'){
                                btn.up('window').close();
                            }
                        }, this);
                    }
                    else {
                        btn.up('window').close();
                    }
                }
            }]
        });

        this.callParent();

        this.on('beforeshow', function(window){
            if (!this.getTargetRecords().length){
                Ext4.Msg.alert('No Records', 'There are no records to in the grid, nothing to do.');
                return false;
            }
        }, this);

        this.loadDemographics();
    },

    getTargetRecords: function(){
        if (this.boundRecord){
            return [this.boundRecord];
        }
        else {
            return this.targetStore.getRange();
        }
    },

    loadDemographics: function(){
        var ids = {};
        Ext4.Array.forEach(this.getTargetRecords(), function(r){
            if (r.get('Id')){
                ids[r.get('Id')] = true;
            }
        }, this);

        this.animalIds = Ext4.Object.getKeys(ids);

        EHR.DemographicsCache.getDemographics(this.animalIds, this.onDemographicsLoad, this, -1);        
    },

    onDemographicsLoad: function(ids, animalRecordMap){
        this.animalRecordMap = animalRecordMap;

        EHR.DataEntryUtils.getWeights(this.targetStore.storeCollection, this.animalIds, this.onWeightsLoad, this, false);
    },

    onWeightsLoad: function(weightMap){
        this.weights = weightMap;

        var target = this.down('#drugTab');
        target.removeAll();

        var toAdd = this.getDrugItems();
        if (toAdd.length){
            target.add(toAdd);
        }
        else {
            target.add({
                html: 'No animals found'
            });
        }

        //also the drugDoseTab tab
        var drugDoseTab = this.down('#drugDoseTab');
        drugDoseTab.removeAll();

        var toAdd2 = this.getDoseTabItems();
        if (toAdd2.length){
            drugDoseTab.add(toAdd2);
        }
        else {
            drugDoseTab.add({
                html: 'No animals found'
            });
        }

        //and weights tab
        var weightsTab = this.down('#weights');
        weightsTab.removeAll();

        var toAdd3 = this.getWeightItems();
        if (toAdd3.length){
            weightsTab.add(toAdd3);
        }
        else {
            weightsTab.add({
                html: 'No animals found'
            });
        }
    },

    getInitialItems: function(){
        return [{
            border: false,
            html: 'Loading...'
        }]
    },

    getWeightItems: function(){
        var numCols = 3;

        return [{
            html: 'This tab shows one row for each animal in your selection.  You are able to choose the desired weight to use in calculations.  You can either use the latest recorded weight, preferentially use the weight entered in the weight section of this form (if applicable), or enter an estimated weight.',
            border: false,
            style: 'padding-bottom: 10px;'
        },{
            defaults: {
                border: false
            },
            border: false,
            items: [{
                itemId: 'weightType',
                fieldLabel: 'Weight Type',
                style: 'margin-right: 10px;',
                width: 300,
                labelWidth: 90,
                xtype: 'combo',
                displayField: 'value',
                valueField: 'value',
                value: 'Prefer Weight From Form',
                currentMode: 'Prefer Weight From Form',
                store: {
                    type: 'array',
                    fields: ['value'],
                    data: [
                        ['Prefer Weight From Form'],
                        ['Use Latest Saved Weight']
                    ]
                },
                listeners: {
                    scope: this,
                    change: function(field, val){
                        var preference = (val == 'Use Latest Saved Weight');
                        EHR.DataEntryUtils.getWeights(this.targetStore.storeCollection, this.animalIds, function(weightMap){
                            this.weights = weightMap;
                            var target = this.down('#weightTable');
                            target.removeAll();
                            target.add(this.getWeightTableItems());

                            //fire change event to update primary tab
                            var fields = target.query('field[fieldName=globalWeight]');
                            for (var i=0;i<fields.length;i++){
                                fields[i].fireEvent('change', fields[i], fields[i].getValue());
                            }
                        }, this, preference);
                    }
                }
            },{
                itemId: 'weightTable',
                style: 'padding-top: 10px',
                defaults: {
                    border: false
                },
                layout: {
                    type: 'table',
                    columns: numCols
                },
                items: this.getWeightTableItems()
            }]
        }];
    },

    getWeightTableItems: function(){
        var items = [{
            html: '<b>Id</b>',
            width: 100
        },{
            html: '<b>Weight (kg)</b>',
            width: 100
        },{
            html: '<b>Weight Type</b>',
            width: 120
        }];

        Ext4.Array.forEach(this.animalIds, function(id, recordIdx){
            items.push({
                xtype: 'displayfield',
                recordIdx: recordIdx,
                value: id
            });

            items.push({
                xtype: 'ldk-numberfield',
                width: 80,
                hideTrigger: true,
                recordIdx: recordIdx,
                animalId: id,
                fieldName: 'globalWeight',
                decimalPrecision: 3,
                value: (this.weights[id] && this.weights[id].weight) ? this.weights[id].weight : null,
                listeners: {
                    scope: this,
                    change: function(field, val){
                        //update the displayfield
                        var target = field.up('panel').query('displayfield[fieldName=weightType][animalId=' + field.animalId + ']')[0];
                        if (this.weights[id] && val == this.weights[id].weight){
                            target.setValue(this.weights[id].weightType);
                        }
                        else {
                            target.setValue('Custom');
                        }

                        //also update the primary tab
                        var fields = this.down('#drugTab').query('field[animalId=' + field.animalId+ '][fieldName=weight]');
                        for (var i=0;i<fields.length;i++){
                            fields[i].setValue(val);
                        }
                    }
                }
            });

            items.push({
                xtype: 'displayfield',
                fieldName: 'weightType',
                recordIdx: recordIdx,
                animalId: id,
                value: (this.weights[id] && this.weights[id].weightType) ? this.weights[id].weightType : null
            });
        }, this);

        return items;
    },

    getDoseTabItems: function(){
        var numCols = 12;
        var items = [{
            html: '<b>Drug</b>'
        },{
            html: '<b>Standard Conc.</b>',
            colspan: 2
        },{
            html: '<b>Standard Dosage</b>',
            colspan: 2
        },{
            html: '<b>Fixed Volume</b>'
        },{
            html: '<b>Vol Units</b>'
        },{
            html: '<b>Vol Rounding</b>'
        },{
            html: '<b>Fixed Amount</b>'
        },{
            html: '<b>Amount Units</b>'
        },{
            html: '<b>Amount Rounding</b>'
        },{
            html: '<b>Recalculate Vol/Amt</b>'
        }];

        var fields = [{
            name: 'concentration',
            width: 70
        },{
            name: 'conc_units',
            width: 80
        },{
            name: 'dosage',
            width: 70
        },{
            name: 'dosage_units',
            width: 80
        },{
            name: 'volume',
            width: 70
        },{
            name: 'vol_units',
            width: 80
        },{
            name: 'volume_rounding',
            width: 80
        },{
            name: 'amount',
            width: 70
        },{
            name: 'amount_units',
            width: 70
        },{
            name: 'amount_rounding',
            width: 70
        }];

        Ext4.Array.forEach(this.getDistinctCodes(), function(code, recordIdx){
            items.push({
                xtype: 'displayfield',
                fieldName: 'code',
                recordIdx: recordIdx,
                snomedCode: code.code,
                value: code.meaning
            });

            Ext4.Array.forEach(fields, function(fieldObj){
                var fieldName = fieldObj.name;
                var editor, found = false;
                Ext4.each(this.formConfig.fieldConfigs, function(field, idx){
                    if (fieldName == field.name){
                        var cfg = Ext4.apply({}, field);
                        cfg = EHR.model.DefaultClientModel.getFieldConfig(cfg, this.formConfig.configSources);

                        editor = LABKEY.ext4.Util.getGridEditorConfig(cfg);

                        if (cfg.jsonType != 'string'){
                            editor.xtype = 'ldk-numberfield';
                            editor.hideTrigger = true;
                        }

                        editor.fieldName = fieldName;
                        found = true;

                        return false;
                    }
                }, this);

                if (fieldName == 'amount_rounding' || fieldName == 'volume_rounding'){
                    found = true;
                    editor = {
                        xtype: 'ldk-numberfield',
                        fieldName: fieldName
                    }
                }

                LDK.Assert.assertTrue('Unable to find target field in DrugAmountWindow: ' + fieldName, found);

                if (editor){
                    editor.width = fieldObj.width;
                    editor.value = code[fieldName];
                    editor.fieldName = fieldName;
                    editor.recordIdx = recordIdx;
                    editor.snomedCode = code.code;

                    items.push(editor);
                }
                else {
                    items.push({
                        html: ''
                    });
                }
            }, this);

            items.push({
                xtype: 'button',
                border: true,
                snomedCode: code.code,
                recordIdx: recordIdx,
                text: 'Update Records',
                style: 'margin-left: 1px;',
                width: 125,
                scope: this,
                handler: function(btn){
                    this.updateMedicationOfType(btn.snomedCode);
                }
            });
        }, this);

        items.push({
            border: false,
            colspan: (numCols -1)
        });

        items.push({
            xtype: 'button',
            style: 'margin-left: 1px;margin-top: 4px;',
            width: 125,
            text: 'Update All',
            border: true,
            scope: this,
            handler: function(btn){
                var panel  = this.down('#drugDoseTab');
                var cbs = panel.query('field[fieldName=code]');
                for (var i=0;i<cbs.length;i++){
                    this.updateMedicationOfType(cbs[i].snomedCode);
                }
            }
        });

        return [{
            html: 'This tab shows one row for each medication in your selection.  You are able to set the desired dose/concentration and rounding factor here, once for each drug.  This may be easier than editing each animal individually.',
            border: false,
            style: 'padding-bottom: 10px;'
        },{
            border: false,
            itemId: 'theTable',
            layout: {
                type: 'table',
                columns: numCols
            },
            defaults: {
                border: false,
                style: 'margin-left: 5px;margin-right: 5px;'
            },
            items: items
        }];
    },

    getDistinctCodes: function(){
        var codes = [];

        Ext4.Array.forEach(this.getTargetRecords(), function(record, recordIdx){
            if (!record.get('Id') || !record.get('code')){
                return;
            }

            codes.push(record.get('code'));
        }, this);

        codes = Ext4.unique(codes);

        this.formularyStore = EHR.DataEntryUtils.getFormularyStore();
        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();
        LDK.Assert.assertTrue('Formulary store is not done loading', !this.formularyStore.isLoading());
        LDK.Assert.assertTrue('SNOMED store is not done loading', !this.snomedStore.isLoading());

        var codeMap = [];
        Ext4.Array.forEach(codes, function(code){
            var snomedRec = this.snomedStore.getRecordForCode(code);
            var formularyMap = this.formularyStore.getFormularyValues(code);
            var valMap = {
                code: code,
                meaning: snomedRec ? snomedRec.get('meaning') : null
            };

            if (formularyMap && !Ext4.Object.isEmpty(formularyMap)){
                if (snomedRec)
                    Ext4.apply(valMap, formularyMap);
            }
            else {
                console.log('unknown or malformed code: ' + code);
                console.log(formularyMap);
            }

            codeMap.push(valMap);
        }, this);

        codeMap = LDK.Utils.sortByProperty(codeMap, 'meaning');

        return codeMap;
    },

    getDrugItems: function(){
        var numCols = 13;
        var items = [{
            html: '<b>Animal</b>'
        },{
            html: '<b>Drug</b>'
        },{
            html: '<b>Weight (kg)</b>',
            width: 100
        },{
            html: '<b>Conc</b>'
        },{
            html: '<b>Units</b>'
        },{
            html: '<b>Dosage</b>'
        },{
            html: '<b>Units</b>'
        },{
            html: '<b>Vol</b>'
        },{
            html: '<b>Units</b>'
        },{
            html: '<b>Amount</b>'
        },{
            html: '<b>Units</b>'
        },{
            html: '<b>Auto Calc?</b>'
        },{
            html: '' //placeholder for messages
        }];

        var fields = [{
            name: 'concentration',
            width: 70
        },{
            name: 'conc_units',
            width: 80
        },{
            name: 'dosage',
            width: 70
        },{
            name: 'dosage_units',
            width: 80
        },{
            name: 'volume',
            width: 70
        },{
            name: 'vol_units',
            width: 80
        },{
            name: 'amount',
            width: 70
        },{
            name: 'amount_units',
            width: 80
        }];

        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();
        LDK.Assert.assertTrue('SNOMED store is not done loading', !this.snomedStore.isLoading());

        Ext4.Array.forEach(this.getTargetRecords(), function(record, recordIdx){
            if (!record.get('Id') || !record.get('code')){
                return;
            }

            items.push({
                xtype: 'displayfield',
                value: record.get('Id'),
                record: record,
                recordIdx: recordIdx,
                fieldName: 'Id'
            });

            var snomedRec = this.snomedStore.getRecordForCode(record.get('code'));
            items.push({
                xtype: 'displayfield',
                fieldName: 'code',
                snomedCode: record.get('code'),
                recordIdx: recordIdx,
                value: snomedRec ? snomedRec.get('meaning') : record.get('code')
            });

            items.push({
                xtype: 'ldk-numberfield',
                hideTrigger: true,
                decimalPrecision: 3,
                keyNavEnabled: false,
                width: 80,
                fieldName: 'weight',
                recordIdx: recordIdx,
                animalId: record.get('Id'),
                value: this.weights[record.get('Id')] ? this.weights[record.get('Id')].weight : null,
                listeners: {
                    scope: this,
                    change: this.onFieldChange
                }
            });

            Ext4.Array.forEach(fields, function(fieldObj){
                var fieldName = fieldObj.name;
                var editor, found = false;
                Ext4.each(this.formConfig.fieldConfigs, function(field, idx){
                    if (fieldName == field.name){
                        var cfg = Ext4.apply({}, field);
                        cfg = EHR.model.DefaultClientModel.getFieldConfig(cfg, this.formConfig.configSources);

                        editor = LABKEY.ext4.Util.getGridEditorConfig(cfg);
                        if (cfg.jsonType != 'string'){
                            editor.xtype = 'ldk-numberfield';
                            editor.hideTrigger = true;
                        }

                        found = true;

                        return false;
                    }
                }, this);

                LDK.Assert.assertTrue('Unable to find target field in DrugAmountWindow: ' + fieldName, found);

                if (editor){
                    editor.width = fieldObj.width;
                    editor.value = record.get(fieldName);
                    editor.fieldName = fieldName;
                    editor.recordIdx = recordIdx;
                    editor.animalId = record.get('Id');
                    if (editor.xtype == 'ldk-numberfield'){
                        editor.hideTrigger = true;
                    }
                    editor.listeners = editor.listeners || {};
                    editor.listeners.scope = this;
                    editor.listeners.change = this.onFieldChange;

                    items.push(editor);
                }
                else {
                    items.push({
                        html: ''
                    });
                }
            }, this);

            items.push({
                xtype: 'checkbox',
                recordIdx: recordIdx,
                fieldName: 'include',
                checked: true
            });

            items.push({
                xtype: 'displayfield',
                width: 80,
                recordIdx: recordIdx,
                fieldName: 'messages'
            });
        }, this);

        return [{
            html: 'This tab shows one row per drug, allowing you to review and re-calculate amount/volume for weight-based drugs.  It will pre-populate doses based on the formulary.  Any drug using kg in the dosage will have the option to auto-calculate dose.  To exclude a given drug from auto-calculation, check the box to the right.  Use the \'Recalculate\' button in the bottom-right to recalculate values.',
            border: false,
            style: 'padding-bottom: 10px;'
        },{
            border: false,
            itemId: 'theTable',
            layout: {
                type: 'table',
                columns: numCols
            },
            defaults: {
                border: false,
                style: 'margin-left: 5px;margin-right: 5px;'
            },
            items: items
        },{
            layout: {
                type: 'vbox',
                align: 'right'
            },
            border: false,
            style: 'margin-bottom: 5px;margin-top: 5px;margin-right: 110px;',
            items: [{
                xtype: 'button',
                text: 'Recalculate All',
                border: true,
                itemId: 'recalculate',
                menu: [{
                    text: 'Recalculate Both Amount/Volume',
                    scope: this,
                    handler: function(btn){
                        var panel  = this.down('#drugTab');
                        var cbs = panel.query('checkbox');
                        for (var i=0;i<cbs.length;i++){
                            if (cbs[i].getValue()){
                                this.recalculateRow(cbs[i].recordIdx, '*');
                            }
                        }
                    }
                },{
                    text: 'Recalculate Amount Based On Volume',
                    scope: this,
                    handler: function(btn){
                        var panel  = this.down('#drugTab');
                        var cbs = panel.query('checkbox');
                        for (var i=0;i<cbs.length;i++){
                            if (cbs[i].getValue()){
                                this.recalculateRow(cbs[i].recordIdx, 'volume');
                            }
                        }
                    }
                },{
                    text: 'Recalculate Volume Based On Amount',
                    scope: this,
                    handler: function(btn){
                        var panel  = this.down('#drugTab');
                        var cbs = panel.query('checkbox');
                        for (var i=0;i<cbs.length;i++){
                            if (cbs[i].getValue()){
                                this.recalculateRow(cbs[i].recordIdx, 'amount');
                            }
                        }
                    }
                }]
            }]
        }];
    },

    updateMedicationOfType: function(code){
        //get source row and values
        var sourceFields = this.down('#drugDoseTab').query('field[snomedCode=' + code + ']');
        var obj = {};
        for (var i=0;i<sourceFields.length;i++){
            if (sourceFields[i].fieldName){
                obj[sourceFields[i].fieldName] = sourceFields[i].getValue();
            }
        }

        //find the target rows
        var tab = this.down('#drugTab');
        var fields = tab.query('field[fieldName=code][snomedCode=' + code + ']');

        for (var i=0;i<fields.length;i++){
            for (var fieldName in obj){
                var field = tab.query('field[fieldName=' + fieldName + '][recordIdx=' + fields[i].recordIdx+ ']');
                if (field.length){
                    field[0].setValue(obj[fieldName]);
                }
            }
        }
    },

    onFieldChange: function(field, val){
        var tab = this.down('#drugTab');
        var checkbox = tab.query('field[recordIdx=' + field.recordIdx + '][fieldName=include]')[0];
        if (!checkbox){
            return;  //can happen during render
        }

        var autoCalc = checkbox.getValue();
        if (autoCalc){
            this.recalculateRow(field.recordIdx, field.fieldName);
        }

        //allow units update
        if (['dosage_units', 'conc_units', 'amount_units', 'vol_units', '*'].indexOf(field.fieldName) > -1){
            console.log('updating units');
            this.updateUnits(field.recordIdx, field.fieldName);
        }

        if (field.fieldName == 'weight'){
            this.updateWeight(field.animalId, field.getValue());
        }
    },

    getFieldValMap: function(recordIdx){
        var tab = this.down('#drugTab');
        var fields = tab.query('field[recordIdx=' + recordIdx + ']');

        var valMap = {};
        var fieldMap = {};
        Ext4.Array.forEach(fields, function(field){
            valMap[field.fieldName] = field.snomedCode ? field.snomedCode : field.getValue();
            fieldMap[field.fieldName] = field;
        }, this);

        return {
            valMap: valMap,
            fieldMap: fieldMap
        }
    },

    getDrugDefaults: function(code){
        var panel = this.down('#drugDoseTab');
        var fields = panel.query('field[snomedCode=' + code + ']');
        var obj = {};
        for (var i=0;i<fields.length;i++){
            obj[fields[i].fieldName] = fields[i].getValue();
        }

        return obj;
    },

    recalculateRow: function(recordIdx, changedField){
        var ret = this.getFieldValMap(recordIdx);
        var fieldMap = ret.fieldMap;
        var valMap = ret.valMap;

        var drugDefaults = this.getDrugDefaults(valMap.code);
        if (['dosage', 'concentration', 'weight', '*'].indexOf(changedField) > -1){
            if (valMap.dosage_units && valMap.dosage_units.match(/\/kg$/)){
                this.calculateVolume(fieldMap, valMap, drugDefaults);

                //NOTE: if we have a volume (which may be rounded), based amount on that.  otherwise calculate directly
                this.calculateAmount(fieldMap, valMap, drugDefaults, !!valMap.volume);
            }
        }
        else if (changedField == 'volume'){
            this.calculateAmount(fieldMap, valMap, drugDefaults, true);
        }
        else if (changedField == 'amount'){
            this.calculateVolume(fieldMap, valMap, drugDefaults, true);
        }
    },

    updateWeight: function(animalId, weight){
        var panel = this.down('#drugTab');
        var fields = panel.query('field[fieldName=weight][animalId=' + animalId + ']');
        for (var i=0;i<fields.length;i++){
            fields[i].setValue(weight);
        }
    },

    getComboRec: function(field, value){
        var recIdx = field.store.findExact(field.valueField, value);
        if (recIdx == -1){
            return;
        }

        return field.store.getAt(recIdx);
    },

    updateUnits: function(recordIdx, changedField){
        var ret = this.getFieldValMap(recordIdx);
        var fieldMap = ret.fieldMap;
        var valMap = ret.valMap;

        var field = fieldMap[changedField];
        if (!field.store || !valMap[changedField]){
            return;
        }

        var rec = this.getComboRec(field, valMap[changedField]);
        if (!rec)
            return;

        if (changedField == 'conc_units' || changedField == '*'){
            if (rec.get('numerator')){
                fieldMap['amount_units'].setValue(rec.get('numerator'));
            }
            if (rec.get('denominator')){
                fieldMap['vol_units'].setValue(rec.get('denominator'));
            }
        }
        else if (changedField == 'dosage_units'){
            if (rec.get('numerator')){
                fieldMap['amount_units'].setValue(rec.get('numerator'));
            }
        }
        else if (changedField == 'vol_units'){
            //validate conc/dosage match
            var concUnitRec = this.getComboRec(fieldMap['conc_units'], fieldMap['conc_units'].getValue());
            if (concUnitRec && concUnitRec.get('denominator') != valMap[changedField]){
                fieldMap['conc_units'].setValue(null);
            }
        }
        else if (changedField == 'amount_units'){
            //validate conc/dosage match
            var concUnitRec = this.getComboRec(fieldMap['conc_units'], fieldMap['conc_units'].getValue());
            if (concUnitRec && concUnitRec.get('numerator') != valMap[changedField]){
                fieldMap['conc_units'].setValue(null);
            }

            var doseUnitRec = this.getComboRec(fieldMap['dosage_units'], fieldMap['dosage_units'].getValue());
            if (doseUnitRec && doseUnitRec.get('numerator') != valMap[changedField]){
                fieldMap['dosage_units'].setValue(null);
            }
        }
    },

    calculateVolume: function(fieldMap, valMap, drugDefaults, fixedAmount){
        valMap.volume = EHR.DataEntryUtils.calculateDrugVolume(valMap, drugDefaults.volume_rounding, fixedAmount);

        if (fieldMap['volume']){
            fieldMap['volume'].suspendEvents();
            fieldMap['volume'].setValue(valMap['volume']);
            fieldMap['volume'].resumeEvents();
        }
    },

    calculateAmount: function(fieldMap, valMap, drugDefaults, fixedAmount){
        valMap.amount = EHR.DataEntryUtils.calculateDrugAmount(valMap, drugDefaults.amount_rounding, fixedAmount);

        if (fieldMap['amount']){
            fieldMap['amount'].suspendEvents();
            fieldMap['amount'].setValue(valMap['amount']);
            fieldMap['amount'].resumeEvents();
        }
    },

    onSubmit: function(btn){
        var panel  = this.down('#drugTab');
        var idFields = panel.query('field[fieldName=Id]');
        for (var i=0;i<idFields.length;i++){
            var record = idFields[i].record;
            var fields = panel.query('field[recordIdx=' + idFields[i].recordIdx + ']');

            var valMap = {};
            Ext4.Array.forEach(fields, function(field){
                if (record.fields.get(field.fieldName))
                    valMap[field.fieldName] = field.getValue();
            }, this);

            delete valMap.code; //currently holds the meaning, not value

            record.suspendEvents();
            record.set(valMap);
            record.resumeEvents();
        }

        this.targetStore.fireEvent('datachanged', this.targetStore);
        if (this.targetGrid)
            this.targetGrid.getView().refresh();

        this.close();
    }
});

EHR.DataEntryUtils.registerGridButton('DRUGAMOUNTHELPER', function(config){
    return Ext4.Object.merge({
        text: 'Review Amount(s)',
        xtype: 'button',
        tooltip: 'Click to set the drug amounts',
        handler: function(btn){
            var grid = btn.up('gridpanel');

            Ext4.create('EHR.window.DrugAmountWindow', {
                targetGrid: grid,
                targetStore: grid.store,
                formConfig: grid.formConfig
            }).show();
        }
    });
});
