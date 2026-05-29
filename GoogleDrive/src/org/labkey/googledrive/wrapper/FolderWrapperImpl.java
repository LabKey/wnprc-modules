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

import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import org.labkey.googledrive.api.DriveSharePermission;
import org.labkey.googledrive.api.FileWrapper;
import org.labkey.googledrive.api.FolderWrapper;
import org.labkey.googledrive.api.exception.NotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;

/**
 * Created by jon on 1/17/17.
 */
public class FolderWrapperImpl extends ItemWrapperImpl implements FolderWrapper {
    public static String FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

    public FolderWrapperImpl(Drive drive, String id) {
        super(drive, id);
    }

    private String _getItemId(String name, boolean onlyFolders) throws NotFoundException, IOException {
        for (File file : this.getFiles()) {
            if (onlyFolders && !file.getMimeType().equals(FOLDER_MIME_TYPE)) {
                continue;
            }

            if (file.getName().equals(name)) {
                return file.getId();
            }
        }

        throw new NotFoundException();
    }

    protected List<File> getFiles() throws IOException {
        String query = String.format("'%s' in parents", this._id);
        FileList list = _drive.files().list().setQ(query).execute();

        List<File> files = list.getFiles();

        return files;
    }

    protected List<String> getParentListForCreatedFiles() {
        return Collections.singletonList(_id);
    }

    @Override
    public FileWrapper getFile(String name) throws NotFoundException, IOException {
        return (FileWrapper) new FileWrapperImpl(_drive, this._getItemId(name, false));
    }

    @Override
    public FolderWrapper getFolder(String name) throws NotFoundException, IOException {
        return (FolderWrapper) new FolderWrapperImpl(_drive, this._getItemId(name, true));
    }

    @Override
    public FolderWrapper createFolder(String name) throws IOException {
        // A folder is just a file with a special mime type.
        File fileMetadata = new File();
        fileMetadata.setName(name).setMimeType(FOLDER_MIME_TYPE);

        File file = _drive.files().create(fileMetadata).setFields("id").execute();

        return new FolderWrapperImpl(_drive, file.getId());
    }

    @Override
    public FileWrapper createFile(String name, String mimeType, InputStream fileContent) throws IOException {
        File fileMetadata = new File();
        fileMetadata.setName(name);

        fileMetadata.setParents(getParentListForCreatedFiles());

        InputStreamContent content = new InputStreamContent(mimeType, fileContent);

        File file = _drive.files().create(fileMetadata, content).setFields("id").execute();
        return (FileWrapper) new FileWrapperImpl(_drive, file.getId());
    }

    @Override
    public void share(String username, DriveSharePermission permission, String type) throws IOException {
        super.share(username, permission, type);

        /*
        for (File file : this.getFiles()) {
            FileWrapperImpl fileWrapper = new FileWrapperImpl(_drive, file.getId());
            fileWrapper.share(username, permission, type);
        }
        */
    }
}
