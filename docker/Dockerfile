# -----------------------------------------------------------------------------
# MAIN IMAGE BUILD DEFINITION

FROM store/oracle/serverjre:8

ENV CATALINA_HOME /usr/local/tomcat
WORKDIR $CATALINA_HOME

# download and untar tomcat
ENV TOMCAT_VERSION 7.0.82
RUN yum -y -q install wget tar gzip \
 && wget -qO- http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_VERSION%%\.[[:digit:]]*}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  | tar -xz --strip-components=1 \
 && chmod -R 755 .

# download and untar LabKey
ENV LABKEY_HOME /usr/local/labkey
ENV LABKEY_TEAMCITY_CONFIG LabkeyModules152_Installers
ENV LABKEY_VERSION 15.2
RUN mkdir -p $LABKEY_HOME
RUN LABKEY_TEAMCITY_BUILD="`wget -qO- https://teamcity.labkey.org/guestAuth/app/rest/buildTypes/${LABKEY_TEAMCITY_CONFIG}/builds/status:success/number`" \
 && wget -qO- https://teamcity.labkey.org/guestAuth/app/rest/builds/number:${LABKEY_TEAMCITY_BUILD}/artifacts/content/wisc/LabKey${LABKEY_VERSION}-${LABKEY_TEAMCITY_BUILD}-UWisc-bin.tar.gz \
  | tar -xz -C $LABKEY_HOME --strip-components=1
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

# install the Munin node system
ENV CENTOS_URI http://mirror.centos.org/centos/7/os/x86_64/Packages
RUN yum -y -q install perl \
 && rpm -U --quiet http://mirror.centos.org/centos/7/os/x86_64/Packages/perl-Crypt-DES-2.05-20.el7.x86_64.rpm \
 && rpm -U --quiet http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm \
 && yum -y -q install munin-node
RUN echo 'cidr_allow 172.18.0.0/16' >> /etc/munin/munin-node.conf

# copy the script to wait for the postgres instance (and chmod it for execution)
COPY wait-for-postgres.sh /etc/
RUN yum -y -q install postgresql && chmod +x /etc/wait-for-postgres.sh
CMD ["sh", "-c", "munin-node && /etc/wait-for-postgres.sh postgres bin/catalina.sh run"]

