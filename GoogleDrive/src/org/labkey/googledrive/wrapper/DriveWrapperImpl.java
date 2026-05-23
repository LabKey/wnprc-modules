/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
