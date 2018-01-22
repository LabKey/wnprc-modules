/*
 * Copyright (c) 2017 LabKey Corporation
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
SELECT
  x.Id,
  x.adate,
  x.edate,
  x.totalAccountsPerAnimal,
  split_part(x.accountProject, ',', 1) account,
  split_part(x.accountProject, ',', 2) project,
  x.totalDaysPerAccount,
  x.comment
  FROM (
SELECT
  pd.Id,
  pd.adate,
  pd.edate,
  unnest(string_to_array(pd.accountsProjects, ';')) AS accountProject,
  pd.totalAccounts AS totalAccountsPerAnimal,
  pd.totalDaysPerAccount,
  'Location(s): ' || group_concat(pd.location, ', ') AS comment
  FROM
  (
    SELECT
      pds.Id,
      pds.adate,
      pds.edate,
      group_concat((pds.account || ',' || pds.project), '; ') AS accountsProjects,
      count(pds.account)                                                            AS totalAccounts,
      (TIMESTAMPDIFF('SQL_TSI_DAY', pds.adate, pds.edate) + 1) / count(pds.account) AS totalDaysPerAccount,
      pds.location
    FROM wnprc_billing.perDiems pds
    GROUP BY
      pds.Id,
      pds.adate,
      pds.edate,
      pds.location
  ) pd
  GROUP BY
    pd.Id,
    pd.adate,
    pd.edate,
    pd.accountsProjects,
    pd.totalAccounts,
    pd.totalDaysPerAccount) x