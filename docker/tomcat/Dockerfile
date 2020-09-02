FROM openjdk:12.0.1-jdk-oraclelinux7

ENV LANG en_US.utf8

# copy in some additional yum repositories
#COPY public-yum-ol7.repo /etc/yum.repos.d
RUN yum-config-manager --enable ol7_optional_latest
RUN yum -y -q install \
    #for R
    texinfo-tex \
    # for the timezone
    tzdata \
    # for downloading LabKey and Tomcat
    wget \
    tar \
    gzip \
    # for creating the netrc file from the template (envsubst)
    gettext \
    # for installing R and the various additional packages
    R-3.5.1 \
    make \
    libcurl-devel \
    libxml2-devel \
    openssl-devel \
    #required to render png
    pango \
    # for checking for when the database is up
    postgresql \
 # to make the image smaller
 && yum clean all

# download and untar tomcat
ENV CATALINA_HOME /usr/local/tomcat
WORKDIR $CATALINA_HOME

ENV TOMCAT_VERSION 8.5.32
RUN wget -qO- http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_VERSION%%\.[[:digit:]]*}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  | tar -xz --strip-components=1 \
 && chmod -R 755 .

# configure LabKey for tomcat
RUN mkdir -p conf/Catalina/localhost
COPY ROOT.xml conf/Catalina/localhost/ROOT.xml

# adding Tomcat custom login pattern
COPY server8_5_32.xml conf/server.xml

RUN mkdir -p /usr/local/labkey/config/config-server
COPY pipelineConfig.xml /usr/local/labkey/config/config-server/pipelineConfig.xml

# install the necessary R packages
COPY install.r /tmp/install.r
RUN mkdir -p /usr/share/doc/R-3.5.1/html && Rscript /tmp/install.r

# copy over the .netrc template file
COPY netrc /root/netrc.template

# copy the script to wait for the postgres instance (and chmod it for execution)
COPY wait-for-postgres.sh /etc/
RUN chmod +x /etc/wait-for-postgres.sh
CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { /etc/wait-for-postgres.sh postgres bin/catalina.sh run ; }"]
