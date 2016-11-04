package org.labkey.gringotts.api.model;

/**
 * Created by jon on 10/19/16.
 */
public interface Vault<RecordType extends Record> {
    String getId();
    String getName();

    RecordType newRecord();
    RecordType getRecord(String id);

    void saveRecord(RecordType record);
    void deleteRecord(RecordType record);
}
