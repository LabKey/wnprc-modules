package org.labkey.googledrive;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.api.util.JsonUtil;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.googledrive.api.DriveWrapper;
import org.labkey.googledrive.api.GoogleDriveService;
import org.labkey.googledrive.api.ServiceAccountForm;
import org.labkey.googledrive.api.exception.NotFoundException;
import org.labkey.googledrive.wrapper.DriveWrapperImpl;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Created by jon on 1/13/17.
 */
public class GoogleDriveServiceImpl extends GoogleDriveService {
    private static final Logger _log = LogManager.getLogger(GoogleDriveService.class);

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    public Drive getRawDrive(String id, User user) throws NotFoundException, GeneralSecurityException {
        try {
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            GoogleCredential credential = getCredential(id, user);
            return new Drive.Builder(httpTransport, JSON_FACTORY, credential).setApplicationName("LabKeyGoogleDrive").build();
        }
        catch (IOException e) {
            // Google's example code always exits on this error.  I imagine this should only fail if there's
            // a problem opening an outgoing websocket, due to permissions.
            _log.error("Unable to create HttpTransport.", e);
            throw new RuntimeException(e);
        }
    }

    private JSONObject getCredentialJSON(String id, User user) throws NotFoundException {
        SimplerFilter filter = new SimplerFilter("id", CompareType.EQUAL, id);
        List<JSONObject> rows = JsonUtil.toJSONObjectList(new SimpleQueryFactory(user, ContainerManager.getHomeContainer()).selectRows("googledrive", "service_accounts", filter));

        if (rows.isEmpty()) {
            throw new NotFoundException();
        }
        else if (rows.size() > 1) {
            // Since Id is our primary key, this shouldn't happen.
            throw new  RuntimeException("More than one row returned for googldrive.service_accounts matching PK of: " + id);
        }
        else {
            return rows.get(0);
        }
    }

    private GoogleCredential getCredential(String id, User user) throws NotFoundException {
        JSONObject json = getCredentialJSON(id, user);
        json.put("type", "service_account");
        String jsonString = json.toString();
        InputStream stream = new ByteArrayInputStream(jsonString.getBytes(StandardCharsets.UTF_8));

        try {
            GoogleCredential credential = GoogleCredential.fromStream(stream);
            return credential.createScoped(Arrays.asList(DriveScopes.DRIVE));
        }
        catch (IOException e) {
            // This shouldn't ever happen, since we're actually reading the stream from a ByteArrayInputStream
            // constructed from a String.
            _log.error("Unknown IO Error when reading JSON Stream: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public DriveWrapper getDrive(String id, User user) throws NotFoundException, GeneralSecurityException {
        return new DriveWrapperImpl(getRawDrive(id, user));
    }

    private SimpleQueryUpdater getQueryUpdater(User user) {
        return new SimpleQueryUpdater(user, ContainerManager.getHomeContainer(), "googledrive", "service_accounts");
    }

    /**
     *
     * @return The id of the newly created service account.
     */
    @Override
    public String registerServiceAccount(String displayName, ServiceAccountForm form, User user) throws  QueryUpdateServiceException, DuplicateKeyException, SQLException, InvalidKeyException, BatchValidationException {
        SimpleQueryUpdater queryUpdater = getQueryUpdater(user);

        String id = UUID.randomUUID().toString();

        ObjectNode row = JsonUtil.DEFAULT_MAPPER.valueToTree(form);

        row.put("id", id);
        row.put("display_name", displayName);

        // Insert the row
        queryUpdater.upsert(new JSONObject(row.toString()));

        return id;
    }

    @Override
    public void updateDisplayNameForAccount(String accountId, String newDisplayname, User user) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, InvalidKeyException, BatchValidationException
    {
        SimpleQueryUpdater queryUpdater = getQueryUpdater(user);

        JSONObject row = new JSONObject();
        row.put("id", accountId);
        row.put("display_name", newDisplayname);

        queryUpdater.upsert(row);
    }

    @Override
    public void deleteAccount(String accountId, User user) throws QueryUpdateServiceException, SQLException, InvalidKeyException, BatchValidationException
    {
        SimpleQueryUpdater queryUpdater = getQueryUpdater(user);

        JSONObject row = new JSONObject();
        row.put("id", accountId);

        queryUpdater.delete(row);
    }

    @Override
    public Map<String, String> getAccounts(User user) {
        Map<String, String> accountDisplayNameLookup = new HashMap<>();

        List<JSONObject> rows = JsonUtil.toJSONObjectList(new SimpleQueryFactory(user, ContainerManager.getHomeContainer()).selectRows("googledrive", "service_accounts"));

        for (JSONObject row : rows) {
            accountDisplayNameLookup.put(row.getString("id"), row.getString("display_name"));
        }

        return accountDisplayNameLookup;
    }
}
