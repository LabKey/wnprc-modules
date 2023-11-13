#!/bin/bash
export LK_MASTER_ENCRYPTION_FILE=$(cat ${LK_MASTER_ENCRYPTION_FILE})

echo "replacing secrets within ROOT.xml..."
sed -i "s/@@encryptionKey@@/${LK_MASTER_ENCRYPTION_FILE}/" /usr/local/tomcat/conf/Catalina/localhost/ROOT.xml