package org.labkey.wnprc_ehr.query;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.laboratory.LaboratoryService;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.table.ButtonConfigFactory;
import org.labkey.api.query.UserSchema;
import org.labkey.api.assay.AssayProtocolSchema;
import org.labkey.api.assay.AssayProvider;

import java.util.List;

public class ViralAssayCustomizer implements TableCustomizer {

    public void customize(TableInfo ti)
    {
        //apply defaults
        TableCustomizer tc = LDKService.get().getBuiltInColumnsCustomizer(true);
        tc.customize(ti);

        if (ti instanceof AbstractTableInfo)
        {
            AbstractTableInfo ati = (AbstractTableInfo)ti;
            customizeAssayTable(ati);
        }
    }

    public void customizeAssayTable(AbstractTableInfo ti)
    {
        customizeSharedColumns(ti);

        if (ti.getName().equalsIgnoreCase("Run"))
        {
            customizeRunsTable(ti);
        }
        else if (ti.getName().equalsIgnoreCase("Batch"))
        {
            customizeBatchTable(ti);
        }
        else if (ti.getName().equalsIgnoreCase("Data"))
        {
            customizeDataTable(ti);
        }

        LDKService.get().getColumnsOrderCustomizer().customize(ti);
    }

    public void customizeSharedColumns(AbstractTableInfo ti)
    {
        BaseColumnInfo hypothesis = ti.getMutableColumn("hypothesis");
        if (hypothesis != null)
        {
            hypothesis.setShownInInsertView(false);
        }
    }

    private AssayProvider getAssayProvider(AbstractTableInfo ti)
    {
        if (ti.getUserSchema() instanceof AssayProtocolSchema)
        {
            AssayProtocolSchema schema = (AssayProtocolSchema)ti.getUserSchema();
            return schema.getProvider();
        }

        return null;
    }

    private void customizeButtonBar(AbstractTableInfo ti, String domain)
    {
        UserSchema us = ti.getUserSchema();
        if (us == null)
            return;

        AssayProvider ap = getAssayProvider(ti);
        if (ap == null)
            return;

        String providerName = ap.getName();

        List<ButtonConfigFactory> buttons = LaboratoryService.get().getAssayButtons(ti, providerName, domain);
        LDKService.get().customizeButtonBar(ti, buttons);
    }

    public void customizeDataTable(AbstractTableInfo ti) {
        BaseColumnInfo subject = ti.getMutableColumn("subjectId");
        if (subject != null) {
            subject.setLabel("Subject Id");
            subject.setConceptURI("http://cpas.labkey.com/Study#ParticipantId");
            LDKService.get().applyNaturalSort(ti, "subjectId");
        }

        BaseColumnInfo result = ti.getMutableColumn("result");
        if (result != null) {
            result.setLabel("Result");
            result.setMeasure(true);
            result.setDimension(false);
            result.setFormat("0.##");
            result.setConceptURI(LaboratoryService.ASSAYRESULT_CONCEPT_URI);
        }

        BaseColumnInfo rawResult = ti.getMutableColumn("rawResult");
        if (rawResult != null) {
            rawResult.setLabel("Raw Result");
            rawResult.setHidden(true);
            rawResult.setShownInInsertView(false);
            rawResult.setUserEditable(false);
            rawResult.setShownInUpdateView(false);
            rawResult.setShownInDetailsView(false);
            rawResult.setMeasure(false);
            rawResult.setDimension(false);
            rawResult.setFormat("0.##");
            rawResult.setConceptURI(LaboratoryService.ASSAYRAWRESULT_CONCEPT_URI);
        }

        BaseColumnInfo date = ti.getMutableColumn("date");
        if (date != null) {
            date.setLabel("Sample Date");
            date.setConceptURI(LaboratoryService.SAMPLEDATE_CONCEPT_URI);
        }

        BaseColumnInfo requestId = ti.getMutableColumn("requestId");
        if (requestId != null) {
            requestId.setLabel("Request Id");
        }

        BaseColumnInfo qcFlags = ti.getMutableColumn("qcflags");
        if (qcFlags != null)
        {
            qcFlags.setLabel("QC Flags");
            qcFlags.setShownInInsertView(false);
            qcFlags.setMeasure(false);
            qcFlags.setDimension(false);
        }

        BaseColumnInfo statusFlags = ti.getMutableColumn("statusflag");
        if (statusFlags != null)
        {
            statusFlags.setLabel("Status Flag");
            statusFlags.setShownInInsertView(false);
            statusFlags.setMeasure(false);
            statusFlags.setDimension(false);
        }

        ColumnInfo sourceMaterialColumn = ti.getColumn("sourceMaterial");
        if (sourceMaterialColumn != null) {
            TableInfo sourceMaterialTable = sourceMaterialColumn.getFkTableInfo(); // CONSIDER: replace foreignkey instead attempting surgery on this inner columninfo
            if (sourceMaterialTable instanceof AbstractTableInfo) {
                BaseColumnInfo liquidColumn = ((AbstractTableInfo)sourceMaterialTable).getMutableColumn("liquid");
                if (liquidColumn != null) {
                    liquidColumn.setLabel("Units");
                    liquidColumn.setDisplayColumnFactory(new DisplayColumnFactory() {
                        @Override
                        public DisplayColumn createRenderer(ColumnInfo colInfo) {
                            return new ViralLoadUnitsColumn(colInfo);
                        }
                    });
                }
            }
        }

        customizeButtonBar(ti, AssayProtocolSchema.DATA_TABLE_NAME);
    }

    public void customizeRunsTable(AbstractTableInfo ti)
    {
        customizeButtonBar(ti, AssayProtocolSchema.RUNS_TABLE_NAME);
    }

    public void customizeBatchTable(AbstractTableInfo ti) {
        BaseColumnInfo name = ti.getMutableColumn("name");
        if (name != null) {
            name.setLabel("Batch Name");
            name.setShownInInsertView(false);
        }

        BaseColumnInfo comments = ti.getMutableColumn("comments");
        if (comments != null) {
            comments.setShownInInsertView(false);
        }

        BaseColumnInfo importMethod = ti.getMutableColumn("importMethod");
        if (importMethod != null) {
            importMethod.setHidden(true);
            importMethod.setLabel("Import Method");
            importMethod.setDescription("The import method, which usually corresponds to the format of the data.  Most commonly, this corresponds to a particular instrument's output.");
        }

        customizeButtonBar(ti, AssayProtocolSchema.BATCHES_TABLE_NAME);
    }

    public static class ViralLoadUnitsColumn extends DataColumn {
        public ViralLoadUnitsColumn(ColumnInfo colInfo) {
            super(colInfo);
        }

        @Override
        public Object getValue(RenderContext ctx) {
            Object value = super.getValue(ctx);
            if (value instanceof Boolean) {
                boolean liquid = (Boolean) value;
                if (liquid) {
                    return "mL";
                }
                else {
                    return "mg";
                }
            }
            return "";
        }

        @Override
        public Object getDisplayValue(RenderContext ctx) {
            return getValue(ctx);
        }

        @Override
        public String getFormattedValue(RenderContext ctx) {
            return h(getValue(ctx));
        }
    }
}
