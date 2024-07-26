#!/bin/bash

export SERVER_CERT=${SERVER_CERT}
export SERVER_KEY=${SERVER_KEY}

echo "replacing secrets within main.cf...${SERVER_CERT}"
sed -i 's|@@server.pem@@|'"${SERVER_CERT}"'|' /etc/postfix/main.cf
sed -i 's|@@server.key@@|'"${SERVER_KEY}"'|' /etc/postfix/main.cf 

#copy resolv.conf at startup
cp /etc/resolv.conf /var/spool/postfix/etc/