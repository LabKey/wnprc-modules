package org.labkey.dbutils.file;

import java.io.*;
import java.nio.file.Path;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * Created by Jon on 3/21/2017.
 */
public class PrivateFile {
    private UUID id;
    private String filename;
    private String extension;

    public PrivateFile(UUID id) {
        this.id = id;
    }

    public String getBaseFilename() {
        return filename;
    }

    public String getFullFilename() {
        return filename + extension;
    }

    private Path _getPathToFile() {
        return PrivateFileUtil.getPathForId(id);
    }

    public InputStream getContents() throws FileNotFoundException {
        File file = _getPathToFile().toFile();
        return new FileInputStream(file);
    }
}
