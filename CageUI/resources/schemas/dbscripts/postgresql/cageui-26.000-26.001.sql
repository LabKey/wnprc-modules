/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_svg_urls' as setname,
       'SVG Urls Field Values' as label,
       'List of URLS for room items' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'cage' as value, '/cageui/static/cage.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'pen' as value, '/cageui/static/pen.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'tempCage' as value, '/cageui/static/cage.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'playCage' as value, '/cageui/static/pen.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'roomDivider' as value, '/cageui/static/roomDivider.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'drain' as value, '/cageui/static/drain.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'door' as value, '/cageui/static/door.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'gateClosed' as value, '/cageui/static/gateClosed.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'gateOpen' as value, '/cageui/static/gateOpen.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'top' as value, '/cageui/static/top.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'bottom' as value, '/cageui/static/bottom.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';
