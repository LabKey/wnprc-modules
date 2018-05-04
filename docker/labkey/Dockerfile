# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

FROM store/oracle/serverjre:8

ARG LABKEY_TEAMCITY_BUILD=

ENV LANG en_US.utf8

# copy in some additional yum repositories
COPY public-yum-ol7.repo /etc/yum.repos.d
RUN rpm -i https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm \
 && yum -y -q install \
    # for the timezone
    tzdata \
    # for downloading LabKey and Tomcat
    wget \
    tar \
    gzip \
    # for creating the netrc file from the template (envsubst)
    gettext \ 
    # for installing R and the various additional packages
    R-3.2.0 \
    make \
    libcurl-devel \
    libxml2-devel \
    openssl-devel \
    # for checking for when the database is up
    postgresql \
 # to make the image smaller
 && yum clean all

ENV CATALINA_HOME /usr/local/tomcat
WORKDIR $CATALINA_HOME

# download and untar tomcat
ENV TOMCAT_VERSION 7.0.82
RUN wget -qO- http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_VERSION%%\.[[:digit:]]*}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  | tar -xz --strip-components=1 \
 && chmod -R 755 .

# download and untar LabKey
ENV LABKEY_HOME /usr/local/labkey
ENV LABKEY_TEAMCITY_CONFIG LabkeyModules152_Installers
ENV LABKEY_VERSION 15.2
RUN mkdir -p $LABKEY_HOME \
 && LABKEY_TEAMCITY_LATEST_BUILD="`wget -qO- https://teamcity.labkey.org/guestAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success/number`" \
 && LABKEY_DOWNLOAD_URI="https://teamcity.labkey.org/guestAuth/app/rest/builds/number:${LABKEY_TEAMCITY_BUILD:-$LABKEY_TEAMCITY_LATEST_BUILD}/artifacts/content/wisc/LabKey${LABKEY_VERSION}-${LABKEY_TEAMCITY_BUILD:-$LABKEY_TEAMCITY_LATEST_BUILD}-UWisc-bin.tar.gz" \
 && echo -e "Downloading LabKey build from \033[1;33m${LABKEY_DOWNLOAD_URI}\033[0m" \
 && wget -qO- $LABKEY_DOWNLOAD_URI \
  | tar -xz -C $LABKEY_HOME --strip-components=1 \
 && cp $LABKEY_HOME/tomcat-lib/*.jar lib

# add the session path to the tomcat config
RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

# configure LabKey for tomcat
RUN mkdir -p conf/Catalina/localhost \
 && sed -i -e 's/<session-timeout>[0-9]*<\/session-timeout>/<session-timeout>120<\/session-timeout>/' conf/web.xml

COPY ROOT.xml conf/Catalina/localhost/ROOT.xml

RUN mkdir -p /usr/local/labkey/config/config-server
COPY pipelineConfig.xml /usr/local/labkey/config/config-server/pipelineConfig.xml

EXPOSE 8080

# install the necessary R scripts
COPY install.r /tmp/install.r
RUN mkdir -p /usr/share/doc/R-3.2.0/html && Rscript /tmp/install.r

# copy over the .netrc template file
COPY netrc /root/netrc.template

# copy the script to wait for the postgres instance (and chmod it for execution)
COPY wait-for-postgres.sh /etc/
RUN chmod +x /etc/wait-for-postgres.sh
CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]

