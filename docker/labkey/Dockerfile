# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)
ARG LK_VERSION
ARG FB_NAME
FROM alpine:3.19 AS download


WORKDIR /tmp/labkey

ARG LABKEY_TEAMCITY_BUILD=

 
RUN apk update \
    && apk add --no-cache wget tar ca-certificates && update-ca-certificates

# Use secrets injected at build time via:
#   --secret id=labkey_username,env=LABKEY_TEAMCITY_USERNAME
#   --secret id=labkey_password,env=LABKEY_TEAMCITY_PASSWORD
# And set them in environment for use in RUN only — not persisted!
ENV TEAMCITY_URL=placeholder \
    LABKEY_TEAMCITY_USERNAME_FILE=/run/secrets/labkey_username \
    LABKEY_TEAMCITY_PASSWORD_FILE=/run/secrets/labkey_password

# ✅ Secure download: secrets only available inside this RUN, never stored in image
RUN --mount=type=secret,id=labkey_username \
    --mount=type=secret,id=labkey_password \
    echo "Downloading LabKey build..." \
    && wget -qO- \
        --http-user="$(cat ${LABKEY_TEAMCITY_USERNAME_FILE})" \
        --http-password="$(cat ${LABKEY_TEAMCITY_PASSWORD_FILE})" \
        "${TEAMCITY_URL}" \
    | tar -xz --strip-components=1


# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION
FROM wnprcehr/cranrnutils:cranrnutils_${LK_VERSION}${FB_NAME}

# creating folders for LabKey installation
RUN mkdir -p /labkey/labkey
RUN mkdir -p /labkey/src
RUN mkdir -p /labkey/labkey/apps
RUN mkdir -p /labkey/labkey/config

#RUN yum -y -q install \
    
#&& yum clean all
#COPY LabKey24.3Beta-79-UWisc/labkeyServer.jar /labkey/src

# copy in LabKey from the other stage of the build and copy in the jars to tomcat
ENV LABKEY_HOME=/labkey/labkey
ENV LABKEY_SRC=/labkey/src
ENV LABKEY_LOGS=/labkey/logs

COPY --from=download /tmp/labkey $LABKEY_SRC
WORKDIR ${LABKEY_HOME}
RUN cp $LABKEY_SRC/labkeyServer.jar $LABKEY_HOME
COPY application.properties config/

COPY replacingSecrets.sh /etc/replacingSecrets.sh
RUN chmod +x /etc/replacingSecrets.sh

RUN useradd -ms /bin/bash labkey

RUN chown -Rc labkey:labkey ${LABKEY_HOME}
#RUN systemctl daemon-reload

# add the session path to the tomcat config
#RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

# update the length of the default web session
#RUN sed -i "s/<session-timeout>[0-9]*<\/session-timeout>/<session-timeout>240<\/session-timeout>/" conf/web.xml

EXPOSE 8080

ENTRYPOINT ["/etc/replacingSecrets.sh" ]

CMD java -XX:+HeapDumpOnOutOfMemoryError -XX:MaxRAMPercentage=75.0 -Dlabkey.home=$LABKEY_HOME -Dlabkey.log.home=$LABKEY_LOGS -Dlogback.debug=true -jar /labkey/labkey/labkeyServer.jar