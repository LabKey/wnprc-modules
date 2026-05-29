#!/bin/bash
export LK_MASTER_ENCRYPTION_FILE=$(cat ${LK_MASTER_ENCRYPTION_FILE})
#
# Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#


ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime 
echo ${TZ} > /etc/timezone 
envsubst < /root/netrc.template > /root/.netrc 
chmod 600 /root/.netrc 
#cp -f /labkey/modules/*.module /labkey/modules/ 

echo "replacing secrets within application.properties..."
echo "value of PG_USER ${PG_USER}"
sed -i "s/@@encryptionKey@@/${LK_MASTER_ENCRYPTION_FILE}/" /labkey/labkey/config/application.properties
sed -i "s/@@jdbcUser@@/${PG_USER}/" /labkey/labkey/config/application.properties
sed -i "s/@@jdbcPassword@@/${PG_PASS}/" /labkey/labkey/config/application.properties
sed -i "s/@@jdbcURL@@/${PG_NAME}/" /labkey/labkey/config/application.properties

echo "replacing ARROW credentials"
sed -i "s/@@arrowJdbcUrl@@/${LK_ARROW_URL}/" /labkey/labkey/config/application.properties
sed -i "s/@@arrowJdbcUsername@@/${LK_ARROW_USER}/" /labkey/labkey/config/application.properties
sed -i "s/@@arrowJdbcPassword@@/${LK_ARROW_PASS}/" /labkey/labkey/config/application.properties


echo "replacing MySQL credentials"
sed -i "s/@@msqlJdbcUrl@@/${LK_MSQL_URL}/" /labkey/labkey/config/application.properties
sed -i "s/@@msqlJdbcUsername@@/${LK_MSQL_USER}/" /labkey/labkey/config/application.properties
sed -i "s/@@msqlJdbcPassword@@/${LK_MSQL_PASS}/" /labkey/labkey/config/application.properties

echo "replacing SMTP configuration"
sed -i "s/@@smtpHost@@/${LK_MAILSERVER}/" /labkey/labkey/config/application.properties
sed -i "s/@@smtpPort@@/${LK_MAIL_PORT}/" /labkey/labkey/config/application.properties
sed -i "s/@@smtpFrom@@/${LK_SERVER_EMAIL_ADDRESS}/" /labkey/labkey/config/application.properties
sed -i "s/@@smtpAuth@@/${LK_MAIL_AUTHENTICATION}/" /labkey/labkey/config/application.properties

#java -XX:MaxRAMPercentage=75.0 -Dlabkey.home=${LABKEY_HOME} -Dlabkey.log.home=/labkey/logs -Dlogback.debug=true -jar /labkey/labkey/labkeyServer.jar

exec "$@"