package org.labkey.wnprc_ehr.bc;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.joda.time.DateTime;
import org.labkey.api.data.Container;
import org.labkey.api.data.ExcelWriter;
import org.labkey.api.settings.AppProps;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by jon on 1/5/17.
 */
public abstract class BusinessContinuityExcelReport extends BusinessContinuityReport {
    protected Workbook workbook;

    abstract public String getBaseName();
    abstract public void populateWorkbook();

    public BusinessContinuityExcelReport(Container container) {
        super(container);
        workbook = getExcelDocumentType().createWorkbook();
    }

    @Override
    public String getFileName() {
        return getBaseName() + "." + getExcelDocumentType().name();
    }

    @Override
    public String getMimeType() {
        return getExcelDocumentType().getMimeType();
    }

    @Override
    public InputStream generateContent() {
        populateWorkbook();

        Sheet aboutSheet = workbook.createSheet("About");
        Map<String, Object> infoMap = new HashMap<>();
        infoMap.put("Created At", new DateTime());
        infoMap.put("Container", container.getPath());
        infoMap.put("Machine", AppProps.getInstance().getBaseServerUrl());

        int i = 0;
        for (String key : infoMap.keySet()) {
            Row row = aboutSheet.createRow(i);
            row.createCell(0).setCellValue(key);
            row.createCell(1).setCellValue(infoMap.get(key).toString());
            i = i + 1;
        }

        // We'll write out the workbook to memory
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            workbook.write(outputStream);
        }
        catch (IOException e) {
            // Since this is only operating on a byte array output stream, it shouldn't error out.
            throw new RuntimeException(e);
        }

        // Now create an input stream from the contents of that memory buffer
        ByteArrayInputStream inputStream = new ByteArrayInputStream(outputStream.toByteArray());

        // Finally, return the InputStream, so that our consumers can read() as much as they'd like.
        return inputStream;
    }

    public Workbook getWorkBook() {
        return workbook;
    }

    public ExcelWriter.ExcelDocumentType getExcelDocumentType() {
        return ExcelWriter.ExcelDocumentType.xlsx;
    }
}
