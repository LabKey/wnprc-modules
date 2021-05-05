package org.labkey.dbutils.jooq;

import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DefaultRecordListener;
import org.json.JSONObject;
import org.labkey.api.audit.AbstractAuditTypeProvider;
import org.labkey.api.audit.AuditLogService;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.query.audit.QueryUpdateAuditProvider;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;


/**
 * Created by jon on 3/29/17.
 */
public class RecordListener extends DefaultRecordListener {
    private Map<Record, Record> mapToOriginalRecordValues = new HashMap<>();
    private Container container;
    private User user;

    public enum ValueType {
        TIMESTAMP,
        USER,
        CONTAINER
    }

    public enum DefaultField {
        MODIFIED    ("modified",   ValueType.TIMESTAMP),
        MODIFIED_BY ("modifiedby", ValueType.USER),
        CREATED     ("created",    ValueType.TIMESTAMP),
        CREATED_BY  ("createdby",  ValueType.USER),
        CONTAINER   ("container",  ValueType.CONTAINER)
        ;

        String columnName;
        ValueType valueType;

        DefaultField(String columnName, ValueType valueType) {
            this.columnName = columnName;
            this.valueType = valueType;
        }

        public String getColumnName() {
            return this.columnName;
        }

        public ValueType getValueType() {
            return this.valueType;
        }
    }

    public enum OpType {
        INSERT ("jOOQ INSERT"),
        UPDATE ("jOOQ UPDATE"),
        DELETE ("jOOQ DELETE")
        ;

        String message;

        OpType(String message) {
            this.message = message;
        }

        public String getMessage() {
            return this.message;
        }
    }

    public RecordListener(Container container, User user) {
        this.container = container;
        this.user = user;
    }

    @Override
    public void insertStart(RecordContext context) {
        DefaultField[] insertFields = {DefaultField.CREATED_BY, DefaultField.CREATED, DefaultField.MODIFIED, DefaultField.MODIFIED_BY, DefaultField.CONTAINER};
        this.setDefaultFields(context, insertFields);
        _cacheOriginalRecord(context);
    }

    @Override
    public void insertEnd(RecordContext context) {
        this.insertAuditMessage(OpType.INSERT, context);
    }

    @Override
    public void updateStart(RecordContext context) {
        DefaultField[] updateFields = {DefaultField.MODIFIED, DefaultField.MODIFIED_BY, DefaultField.CONTAINER};
        this.setDefaultFields(context, updateFields);
        _cacheOriginalRecord(context);
    }

    @Override
    public void updateEnd(RecordContext context) {
        this.insertAuditMessage(OpType.UPDATE, context);
    }


    @Override
    public void deleteStart(RecordContext context) {
        _cacheOriginalRecord(context);
    }

    @Override
    public void deleteEnd(RecordContext context) {
        this.insertAuditMessage(OpType.DELETE, context);
    }

    public void _cacheOriginalRecord(RecordContext context) {
        if (context.type().equals(ExecuteType.BATCH)) {
            for (Record record : context.batchRecords()) {
                mapToOriginalRecordValues.put(record, record.original());
            }
        }
        else if (context.type().equals(ExecuteType.WRITE)) {
            Record record = context.record();
            mapToOriginalRecordValues.put(record, record.original());
        }

    }

    private void insertAuditMessage(OpType opType, RecordContext context) {
        if (context.type().equals(ExecuteType.BATCH)) {
            for (Record record : context.batchRecords()) {
                insertAuditMessageForRecord(opType, record);
            }
        }
        else if (context.type().equals(ExecuteType.WRITE)) {
            insertAuditMessageForRecord(opType, context.record());
        }
    }

    private void insertAuditMessageForRecord(OpType opType, Record record) {
        QueryUpdateAuditProvider.QueryUpdateAuditEvent event = new QueryUpdateAuditProvider.QueryUpdateAuditEvent(container.getId(), opType.getMessage());

        if (record instanceof TableRecord) {
            String schemaName = ((TableRecord) record).getTable().getSchema().getName();
            String queryName  = ((TableRecord) record).getTable().getName();

            event.setSchemaName(schemaName);
            event.setQueryName(queryName);
        }

        // Set Primary Key.  Since there could be multiple primary key columns, we'll use
        // JSON to represent it.
        event.setRowPk(RecordUtils.getJSONForPKs(record).toString());

        // Set new record values
        JSONObject newRecordValues = RecordUtils.getJSON(record);
        event.setNewRecordMap(AbstractAuditTypeProvider.encodeForDataMap(container, newRecordValues));

        if (!opType.equals(OpType.INSERT) && mapToOriginalRecordValues.containsKey(record)) {
            Record oldRecord = mapToOriginalRecordValues.get(record);
            JSONObject oldRecordValues = RecordUtils.getJSON(oldRecord);
            event.setOldRecordMap(AbstractAuditTypeProvider.encodeForDataMap(container, oldRecordValues));
            mapToOriginalRecordValues.remove(record);
        }

        AuditLogService.get().addEvent(user, event);
    }

    private void setDefaultFields(RecordContext context, DefaultField... fields) {
        if (context.type().equals(ExecuteType.BATCH)) {
            for (Record record : context.batchRecords()) {
                setDefaultFieldsOnRecord(record, fields);
            }
        }
        else if (context.type().equals(ExecuteType.WRITE)) {
            setDefaultFieldsOnRecord(context.record(), fields);
        }
    }

    private void setDefaultFieldsOnRecord(Record record, DefaultField... fields) {
        for (DefaultField defaultField : fields) {
            Field field = record.field(defaultField.getColumnName());
            if (field != null) {
                record.setValue(field, getValueForValueType(defaultField.valueType));
            }
        }
    }

    private Object getValueForValueType(ValueType valueType) {
        if (valueType.equals(ValueType.TIMESTAMP)) {
            return new Date();
        }
        else if (valueType.equals(ValueType.USER)) {
            return this.user.getUserId();
        }
        else if (valueType.equals(ValueType.CONTAINER)) {
            return this.container.getId();
        }
        else {
            return null;
        }
    }
}
