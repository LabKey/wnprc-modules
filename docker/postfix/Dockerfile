FROM ubuntu:22.04

# Set noninteractive mode for apt-get
ENV DEBIAN_FRONTEND noninteractive

# The gettext package contains the envsubst command needed for the run command of this image.
RUN apt-get update                      \
 && apt-get -qq install -y postfix      \
                           postfix-pcre \
                           gettext      \
 && apt-get clean

# Copy in supervisord configuration and a shell script to run postfix
COPY postfix.sh       /opt/postfix.sh
RUN chmod u+x /opt/postfix.sh

# Tell postfix to listen on port 1025
RUN echo "1025       inet  n       -       -       -       -       smtpd" >> /etc/postfix/master.cf
RUN echo "tlsmgr    unix  -       -       n       1000?   1       tlsmgr" >> /etc/postfix/master.cf 
RUN echo "postlog   unix-dgram n  -       n       -       1       postlogd" >> /etc/postfix/master.cf
EXPOSE 1025

# Add in some default configuration files.  The transport configuration tells postfix how to route emails based on
# intended recipients  By default, it routes everything to "mailcatcher" on port 1025.  The relays file tells postfix
# which domains to accept and forward.  The default configuration accepts all domains.
COPY header_checks  /etc/postfix/header_checks
COPY transport      /etc/postfix/transport.template
COPY relays         /etc/postfix/relays

COPY replacingSecrets.sh /etc/replacingSecrets.sh
RUN chmod +x /etc/replacingSecrets.sh

RUN postconf -d | grep mail_version 

# Configure postfix to use the config files we just copied in.  Also, disable TLS, tell postfix to send anything that
# didn't get rejected by the filters, and always bcc "mail_spy@example.com".  This is a safe domain that will never
# route anywhere effectively.  This is done so that production containers can override the transport configuration but
# still route example.com to a mailcatcher instance.  This allows administrators to always have a view on what e-mails
# are getting sent out
RUN postconf    transport_maps=hash:/etc/postfix/transport                \
                smtpd_relay_restrictions=reject_unauth_destination        \
                relay_domains=pcre:/etc/postfix/relays                    \
                always_bcc=mail_spy@example.com                           \
                smtp_header_checks=regexp:/etc/postfix/header_checks      \
                smtpd_tls_cert_file=@@server.pem@@                        \
                smtpd_tls_key_file=@@server.key@@                         \
                # recommanded for log details                             
                smtpd_tls_loglevel=1                                      \
                maillog_file=/dev/stdout                         \
                # recommanded for tracing TLS headers
                smtpd_tls_received_header=yes                             \
                smtpd_tls_exclude_ciphers=NULL,aNULL,RC4,3DES,eNULL,DHE_EXPORT        \
                smtpd_tls_mandatory_ciphers=medium                                      \
                smtpd_tls_ciphers=medium                                                \
                smtpd_tls_protocols='>=TLSv1,<=0305'                                          \
                smtpd_tls_mandatory_protocols='>=TLSv1'                                \
                # TLS, DNSSEC and DANE for SMTP client outbound email
                smtp_tls_session_cache_database=btree:/var/lib/postfix/smtp_scache    \
                smtp_tls_security_level=dane                                          \
                smtp_dns_support_level=dnssec                                   

CMD envsubst < /etc/postfix/transport.template > /etc/postfix/transport && postmap hash:/etc/postfix/transport && postmap /etc/postfix/header_checks && /etc/replacingSecrets.sh && /opt/postfix.sh
