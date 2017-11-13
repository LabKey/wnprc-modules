# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)

FROM alpine:latest as download

ARG LABKEY_TEAMCITY_PASSWORD
ARG LABKEY_TEAMCITY_USERNAME

ENV LABKEY_TEAMCITY_CONFIG LabKey_172Modules_Premium_Installers
ENV LABKEY_VERSION 17.2

WORKDIR /tmp/labkey

RUN apk add --no-cache wget tar ca-certificates && update-ca-certificates
RUN X="`wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success/number`" \
 && wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/builds/number:${X}/artifacts/content/wisc/Labkey${LABKEY_VERSION}-${X%%\.[[:digit:]]*}-UWisc-bin.tar.gz \
  | tar -xz --strip-components=1

# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

FROM store/oracle/serverjre:8

ENV CATALINA_HOME /usr/local/tomcat
WORKDIR $CATALINA_HOME

# download and untar tomcat
ENV TOMCAT_VERSION 8.5.23
RUN yum -y -q install wget tar gzip R-3.2.0 tzdata \
 && wget -qO- http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_VERSION%%\.[[:digit:]]*}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  | tar -xz --strip-components=1 \
 && chmod -R 755 .

# copy in LabKey from the other stage of the build and copy in the jars to tomcat
ENV LABKEY_HOME /usr/local/labkey
COPY --from=download /tmp/labkey $LABKEY_HOME
RUN cp $LABKEY_HOME/tomcat-lib/*.jar lib

# add the session path to the tomcat config
RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

# configure LabKey for tomcat
RUN mkdir -p conf/Catalina/localhost
RUN sed -e "s/@@appDocBase@@/${LABKEY_HOME//\//\\/}\/labkeywebapp/" \
        -e 's/jdbc:postgresql:\/\/localhost\/labkey/${jdbc.url}/' \
        -e 's/@@jdbcUser@@/${jdbc.user}/' \
        -e 's/@@jdbcPassword@@/${jdbc.pass}/' \
        -e 's/@@smtpHost@@/mailserver/' \
        -e 's/@@smtpUser@@//' \
        -e 's/@@smtpPort@@/1025/' \
        -e 's/@@masterEncryptionKey@@/defaultKey/' \
            $LABKEY_HOME/labkey.xml > conf/Catalina/localhost/ROOT.xml

EXPOSE 8080

# copy the script to wait for the postgres instance (and chmod it for execution)
COPY wait-for-postgres.sh /etc/
RUN yum -y -q install postgresql && chmod +x /etc/wait-for-postgres.sh
CMD ["sh", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]

