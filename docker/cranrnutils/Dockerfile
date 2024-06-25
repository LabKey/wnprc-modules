FROM eclipse-temurin:17-jdk-centos7

ENV LANG en_US.utf8

RUN  yum -y -q install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
RUN yum update -y
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
    R-3.6.0 \
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

# configure LabKey for tomcat
#RUN mkdir -p conf/Catalina/localhost
#COPY ROOT.xml conf/Catalina/localhost/ROOT.xml

# adding Tomcat custom login pattern
#COPY server9_0_54.xml conf/server.xml

# install the necessary R packages
COPY install.r /tmp/install.r
RUN mkdir -p /usr/share/doc/R-3.6.0/html && Rscript /tmp/install.r

# copy over the .netrc template file
COPY netrc /root/netrc.template

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { jshell ; }"]
