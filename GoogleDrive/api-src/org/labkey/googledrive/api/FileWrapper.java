package org.labkey.googledrive.api;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by jon on 1/17/17.
 */
public interface FileWrapper {
    void updateContent(InputStream stream) throws IOException;
}
