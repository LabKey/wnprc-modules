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
package org.labkey.googledrive.api;

import org.labkey.googledrive.api.exception.NotFoundException;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by jon on 1/17/17.
 */
public interface FolderWrapper extends Shareable {
    FileWrapper getFile(String name) throws NotFoundException, IOException;
    FolderWrapper getFolder(String name) throws NotFoundException, IOException;

    FolderWrapper createFolder(String name) throws IOException;
    FileWrapper createFile(String name, String mimeType, InputStream fileContent) throws IOException;
}
