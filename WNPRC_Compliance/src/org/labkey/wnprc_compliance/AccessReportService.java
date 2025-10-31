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

    public void importReport(InputStream stream, String filename) throws IOException, AccessReportRowParser.MalformedReportException, ParseException
    {
        String reportid = UUID.randomUUID().toString().toUpperCase();
        Sheet sheet = new ExcelLoader(stream,false, null).getSheet();

        // Ensure all necessary columns are present in an uploaded report
        Row columnHeaderRow = sheet.getRow(0);
        if(!columnHeaderRow.getCell(3).getStringCellValue().equalsIgnoreCase("Last Name")
            || !columnHeaderRow.getCell(5).getStringCellValue().equalsIgnoreCase("First Name")
            || !columnHeaderRow.getCell(7).getStringCellValue().equalsIgnoreCase("Middle Name")
            || !columnHeaderRow.getCell(23).getStringCellValue().equalsIgnoreCase("Badge Type")
            || !columnHeaderRow.getCell(25).getStringCellValue().equalsIgnoreCase("Badge ID")
            || !columnHeaderRow.getCell(30).getStringCellValue().equalsIgnoreCase("Badge Activate")
            || !columnHeaderRow.getCell(32).getStringCellValue().equalsIgnoreCase("Badge Deactivate")){
            throw new ApiUsageException("You can only upload area rights reports here.");
        }

        //the report created is in the file name
        Matcher matcher = Pattern.compile("(\\d{1,2}\\.\\d{1,2}\\.\\d{2})").matcher(filename);
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
        Iterator<Row> rows = sheet.rowIterator();
        AccessReportRowParser rowParser = new AccessReportRowParser(columnHeaderRow);
        while (rows.hasNext()) {
            Row currentRow = rows.next();
            // Skip header row
            if(currentRow.getRowNum() == 0){
                continue;
            }

            AccessReportRowParser.CardInfo cardInfo = rowParser.parseRow(currentRow);

            if (cardInfo.getValues().isEmpty())
                continue;

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
            cardInfoJSON.put("card_type", cardInfo.getCardType());
            cardInfoJSON.put("container", container.getId());

            cardInfos.put(cardNumber, cardInfoJSON);
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
