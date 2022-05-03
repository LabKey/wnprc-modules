
Ext4.define('WNPRC_Billing.form.field.ChargeItemField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-chargeitemfield',
    valueField: 'rowid',
    displayField: 'name',

    initComponent: function(){
        var filterArray = [];
        this.addListener({
            scope: this,
            focus: function() {
                if(this.fieldLabel){
                    filterArray = filterFunction(this);
                }else{
                    filterArray = filterFunction(this)
                }
                if (filterArray){
                    this.store.filterArray = filterArray;
                    this.store.load();
                }
            },
            beforerender: function (field) {

                //for bulk edit window
                //field only gets a label when is displayed inside the bulk upload window
                if(field.fieldLabel){
                    filterArray = filterFunction(field);
                    this.store.filterArray = filterArray;
                    field.store.load();
                }
            },
            select: function (combo, recs) {
                var filterArray = [];

                if (recs && recs[0] && recs[0].data) {

                    var chargeId = recs[0].data.rowid;
                    var form = this.up("form") ? this.up("form").getForm() : undefined;
                    filterArray = filterFunction(combo, chargeId);

                    LABKEY.Query.selectRows({
                        schemaName: 'ehr_billing_public',
                        queryName: 'chargeRates',
                        filterArray: filterArray,
                        columns: 'chargeId, unitCost',
                        failure: LDK.Utils.getErrorCallback(),
                        scope: this,
                        success: function (results) {

                            var unitCost = results.rows[0].unitCost;
                            // for bulk edit window
                            if (form) {
                                var unitCostField = this.up("form").getForm().findField("unitCost");
                                if (unitCostField)
                                {
                                    unitCostField.disabled = false;
                                    unitCostField.setValue(results.rows[0] != null ? unitCost : null);
                                }
                                var quantity = this.up("form").getForm().findField("quantity");
                                if (quantity && quantity.getValue())
                                {
                                    var totalCostField = this.up("form").getForm().findField("totalCost");
                                    if (totalCostField)
                                    {
                                        var val = results.rows[0] != null ? (quantity.getValue() * unitCost) : null;
                                        totalCostField.disabled = false;
                                        totalCostField.setValue(val);
                                    }
                                }


                            }
                            //for data entry grid
                            else {
                                var quantity = EHR.DataEntryUtils.getSiblingValue(this, "quantity");
                                EHR.DataEntryUtils.setSiblingFields(combo, {
                                    unitCost: (results.rows[0] != null ? unitCost : null),
                                    totalCost: (results.rows[0] != null && quantity != null ? unitCost * quantity : null)
                                });
                            }
                        }
                    });
                }
            }
        });
        this.callParent();
    }
});

function filterFunction(object,chargeId){
    var chargeGroup;
    var dateValue;
    var returnFilter = [];

    if (object.up("grid")) {
        chargeGroup = EHR.DataEntryUtils.getSiblingValue(object, "chargeGroup");
        dateValue = EHR.DataEntryUtils.getSiblingValue(object, "date");
    }else if (object.up("form")) {
        var form = object.up("form").getForm();
        chargeGroup = form.findField("chargeGroup").value;
        dateValue = form.findField("date").value;
    }
    if (arguments.length === 2 && chargeId != null){
        returnFilter.push(LABKEY.Filter.create('chargeId', chargeId, LABKEY.Filter.Types.EQUAL));
    }
    if(chargeGroup){
        returnFilter.push(LABKEY.Filter.create('departmentCode', chargeGroup, LABKEY.Filter.Types.EQUAL));
    }
    if (dateValue){
        returnFilter.push(LABKEY.Filter.create('startDate', dateValue.format("Y-m-d"), LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL));
        returnFilter.push(LABKEY.Filter.create('endDate', dateValue.format("Y-m-d"), LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL));
    }
    return returnFilter;
}