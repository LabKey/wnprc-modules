package org.labkey.wnprc_compliance;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.NumberToTextConverter;
import org.labkey.api.action.ApiUsageException;
import org.labkey.api.data.Container;
import org.labkey.api.util.Pair;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Created by jon on 2/9/17.
 */
public class AccessReportRowParser {
    enum ColumnName {
        FIRST_NAME      (false, "FirstName"),
        LAST_NAME       (false, "LastName"),
        MIDDLE_NAME     (false, "MiddleName"),
        DEPARTMENT      (false, "department"),
        EMPLOYEE_NUMBER (false, "empNumber"),
        CARD_NUMBER     (true,  "CardNumber"),
        STATE           (false, "state"),
        TIME_ENTERED    (false, "timeEntered", Date.class),
        INFO2           (false, "info2"),
        INFO3           (false, "info3"),
        INFO5           (false, "info5"),
        // This column only appears some times, but it appears to be the access schedule for the employee (what
        // hours they're allowed to use the door).
        SCHEDULE_PT     (false, "scheuld_pt")
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

    public Pair<CardInfo, AccessInfo> parseRow(String reportId, Row row, Container container) {
        Map<ColumnName, Object> values = new HashMap<>();

        for (ColumnName columnName : cellIndexLookup.keySet()) {
            Cell cell = row.getCell(cellIndexLookup.get(columnName));

            if (cell != null) {
                if (columnName.type == Date.class) {
                    Date value;
                    if (cell.getCellType() == CellType.STRING) {
                        value = parseDate(cell.getStringCellValue());
                    }
                    else if (cell.getCellType() == CellType.NUMERIC) {
                        value = cell.getDateCellValue();
                    }
                    else if (cell.getCellType() == CellType.BLANK) {
                        value = null;
                    }
                    else {
                        throw new ApiUsageException("Unrecognized type in date column");
                    }

                    values.put(columnName, value);
                }
                else {
                    //For whatever reason apache ROI library thinks some of these cells are numeric,
                    //Even though excel says they are text
                    String value;
                    if (cell.getCellType() == CellType.NUMERIC) {
                        value = NumberToTextConverter.toText(cell.getNumericCellValue());
                    }
                    else {
                        value = cell.getStringCellValue();
                    }
                    values.put(columnName, value);
                }
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

        public String getDepartment() {
            return (String) this.values.get(ColumnName.DEPARTMENT);
        }

        public String getCardNumber() {
            return (String) this.values.get(ColumnName.CARD_NUMBER);
        }

        public String getEmployeeNumber() {
            return (String) this.values.get(ColumnName.EMPLOYEE_NUMBER);
        }

        public String getInfo2() {
            return (String) this.values.get(ColumnName.INFO2);
        }

        public String getInfo3() {
            return (String) this.values.get(ColumnName.INFO3);
        }

        public String getInfo5() {
            return (String) this.values.get(ColumnName.INFO5);
        }
    }

    public static class AccessInfo {
        private Map<ColumnName, Object> values;

        public AccessInfo(Map<ColumnName, Object> values) {
            this.values = values;
        }

        public String getSchedule() {
            return (String) this.values.get(ColumnName.SCHEDULE_PT);
        }

        public Date getLastEntered() {
            return (Date) this.values.get(ColumnName.TIME_ENTERED);
        }

        public boolean isEnabled() {
            String state = (String) this.values.get(ColumnName.STATE);
            if (state.equalsIgnoreCase("Enabled") || state.equalsIgnoreCase("")) {
                return true;
            }
            else if (state.equalsIgnoreCase("DISABLED")) {
                return false;
            }
            else {
                throw new ApiUsageException("Unrecognized value in 'state' column: " + state);
            }
        }
    }

    public static class MalformedReportException extends Exception {
        public MalformedReportException(String message) {
            super(message);
        }
    }

    public static Date parseDate(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy hh:mm:ss a");
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
