package org.labkey.wnprc_compliance;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.NumberToTextConverter;
import org.labkey.api.action.ApiUsageException;
import org.labkey.api.data.Container;
import org.labkey.api.util.Pair;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by jon on 2/9/17.
 */
public class AccessReportRowParser {
    enum ColumnName {
        FIRST_NAME      (false, "Name (Last, First, Middle)"),
        LAST_NAME       (false, "Name (Last, First, Middle)"),
        MIDDLE_NAME     (false, "Name (Last, First, Middle)"),
        CARD_NUMBER     (true,  "Badge ID(Issue)"),
        CARD_ISSUED     (false,  "Badge Active"),
        CARD_EXPIRE     (false,  "Badge Deactive"),
        BADGE_TYPE (false,  "Badge Type"),
        CARD_ISSUE_CODE (false,  "Badge Id(Issue)"),
        ;

        boolean required;
        String headerText;
        Class type = String.class;

        ColumnName(boolean required, String headerText, Class type) {
            this(required, headerText);
            this.type = type;
        }

        ColumnName(boolean required, String headerText) {
            this.headerText = headerText;
            this.required = required;
        }

        static Set<ColumnName> getRequiredColumns() {
            Set<ColumnName> requiredColumns = new HashSet<>();

            for (ColumnName columnName : ColumnName.values()) {
                if (columnName.required) {
                    requiredColumns.add(columnName);
                }
            }

            return requiredColumns;
        }
    }

    private Map<ColumnName, Integer> cellIndexLookup = new HashMap();

    public AccessReportRowParser(Row headerRow) throws MalformedReportException {

        Iterator<Cell> cellIterator = headerRow.cellIterator();

        while(cellIterator.hasNext()) {
            Cell curCell = cellIterator.next();

            columnLoop:
            for (ColumnName columnName : ColumnName.values()) {
                if (columnName.headerText.equalsIgnoreCase(curCell.getStringCellValue())) {
                    cellIndexLookup.put(columnName, curCell.getColumnIndex());
                    break columnLoop;
                }
            }
        }

        for (ColumnName columnName : ColumnName.getRequiredColumns()) {
            if (!this.cellIndexLookup.containsKey(columnName)) {
                throw new MalformedReportException(String.format("Report is missing the '%s' column, which is required.", columnName.headerText));
            }
        }
    }

    public Pair<CardInfo, AccessInfo> parseRow(String reportId, Row row, Container container) throws ParseException
    {
        Map<ColumnName, Object> values = new HashMap<>();


        //TODO maybe just grab the names directly instead of this loop
        for (ColumnName columnName : cellIndexLookup.keySet()) {
            Cell cell = row.getCell(cellIndexLookup.get(columnName));
            if (cell != null ) {
                if (columnName.headerText.equals(ColumnName.FIRST_NAME.headerText))
                {
                    if (cell.getCellType() == CellType.STRING && !cell.getStringCellValue().isEmpty())
                    {
                        Matcher matcher = Pattern.compile("^(.*?),\\s+(\\w+)(?:\\s+(\\w+))?$").matcher(cell.getStringCellValue());

                        if (matcher.find())
                        {
                            values.put(ColumnName.FIRST_NAME, matcher.group(2));
                            values.put(ColumnName.LAST_NAME, matcher.group(1));
                            values.put(ColumnName.MIDDLE_NAME, matcher.group(3));
                        }
                    }

                }

                if (columnName.headerText.equals(ColumnName.CARD_ISSUED.headerText))
                {
                    if (!cell.toString().isEmpty())
                    {
                        DateFormat df = new SimpleDateFormat("dd-MMM-yyyy");
                        Date d = df.parse(cell.toString());
                        values.put(ColumnName.CARD_ISSUED, d);

                    }
                }
                if (columnName.headerText.equals(ColumnName.CARD_EXPIRE.headerText))
                {
                    if (!cell.toString().isEmpty())
                    {
                        DateFormat df = new SimpleDateFormat("dd-MMM-yyyy");
                        Date d = df.parse(cell.toString());
                        values.put(ColumnName.CARD_EXPIRE, d);
                    }
                }

                if (columnName.headerText.equals(ColumnName.CARD_NUMBER.headerText))
                {

                    if (cell.getCellType() == CellType.STRING && !cell.getStringCellValue().isEmpty())
                    {
                        Matcher matcher = Pattern.compile("(\\d+)\\s*\\((\\d+)\\)").matcher(cell.getStringCellValue());
                        if (matcher.find())
                        {
                            values.put(ColumnName.CARD_NUMBER, matcher.group(1));
                            values.put(ColumnName.CARD_ISSUE_CODE, matcher.group(2));
                        }
                    }
                }

                String value = "";
                if (cell.getCellType() == CellType.STRING) {
                    value = cell.getStringCellValue();
                }
                if (!values.containsKey(columnName))
                    values.put(columnName, value);
            }
        }

       Pair<CardInfo, AccessInfo> pair = new Pair<>(new CardInfo(values), new AccessInfo(values));
        return pair;
    }

    public static class CardInfo {
        private Map<ColumnName, Object> values;

        public CardInfo(Map<ColumnName, Object> values) {
            this.values = values;
        }

        public String getFirstName() {
            return (String) this.values.get(ColumnName.FIRST_NAME);
        }

        public String getMiddleName() {
            return (String) this.values.get(ColumnName.MIDDLE_NAME);
        }

        public String getLastName() {
            return (String) this.values.get(ColumnName.LAST_NAME);
        }

        public String getCardNumber() {
            return (String) this.values.get(ColumnName.CARD_NUMBER);
        }
        public Date getCardIssued() {
            return (Date) this.values.get(ColumnName.CARD_ISSUED);
        }
        public Date getCardExpire() {
            return (Date) this.values.get(ColumnName.CARD_EXPIRE);
        }
        public String getIssueCode() {
            return (String) this.values.get(ColumnName.CARD_ISSUE_CODE);
        }
        public String getCardType() {
            return (String) this.values.get(ColumnName.BADGE_TYPE);
        }

        public Map<ColumnName, Object> getValues() {
            return this.values;
        }

    }

    public static class AccessInfo {
        private Map<ColumnName, Object> values;

        public AccessInfo(Map<ColumnName, Object> values) {
            this.values = values;
        }

    }

    public static class MalformedReportException extends Exception {
        public MalformedReportException(String message) {
            super(message);
        }
    }

    public static Date parseDate(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy hh:mm:ssa");
        SimpleDateFormat shortDateFormat = new SimpleDateFormat("MM/dd/yyyy");

        Date date;

        try {
            date = dateFormat.parse(dateString);
        }
        catch (ParseException e) {
            try {
                date = shortDateFormat.parse(dateString);
            }
            catch(ParseException e2) {
                throw new ApiUsageException("Unrecognized Date format: " + dateString);
            }
        }

        return date;
    }
}
