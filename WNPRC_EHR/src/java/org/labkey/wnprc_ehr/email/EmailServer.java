package org.labkey.wnprc_ehr.email;

import org.jetbrains.annotations.Nullable;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.mail.BodyPart;
import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Store;
import javax.mail.search.SearchTerm;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Created by jon on 5/26/16.
 */
public class EmailServer {
    // This is the Primary Key for the server record to use.
    private String serverkey;

    // Password to connect
    private String username;
    private String password;
    private EmailServerConfig config;

    protected class Inbox implements AutoCloseable {
        private final Store store;
        private final Folder folder;

        protected Inbox() throws MessagingException {
            this.store = config.getConnectedStore(username, password);
            this.folder = store.getFolder("Inbox");

            // To make this generic (although not the most secure), always open in RW
            this.folder.open(Folder.READ_WRITE);
        }

        @Override
        public void close() throws MessagingException {
            boolean expungeAllDeletedMessages = true;
            this.folder.close(expungeAllDeletedMessages);
            this.store.close();
        }

        public List<Message> getMessages() throws MessagingException {
            return Arrays.asList(this.folder.getMessages());
        }

        public List<Message> search(SearchTerm searchTerm) throws MessagingException {
            return Arrays.asList(this.folder.search(searchTerm));
        }
    }

    public EmailServer(EmailServerConfig config, String username, String password) {
        this.config = config;
        this.username = username;
        this.password = password;
    }

    public JSONObject getInboxMessage(MessageIdentifier messageIdentifier) throws MessagingException, SearchException {
        return getInboxMessage(messageIdentifier, new MessageHandler());
    }

    public JSONObject getInboxMessage(MessageIdentifier messageIdentifier, MessageHandler messageHandler) throws MessagingException, SearchException {
        JSONArray messages = getInboxMessages(messageIdentifier.getSearchTerm(), messageHandler).getJSONArray("messages");

        if (messages.length() == 0) {
            throw new SearchException("No messages matched the query.");
        }

        if (messages.length() > 1) {
            throw new SearchException("More than one message matched the query.");
        }

        return messages.getJSONObject(0);
    }

    public JSONObject getInboxMessages() throws MessagingException {
        return getInboxMessages(null, null);
    }

    public JSONObject getInboxMessages(SearchTerm searchTerm, @Nullable MessageHandler messageHandler) throws MessagingException {
        if (messageHandler == null) {
            messageHandler = new MessageHandler();
        }

        try (Inbox inbox = new Inbox()) {
            List<Message> messages;
            if (searchTerm != null) {
                messages = inbox.search(searchTerm);
            }
            else {
                messages = inbox.getMessages();
            }

            // Create a json object to contain the results.
            JSONObject json = new JSONObject();

            JSONArray messageList = new JSONArray();
            for(Message message : messages) {
                // Convert the message to a JSON object.
                JSONObject messageJSON = EmailMessageUtils.convertMessageToJSON(message, messageHandler);

                // Add this message to the message list.
                messageList.put(messageJSON);
            }
            json.put("messages", messageList);

            return json;
        }
    }

    public void deleteMessage(MessageIdentifier messageIdentifier) throws MessagingException {
        try (Inbox inbox = new Inbox()) {
            for(Message message : inbox.search(messageIdentifier.getSearchTerm())) {
                // Mark the message for deletion.  The message will get deleted when the inbox is closed.
                message.setFlag(Flags.Flag.DELETED, true);
            }
        }
    }

    public JSONArray getExcelDataFromMessage(MessageIdentifier messageIdentifier) throws MessagingException, SearchException {
        JSONObject message = getInboxMessage(messageIdentifier, new ExcelMessageHandler());
        JSONArray attachments = message.getJSONArray("attachments");

        // If there are no attachments, just return an empty list.
        if (attachments.length() == 0) {
            return new JSONArray();
        }

        return attachments.getJSONObject(0).getJSONArray("rows");
    }

    public JSONArray getExcelPreviewData(MessageIdentifier messageIdentifier) throws MessagingException, SearchException {
        JSONObject message = getInboxMessage(messageIdentifier, new ExcelPreviewMessageHandler());
        JSONArray attachments = message.getJSONArray("attachments");

        // If there are no attachments, just return an empty list.
        if (attachments.length() == 0) {
            return new JSONArray();
        }

        return attachments.getJSONObject(0).getJSONArray("rows");
    }

    public class SearchException extends Exception {
        public SearchException(String message) {
            super(message);
        }
    }

    public class ExcelMessageHandler extends MessageHandler {
        @Override
        public JSONObject handleAttachment(String filename, InputStream inputStream, BodyPart attachment) {
            JSONObject attachmentJSON = super.handleAttachment(filename, inputStream, attachment);

            try {
                if (Pattern.compile("\\.xlsx$").matcher(filename).find()) {
                    Workbook workbook = WorkbookFactory.create(inputStream);
                    Sheet sheet = workbook.getSheetAt(0);

                    Map<Integer, String> columnNameLookup = new HashMap<>();

                    Row row;
                    Cell cell;
                    // Iterate through each rows from first sheet
                    Iterator<Row> rowIterator = sheet.iterator();

                    JSONArray rows = new JSONArray();
                    while (rowIterator.hasNext()) {
                        JSONObject rowJSON = new JSONObject();
                        row = rowIterator.next();

                        // For each row, iterate through each columns
                        Iterator<Cell> cellIterator = row.cellIterator();
                        while (cellIterator.hasNext()) {
                            cell = cellIterator.next();

                            if (row.getRowNum() == 0) {
                                columnNameLookup.put(cell.getColumnIndex(), cell.getStringCellValue());
                            }
                            else {
                                if (Cell.CELL_TYPE_STRING == cell.getCellType()) {
                                    if (columnNameLookup.containsKey(cell.getColumnIndex())) {
                                        rowJSON.put(columnNameLookup.get(cell.getColumnIndex()), cell.getStringCellValue());
                                    }
                                }
                                else if (Cell.CELL_TYPE_NUMERIC == cell.getCellType()) {
                                    if (columnNameLookup.containsKey(cell.getColumnIndex())) {
                                        String columnName = columnNameLookup.get(cell.getColumnIndex());

                                        if (Pattern.compile("date", Pattern.CASE_INSENSITIVE).matcher(columnName).find()) {
                                            Date date = cell.getDateCellValue();
                                            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
                                            rowJSON.put(columnName, format.format(date));
                                        }
                                        else {
                                            rowJSON.put(columnName, cell.getNumericCellValue());
                                        }
                                    }
                                }
                            }
                        }

                        if (row.getRowNum() != 0) {
                            rows.put(rowJSON);
                        }
                    }

                    attachmentJSON.put("rows", rows);
                }
            }
            catch (IOException |InvalidFormatException e) {
                attachmentJSON.put("error", e.getMessage());
            }

            return attachmentJSON;
        }
    }

    public class ExcelPreviewMessageHandler extends MessageHandler {
        @Override
        public JSONObject handleAttachment(String filename, InputStream inputStream, BodyPart attachment) {
            JSONObject attachmentJSON = super.handleAttachment(filename, inputStream, attachment);

            try {
                if (Pattern.compile("\\.xlsx$").matcher(filename).find()) {
                    Workbook workbook = WorkbookFactory.create(inputStream);
                    Sheet sheet = workbook.getSheetAt(0);

                    Map<Integer, String> columnNameLookup = new HashMap<>();

                    Row row = null;
                    Cell cell;
                    // Iterate through each rows from first sheet
                    Iterator<Row> rowIterator = sheet.iterator();

                    JSONArray rows = new JSONArray();
                    while (rowIterator.hasNext() && (row == null || row.getRowNum() < 5)) {
                        JSONArray rowJSON = new JSONArray();
                        row = rowIterator.next();

                        // For each row, iterate through each columns
                        Iterator<Cell> cellIterator = row.cellIterator();
                        while (cellIterator.hasNext()) {
                            cell = cellIterator.next();

                            String value = "";

                            if (row.getRowNum() == 0) {
                                columnNameLookup.put(cell.getColumnIndex(), cell.getStringCellValue());
                            }

                            if (Cell.CELL_TYPE_STRING == cell.getCellType()) {
                                value = cell.getStringCellValue();
                            }
                            else if (Cell.CELL_TYPE_NUMERIC == cell.getCellType()) {
                                if (columnNameLookup.containsKey(cell.getColumnIndex())
                                        && Pattern.compile("date", Pattern.CASE_INSENSITIVE).matcher(columnNameLookup.get(cell.getColumnIndex())).find()) {

                                    Date date = cell.getDateCellValue();
                                    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
                                    value = format.format(date);
                                }
                                else {
                                    value = Double.toString(cell.getNumericCellValue());
                                }
                            }

                            rowJSON.put(cell.getColumnIndex(), value);
                        }

                        rows.put(rowJSON);
                    }

                    attachmentJSON.put("rows", rows);
                }
            }
            catch (IOException |InvalidFormatException e) {
                attachmentJSON.put("error", e.getMessage());
            }

            return attachmentJSON;
        }
    }
}
