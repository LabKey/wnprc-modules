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
