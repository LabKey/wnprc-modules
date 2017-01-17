package org.labkey.googledrive.wrapper;

import com.google.api.services.drive.Drive;
import org.labkey.googledrive.api.DriveWrapper;

import java.util.Collections;
import java.util.List;

/**
 * Created by jon on 1/13/17.
 */
public class DriveWrapperImpl extends FolderWrapperImpl implements DriveWrapper {
    public DriveWrapperImpl(Drive drive) {
        super(drive, "root");
    }

    @Override
    protected List<String> getParentListForCreatedFiles() {
        return Collections.emptyList();
    }
}
