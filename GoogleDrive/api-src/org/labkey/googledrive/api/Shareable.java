package org.labkey.googledrive.api;

import java.io.IOException;

/**
 * Created by jon on 1/19/17.
 */
public interface Shareable {
    void shareWithGroup(String groupName, DriveSharePermission permission) throws IOException;
    void shareWithUser(String userName, DriveSharePermission permission) throws IOException;
}
