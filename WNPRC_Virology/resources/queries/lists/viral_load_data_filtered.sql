/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
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
SELECT vl.Id,
       vl.date,
       vl.key,
       vl.assay,
       vl.sample_type,
       vl.viral_load_average,
       vl.below_llod,
       vl.viral_load_replicates,
       vl.source_type,
       vl.comment,
       vl.experiment_number,
       vl.nucleic_acid_isolation_method,
       vl.account,
       mp.account as mpaccount,
       mp.folder_name
FROM study.viral_loads vl
LEFT JOIN (
       SELECT  wnprc_virology.folders_accounts_mappings.account,
               wnprc_virology.folders_accounts_mappings.folder_name
       FROM wnprc_virology.folders_accounts_mappings) mp
ON mp.account = vl.account
--ON ';' || LOWER(mp.accounts) || ';' LIKE '%;' || LOWER(vl.account.alias) || ';%'
--might be able to use a %like% here with semicolons around each account
--ON vl.account in any(unnest(string_to_array(mp.accounts, ';')))