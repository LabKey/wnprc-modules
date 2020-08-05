package org.labkey.wnprc_ehr.bc;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.googledrive.api.DriveWrapper;
import org.labkey.googledrive.api.GoogleDriveService;
import org.labkey.googledrive.api.exception.NotFoundException;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.io.IOException;
import java.security.GeneralSecurityException;

/**
 * Created by jon on 1/19/17.
 */
public class BCReportManager {
    private static Logger _log = LogManager.getLogger(BCReportManager.class);

    Container studyContainer;
    User user;

    public BCReportManager(User user, Container studyContainer) {
        this.studyContainer = studyContainer;
        this.user = user;
    }

    public void uploadReports() {
        WNPRC_EHRModule wnprc = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
        String id = wnprc.getGoogleDriveAccountId(studyContainer);

        try {
            DriveWrapper drive = GoogleDriveService.get().getDrive(id, user);


            try {
                TreatmentsBCReport treatmentsReport = new TreatmentsBCReport(studyContainer);
                treatmentsReport.uploadToDrive(drive);

                HousingBCReport housingBCReport = new HousingBCReport(studyContainer);
                housingBCReport.uploadToDrive(drive);
            }
            catch (IOException e) {
                _log.error("Hit IO Error while generating BC reports.", e);
            }
        }
        catch (GeneralSecurityException e) {
            _log.error("Error authenticating with Drive.  Please ensure the drive account information is correct.");
        }
        catch (NotFoundException e) {
            _log.warn(String.format("%s is not the valid ID for a drive account.  Reports will not be uploaded.", WNPRC_EHRModule.BC_GOOGLE_DRIVE_PROPERTY_NAME));
        }
    }
}
