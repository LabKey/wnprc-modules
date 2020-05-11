FROM perl:5.24

RUN cpanm LabKey::Query         \
          MIME::Lite            \
          File::Touch           \
          List::MoreUtils       \
          LWP::Protocol::https  \
          Config::Abstract::Ini \
          Log::Rolling

# Add the apt repo for PostgreSQL so we can install the client package
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ stretch-pgdg main' > /etc/apt/sources.list.d/pgdg.list \
 && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# The gettext package contains the envsubst command needed for the run command of this image.
RUN apt-get update                 \
 && apt-get -qq install -y vim     \
                           rsyslog \
                           ssmtp   \
                           cron    \
                           gettext \
                           postgresql-client-9.4 \
                           tzdata \
 && apt-get clean

COPY ssmtp.conf /etc/ssmtp/ssmtp.conf
COPY netrc /root/netrc.template
COPY scripts/ /usr/local/labkey/

RUN chmod u+x /usr/local/labkey/*/* \
 && echo "\n\nMAILTO=ehrservices@g-groups.wisc.edu\n\n" >> /etc/crontab \
 && cat /usr/local/labkey/*/*.cron >> /etc/crontab \
 && touch ~/.netrc

CMD /bin/bash -c "echo $TZ > /etc/timezone && rm /etc/localtime && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && dpkg-reconfigure -f noninteractive tzdata && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && touch /etc/crontab /etc/cron.*/* && /usr/sbin/rsyslogd && cron && touch /var/log/cron.log && tail -f /var/log/syslog"
