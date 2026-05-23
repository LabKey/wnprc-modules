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
cards.card_id,
last_name,
first_name,
middle_name,
card_info.card_type,
to_char(card_info.date_issued , 'yyyy-MM-dd') AS date_issued,
to_char(card_info.date_expire, 'yyyy-MM-dd') AS date_expire,
card_info.issue_code

FROM (
  SELECT
  card_id,
  MAX(date) as date

  FROM (
    SELECT
    unknown_cards.card_id,
    card_info.report_id,
    card_info.report_id.date,
    card_info.card_type,
    card_info.date_issued,
    card_info.date_expire,
    card_info.issue_code

    FROM (
      SELECT
      cards.card_id,
      persons_to_cards.personid,

      FROM (
        SELECT card_id
        FROM wnprc_compliance.cards
        WHERE exempt IS FALSE
      ) cards

      LEFT JOIN persons_to_cards
      ON (
        persons_to_cards.cardid = cards.card_id
      )
    ) unknown_cards, card_info
    WHERE (
      personid IS NULL
      AND
      card_info.card_id = unknown_cards.card_id
    )
  )
  GROUP BY (card_id)
) as cards, card_info
WHERE (
  cards.card_id = card_info.card_id
  AND
  cards.date = card_info.report_id.date
)
;