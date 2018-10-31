package org.labkey.wnprc_ehr.bc;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.joda.time.LocalDateTime;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveMapWrapper;
import org.labkey.api.data.Container;
import org.labkey.api.data.ExcelWriter;
import org.labkey.dbutils.api.SimpleQueryFactory;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


/**
 * Created by jon on 1/5/17.
 */
public class TreatmentsBCReport extends BusinessContinuityExcelReport {
    LocalDateTime date = new LocalDateTime();

    public TreatmentsBCReport(Container container, LocalDateTime localDateTime) {
        super(container);
        if (localDateTime != null) {
            date = localDateTime;
        }
    }

    public TreatmentsBCReport(Container container) {
        this(container, null);
    }

    @Override
    public String getBaseName() {
        return "Treatment Schedule";
    }

    @Override
    public void populateWorkbook() {
        // Bold the column headers
        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        List<JSONObject> treatments = Arrays.asList(queryFactory.selectRows("wnprc", "BCTreatments").toJSONObjectArray());

        Map<String, Map<String, Map<String, List<JSONObject>>>> areas = new HashMap<>();
        for (JSONObject treatment: treatments) {
            String area = treatment.optString("area", "unknown");
            String room = treatment.optString("room", "unknown");
            String cage = treatment.optString("cage", "unknown");

            Map<String, Map<String, List<JSONObject>>> rooms = areas.get(area);
            if (rooms == null) {
                rooms = new HashMap<>();
                areas.put(area, rooms);
            }

            Map<String, List<JSONObject>> cages = rooms.get(room);
            if (cages == null) {
                cages = new HashMap<>();
                rooms.put(room, cages);
            }

            List<JSONObject> animalsInCage = cages.get(cage);
            if (animalsInCage == null) {
                animalsInCage = new ArrayList<>();
                cages.put(cage, animalsInCage);
            }

            animalsInCage.add(treatment);
        }

        // Use a Linked Hash Map so that the order is maintained
        Map<String, String> displayNames = new LinkedHashMap<>();
        displayNames.put("Id", "Animal ID");

        displayNames.put("room", "Room");
        displayNames.put("cage", "Cage");

        displayNames.put("frequency", "Frequency");
        displayNames.put("treatment", "Treatment");
        displayNames.put("shortName", "Short Name");
        displayNames.put("qualifier", "Qualifier");
        displayNames.put("route",     "Route");
        displayNames.put("remark",    "Remark");

        displayNames.put("volume",      "Volume");
        displayNames.put("volumeUnits", "Volume Units");
        displayNames.put("concentration",      "Concentration");
        displayNames.put("concentrationUnits", "Concentration Units");
        displayNames.put("dosage",      "Dosage");
        displayNames.put("dosageUnits", "Dosage Units");
        displayNames.put("amount",      "Amount");
        displayNames.put("amountUnits", "Amount Units");

        displayNames.put("startdate", "Start Date");
        displayNames.put("enddate",   "End Date");
        displayNames.put("project",   "Project");
        displayNames.put("account",   "Account");

        displayNames.put("treatmentCode",   "TreatmentCode");


        List<String> columns = new ArrayList<>();
        columns.addAll(displayNames.keySet());

        for (String area : areas.keySet()) {
            Map<String, Map<String, List<JSONObject>>> rooms = areas.get(area);

            Sheet sheet = workbook.createSheet(ExcelWriter.cleanSheetName(area));
            int rowNumber = 0;

            // Create header row
            Row headerRow = sheet.createRow(rowNumber);
            for (int colNumber = 0; colNumber < columns.size(); colNumber++) {
                Cell headerCell = headerRow.createCell(colNumber);
                headerCell.setCellStyle(headerStyle);
                headerCell.setCellValue(displayNames.get(columns.get(colNumber)));
            }

            // Add rows
            for (String room : rooms.keySet()) {
                Map<String, List<JSONObject>> cages = rooms.get(room);

                for (String cage : cages.keySet()) {
                    List<JSONObject> animalsInCage = cages.get(cage);

                    for (JSONObject treatment : animalsInCage) {
                        CaseInsensitiveMapWrapper valueMap = new CaseInsensitiveMapWrapper<Object>(treatment);

                        // Create a row for the treatment
                        rowNumber += 1;
                        Row row = sheet.createRow(rowNumber);

                        // Populate the columns
                        for (int colNumber = 0; colNumber < columns.size(); colNumber++) {
                            Cell cell = row.createCell(colNumber);
                            String colName = columns.get(colNumber);

                            Object value = valueMap.get(colName);
                            String displayValue;

                            if (value == null) {
                                displayValue = "";
                            }
                            else if (value instanceof Date) {
                                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mma");

                                displayValue = dateFormat.format(value);
                            }
                            else {
                                displayValue = value.toString();
                            }

                            cell.setCellValue(displayValue);
                        }
                    }
                }
            }
        }
    }
}
