/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_ehr.bc;

import org.labkey.api.data.Container;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.security.User;
import org.labkey.googledrive.api.DriveWrapper;
import org.labkey.googledrive.api.FileWrapper;
import org.labkey.googledrive.api.FolderWrapper;
import org.labkey.googledrive.api.exception.NotFoundException;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by jon on 1/5/17.
 */
public abstract class BusinessContinuityReport {
    public static String BusinessContinuityFolderName = "BusinessContinuity";
    protected Container container;
    protected User user;

    public BusinessContinuityReport(Container container) {
        this.container = container;
        this.user = EHRService.get().getEHRUser(container);
    }

    abstract public String getFileName();
    abstract public InputStream generateContent();
    abstract public String getMimeType();

    public void uploadToDrive(DriveWrapper drive) throws IOException {
        FolderWrapper businessContinuityFolder;

        try {
            businessContinuityFolder = drive.getFolder(BusinessContinuityFolderName);
        }
        catch (NotFoundException e) {
            businessContinuityFolder = drive.createFolder(BusinessContinuityFolderName);
        }

        FileWrapper reportFile;
        try {
            reportFile = businessContinuityFolder.getFile(getFileName());
            reportFile.updateContent(generateContent());
        }
        catch (NotFoundException e) {
            reportFile = businessContinuityFolder.createFile(getFileName(), getMimeType(), generateContent());
        }
    }
}
