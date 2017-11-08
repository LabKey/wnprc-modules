package org.labkey.dbutils.file;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;

import java.io.File;
import java.io.FileFilter;
import java.lang.management.ManagementFactory;
import java.util.*;

/**
 * Created by jon on 5/25/17.
 */
public class FileToucher extends Thread {
    private static Logger _log = Logger.getLogger(FileToucher.class);
    private static final String SOURCE_DIR = "/LabKey/sources/";

    @Override
    public void run() {
        Date javaStartDate = new Date(ManagementFactory.getRuntimeMXBean().getStartTime());
        TimeBasedFileFilter fileFilter = new TimeBasedFileFilter(javaStartDate);

        while(getRoots().size() > 0) {
            Date runStartTime = new Date();

            // Find all modified files.
            _log.debug("Start search");
            List<File> modifiedFiles = new ArrayList<>();
            for (File root : getRoots()) {
                modifiedFiles.addAll(getModifiedFiles(root, fileFilter));
            }
            _log.debug("Finished search");

            // "Touch" all the files so they look like they were last modified right before this script ran.  That way,
            // they won't be included the next time this loop runs, unless they are subsequently modified.
            for(File file : modifiedFiles) {
                _log.info("Touching " + file.getAbsolutePath());
                file.setLastModified(runStartTime.getTime() - 1);
            }

            fileFilter.updateDate(runStartTime);

            try {
                int sleepTime = 3000;
                _log.debug("Sleeping for " + sleepTime + " ms.");
                sleep(sleepTime);
            } catch (InterruptedException e) {
                _log.debug("FileToucher was interrupted");
            }
        }
    }

    private List<File> _roots = null;
    public List<File> getRoots() {
        if (_roots == null) {
            _roots = new ArrayList<>();

            File sourceRoot = new File(SOURCE_DIR);
            if (sourceRoot.exists()) {
                File explodedRootDir = getExplodedModuleDir(sourceRoot);
                if (explodedRootDir != null) {
                    _log.info("Using root: " + explodedRootDir.getAbsolutePath());
                    _roots.add(explodedRootDir);
                }

                File subModuleRoot = new File(SOURCE_DIR + "/lkpm/modules");
                if (subModuleRoot.exists() && subModuleRoot.isDirectory()) {
                    for (File file : subModuleRoot.listFiles()) {
                        File explodedModuleDir = getExplodedModuleDir(file);
                        if (explodedModuleDir != null) {
                            _log.info("Using root: " + explodedModuleDir.getAbsolutePath());
                            _roots.add(explodedModuleDir);
                        }
                    }
                }
            }
        }

        return _roots;
    }

    @Nullable
    private static File getExplodedModuleDir(File file) {
        if (file.exists()) {
            File explodedDir = new File(file.getAbsolutePath() + "/build/explodedModule");

            if (explodedDir.exists() && explodedDir.isDirectory()) {
                return explodedDir;
            }
        }

        return null;
    }

    private List<File> getModifiedFiles(File dir, FileFilter fileFilter) {
        List<File> modifiedFiles = new ArrayList<>();

        for(File file : dir.listFiles(fileFilter)) {
            if (file.isDirectory()) {
                modifiedFiles.addAll(getModifiedFiles(file, fileFilter));
            }
            else {
                modifiedFiles.add(file);
            }
        }

        return modifiedFiles;
    }

    public class TimeBasedFileFilter implements FileFilter {
        private Date dateToCompareAgainst;

        public TimeBasedFileFilter(Date date) {
            this.dateToCompareAgainst = date;
        }

        public void updateDate(Date date) {
            this.dateToCompareAgainst = date;
        }

        @Override
        public boolean accept(File file) {
            // Always return true so we can recurse
            if (file.isDirectory()) {
                return true;
            }

            // Check if the file has been modified recently
            Date lastModifed = new Date(file.lastModified());
            return lastModifed.after(dateToCompareAgainst);
        }
    }
}
