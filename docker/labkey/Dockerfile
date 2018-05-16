# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)

FROM alpine:latest as download

ARG LABKEY_TEAMCITY_PASSWORD
ARG LABKEY_TEAMCITY_USERNAME

ENV LABKEY_TEAMCITY_CONFIG LabKey_173wnprc_Premium_Installers
ENV LABKEY_VERSION 17.3

WORKDIR /tmp/labkey

ARG LABKEY_TEAMCITY_BUILD=

RUN apk add --no-cache wget tar ca-certificates && update-ca-certificates
RUN X="`wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/buildTypes/id:${LABKEY_TEAMCITY_CONFIG}/builds/status:success/number`" \
 && Y="${LABKEY_TEAMCITY_BUILD:-$X}" \
 && Z="https://teamcity.labkey.org/httpAuth/app/rest/builds/number:${Y}/artifacts/content/wisc/LabKey${LABKEY_VERSION}-${Y}-UWisc-bin.tar.gz" \
 && echo -e "Downloading LabKey build from \033[1;33m${Z}\033[0m" \
 && wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" ${Z} \
  | tar -xz --strip-components=1

# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

FROM wnprcehr/tomcat:latest

# copy in LabKey from the other stage of the build and copy in the jars to tomcat
ENV LABKEY_HOME /usr/local/labkey
COPY --from=download /tmp/labkey $LABKEY_HOME
RUN cp $LABKEY_HOME/tomcat-lib/*.jar lib

# add the session path to the tomcat config
RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

EXPOSE 8080

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]

