ARG R_VERSION=4.4.1
FROM --platform=$BUILDPLATFORM eclipse-temurin:17-jre-jammy AS download

# Set noninteractive mode for apt-get
ENV DEBIAN_FRONTEND=noninteractive

ENV LANG=en_US.utf8

# Adding various application to download packages to install Postgres 15 and CRAN-R
RUN apt-get update \
    && apt-get -qq install --download-only -y   lsb-release \
                                                texinfo           \
                                                tzdata           \
                                                gettext          \
                                                make             \
                                                openssl          \
                                                #Linux packages needed for installing CRAN-R
                                                software-properties-common \
                                                dirmngr \
                                                #Linux packages needed for RlabKey
                                                libcurl4-openssl-dev \
                                                libssl-dev \
    && apt-get clean

# Download and add siging key for Postgres 15
# https://www.linuxtechi.com/how-to-install-postgresql-on-ubuntu/
# https://askubuntu.com/a/1456015    
#RUN echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list 
#RUN wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | tee /etc/apt/trusted.gpg.d/pgdg.asc > /dev/null 2>&1



# Download and add signing key for CRAN repository
# https://www.r-bloggers.com/2022/08/installation-of-r-4-2-on-ubuntu-22-04-1-lts-and-tips-for-spatial-packages/
# https://phoenixnap.com/kb/install-r-ubuntu
#RUN wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | tee -a /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc > /dev/null 2>&1
#RUN add-apt-repository "deb https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/"
RUN curl -Ls https://github.com/r-lib/rig/releases/download/latest/rig-linux-arm64-latest.tar.gz | tar xz -C /usr/local

RUN rig add 4.4.1
RUN rig default 4.4.1

# install the necessary R packages
COPY download.r /tmp/download.r
RUN mkdir /tmp/rdownload
RUN mkdir -p /usr/share/doc/R-4.4.1/html && Rscript /tmp/download.r

# copy over the .netrc template file
COPY netrc /root/netrc.template

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { jshell ; }"]

ARG R_VERSION=4.4.1

FROM eclipse-temurin:17-jre-jammy

COPY --from=download /var/cache/apt/archives /var/cache/apt/archives

COPY --from=download /tmp/rdownload/ /tmp/rdownload/

COPY --from=download /usr/local/ /usr/local/

# Set noninteractive mode for apt-get
ENV DEBIAN_FRONTEND=noninteractive

ENV LANG=en_US.utf8

# Adding various application to download packages to install Postgres 15 and CRAN-R
RUN apt-get update \
    && apt-get -qq install -y   lsb-release \
                                texinfo           \
                                tzdata           \
                                gettext          \
                                make             \
                                openssl          \
                                #Linux packages needed for installing CRAN-R
                                software-properties-common \
                                dirmngr \
                                #Linux packages needed for RlabKey
                                libcurl4-openssl-dev \
                                libssl-dev \
    && apt-get clean

# Download and add siging key for Postgres 15
# https://www.linuxtechi.com/how-to-install-postgresql-on-ubuntu/
# https://askubuntu.com/a/1456015    
#RUN echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list 
#RUN wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | tee /etc/apt/trusted.gpg.d/pgdg.asc > /dev/null 2>&1


#https://www.postgresql.org/download/linux/debian/
RUN apt install curl ca-certificates
RUN install -d /usr/share/postgresql-common/pgdg
RUN curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc

RUN . /etc/os-release
RUN sh -c "echo 'deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt jammy-pgdg main' > /etc/apt/sources.list.d/pgdg.list"
RUN apt update

# Download and add signing key for CRAN repository
# https://www.r-bloggers.com/2022/08/installation-of-r-4-2-on-ubuntu-22-04-1-lts-and-tips-for-spatial-packages/
# https://phoenixnap.com/kb/install-r-ubuntu
#RUN wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | tee -a /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc > /dev/null 2>&1
#RUN add-apt-repository "deb https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/"
RUN curl -Ls https://github.com/r-lib/rig/releases/download/latest/rig-linux-arm64-latest.tar.gz | tar xz -C /usr/local

RUN rig add 4.4.1
RUN rig default 4.4.1

RUN apt-get update      \
    &&  apt-get -qq install -y  postgresql-client-15 \
    && apt-get clean

# install the necessary R packages
COPY install.r /tmp/install.r
RUN mkdir -p /usr/share/doc/R-4.4.1/html && Rscript /tmp/install.r

# copy over the .netrc template file
COPY netrc /root/netrc.template

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { jshell ; }"]
