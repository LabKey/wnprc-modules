package org.labkey.dbutils.file;

import org.apache.commons.lang3.ArrayUtils;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.dbutils.dbutilsModule;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Created by Jon on 3/21/2017.
 */
public class PrivateFileUtil {
    public static Path getPathForId(UUID id) {
        dbutilsModule module = (dbutilsModule) ModuleLoader.getInstance().getModule(dbutilsModule.class);

        // Technically, this can return null if the container doesn't exist, but it should always work here because
        // dbutilsModule creates the container if it doesn't exist yet.
        PipeRoot root = PipelineService.get().getPipelineRootSetting(module.getPrivateContainer());

        return Paths.get(root.getRootPath().getAbsolutePath(), ArrayUtils.addAll(_splitIdIntoDirs(id), _getFilenameOnServer(id)));
    }

    private static String[] _splitIdIntoDirs(UUID id) {
        String uuid = _stripUUIDandCapitalize(id);

        return new String[] {
                uuid.substring(0,4),
                uuid.substring(4,8),
                uuid.substring(8,12),
                uuid.substring(12,16),
                uuid.substring(16,20),
                uuid.substring(20,24),
                uuid.substring(24,28)
        };
    }

    private static String _getFilenameOnServer(UUID id) {
        return _stripUUIDandCapitalize(id).substring(28, 32);
    }

    private static String _stripUUIDandCapitalize(UUID id) {
        return id.toString().toUpperCase().replaceAll("-", "");
    }
}
