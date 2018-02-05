package org.labkey.wnprc_compliance;

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.wnprc_compliance.form.NewUserForm;
import org.labkey.wnprc_compliance.form.RequirementForm;

import java.sql.SQLException;
import java.util.UUID;

/**
 * Created by Jon on 2/13/2017.
 */
public class PersonService {
    protected User user;
    protected Container container;

    public PersonService(User user, Container container) {
        this.user = user;
        this.container = container;
    }

    public String newUser(NewUserForm form) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, InvalidKeyException, BatchValidationException {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "persons");
        String personId = UUID.randomUUID().toString().toUpperCase();

        JSONObject newPerson = new JSONObject();
        newPerson.put("personid", personId);
        newPerson.put("first_name", form.firstName);
        newPerson.put("middle_name", form.middleName);
        newPerson.put("last_name", form.lastName);
        newPerson.put("date_of_birth", form.dateOfBirth);
        newPerson.put("notes", form.description);
        newPerson.put("container", container.getId());

        queryUpdater.upsert(newPerson);

        for (Integer cardId : form.cardNumbers) {
            SimpleQueryUpdater mapUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "persons_to_cards");

            JSONObject map = new JSONObject();
            map.put("personid", personId);
            map.put("cardid", cardId);
            map.put("container", container.getId());
            mapUpdater.upsert(map);
        }

        for (Integer userId : form.userIds) {
            SimpleQueryUpdater mapUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, "persons_to_users");

            JSONObject map = new JSONObject();
            map.put("personid",  personId);
            map.put("userid",    userId);
            map.put("container", container.getId());
            mapUpdater.upsert(map);
        }


        return personId;
    }

    public String addClearance(String personId, String tableName, String lookupTableName, RequirementForm form) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, InvalidKeyException, BatchValidationException {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, tableName);
        SimpleQueryUpdater lookupQueryUpdater = new SimpleQueryUpdater(user, container, WNPRC_ComplianceSchema.NAME, lookupTableName);

        String requirementId = UUID.randomUUID().toString().toUpperCase();

        JSONObject requirementInfo = new JSONObject();
        requirementInfo.put("id",   requirementId);
        requirementInfo.put("date", form.dateCompleted);
        requirementInfo.put("comment",   form.notes);
        requirementInfo.put("container", container.getId());
        queryUpdater.upsert(requirementInfo);

        JSONObject lookupInfo = new JSONObject();
        lookupInfo.put("person_id",    personId);
        lookupInfo.put("clearance_id", requirementId);
        lookupInfo.put("container",    container.getId());
        lookupQueryUpdater.upsert(lookupInfo);

        return requirementId;
    }
}
