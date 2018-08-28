# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)

FROM alpine:latest as download

ARG LABKEY_TEAMCITY_PASSWORD
ARG LABKEY_TEAMCITY_USERNAME

ENV LABKEY_TEAMCITY_CONFIG LabKey_172wnprc_Community_Installers
ENV LABKEY_VERSION 17.2

<<<<<<< HEAD
WORKDIR /tmp/labkey

ARG LABKEY_TEAMCITY_BUILD=
=======
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
>>>>>>> sharedNetwork

RUN apk update \
    && apk add --no-cache wget tar ca-certificates && update-ca-certificates
RUN W="`wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success/id`" \
 && X="`wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success/number`" \
 && Y="${LABKEY_TEAMCITY_BUILD:-$X}" \
 && Z="https://teamcity.labkey.org/repository/download/${LABKEY_TEAMCITY_CONFIG}/${W}:id/wisc_community/LabKey${LABKEY_VERSION}-${Y}-UWisc-Community-bin.tar.gz" \
 && echo -e "Downloading LabKey build from \033[1;33m${Z}\033[0m" \
 && wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" ${Z} \
  | tar -xz --strip-components=1

# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

<<<<<<< HEAD
FROM wnprcehr/tomcat:latest
=======
# download and untar tomcat
ENV TOMCAT_VERSION 7.0.90
RUN wget -qO- http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_VERSION%%\.[[:digit:]]*}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  | tar -xz --strip-components=1 \
 && chmod -R 755 .
>>>>>>> sharedNetwork

# copy in LabKey from the other stage of the build and copy in the jars to tomcat
ENV LABKEY_HOME /usr/local/labkey
COPY --from=download /tmp/labkey $LABKEY_HOME
RUN cp $LABKEY_HOME/tomcat-lib/*.jar lib

# add the session path to the tomcat config
RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

EXPOSE 8080

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]
