package org.labkey.wnprc_compliance;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.json.JSONObject;
import org.junit.Assert;
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
import org.labkey.api.reader.ExcelLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.util.Pair;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;


import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.text.ParseException;
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

    public void importReport(InputStream stream) throws IOException, AccessReportRowParser.MalformedReportException, ParseException
    {
        String reportid = UUID.randomUUID().toString().toUpperCase();
        Sheet sheet = new ExcelLoader(stream,false, null).getSheet();

        Row titleRow = sheet.getRow(1);
        if (!titleRow.getCell(0).getStringCellValue().equalsIgnoreCase("Access Level Assignments to Cardholders")) {
            throw new ApiUsageException("You can only upload area rights reports here.");
        }

        Row dateRow = sheet.getRow(6);
        //the report created date is the 13th column over
        Matcher matcher = Pattern.compile("Report\\s+Date:\\s*(\\d{2}/\\d{2}/\\d{4}\\s+\\d{1,2}:\\d{2}:\\d{2}[AP]M)").matcher(dateRow.getCell(14).getStringCellValue());
        String reportDateTime;
        Date generatedOn;
        if (matcher.find())
        {
            reportDateTime = matcher.group(1).trim();
            generatedOn = AccessReportRowParser.parseDate(reportDateTime);
        }
        else
        {
            throw new ApiUsageException("Unable to parse date/time string");
        }

        // Check to make sure we haven't done this already.
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimpleFilter filter = new SimplerFilter("date", CompareType.DATE_EQUAL, generatedOn);
        List<JSONObject> existingRows = JsonUtil.toJSONObjectList(queryFactory.selectRows(WNPRC_ComplianceSchema.NAME, "access_reports", filter));
        if (!existingRows.isEmpty()) {
            throw new ApiUsageException("This report has already been uploaded.");
        }

        Map<String, JSONObject> cardInfos = new HashMap<>();
        List<Map<String, Object>> accessData = new ArrayList<>();


        //if the cell contains Prim and Barrier
        Pattern accessLevelPattern = Pattern.compile("Access Level:\\s*");

        Iterator<Row> rows = sheet.rowIterator();
        AccessReportRowParser rowParser = null;
        String accessLevel = "";
        outer:
        while (rows.hasNext()) {
            Row currentRow = rows.next();
            //don't parse items until we reach the main block
            if (currentRow.getRowNum() < 8)
            {
                continue;
            }
            if (currentRow.getCell(4) == null)
            {
                continue;
            }
            String firstCellText = currentRow.getCell(0).getStringCellValue();

            Matcher accessLevelMatcher = accessLevelPattern.matcher(firstCellText);
            //we've encountered an access level block of text
            //we can grab the header and skip a row
            if (accessLevelMatcher.matches())
            {
                accessLevel = currentRow.getCell(4).getStringCellValue();

                // We are about to go into a block of values.  First, eat the blank line
                rows.next();

                // Now eat the header line
                Row headerRow = rows.next();
                //sets up the column names from the header row?

                //
                rowParser = new AccessReportRowParser(headerRow);

                currentRow = rows.next();
            }
            if (rowParser == null)
            {
                continue;
            }
            Pair<AccessReportRowParser.CardInfo, AccessReportRowParser.AccessInfo> results = rowParser.parseRow(reportid, currentRow, container);
            AccessReportRowParser.CardInfo cardInfo = results.first;
            AccessReportRowParser.AccessInfo accessInfo = results.second;

            if (cardInfo.getValues().isEmpty())
                continue;


            //end of spreadsheet pattern
            Pattern endOfSheetPattern = Pattern.compile("Total Badges Required for Download:");
            if (endOfSheetPattern.matcher(cardInfo.getFirstName()).matches())
            {
                int getNumCards = (int) currentRow.getCell(10).getNumericCellValue();
                if (cardInfos.size() != getNumCards)
                {
                    throw new RuntimeException("Card number does not equal total badge count in sheet, upload failed.");
                }
                break;
            }


            String cardNumber = cardInfo.getCardNumber();
            if (cardNumber == null || cardNumber.equals(""))
            {
                continue;
            }


            JSONObject cardInfoJSON = new JSONObject();
            cardInfoJSON.put("report_id", reportid);
            cardInfoJSON.put("card_id", cardNumber);

            cardInfoJSON.put("first_name",  cardInfo.getFirstName());
            cardInfoJSON.put("last_name",   cardInfo.getLastName());
            cardInfoJSON.put("middle_name", cardInfo.getMiddleName());
            cardInfoJSON.put("date_issued", cardInfo.getCardIssued());
            cardInfoJSON.put("date_expire", cardInfo.getCardExpire());
            cardInfoJSON.put("issue_code", cardInfo.getIssueCode());
            cardInfoJSON.put("card_type", cardInfo.getCardType());
            cardInfoJSON.put("container", container.getId());

            cardInfos.put(cardNumber, cardInfoJSON);

            JSONObject accessInfoJSON = new JSONObject();
            accessInfoJSON.put("report_id", reportid);
            accessInfoJSON.put("access_level", accessLevel);
            accessInfoJSON.put("card_id",   cardNumber);
            accessInfoJSON.put("container", container.getId());

            accessData.add(accessInfoJSON.toMap());
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
                cardsList.add(json.toMap());
            }
            cardsUpdater.upsert(cardsList);

            SimpleQueryUpdater dataUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "access_report_data");
            dataUpdater.upsert(accessData);

            List<Map<String, Object>> cardInfoList = new ArrayList<>(cardInfos.values().stream().map(JSONObject::toMap).toList());
            SimpleQueryUpdater cardInfoUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "card_info");
            cardInfoUpdater.upsert(cardInfoList);

            transaction.commit();
        }
        catch (InvalidKeyException|SQLException|QueryUpdateServiceException|BatchValidationException|DuplicateKeyException e) {
            throw new ApiUsageException("Failed to insert rows", e);
        }
    }
}
