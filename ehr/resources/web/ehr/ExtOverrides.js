/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//This will contain ext overrides
Ext.namespace('EHR.ext');



//a css fix for Ext datepicker and tabpanel
Ext.menu.DateMenu.prototype.addClass('extContainer');
Ext.TabPanel.prototype.addClass('extContainer');


//NOTE: In IE8, DatePickers render half-width
//see: http://www.opendebug.com/article/533989
Ext.override (Ext.menu.Menu, {
    autoWidth:function (){
        //only append if input is numeric
        if (!isNaN(this.width))
            this.width += 'px';
    }
});

//Ext's 3.1 documentation says this should be the code.
// the purpose is to allow null values in numeric fields
Ext.data.Types.INT.convert = function(v){
    return v !== undefined && v !== null && v !== '' ?
        parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
};

Ext.data.Types.FLOAT.convert = function(v){
    return v !== undefined && v !== null && v !== '' ?
        parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
};

//if not set to true, null numeric values will automatically be coerced to zero
Ext.data.Field.prototype.useNull = true;



Ext.override(Ext.form.CheckboxGroup, {
    getValueAsString: function(delim)
    {
        delim = delim || ',';
        var vals = [];
        Ext.each(this.getValue(), function(c){
            vals.push(c.inputValue);
        }, this);
        return vals.join(delim);
    },
    removeAll: function () {
        this.panel.items.each(function(col){
            col.items.each(function(item){
                this.items.remove(item);
                col.remove(item);
            })
        }, this);
    }
});

//Ext is going to coerse the value into a string, which doesnt work well when it's null
Ext.override(Ext.form.RadioGroup, {
    setValueForItem: function(val){
        val = (val===null ? '' : val);
        Ext.form.RadioGroup.superclass.setValueForItem.call(this, val);
    },
    blankText: 'This field is required'
});


Ext.override(Ext.Panel, {
    setReadOnly: function(val){
        if(!this.items){
            console.log(this)
        }
        else {
            this.items.each(function(item){
                if(item.setReadOnly){
                    item.setReadOnly(val);
                }
                else {
                    item.setDisabled(val)
                }
            }, this);
        }
    }
});

//overridden b/c if you try to set the value of a combo prior to store loading, it will display
//the raw value, not display value
Ext.override(LABKEY.ext.ComboBox, {
    setValue: function(v){
        if(this.store && !this.store.fields){
            this.initialValue = v;
        }

        LABKEY.ext.ComboBox.superclass.setValue.call(this, v);
    }
});


//overridden b/c readOnly has no effect on checkboxes and radios.  this will disable the element, making it truly read only
Ext.override(Ext.form.Checkbox, {
    setReadOnly: function(val){
        Ext.form.Checkbox.superclass.setReadOnly.apply(this, arguments);
        this.setDisabled(val);
    }
});

Ext.override(Ext.data.Store, {
    add : function(records) {
        var i, len, record, index;

        records = [].concat(records);
        if (records.length < 1) {
            return;
        }

        for (i = 0, len = records.length; i < len; i++) {
            record = records[i];

            record.join(this);

            if (record.dirty || record.phantom) {
                this.modified.push(record);
            }
        }

        index = this.data.length;
        this.data.addAll(records);

        if (this.snapshot) {
            this.snapshot.addAll(records);
        }

        this.fireEvent('add', this, records, index);
    },
    insert : function(index, records) {
        var i, len, record;

        records = [].concat(records);
        for (i = 0, len = records.length; i < len; i++) {
            record = records[i];

            this.data.insert(index + i, record);
            record.join(this);

            if (record.dirty || record.phantom) {
                this.modified.push(record);
            }
        }

        if (this.snapshot) {
            this.snapshot.addAll(records);
        }

        this.fireEvent('add', this, records, index);
    }
});

//only overriden to remove setting a default nullCaption.  this is moved to the combo tpl
Ext.override(LABKEY.ext.Store, {
    onLoad : function(store, records, options) {
        this.isLoading = false;

        //remeber the name of the id column
        this.idName = this.reader.meta.id;

        if(this.nullRecord)
        {
            //create an extra record with a blank id column
            //and the null caption in the display column
            var data = {};
            data[this.reader.meta.id] = "";
            data[this.nullRecord.displayColumn] = this.nullRecord.nullCaption || this.nullCaption || null;

            var recordConstructor = Ext.data.Record.create(this.reader.meta.fields);
            var record = new recordConstructor(data, -1);
            this.insert(0, record);
        }
    }
});

//Ext.override(Ext.form.ComboBox, {
//    doQuery : function(q, forceAll){
//        q = Ext.isEmpty(q) ? '' : q;
//        var qe = {
//            query: q,
//            forceAll: forceAll,
//            combo: this,
//            cancel:false
//        };
//        if(this.fireEvent('beforequery', qe)===false || qe.cancel){
//            return false;
//        }
//        q = qe.query;
//        forceAll = qe.forceAll;
//        if(forceAll === true || (q.length >= this.minChars)){
//            if(this.lastQuery !== q){
//                this.lastQuery = q;
//                if(this.mode == 'local'){
//                    this.selectedIndex = -1;
//                    if(forceAll){
//                        this.store.clearFilter();
//                    }else{
//                        this.store.filter(this.displayField, q, this.allowAnyValue, this.caseSensitive);
//                    }
//                    this.onLoad();
//                }else{
//                    this.store.baseParams[this.queryParam] = q;
//                    this.store.load({
//                        params: this.getParams(q)
//                    });
//                    this.expand();
//                }
//            }else{
//                this.selectedIndex = -1;
//                this.onLoad();
//            }
//        }
//    }
//});


