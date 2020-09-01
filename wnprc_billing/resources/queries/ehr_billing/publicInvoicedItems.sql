/*
 * Copyright (c) 2018 LabKey Corporation
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
SELECT i.rowId,
       i.invoiceId,
       i.invoiceId.rowId as invoiceRunId,
       i.date,
       i.Id as animalId,
       i.item,
       i.itemCode,
       i.category,
       i.project,
       i.project.protocol as protocol,
       i.project.investigatorId.investigatorWithName    as projectContact,
       i.debitedaccount,
       i.creditedaccount,
       i.investigatorId,
       i.firstName,
       i.lastName,
       i.department,
       i.mailcode,
       i.contactPhone,
       i.chargeId,
       i.objectid,
       i.quantity,
       i.unitCost,
       i.totalcost

FROM ehr_billing.invoicedItems i
WHERE (
          (
            SELECT max(rowid) AS expr
              FROM ehr_billing.dataAccess da
              WHERE
                 isMemberOf(da.userid)
                 AND
                 (
                    (da.allData = true AND (da.investigatorid = i.project.investigatorId OR da.investigatorid = i.debitedaccount.investigatorId))
                    OR
                    da.project = i.project
                 )
          ) IS NOT NULL

          OR

         --include if the user is either the project's PI, the account PI, or the financial analyst
         isMemberOf(i.project.investigatorId.userid) OR
         isMemberOf(i.debitedaccount.investigatorId) OR
         isMemberOf(i.project.investigatorId.financialAnalyst)
      )