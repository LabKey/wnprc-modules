/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
ALTER TABLE wnprc_r24.SampleInventory ADD SampleWeight NUMERIC(7,2) NULL;
ALTER TABLE wnprc_r24.SampleInventory ADD SampleAmount NUMERIC(7,2) NULL;

CREATE TABLE [wnprc_r24].[RowsToDelete](
[ObjectId] [dbo].[EntityId] NOT NULL,
[Modified] [DATETIME] NOT NULL
CONSTRAINT [pk_wnprc_r24_RowsToDelete] PRIMARY KEY (	[ObjectId] ASC) );

GO

CREATE TABLE [wnprc_r24].[WeightStaging] (
[AnimalId] [NVARCHAR](32) NOT NULL,
[Date] [DATETIME] NOT NULL,
[Weight] [NUMERIC](7,4) NOT NULL,
[ObjectId] [dbo].EntityId NOT NULL,
[Created] [DATETIME] NULL,
[CreatedBy] [dbo].[USERID] NULL,
[Modified] [DATETIME] NULL,
[ModifiedBy] [dbo].[USERID] NULL

CONSTRAINT [pk_wnprc_r24_weight_staging] PRIMARY KEY (	[ObjectId] ASC) );

GO