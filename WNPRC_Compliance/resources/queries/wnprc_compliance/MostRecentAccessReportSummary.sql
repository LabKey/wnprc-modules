/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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
    ar.date as report_date,
    card_info.card_id,
    cards.exempt,
    cards.exempt_reason,
    personsList.lastTbClearance,
    personsList.measles_required,
    personsList.isArchived,
    card_info.first_name,
    card_info.last_name,
    card_info.middle_name,
    persons_to_cards.personid
FROM wnprc_compliance.access_reports ar
         INNER JOIN wnprc_compliance.card_info card_info
                    ON ar.report_id = card_info.report_id
         LEFT JOIN wnprc_compliance.cards cards
                   ON cards.card_id = card_info.card_id
         LEFT JOIN wnprc_compliance.persons_to_cards persons_to_cards
                   ON persons_to_cards.cardid = card_info.card_id
         LEFT JOIN wnprc_compliance.personsList personsList
                   ON personsList.personid = persons_to_cards.personid
WHERE ar.date = (SELECT MAX(date) FROM wnprc_compliance.access_reports)
