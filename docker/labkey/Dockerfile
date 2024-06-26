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
ENV LABKEY_HOME /labkey/labkey
ENV LABKEY_SRC /labkey/src
ENV LABKEY_LOGS /labkey/logs

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

#USER labkey
#CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/replacingSecrets.sh && systemctl daemon-reload && systemctl start labkey_server ; }"]
#CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ;}", "java", "-jar", "labkeyServer.jar"]
#CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; java -jar /labkey/labkeyServer.jar;}"]
ENTRYPOINT ["/etc/replacingSecrets.sh" ]

#working 
#CMD ["java", "-XX:MaxRAMPercentage=75.0", "-Dlabkey.home=$LABKEY_HOME" , "-Dlabkey.log.home=/labkey/logs", "-Dlogback.debug=true", "-jar", "/labkey/labkey/labkeyServer.jar"]
CMD java -XX:+HeapDumpOnOutOfMemoryError -XX:MaxRAMPercentage=75.0 -Dlabkey.home=$LABKEY_HOME -Dlabkey.log.home=$LABKEY_LOGS -Dlogback.debug=true -jar /labkey/labkey/labkeyServer.jar
#ENTRYPOINT ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/replacingSecrets.sh; }" ]

#CMD ["sudo","-u","labkey","java","-XX:MaxRAMPercentage=75.0", "-Dlabkey.home=$LABKEY_HOME" , "-Dlabkey.log.home=/labkey/logs", "-Dlogback.debug=true", "-jar", "/labkey/labkeyServer.jar"]