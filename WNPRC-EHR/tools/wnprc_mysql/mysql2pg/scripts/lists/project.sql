/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT cast(pno as SIGNED) as project, lower(protocol) as protocol, account, inves, avail, title, research, reqname, ts, uuid AS objectid FROM project p

