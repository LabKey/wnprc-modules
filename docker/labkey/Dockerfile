# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)

FROM alpine:latest as download

ARG LABKEY_TEAMCITY_PASSWORD
ARG LABKEY_TEAMCITY_USERNAME
ARG WNPRC_BRANCH=master
ARG LABKEY_VERSION=18.3
ARG LABKEY_IS_PREMIUM=true

WORKDIR /tmp/labkey

ARG LABKEY_TEAMCITY_BUILD=

RUN apk update \
    && apk add --no-cache wget tar ca-certificates && update-ca-certificates

RUN if [ "$WNPRC_BRANCH" = "master" ] ; then B="" ; else B=",branch:"${WNPRC_BRANCH}; fi \
 && if [ "$LABKEY_VERSION" = 18.3 ] ; then \
        LABKEY_TEAMCITY_CONFIG="LabKey_183wnprc_2_Premium_Installers" ; \
        LABKEY_SNAPSHOT="-SNAPSHOT-" ; \
        LABKEY_DISTRIBUTION="wisc" ; \
        LABKEY_FILE_NAME="UWisc-bin.tar.gz" ; \
    elif [ "$LABKEY_VERSION" = 20.7 ] ; then \
        LABKEY_TEAMCITY_CONFIG="LabKey_207Release_Premium_SnapshotInstallers" ; \
        LABKEY_SNAPSHOT="-Beta-" ; \
        LABKEY_DISTRIBUTION="wisc" ; \
        LABKEY_FILE_NAME="UWisc-bin.tar.gz" ; \
    fi \
 && W="`wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success${B}/id`" \
 && X="`wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success${B}/number`" \
 && Y="${LABKEY_TEAMCITY_BUILD:-$X}" \
 && Z="https://teamcity.labkey.org/repository/download/${LABKEY_TEAMCITY_CONFIG}/${W}:id/${LABKEY_DISTRIBUTION}/LabKey${LABKEY_VERSION}${LABKEY_SNAPSHOT}${Y}-${LABKEY_FILE_NAME}" \
 && echo -e "Downloading LabKey build from \033[1;33m${Z}\033[0m" \
 && wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" ${Z} \
  | tar -xz --strip-components=1

# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

FROM wnprcehr/tomcat:18.3

# copy in LabKey from the other stage of the build and copy in the jars to tomcat
ENV LABKEY_HOME /usr/local/labkey
COPY --from=download /tmp/labkey $LABKEY_HOME
RUN cp $LABKEY_HOME/tomcat-lib/*.jar lib

# add the session path to the tomcat config
RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

# update the length of the default web session
RUN sed -i "s/<session-timeout>[0-9]*<\/session-timeout>/<session-timeout>240<\/session-timeout>/" conf/web.xml

EXPOSE 8080

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]
