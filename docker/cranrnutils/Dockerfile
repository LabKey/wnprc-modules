FROM eclipse-temurin:25-jre-noble

# Set noninteractive mode for apt-get
ENV DEBIAN_FRONTEND=noninteractive

ENV LANG=en_US.utf8

RUN apt-get update \
    && apt-get -qq install -y   lsb-release             \
    software-properties-common \
    curl                        \
    && apt-get clean


# Download and add signing key for Postgres 15
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /etc/apt/keyrings/pgdg.asc \
    && echo "deb [signed-by=/etc/apt/keyrings/pgdg.asc] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Download and add signing key for CRAN repository
RUN curl -fsSL https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc -o /etc/apt/keyrings/cran_ubuntu_key.asc \
    && echo "deb [signed-by=/etc/apt/keyrings/cran_ubuntu_key.asc] https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/" > /etc/apt/sources.list.d/cran.list

# Adding various application to download packages to install Postgres 15 and CRAN-R
RUN apt-get update \
    && apt-get -qq install -y   texinfo                 \
    tzdata                  \
    gettext                 \
    make                    \
    openssl                 \
    #Linux packages needed for installing CRAN-R
    dirmngr                 \
    #Linux packages needed for RlabKey
    libcurl4-openssl-dev    \
    libssl-dev              \
    postgresql-client-15    \
    r-base                  \
    r-base-dev              \
    && apt-get clean

# install the necessary R packages
COPY install.r /tmp/install.r
RUN mkdir -p /usr/share/doc/R-4.4.1/html && Rscript /tmp/install.r

# copy over the .netrc template file
COPY netrc /root/netrc.template

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { jshell ; }"]
