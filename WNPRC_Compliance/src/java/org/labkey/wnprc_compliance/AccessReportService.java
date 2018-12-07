package org.labkey.wnprc_compliance;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.json.JSONObject;
import org.labkey.api.action.ApiUsageException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.api.util.Pair;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;


import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by jon on 2/6/17.
 */
public class AccessReportService {
    protected User user;
    protected Container container;

    public AccessReportService(User user, Container container) {
        this.user = user;
        this.container = container;
    }

    public void importReport(InputStream stream) throws IOException, AccessReportRowParser.MalformedReportException {
        String reportid = UUID.randomUUID().toString().toUpperCase();

        HSSFWorkbook workbook = new HSSFWorkbook(stream);
        HSSFSheet sheet = workbook.getSheetAt(0);

        Row titleRow = sheet.getRow(2);
        if (!titleRow.getCell(0).getStringCellValue().equalsIgnoreCase("Area Rights Report")) {
            throw new ApiUsageException("You can only upload area rights reports here.");
        }

        Row dateRow = sheet.getRow(6);
        Pattern datePattern = Pattern.compile("report created on (.*)");
        Matcher datePatternMatcher = datePattern.matcher(dateRow.getCell(0).getStringCellValue());
        if (!datePatternMatcher.matches()) {
            throw new ApiUsageException("Could not parse date of report");
        }
        Date generatedOn = AccessReportRowParser.parseDate(datePatternMatcher.group(1));

        // Check to make sure we haven't done this already.
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimpleFilter filter = new SimplerFilter("date", CompareType.DATE_EQUAL, generatedOn);
        JSONObject[] existingRows = queryFactory.selectRows(WNPRC_ComplianceSchema.NAME, "access_reports", filter).toJSONObjectArray();
        if (existingRows.length > 0) {
            throw new ApiUsageException("This report has already been uploaded.");
        }


        Set<String> areaNames = new HashSet();
        Map<String, Map<String, Object>> cardInfos = new HashMap<>();
        List<Map<String, Object>> accessData = new ArrayList<>();

        Pattern areaNamePattern = Pattern.compile("[\\s\\x00A0]*area: (.*)");

        Iterator<Row> rows = sheet.rowIterator();
        outer:
        while (rows.hasNext()) {
            Row row = rows.next();
            String firstCellText = row.getCell(0).getStringCellValue();
            firstCellText = firstCellText.replaceAll("\u00A0", ""); // strip out non-breaking spaces

            Matcher areaNameMatcher = areaNamePattern.matcher(firstCellText);
            if (areaNameMatcher.matches()) {
                areaNames.add(areaNameMatcher.group(1));
                continue;
            }

            if (areaNames.contains(firstCellText)) {
                String areaName = firstCellText;

                // We are about to go into a block of values.  First, eat the blank line
                rows.next();

                // Now eat the header line
                Row headerRow = rows.next();
                AccessReportRowParser rowParser = new AccessReportRowParser(headerRow);

                inner:
                while (rows.hasNext()) {
                    Row currentRow = rows.next();
                    Pair<AccessReportRowParser.CardInfo, AccessReportRowParser.AccessInfo> results = rowParser.parseRow(reportid, currentRow, container);
                    AccessReportRowParser.CardInfo cardInfo = results.first;
                    AccessReportRowParser.AccessInfo accessInfo = results.second;

                    String cardNumber = cardInfo.getCardNumber();

                    // Ignore cards with "0" as the cardNumber
                    if (cardNumber.equals("0")) {
                        continue inner;
                    }

                    // If we've hit a blank line, break out
                    if (cardNumber.equals("")) {
                        break inner;
                    }

                    JSONObject cardInfoJSON = new JSONObject();
                    cardInfoJSON.put("report_id", reportid);
                    cardInfoJSON.put("card_id", cardNumber);

                    cardInfoJSON.put("first_name",  cardInfo.getFirstName());
                    cardInfoJSON.put("last_name",   cardInfo.getLastName());
                    cardInfoJSON.put("middle_name", cardInfo.getMiddleName());
                    cardInfoJSON.put("department",  cardInfo.getDepartment());
                    cardInfoJSON.put("employee_number", cardInfo.getEmployeeNumber());

                    cardInfoJSON.put("info2", cardInfo.getInfo2());
                    cardInfoJSON.put("info3", cardInfo.getInfo3());
                    cardInfoJSON.put("info4", cardInfo.getInfo3());
                    cardInfoJSON.put("container", container.getId());

                    cardInfos.put(cardNumber, cardInfoJSON);

                    JSONObject accessInfoJSON = new JSONObject();
                    accessInfoJSON.put("report_id", reportid);
                    accessInfoJSON.put("area",      areaName);
                    accessInfoJSON.put("card_id",   cardNumber);
                    accessInfoJSON.put("container", container.getId());

                    accessInfoJSON.put("schedule_pt", accessInfo.getSchedule());
                    accessInfoJSON.put("last_entered", accessInfo.getLastEntered());
                    accessInfoJSON.put("enabled", accessInfo.isEnabled());

                    accessData.add(accessInfoJSON);
                }

            }
        }

        try (DbScope.Transaction transaction = DbSchema.get(WNPRC_ComplianceSchema.NAME, DbSchemaType.Module).getScope().ensureTransaction()) {
            SimpleQueryUpdater updater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "access_reports");
            JSONObject reportRecord = new JSONObject();
            reportRecord.put("report_id", reportid);
            reportRecord.put("date", generatedOn);
            reportRecord.put("container", container.getId());
            updater.upsert(reportRecord);

            List<Map<String, Object>> cardsList = new ArrayList<>();
            SimpleQueryUpdater cardsUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "cards");
            for (String cardNumber : cardInfos.keySet()) {
                JSONObject json = new JSONObject();
                json.put("card_id", cardNumber);
                json.put("container", container.getId());
                cardsList.add(json);
            }
            cardsUpdater.upsert(cardsList);

            SimpleQueryUpdater dataUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "access_report_data");
            dataUpdater.upsert(accessData);

            List<Map<String, Object>> cardInfoList = new ArrayList<>();
            cardInfoList.addAll(cardInfos.values());
            SimpleQueryUpdater cardInfoUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "card_info");
            cardInfoUpdater.upsert(cardInfoList);

            transaction.commit();
        }
        catch (InvalidKeyException|SQLException|QueryUpdateServiceException|BatchValidationException|DuplicateKeyException e) {
            throw new ApiUsageException("Failed to insert rows", e);
        }
    }
}
