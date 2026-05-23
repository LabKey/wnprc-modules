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
import org.labkey.googledrive.api.FileWrapper;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by jon on 1/17/17.
 */
public class FileWrapperImpl extends ItemWrapperImpl implements FileWrapper {
    private File _file;

    public FileWrapperImpl(Drive drive, String id) throws IOException {
        super(drive, id);

        _file = _drive.files().get(id).execute();
    }

    @Override
    public void updateContent(InputStream stream) throws IOException {
        InputStreamContent content = new InputStreamContent(_file.getMimeType(), stream);
        this._file = _drive.files().update(_id, null, content).execute();
    }
}
