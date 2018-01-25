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
