/*
 * Copyright (c) 2015 LabKey Corporation
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

package org.labkey.gringottstest;

import org.labkey.api.action.ApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringottstest.model.PersonVault;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.time.Month;

public class GringottsTestController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(GringottsTestController.class);
    public static final String NAME = "gringottstest";

    public GringottsTestController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction {
        public ModelAndView getView(Object o, BindException errors) throws Exception {
            return new JspView("/org/labkey/gringottstest/view/hello.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    public static class NullForm {}

    @RequiresNoPermission
    public class TestAction extends ApiAction<NullForm> {
        @Override
        public Object execute(NullForm nullForm, BindException errors) throws Exception {
            String firstName = "Edward";
            String middleName = "Percival";
            String lastName  = "Nygma";
            Integer age = 3;
            LocalDateTime birthdate = LocalDateTime.of(1985, Month.APRIL, 1, 0, 0, 0);

            PersonVault vault = new PersonVault(getContainer(), getUser());

            PersonVault.Person jon = vault.new Person();

            jon.firstName = firstName;
            jon.middleName = middleName;
            jon.lastName = lastName;
            jon.birthdate = birthdate;
            jon.age = age;

            jon.save();

            String jonsId = jon.getId(vault.getTypeToken());

            PersonVault.Person jon2 = vault.new Person(jonsId);

            assert jon2.age.equals(age);
            assert jon2.birthdate.isEqual(birthdate);
            assert jon2.firstName.equals(firstName);
            assert jon2.lastName.equals(lastName);
            assert jon2.middleName.equals(middleName);

            // Sometimes the guy can take the girl's name...
            jon2.lastName = "Kringle";

            jon2.save();

            PersonVault.Person jon3 = vault.new Person(jonsId);

            assert jon3.lastName.equals("Kringle");

            return jon3.toJSON();
        }
    }
}