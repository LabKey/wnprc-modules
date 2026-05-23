/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.googledrive.wrapper;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.Permission;
import org.labkey.googledrive.api.DriveSharePermission;
import org.labkey.googledrive.api.Shareable;

import java.io.IOException;

/**
 * Created by jon on 1/19/17.
 */
public class ItemWrapperImpl implements Shareable {
    protected Drive _drive;
    protected String _id;

    public ItemWrapperImpl(Drive drive, String id) {
        _drive = drive;
        _id = id;
    }

    protected void share(String username, DriveSharePermission sharePermission, String type) throws IOException {
        Permission permission = new Permission();
        permission.setType(type);
        permission.setRole(sharePermission.getValue());
        permission.setEmailAddress(username);

        try {
            _drive.permissions().create(_id, permission).setFields("*").execute();
        }
        catch (IOException e) {
            // An IO Exception here would mean a problem with network connectivity.
            throw new RuntimeException(e);
        }

    }

    @Override
    public void shareWithGroup(String groupName, DriveSharePermission permission) throws IOException {
        this.share(groupName, permission, "group");
    }

    @Override
    public void shareWithUser(String userName, DriveSharePermission permission) throws IOException {
        this.share(userName, permission, "user");
    }
}
