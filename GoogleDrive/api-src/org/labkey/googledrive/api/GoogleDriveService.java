package org.labkey.googledrive.api;

import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.googledrive.api.exception.NotFoundException;

import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.Map;

/**
 * Created by jon on 1/13/17.
 */
public abstract class GoogleDriveService {
    static private GoogleDriveService _service;

    static public GoogleDriveService get() {
        return _service;
    }

    static public void set(GoogleDriveService service) {
        _service = service;
    }

    abstract public DriveWrapper getDrive(String id, User user) throws NotFoundException, GeneralSecurityException;
    abstract public String registerServiceAccount(String displayName, ServiceAccountForm form, User user) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, InvalidKeyException, BatchValidationException;
    abstract public void updateDisplayNameForAccount(String accountId, String newDisplayname, User user) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, InvalidKeyException, BatchValidationException;
    abstract public void deleteAccount(String accountId, User user) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, InvalidKeyException, BatchValidationException;
    abstract public Map<String, String> getAccounts(User user);
}
