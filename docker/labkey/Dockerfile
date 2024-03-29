# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)
ARG LK_VERSION
ARG TOMCAT_IMAGE
FROM alpine:latest as download

ARG LABKEY_TEAMCITY_PASSWORD
ARG LABKEY_TEAMCITY_USERNAME
ARG TEAMCITY_URL

WORKDIR /tmp/labkey

ARG LABKEY_TEAMCITY_BUILD=

RUN apk update \
    && apk add --no-cache wget tar ca-certificates && update-ca-certificates

RUN echo -e "Downloading LabKey build from \033[1;33m${Z}\033[0m" \
    && wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" ${TEAMCITY_URL} \
  | tar -xz --strip-components=1

# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION
FROM wnprcehr/tomcat:tomcat9_${LK_VERSION}${TOMCAT_IMAGE}

# copy in LabKey from the other stage of the build and copy in the jars to tomcat
ENV LABKEY_HOME /usr/local/labkey
COPY --from=download /tmp/labkey $LABKEY_HOME
RUN cp $LABKEY_HOME/tomcat-lib/*.jar lib

COPY replacingSecrets.sh /etc/replacingSecrets.sh
RUN chmod +x /etc/replacingSecrets.sh

# add the session path to the tomcat config
RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

# update the length of the default web session
RUN sed -i "s/<session-timeout>[0-9]*<\/session-timeout>/<session-timeout>240<\/session-timeout>/" conf/web.xml

EXPOSE 8080

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/replacingSecrets.sh && /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]
