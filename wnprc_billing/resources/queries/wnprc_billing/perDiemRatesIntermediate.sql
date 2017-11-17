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
  pd.Id,
  pd.adate,
  pd.edate,
--   pd.project,
  pd.totalAccounts,
  pd.totalDaysPerAccount,
  pds2.account
  FROM
  (
    SELECT
      pds.Id,
      pds.adate,
      pds.edate,
--       pds.project,
      count(pds.account)                                                            AS totalAccounts,
      (TIMESTAMPDIFF('SQL_TSI_DAY', pds.adate, pds.edate) + 1) / count(pds.account) AS totalDaysPerAccount
    FROM wnprc_billing.perDiems pds
    GROUP BY
      pds.Id,
      pds.adate,
      pds.edate
--       pds.project
  ) pd
  LEFT JOIN wnprc_billing.perDiems pds2 ON pds2.Id = pd.Id AND pds2.adate = pd.adate AND pds2.edate = pd.edate