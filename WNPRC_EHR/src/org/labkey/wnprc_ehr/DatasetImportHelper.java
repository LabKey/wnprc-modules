package org.labkey.wnprc_ehr;

import org.apache.log4j.Logger;
import org.apache.xmlbeans.XmlException;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.admin.ImportException;
import org.labkey.api.admin.StaticLoggerGetter;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.writer.FileSystemFile;
import org.labkey.study.importer.DatasetDefinitionImporter;
import org.labkey.study.importer.DatasetImportUtils;
import org.labkey.study.importer.StudyImportContext;
import org.labkey.study.model.StudyManager;
import org.labkey.study.writer.StudyArchiveDataTypes;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Collections;

/**
 * Helper class to initiate the dataset metadata import
 */
public final class DatasetImportHelper
{
    /**
     * Logger for logging the logs
     */
    private static final Logger LOG = Logger.getLogger(DatasetImportHelper.class);

    /**
     * Executes the dataset metadata import utilizing LabKey's predefined dataset definition importer.
     *
     * @param user         User executing the import
     * @param container    Container into which to import the dataset. Expected to have an active study
     * @param studyXmlFile XML file defining the study, including the manifest and the metadata
     */
    public static void importDatasetMetadata(@NotNull User user, @NotNull Container container, @NotNull File studyXmlFile)
            throws IOException, SQLException, DatasetImportUtils.DatasetLockExistsException, XmlException, ImportException
    {
        assert container.hasActiveModuleByName("study") : "Study module is not active in the container.";
        assert StudyManager.getInstance().getStudy(container) != null : "No study found in the container.";
        assert studyXmlFile.exists() : "Study reference data XML file does not exist: " + studyXmlFile.getAbsolutePath();

        LOG.debug(String.format("[import] loading dataset metadata... [from='%s',to='%s']",
                studyXmlFile.getAbsolutePath(), container.getName()));
        FileSystemFile root = new FileSystemFile(studyXmlFile.getParentFile());
        StudyImportContext ctx = new StudyImportContext(user, container, studyXmlFile,
                Collections.singleton(StudyArchiveDataTypes.DATASET_DEFINITIONS), new StaticLoggerGetter(LOG), root);
        DatasetDefinitionImporter ddi = new DatasetDefinitionImporter();
        ddi.process(ctx, root, new NullSafeBindException(container, "import"));
        LOG.debug("[import] ...done.");
    }

    /**
     * Safe wrapper for the main import method which eats and logs any exceptions.
     *
     * @param user         User executing the import
     * @param container    Container into which to import the dataset. Expected to have an active study
     * @param studyXmlFile XML file defining the study, including the manifest and the metadata
     */
    public static void safeImportDatasetMetadata(@NotNull User user, @NotNull Container container, @NotNull File studyXmlFile)
    {
        try
        {
            importDatasetMetadata(user, container, studyXmlFile);
        }
        catch (IOException | SQLException | DatasetImportUtils.DatasetLockExistsException | XmlException | ImportException e)
        {
            LOG.error(String.format("[import] error importing dataset metadata into container, functionality may be lost: %s",
                    container.getName()), e);
        }
    }
}
