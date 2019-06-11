package org.labkey.wnprc_ehr;

import org.apache.xmlbeans.XmlException;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.admin.ImportException;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.Study;
import org.labkey.api.study.TimepointType;
import org.labkey.api.test.TestWhen;
import org.labkey.api.util.GUID;
import org.labkey.api.util.JunitUtil;
import org.labkey.api.util.TestContext;
import org.labkey.study.importer.DatasetImportUtils;
import org.labkey.study.model.StudyImpl;
import org.labkey.study.model.StudyManager;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.List;

@TestWhen(TestWhen.When.DRT)
public class DatasetImportHelperIntegrationTest extends Assert
{
    private static final String TEST_CONTAINER_NAME = GUID.makeHash();

    private Container _container;
    private User _user;

    @Before
    public void createContainer()
    {
        _container = ContainerManager.ensureContainer(JunitUtil.getTestContainer(), TEST_CONTAINER_NAME);
        _user = TestContext.get().getUser();
    }

    @After
    public void deleteContainer()
    {
        if (_container != null)
            ContainerManager.delete(_container, _user);
    }

    @Test
    public void testImportDatasetMetadata()
            throws XmlException, SQLException, ImportException, DatasetImportUtils.DatasetLockExistsException, IOException
    {
        // ARRANGE: create the study in the breeding test container
        ContainerManager.setFolderType(_container, FolderTypeManager.get().getFolderType("Study"), _user,
                new NullSafeBindException(_container, "test-import"));
        StudyImpl s = new StudyImpl(_container, "Breeding Test Study");
        s.setTimepointType(TimepointType.DATE); // must be set to avoid NullPointerException
        s.setSubjectColumnName("SubjectID");    // must be set due to non-null constraint
        s.setSubjectNounPlural("Subjects");     // must be set due to non-null constraint
        s.setSubjectNounSingular("Subject");    // must be set due to non-null constraint
        Study study = StudyManager.getInstance().createStudy(_user, s);

        // ACT: load the dataset metadata from the reference study in the resources
        File file = new File(Paths.get(ModuleLoader.getInstance().getModule("WNPRC_EHR")
                .getExplodedPath().getAbsolutePath(), "referenceStudy", "study").toFile(), "study.xml");
        DatasetImportHelper.importDatasetMetadata(_user, _container, file);

        // ASSERT: make sure that the datasets we are expecting got created
        List<? extends Dataset> datasets = study.getDatasets();
        Assert.assertArrayEquals(new String[]{"breeding_encounters", "pregnancies", "pregnancy_outcomes", "ultrasounds"},
                datasets.stream().map(Dataset::getName).sorted().toArray());
    }
}