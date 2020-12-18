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
CREATE TABLE [wnprc_r24].[SampleInventory](
	[RowId] [bigint] IDENTITY(1,1) NOT NULL,
	[AnimalId] [NVARCHAR](32) NOT NULL,
	[Date] [DATETIME] NOT NULL,
	[SampleId] [NVARCHAR](32) NOT NULL,
	[Aim] [NVARCHAR](128) NULL,
	[SampleType] [NVARCHAR](128) NOT NULL,
	[ObjectId] nvarchar(128) NULL,
	[Created] [DATETIME] NULL,
	[CreatedBy] [dbo].[USERID] NULL,
	[Modified] [DATETIME] NULL,
	[ModifiedBy] [dbo].[USERID] NULL,
	[DiCreated] [DATETIME] NULL,
	[DiModified] [DATETIME] NULL,
	[DiCreatedBy] [dbo].[USERID] NULL,
	[DiModifiedBy] [dbo].[USERID] NULL,
	Container	entityId NOT NULL

 CONSTRAINT [pk_wnprc_r24_sampleinventory] PRIMARY KEY (	[SampleId] ASC)
 CONSTRAINT [fk_wnprc_r24_sampleinventory_container] FOREIGN KEY (Container) REFERENCES core.Containers (EntityId) );

GO

ALTER TABLE [wnprc_r24].[SampleInventory] ADD  DEFAULT (NEWID()) FOR [ObjectId]
GO

CREATE TABLE [wnprc_r24].[lookupSets](
	[RowId] [bigint] IDENTITY(1,1) NOT NULL,
	[SetName] [NVARCHAR](32) NOT NULL,
	[Label] [NVARCHAR](32) NOT NULL,
	[ObjectId] nvarchar(128) NULL,
	[Created] [DATETIME] NULL,
	[CreatedBy] [dbo].[USERID] NULL,
	[Modified] [DATETIME] NULL,
	[ModifiedBy] [dbo].[USERID] NULL,
	[DiCreated] [DATETIME] NULL,
	[DiModified] [DATETIME] NULL,
	[DiCreatedBy] [dbo].[USERID] NULL,
	[DiModifiedBy] [dbo].[USERID] NULL,
	Container	entityId NOT NULL

 CONSTRAINT [pk_wnprc_r24_lookupsets] PRIMARY KEY (	[RowId] ASC)
 CONSTRAINT [fk_wnprc_r24_lookupsets_container] FOREIGN KEY (Container) REFERENCES core.Containers (EntityId) );
GO

CREATE UNIQUE NONCLUSTERED INDEX [idx_wnprc_r24_lookupSets_setname] ON [wnprc_r24].[lookupSets] ( [SetName] ASC )
GO

ALTER TABLE [wnprc_r24].[LookupSets] ADD  DEFAULT (NEWID()) FOR [ObjectId]
GO

CREATE TABLE [wnprc_r24].[lookups](
	[RowId] [bigint] IDENTITY(1,1) NOT NULL,
	[SetName] [NVARCHAR](32) NOT NULL,
	[Value] [NVARCHAR](128) NOT NULL,
	[SortOrder] [INTEGER] NULL,
	[DateDisabled] [datetime] NULL,
	[ObjectId] nvarchar(128) NULL,
	[Created] [DATETIME] NULL,
	[CreatedBy] [dbo].[USERID] NULL,
	[Modified] [DATETIME] NULL,
	[ModifiedBy] [dbo].[USERID] NULL,
	[DiCreated] [DATETIME] NULL,
	[DiModified] [DATETIME] NULL,
	[DiCreatedBy] [dbo].[USERID] NULL,
	[DiModifiedBy] [dbo].[USERID] NULL,
	Container	entityId NOT NULL

 CONSTRAINT [pk_wnprc_r24_lookups] PRIMARY KEY (	[RowId] ASC),
 CONSTRAINT [fk_wnprc_r24_lookups_SetName] FOREIGN KEY (SetName) REFERENCES wnprc_r24.LookupSets (SetName),
 CONSTRAINT [fk_wnprc_r24_lookups_container] FOREIGN KEY (Container) REFERENCES core.Containers (EntityId) );
GO

CREATE UNIQUE NONCLUSTERED INDEX [idx_wnprc_r24_lookups_setname] ON [wnprc_r24].[lookups] ( [SetName] ASC, [VALUE] ASC)
GO

ALTER TABLE [wnprc_r24].[Lookups] ADD  DEFAULT (NEWID()) FOR [ObjectId]
GO