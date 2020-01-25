
Ext4.define('WNPRC_Billing.form.field.ChargeItemField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc_billing-chargeitemfield',
    valueField: 'rowid',
    displayField: 'name',

    initComponent: function(){

        this.addListener({
            scope: this,
            focus: function() {
                //for data entry grid
                if (this.up("grid")) {
                    var chargeGroupVal = EHR.DataEntryUtils.getSiblingValue(this, "chargeGroup");
                    if (chargeGroupVal) {
                        var filter = LABKEY.Filter.create('departmentCode', chargeGroupVal, LABKEY.Filter.Types.EQUAL);
                        this.store.filterArray = [filter];
                        this.store.load();
                    }
                }

                //for bulk edit window
                var form = this.up("form") ? this.up("form").getForm() : undefined;
                if (form) {
                    //filter charge items based on chargeGroup selection
                    var chargeGroupField = form.findField("chargeGroup");

                    if (chargeGroupField) {
                        var filter = LABKEY.Filter.create('departmentCode', chargeGroupField.value, LABKEY.Filter.Types.EQUAL);
                        this.store.filterArray = [filter];
                        this.store.load();
                    }
                }
            },
            beforerender: function (field) {

                //for bulk edit window
                var form = field.up("form") ? field.up("form").getForm() : undefined;
                if (form) {
                    //filter charge items based on chargeGroup selection
                    var chargeGroupField = form.findField("chargeGroup");

                    if (chargeGroupField) {
                        var filter = LABKEY.Filter.create('departmentCode', chargeGroupField.value, LABKEY.Filter.Types.EQUAL);
                        field.store.filterArray = [filter];
                        field.store.load();
                    }
                }
            },
            select: function (combo, recs) {

                if (recs && recs[0] && recs[0].data) {

                    var chargeId = recs[0].data.rowid;
                    var chargeDateValue = undefined;

                    var form = this.up("form") ? this.up("form").getForm() : undefined;

                    if (form) {
                        chargeDateValue = form.findField("date").value;
                    }
                    else {
                        chargeDateValue = EHR.DataEntryUtils.getSiblingValue(combo, "date");
                    }

                    LABKEY.Query.selectRows({
                        schemaName: 'ehr_billing_public',
                        queryName: 'chargeRates',
                        filterArray: [
                            LABKEY.Filter.create('chargeId', chargeId, LABKEY.Filter.Types.EQUAL),
                            LABKEY.Filter.create('startDate', chargeDateValue.format("Y-m-d"), LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL),
                            LABKEY.Filter.create('endDate', chargeDateValue.format("Y-m-d"), LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
                        ],
                        columns: 'chargeId, unitCost',
                        failure: LDK.Utils.getErrorCallback(),
                        scope: this,
                        success: function (results) {

                            // for bulk edit window
                            if (form) {
                                var unitCostField = this.up("form").getForm().findField("unitCost");
                                unitCostField.disabled = false;
                                unitCostField.setValue(results.rows[0] != null ? results.rows[0].unitCost : null);
                            }
                            //for data entry grid
                            else {
                                EHR.DataEntryUtils.setSiblingFields(combo, {
                                    unitCost: (results.rows[0] != null ? results.rows[0].unitCost : null)
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