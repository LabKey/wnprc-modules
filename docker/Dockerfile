# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)

FROM alpine:latest as download

ENV LABKEY_TEAMCITY_CONFIG LabkeyModules152_Installers
ENV LABKEY_TEAMCITY_REST https://teamcity.labkey.org/guestAuth/app/rest
ENV LABKEY_TEAMCITY_NUMBER_URI ${LABKEY_TEAMCITY_REST}/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success/number
ENV LABKEY_VERSION 15.2

WORKDIR /tmp/labkey

RUN apk add --no-cache wget tar ca-certificates && update-ca-certificates
RUN LABKEY_TEAMCITY_BUILD="`wget -qO- ${LABKEY_TEAMCITY_NUMBER_URI}`" \
 && wget -qO- ${LABKEY_TEAMCITY_REST}/builds/number:${LABKEY_TEAMCITY_BUILD}/artifacts/content/wisc/LabKey${LABKEY_VERSION}-${LABKEY_TEAMCITY_BUILD}-UWisc-bin.tar.gz \
  | tar -xz --strip-components=1

# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

FROM store/oracle/serverjre:8

ENV TOMCAT_VERSION 7.0.82
ENV CATALINA_HOME /usr/local/tomcat
ENV LABKEY_HOME /usr/local/labkey

WORKDIR $CATALINA_HOME

# download and untar tomcat
RUN yum -y -q install wget tar gzip \
 && wget -qO- http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_VERSION%%\.[[:digit:]]*}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  | tar -xz --strip-components=1 \
 && chmod -R 755 .

# copy in LabKey from the other stage of the build and copy the jars to tomcat
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
            $LABKEY_HOME/labkey.xml > conf/Catalina/localhost/ROOT.xml

EXPOSE 8080

# copy the script to wait for the postgres instance (and chmod it for execution)
COPY wait-for-postgres.sh /etc/
RUN yum -y -q install postgresql && chmod +x /etc/wait-for-postgres.sh
CMD ["/etc/wait-for-postgres.sh", "postgres", "bin/catalina.sh", "run"]

