FROM perl:5.24

# There really are two LabKey Modules (Labkey and LabKey), and we need them both; it’s not a mistake.  
RUN cpanm LabKey::Query         \
          Labkey::Query         \
          MIME::Lite            \
          File::Touch           \
          List::MoreUtils       \
          LWP::Protocol::https  \
          Config::Abstract::Ini \
          Log::Rolling

# The gettext package contains the envsubst command needed for the run command of this image.
RUN apt-get update                 \
 && apt-get -qq install -y vim     \
                           rsyslog \
                           ssmtp   \
                           cron    \
                           gettext \
 && apt-get clean

COPY ssmtp.conf /etc/ssmtp/ssmtp.conf
COPY netrc /root/netrc.template
COPY scripts/ /usr/local/labkey/

RUN chmod u+x /usr/local/labkey/*/* \
 && echo "\n\nMAILTO=ehrservices@g-groups.wisc.edu\n\n" >> /etc/crontab \
 && cat /usr/local/labkey/*/*.cron >> /etc/crontab \
 && touch ~/.netrc

CMD /bin/bash -c "envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && touch /etc/crontab /etc/cron.*/* && /usr/sbin/rsyslogd && cron && touch /var/log/cron.log && tail -f /var/log/syslog"
