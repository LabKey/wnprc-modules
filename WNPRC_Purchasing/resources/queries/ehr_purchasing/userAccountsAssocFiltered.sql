/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
SELECT *
FROM (

--    associate all accounts to the user if accessToAllAccounts flag is set to true
         SELECT a.rowid AS rowid,
                a.displayName AS account,
                u.userId,
                a.isAcceptingCharges
         FROM ehr_billingLinked.aliases a,
              (SELECT ua.userId,
                      ua.account
               FROM ehr_purchasing.userAccountAssociations ua
               WHERE ua.accessToAllAccounts = true
                 AND ua.account IS NULL) u

         UNION

-- get accounts associated with user
         SELECT a.rowid    AS rowid,
                a.displayName AS account,
                ua.userId,
                a.isAcceptingCharges
         FROM ehr_purchasing.userAccountAssociations ua
                  LEFT JOIN ehr_billingLinked.aliases a ON ua.account = a.alias
         WHERE ua.accessToAllAccounts IS NULL OR ua.accessToAllAccounts = false) userAndAccts

WHERE userAndAccts.isAcceptingCharges IS TRUE AND ISMEMBEROF(userAndAccts.userId) --only display accounts associated with the current user
