/*
 * Copyright (c) 2010-2016 LabKey Corporation
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
package org.labkey.ehr;

import org.labkey.api.data.ContainerManager;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.PropertyType;
import org.labkey.api.exp.property.SystemProperty;

/**
 * User: kevink
 * Date: Jan 12, 2010 5:57:14 PM
 */
public class EHRProperties
{
    static private String URI = "urn:ehr.labkey.org/#";

    public static SystemProperty REMARK = new SystemProperty(URI + "Remark", PropertyType.MULTI_LINE)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("remark");
            pd.setInputType("textarea");
            return pd;
        }
    };

    public static SystemProperty PARENTID = new SystemProperty(URI + "ParentId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            //pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setName("parentid");
            pd.setLabel("Parent Id");
            pd.setScale(400);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty TASKID = new SystemProperty(URI + "TaskId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            //pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setName("taskid");
            pd.setLabel("Task Id");
            pd.setScale(100);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty CASEID = new SystemProperty(URI + "CaseId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            //pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setName("caseid");
            pd.setLabel("Case Id");
            pd.setScale(100);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty PROBLEMID = new SystemProperty(URI + "ProblemId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            //pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setName("problemid");
            pd.setLabel("Problem Id");
            pd.setScale(100);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty RUNID = new SystemProperty(URI + "RunId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            //pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setName("runid");
            pd.setLabel("Run Id");
            pd.setScale(100);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty FORMSORT = new SystemProperty(URI + "FormSort", PropertyType.INTEGER)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setName("formSort");
            pd.setLabel("Form Sort Order");
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty REQUESTID = new SystemProperty(URI + "RequestId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            //pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setName("requestid");
            pd.setLabel("Request Id");
            pd.setScale(100);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty USERID = new SystemProperty(URI + "UserId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setName("userid");
            pd.setScale(64);
//            pd.setHidden(true);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty DESCRIPTION = new SystemProperty(URI + "Description", PropertyType.MULTI_LINE)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setLabel("Description");
            pd.setInputType("textarea");
            pd.setName("description");
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty ACCOUNT = new SystemProperty(URI + "Account", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("account");
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty PROJECT = new SystemProperty(URI + "Project", PropertyType.INTEGER)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("project");
            pd.setFormat("00000000");
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty OBJECTID = new SystemProperty(URI + "ObjectId", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("objectid");
            pd.setLabel("Key");
            pd.setHidden(true);
            //pd.setShownInInsertView(false);
            pd.setShownInDetailsView(false);
            pd.setShownInUpdateView(false);
            pd.setScale(100);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty PERFORMEDBY = new SystemProperty(URI + "PerformedBy", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("performedby");
            pd.setLabel("Performed By");
            pd.setScale(64);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty ENDDATE = new SystemProperty(URI + "EndDate", PropertyType.DATE_TIME)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("enddate");
            pd.setLabel("End Date");
            pd.setShownInInsertView(true);
            pd.setShownInUpdateView(true);
            pd.setShownInDetailsView(true);
            pd.setHidden(true);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty DATEREQUESTED = new SystemProperty(URI + "DateRequested", PropertyType.DATE_TIME)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("daterequested");
            pd.setLabel("Date Requested");
            pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty VETREVIEW = new SystemProperty(URI + "VetReview", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("vetreview");
            pd.setLabel("Vet Reviewer");
            pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty VETREVIEWDATE = new SystemProperty(URI + "VetReviewDate", PropertyType.DATE_TIME)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("vetreviewdate");
            pd.setLabel("Vet Review Date");
            pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    public static SystemProperty DATEFINALIZED = new SystemProperty(URI + "DateFinalized", PropertyType.DATE_TIME)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("datefinalized");
            pd.setLabel("Date Finalized");
            pd.setShownInInsertView(false);
            pd.setShownInUpdateView(false);
            pd.setShownInDetailsView(false);
            pd.setHidden(true);
            pd.setContainer(ContainerManager.getSharedContainer());
            return pd;
        }
    };

    static public void register()
    {
        // do nothing
    }


}
