# -----------------------------------------------------------------------------
# HELPER IMAGE (to download LabKey)

FROM alpine:latest as download

ARG LABKEY_TEAMCITY_PASSWORD
ARG LABKEY_TEAMCITY_USERNAME

ENV LABKEY_TEAMCITY_CONFIG LabKey_172Modules_Premium_Installers
ENV LABKEY_VERSION 17.2

WORKDIR /tmp/labkey

ARG LABKEY_TEAMCITY_BUILD=

RUN apk add --no-cache wget tar ca-certificates && update-ca-certificates
RUN X="`wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" https://teamcity.labkey.org/httpAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success/number`" \
 && Y="${LABKEY_TEAMCITY_BUILD:-$X}" \
 && Z="https://teamcity.labkey.org/httpAuth/app/rest/builds/number:${Y}/artifacts/content/wisc/Labkey${LABKEY_VERSION}-${Y%%\.[[:digit:]]*}-UWisc-bin.tar.gz" \
 && echo -e "Downloading LabKey build from \033[1;33m${Z}\033[0m" \
 && wget -qO- --http-user="${LABKEY_TEAMCITY_USERNAME}" --http-password="${LABKEY_TEAMCITY_PASSWORD}" ${Z} \
  | tar -xz --strip-components=1

# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

FROM store/oracle/serverjre:8

ENV LANG en_US.utf8

# copy in some additional yum repositories
COPY public-yum-ol7.repo /etc/yum.repos.d
RUN yum -y -q install \
    # for the timezone
    tzdata \
    # for downloading LabKey and Tomcat
    wget \
    tar \
    gzip \
    # for installing R and the various additional packages
    R-3.2.0 \
    make \
    libcurl-devel \
    libxml2-devel \
    # for checking when the database is up
    postgresql \
 # to make the image smaller
 && yum clean all

# download and untar tomcat
ENV CATALINA_HOME /usr/local/tomcat
WORKDIR $CATALINA_HOME

ENV TOMCAT_VERSION 8.5.23
RUN wget -qO- http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_VERSION%%\.[[:digit:]]*}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  | tar -xz --strip-components=1 \
 && chmod -R 755 .

# copy in LabKey from the other stage of the build and copy in the jars to tomcat
ENV LABKEY_HOME /usr/local/labkey
COPY --from=download /tmp/labkey $LABKEY_HOME
RUN cp $LABKEY_HOME/tomcat-lib/*.jar lib

# add the session path to the tomcat config
RUN sed -i "s/<Manager pathname=\"\" *\/>/<Manager pathname=\"${LABKEY_HOME//\//\\/}\/sessions\/sessions.ser\" \/>/" conf/context.xml

# update the length of the default web session
RUN sed -i "s/<session-timeout>[0-9]+<\/session-timeout>/<session-timeout>240<\/session-timeout>/" conf/web.xml

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

# install the necessary R scripts
RUN mkdir -p /usr/share/doc/R-3.2.0/html \
 && Rscript -e "install.packages('quadprog', repos='http://cran.us.r-project.org')" \
 && Rscript -e "install.packages('pedigree', repos='http://cran.us.r-project.org')" \
 && Rscript -e "install.packages('Matrix',   repos='http://cran.us.r-project.org')" \
 && Rscript -e "install.packages('RCurl',    repos='http://cran.us.r-project.org')" \
 && Rscript -e "install.packages('Rlabkey',  repos='http://cran.us.r-project.org')" \
 && Rscript -e "install.packages('kinship2', repos='http://cran.us.r-project.org')" \
 && Rscript -e "install.packages('getopt',   repos='http://cran.us.r-project.org')"

# copy the script to wait for the postgres instance (and chmod it for execution)
COPY wait-for-postgres.sh /etc/
RUN yum -y -q install postgresql && chmod +x /etc/wait-for-postgres.sh
CMD ["sh", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && { \\cp -f /usr/local/modules/*.module /usr/local/labkey/modules/ &>/dev/null ; /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]

