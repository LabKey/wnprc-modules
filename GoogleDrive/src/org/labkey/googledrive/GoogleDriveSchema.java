package org.labkey.googledrive;

import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

public class GoogleDriveSchema extends SimpleUserSchema {
    public static final String NAME = "googledrive";
    public static final String DESCRIPTION = "Configuration options for google drive storage.";

    public GoogleDriveSchema(User user, Container container) {
        super(NAME, DESCRIPTION, user, container, DbSchema.get(NAME));
    }
}
