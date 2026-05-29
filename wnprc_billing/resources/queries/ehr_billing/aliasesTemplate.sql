/*
 * Copyright (c) 2025-2026 Board of Regents of the University of Wisconsin System
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
    al.alias AS grantWorkDay,
    al.category AS category,
    al.isAcceptingCharges AS isAcceptingCharges,
    al.gencredits AS genCredits,
    al.projectNumber AS Grant,
    al.grantNumber AS grantNumber,
    al.tier_rate AS tierRate,
    al.type AS type,
    al.budgetStartDate AS budgetStartDate,
    al.budgetEndDate AS budgetEndDate,
    al.investigatorName AS investigatorName,
    al.investigatorId AS investigatorId,
    al.fiscalAuthority AS fiscalAuthority,
    al.affiliate AS affiliate,
    al.contact_name AS contact_name,
    al.contact_phone AS contact_phone,
    al.contact_email AS contact_email,
    --al.institution AS institution,
    al.address AS address,
    al.city AS city,
    al.state AS state,
    al.zip AS zip,
    al.billing_contact_info AS billing_contact_info,
    al.comments AS comments,
    al.po_number AS po_number,
    al.po_amount AS po_amount,
    al.charge_grant_accounts_id AS charge_grant_accounts_id,
    al.uw_fund AS fund,
    al.uw_account AS ledgerAccount,
    al.uw_udds AS costCenter,
    al.uw_class_code AS uw_class_code,
    al.grant_period_end AS grant_period_end,
    al.order_cutoff AS order_cutoff,
    al.successor_account AS successor_account,
    al.predecessor_account AS predecessor_account,
    al.mds_number AS mds_number,
    al.faRate AS faRate,
    al.faSchedule AS faSchedule
FROM ehr_billing.aliases al