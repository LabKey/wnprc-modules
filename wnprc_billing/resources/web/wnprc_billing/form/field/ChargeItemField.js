
Ext4.define('WNPRC_Billing.form.field.ChargeItemField', {
    extend: 'EHR_Billing.form.field.EHRBillingRowObserverEntryField',
    alias: 'widget.wnprc_billing-chargeitemfield',

    initComponent: function(){

        this.addListener(
        {
                scope:this,
                select: function (combo, recs) {

                    var chargeDate = EHR.DataEntryUtils.getSiblingValue(combo, 'date'); // get date value from data entry form
                    var chargeId = recs[0].get('rowId');

                    LABKEY.Query.selectRows({
                        schemaName: 'ehr_billing_public',
                        queryName: 'chargeRates',
                        filterArray: [
                            LABKEY.Filter.create('chargeId', chargeId, LABKEY.Filter.Types.EQUAL),
                            LABKEY.Filter.create('startDate', chargeDate.format("Y-m-d"), LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL),
                            LABKEY.Filter.create('endDate', chargeDate.format("Y-m-d"), LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
                        ],
                        columns: 'chargeId, startDate, endDate, unitCost',
                        failure: LDK.Utils.getErrorCallback(),
                        scope: this,
                        success: function(results){
                            EHR.DataEntryUtils.setSiblingFields(combo, {
                                unitCost: (results.rows[0] != null ? results.rows[0].unitCost : null)
                            });
                        }
                });
        }});
        this.callParent();
    }
});