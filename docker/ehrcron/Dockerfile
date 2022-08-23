FROM perl:5.34-threaded-bullseye

ARG PROD_VERSION=false

RUN cpanm LabKey::Query         \
          MIME::Lite            \
          File::Touch           \
          List::MoreUtils       \
          LWP::Protocol::https  \
          Config::Abstract::Ini \
          Log::Rolling

# Add the apt repo for PostgreSQL so we can install the client package
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ bullseye-pgdg main' > /etc/apt/sources.list.d/pgdg.list \
 && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# The gettext package contains the envsubst command needed for the run command of this image.
RUN apt-get update                 \
 && apt-get -qq install -y vim     \
                           rsyslog \
                           ssmtp   \
                           cron    \
                           gettext \
                           postgresql-client-11 \
                           tzdata \
 && apt-get clean

COPY ssmtp.conf /etc/ssmtp/ssmtp.conf
COPY netrc /root/netrc.template
COPY scripts/ /usr/local/labkey/

RUN chmod u+x /usr/local/labkey/*/* \
 && echo "\n\nMAILTO=ehrservices@g-groups.wisc.edu\n\n" >> /etc/crontab \
 && touch ~/.netrc

#Adding an ARG to determine if the image will be used by production server
#Default value false, we would only change to true for production
#If true, the ehrcron image will send emails and ran deleteStudyRecords
RUN if [ "$PROD_VERSION" = "true" ] ; \
      then cat /usr/local/labkey/*/*.cron >> /etc/crontab ; \
      else cat /usr/local/labkey/pg_backup/pg_backup.cron >> /etc/crontab ; \
    fi

#This fixes a problem with imklog (Source: https://stackoverflow.com/questions/56609182/openthread-environment-docker-rsyslogd-imklog-cannot-open-kernel-log-proc-km)
RUN sed -i '/imklog/s/^/#/' /etc/rsyslog.conf

#Enabling the use of /etc/environment inside cron jobs, perls scripts have access to the enviromental variables
#Print enviromental variables to /etc/environment because enviromental variables only exist in memory inside the docker container
RUN sed -i 's/pam_env.so*$/pam_env.so readenv=1/g' /etc/pam.d/cron

#Adding postgres location to the images
RUN echo "PG_DUMP_DIR=/usr/local/postgresql/bin" > /etc/environment

CMD /bin/bash -c "printenv >> /etc/environment && echo $TZ > /etc/timezone && rm /etc/localtime && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && dpkg-reconfigure -f noninteractive tzdata && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && touch /etc/crontab /etc/cron.*/* && /usr/sbin/rsyslogd && cron && touch /var/log/cron.log && tail -f /var/log/syslog"
