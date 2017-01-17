package org.labkey.googledrive.api;

import org.labkey.googledrive.api.exception.NotFoundException;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by jon on 1/17/17.
 */
public interface FolderWrapper {
    FileWrapper getFile(String name) throws NotFoundException, IOException;
    FolderWrapper getFolder(String name) throws NotFoundException, IOException;

    FolderWrapper createFolder(String name) throws IOException;
    FileWrapper createFile(String name, String mimeType, InputStream fileContent) throws IOException;
}
