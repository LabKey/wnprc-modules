package org.labkey.googledrive.wrapper;

import com.google.api.services.drive.Drive;
import org.labkey.googledrive.api.DriveWrapper;

/**
 * Created by jon on 1/13/17.
 */
public class DriveWrapperImpl implements DriveWrapper {
    private Drive _drive;

    public DriveWrapperImpl(Drive drive) {
        this._drive = drive;
    }
}
