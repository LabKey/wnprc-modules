package org.labkey.googledrive;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.drive.Drive;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.security.User;
import org.labkey.googledrive.api.DriveWrapper;
import org.labkey.googledrive.api.GoogleDriveService;
import org.labkey.googledrive.api.ServiceAccountForm;
import org.labkey.googledrive.api.exception.NotFoundException;
import org.labkey.googledrive.wrapper.DriveWrapperImpl;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Map;

/**
 * Created by jon on 1/13/17.
 */
public class GoogleDriveServiceImpl extends GoogleDriveService {
    private static Logger _log = Logger.getLogger(GoogleDriveService.class);

    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

    public Drive getRawDrive(String id) throws NotFoundException, GeneralSecurityException {
        try {
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            GoogleCredential credential = getCredential(id);
            return new Drive.Builder(httpTransport, JSON_FACTORY, credential).build();
        }
        catch (IOException e) {
            // Google's example code always exits on this error.  I imagine this should only fail if there's
            // a problem opening an outgoing websocket, due to permissions.
            _log.error("Unable to create HttpTransport.", e);
            throw new RuntimeException(e);
        }
    }

    private JSONObject getCredentialJSON(String id) throws NotFoundException {
        //TODO:
        throw new NotImplementedException();
    }

    private GoogleCredential getCredential(String id) throws NotFoundException {
        String jsonString = getCredentialJSON(id).toString();
        InputStream stream = new ByteArrayInputStream(jsonString.getBytes(StandardCharsets.UTF_8));

        try {
            GoogleCredential credential = GoogleCredential.fromStream(stream);

            return credential;
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
        return new DriveWrapperImpl(getRawDrive(id));
    }

    /**
     *
     * @return The id of the newly created service account.
     */
    public String registerServiceAccount(String displayName, ServiceAccountForm form, User user) {
        throw new NotImplementedException();
    }

    @Override
    public void updateDisplayNameForAccount(String accountId, String newDisplayname) {
        throw new NotImplementedException();
    }

    public void deleteAccount(String accountId) {
        throw new NotImplementedException();
    }

    @Override
    public Map<String, String> getAccounts() {
        throw new NotImplementedException();
    }


}
