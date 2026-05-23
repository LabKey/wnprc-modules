/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select

n.notificationtype,
n.recipient,
n.recipient.DisplayName as name,
m.Userid,
m.Userid.DisplayName as UserName,
m.Userid.email as email,
from ehr.notificationrecipients n
left join core.members m on (n.recipient = m.GroupId)
where m.userid is not null

union all

select

n.notificationtype,
n.recipient,
n.recipient.DisplayName as name,
u.UserId,
u.DisplayName,
u.email,
from ehr.notificationrecipients n
left join core.users u on (n.recipient = u.userid)
where u.userid is not null
