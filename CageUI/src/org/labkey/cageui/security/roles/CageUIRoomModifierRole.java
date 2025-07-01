/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.cageui.CageUIModule;
import org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;
import org.labkey.cageui.security.permissions.CageUINotesEditorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomModifierPermission;

public class CageUIRoomModifierRole extends AbstractRole
{
    public CageUIRoomModifierRole(){
        this("Cage UI Room Modifier Role",
                "Room modifier role for Cage UI",
                CageUIRoomModifierPermission.class,
                CageUIAnimalEditorPermission.class,
                CageUIModificationEditorPermission.class,
                CageUILayoutEditorAccessPermission.class,
                CageUINotesEditorPermission.class
        );
    }

    protected CageUIRoomModifierRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, CageUIModule.class, perms);
    }

}
