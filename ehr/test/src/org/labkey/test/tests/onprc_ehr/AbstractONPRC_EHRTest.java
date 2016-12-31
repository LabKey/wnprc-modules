/*
 * Copyright (c) 2014-2016 LabKey Corporation
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
package org.labkey.test.tests.onprc_ehr;

/**
Inherit from this class if you do not wish to run the generic tests in AbstractGenericONPRC_EHRTest
 */
public abstract class AbstractONPRC_EHRTest extends AbstractGenericONPRC_EHRTest
{
    @Override
    public void testQuickSearch(){}

    @Override
    public void testWeightValidation(){}

    @Override
    public void testSecurityDataAdmin() throws Exception{}

    @Override
    public void testSecurityRequester() throws Exception{}

    @Override
    public void testSecurityBasicSubmitter() throws Exception{}

    @Override
    public void testSecurityFullSubmitter() throws Exception{}

    @Override
    public void testSecurityFullUpdater() throws Exception{}

    @Override
    public void testSecurityRequestAdmin() throws Exception{}

    @Override
    public void testCustomButtons(){}

    @Override
    public void customActionsTest(){}
}
