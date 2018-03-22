FROM ubuntu:14.04

# Set noninteractive mode for apt-get
ENV DEBIAN_FRONTEND noninteractive

# The gettext package contains the envsubst command needed for the run command of this image.
RUN apt-get update                      \
 && apt-get -qq install -y supervisor   \
                           postfix      \
                           postfix-pcre \
                           gettext      \
 && apt-get clean

# Copy in supervisord configuration and a shell script to run postfix
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY postfix.sh       /opt/postfix.sh
RUN chmod u+x /opt/postfix.sh

# Tell postfix to listen on port 1025
RUN echo "1025       inet  n       -       -       -       -       smtpd" >> /etc/postfix/master.cf
EXPOSE 1025

# Add in some default configuration files.  The transport configuration tells postfix how to route emails based on
# intended recipients  By default, it routes everything to "mailcatcher" on port 1025.  The relays file tells postfix
# which domains to accept and forward.  The default configuration accepts all domains.
COPY header_checks  /etc/postfix/header_checks
COPY transport      /etc/postfix/transport.template
COPY relays         /etc/postfix/relays

# Configure postfix to use the config files we just copied in.  Also, disable TLS, tell postfix to send anything that
# didn't get rejected by the filters, and always bcc "mail_spy@example.com".  This is a safe domain that will never
# route anywhere effectively.  This is done so that production containers can override the transport configuration but
# still route example.com to a mailcatcher instance.  This allows administrators to always have a view on what e-mails
# are getting sent out
RUN postconf -e transport_maps=hash:/etc/postfix/transport              \
                smtpd_relay_restrictions=reject_unauth_destination      \
                relay_domains=pcre:/etc/postfix/relays                  \
                always_bcc=mail_spy@example.com                         \
                smtpd_use_tls=no                                        \
                smtp_header_checks=regexp:/etc/postfix/header_checks


CMD envsubst < /etc/postfix/transport.template > /etc/postfix/transport && postmap hash:/etc/postfix/transport && postmap /etc/postfix/header_checks && /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
